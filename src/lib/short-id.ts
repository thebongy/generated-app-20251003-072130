// A simple, crypto-based short ID generator inspired by nanoid.
// This is URL-friendly and suitable for paste links.
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 8;
export function generateShortId(): string {
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  // `& 61` is a slightly biased but fast way to get a character from the alphabet.
  // The alphabet has 62 characters.
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ALPHABET[bytes[i] & 61];
  }
  return id;
}