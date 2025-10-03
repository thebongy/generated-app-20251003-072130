export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type PasteType = 'text' | 'image';
export interface Paste {
  id: string;
  content: string;
  type: PasteType;
  createdAt: number;
  passwordHash?: string;
  expiresAt?: number;
  fileName?: string;
}
export type GetPasteResponse = Paste | { passwordRequired: true };