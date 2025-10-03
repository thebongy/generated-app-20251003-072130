import { Hono } from "hono";
import type { Env } from './core-utils';
import { PasteEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { generateShortId } from '../src/lib/short-id';
import type { Paste, PasteType } from "@shared/types";
import { hashPassword, verifyPassword } from "./crypto";
const MAX_TEXT_SIZE = 1024 * 1024; // 1MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // POST /api/pastes - Create a new paste
  app.post('/api/pastes', async (c) => {
    const { content, password, expiresIn, type = 'text', fileName } = await c.req.json<{
      content?: string;
      password?: string;
      expiresIn?: number;
      type?: PasteType;
      fileName?: string;
    }>();
    if (!isStr(content)) {
      return bad(c, 'Content is required and must be a string.');
    }
    if (type === 'text' && content.length > MAX_TEXT_SIZE) {
      return bad(c, `Text content exceeds maximum size limit of ${MAX_TEXT_SIZE / 1024 / 1024}MB.`);
    }
    if (type === 'image' && content.length > MAX_IMAGE_SIZE * 1.4) { // Base64 overhead
      return bad(c, `Image content exceeds maximum size limit of ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`);
    }
    const newPaste: Paste = {
      id: generateShortId(),
      content: content,
      type: type,
      fileName: fileName,
      createdAt: Date.now(),
    };
    if (isStr(password)) {
      newPaste.passwordHash = await hashPassword(password);
    }
    if (typeof expiresIn === 'number' && expiresIn > 0) {
      newPaste.expiresAt = Date.now() + expiresIn * 1000;
    }
    const created = await PasteEntity.create(c.env, newPaste);
    return ok(c, created);
  });
  // GET /api/pastes/:id - Retrieve a paste's metadata
  app.get('/api/pastes/:id', async (c) => {
    const { id } = c.req.param();
    if (!isStr(id)) return bad(c, 'Invalid paste ID.');
    const pasteEntity = new PasteEntity(c.env, id);
    if (!(await pasteEntity.exists())) {
      return notFound(c, 'Paste not found.');
    }
    const paste = await pasteEntity.getState();
    if (paste.expiresAt && paste.expiresAt < Date.now()) {
      await PasteEntity.delete(c.env, id);
      return notFound(c, 'Paste has expired and was deleted.');
    }
    if (paste.passwordHash) {
      return ok(c, { passwordRequired: true });
    }
    return ok(c, paste);
  });
  // GET /api/pastes/:id/raw - Get raw content of a paste
  app.get('/api/pastes/:id/raw', async (c) => {
    const { id } = c.req.param();
    if (!isStr(id)) return new Response('Invalid paste ID.', { status: 400 });
    const pasteEntity = new PasteEntity(c.env, id);
    // Retry logic to handle potential replication delays
    let exists = await pasteEntity.exists();
    if (!exists) {
      for (let i = 0; i < 2; i++) { // 2 retries, 3 total attempts
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay
        exists = await pasteEntity.exists();
        if (exists) break;
      }
    }
    if (!exists) {
      return new Response('Paste not found.', { status: 404 });
    }
    const paste = await pasteEntity.getState();
    if (paste.expiresAt && paste.expiresAt < Date.now()) {
      await PasteEntity.delete(c.env, id);
      return new Response('Paste has expired and was deleted.', { status: 404 });
    }
    if (paste.passwordHash) {
      return new Response('This paste is password protected and cannot be viewed raw.', { status: 403 });
    }
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=604800, immutable'); // Cache for 1 week
    if (paste.type === 'text') {
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response(paste.content, { status: 200, headers });
    }
    if (paste.type === 'image') {
      const parts = paste.content.match(/^data:(image\/.+);base64,(.+)$/);
      if (!parts) {
        return new Response('Invalid image data format.', { status: 500 });
      }
      const mimeType = parts[1];
      const base64Data = parts[2];
      const buffer = Uint8Array.from(atob(base64Data), char => char.charCodeAt(0));
      headers.set('Content-Type', mimeType);
      if (paste.fileName) {
        headers.set('Content-Disposition', `inline; filename="${paste.fileName}"`);
      }
      return new Response(buffer.buffer, { status: 200, headers });
    }
    return new Response('Unsupported paste type.', { status: 500 });
  });
  // POST /api/pastes/:id/verify - Verify password and retrieve paste
  app.post('/api/pastes/:id/verify', async (c) => {
    const { id } = c.req.param();
    const { password } = (await c.req.json()) as { password?: string };
    if (!isStr(id)) return bad(c, 'Invalid paste ID.');
    if (!isStr(password)) return bad(c, 'Password is required.');
    const pasteEntity = new PasteEntity(c.env, id);
    if (!(await pasteEntity.exists())) {
      return notFound(c, 'Paste not found.');
    }
    const paste = await pasteEntity.getState();
    if (paste.expiresAt && paste.expiresAt < Date.now()) {
      await PasteEntity.delete(c.env, id);
      return notFound(c, 'Paste has expired and was deleted.');
    }
    if (!paste.passwordHash) {
      return bad(c, 'This paste is not password protected.');
    }
    const isValid = await verifyPassword(password, paste.passwordHash);
    if (!isValid) {
      return bad(c, 'Invalid password.');
    }
    return ok(c, paste);
  });
}