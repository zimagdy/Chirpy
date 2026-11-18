import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT, extractBearerToken } from "../utils/auth.js";
import { checkPasswordHash, hashPassword } from "../utils/password.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT", () => {
  const userId = "user-123";
  const secret = "secret";

  it("should create and validate a JWT", () => {
    const token = makeJWT(userId, 3600, secret);
    const result = validateJWT(token, secret);

    expect(result).toBe(userId);
  });

  it("should throw an error for an expired JWT", () => {
    const token = makeJWT(userId, -3600, secret);

    expect(() => validateJWT(token, secret)).toThrow();
  });

  it("should throw an error for an invalid secret", () => {
    const token = makeJWT(userId, 3600, secret);

    expect(() => validateJWT(token, "wrong-secret")).toThrow();
  });
});

describe("extractBearerToken", () => {
  it("should extract token from a valid Bearer header", () => {
    const token = "abc123";

    const result = extractBearerToken(`Bearer ${token}`);

    expect(result).toBe(token);
  });

  it("should throw error401 when authorization header is undefined", () => {
    expect(() => extractBearerToken(undefined)).toThrow();
  });
});
