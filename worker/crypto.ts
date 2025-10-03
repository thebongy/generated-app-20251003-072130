// Utility functions for password hashing and verification using Web Crypto API.
const ALGO = {
  name: 'PBKDF2',
  hash: 'SHA-256',
  salt: new Uint8Array(16), // A new salt should be generated for each hash
  iterations: 100000,
};
// Converts a string to an ArrayBuffer.
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}
// Converts an ArrayBuffer to a hex string.
function ab2hex(ab: ArrayBuffer): string {
  return Array.from(new Uint8Array(ab))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
// Converts a hex string back to an ArrayBuffer.
function hex2ab(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}
/**
 * Hashes a password with a randomly generated salt.
 * @param password The plaintext password to hash.
 * @returns A promise that resolves to a string containing the salt and hash, separated by a dot.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', str2ab(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const hashBuffer = await crypto.subtle.deriveBits(
    { ...ALGO, salt },
    keyMaterial,
    256 // 256 bits
  );
  const saltHex = ab2hex(salt);
  const hashHex = ab2hex(hashBuffer);
  return `${saltHex}.${hashHex}`;
}
/**
 * Verifies a plaintext password against a stored hash.
 * @param password The plaintext password to verify.
 * @param storedHash The stored hash string (salt.hash).
 * @returns A promise that resolves to true if the password is correct, false otherwise.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split('.');
  if (!saltHex || !hashHex) {
    return false;
  }
  const salt = hex2ab(saltHex);
  const keyMaterial = await crypto.subtle.importKey('raw', str2ab(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const hashBuffer = await crypto.subtle.deriveBits(
    { ...ALGO, salt },
    keyMaterial,
    256
  );
  const newHashHex = ab2hex(hashBuffer);
  return newHashHex === hashHex;
}