import type { Chirp } from "./db/schema.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      token?: string;
      email?: string;
      userPassword?: string;
      chirp?: Chirp;
      chirpBody?: string;
    }
  }
}

export {};
