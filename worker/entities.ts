import { IndexedEntity } from "./core-utils";
import type { Paste } from "@shared/types";
export class PasteEntity extends IndexedEntity<Paste> {
  static readonly entityName = "paste";
  static readonly indexName = "pastes";
  static readonly initialState: Paste = {
    id: "",
    content: "",
    type: 'text',
    createdAt: 0,
    passwordHash: undefined,
    expiresAt: undefined,
    fileName: undefined,
  };
}