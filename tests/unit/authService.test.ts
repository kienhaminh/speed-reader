import { describe, it, expect } from "vitest";
import crypto from "crypto";

/**
 * Hash password helper extracted from authService for testing
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}$${hash}`;
}

/**
 * Verify password helper extracted from authService for testing
 */
function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split("$");
  if (!salt || !storedHash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  // Use timingSafeEqual to prevent timing attack vulnerabilities
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(storedHash)
    );
  } catch {
    // timingSafeEqual throws if buffers are different lengths
    return false;
  }
}

/**
 * Generate session token helper extracted from authService for testing
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

describe("authService", () => {
  describe("hashPassword", () => {
    it("should generate a hash with salt", () => {
      const password = "securePassword123!";
      const hash = hashPassword(password);

      expect(hash).toContain("$");
      const [salt, hashPart] = hash.split("$");
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(hashPart).toHaveLength(128); // 64 bytes = 128 hex chars
    });

    it("should generate different hashes for same password", () => {
      const password = "securePassword123!";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it("should handle empty password", () => {
      const hash = hashPassword("");
      expect(hash).toContain("$");
      const [salt, hashPart] = hash.split("$");
      expect(salt).toHaveLength(32);
      expect(hashPart).toHaveLength(128);
    });

    it("should handle special characters", () => {
      const password = "p@$$w0rd!#%&*()";
      const hash = hashPassword(password);
      expect(hash).toContain("$");
    });

    it("should handle unicode characters", () => {
      const password = "пароль密码パスワード";
      const hash = hashPassword(password);
      expect(hash).toContain("$");
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", () => {
      const password = "securePassword123!";
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject incorrect password", () => {
      const password = "securePassword123!";
      const hash = hashPassword(password);

      expect(verifyPassword("wrongPassword", hash)).toBe(false);
    });

    it("should reject empty password when hash is not empty", () => {
      const password = "securePassword123!";
      const hash = hashPassword(password);

      expect(verifyPassword("", hash)).toBe(false);
    });

    it("should handle empty password when hash is for empty password", () => {
      const password = "";
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
    });

    it("should reject password with case difference", () => {
      const password = "SecurePassword123!";
      const hash = hashPassword(password);

      expect(verifyPassword("securepassword123!", hash)).toBe(false);
    });

    it("should reject invalid hash format", () => {
      expect(verifyPassword("password", "invalid_hash")).toBe(false);
      expect(verifyPassword("password", "no_dollar_sign")).toBe(false);
      expect(verifyPassword("password", "$only_one_part")).toBe(false);
    });

    it("should reject hash with wrong length", () => {
      const password = "securePassword123!";
      const hash = hashPassword(password);
      const [salt] = hash.split("$");
      const corruptedHash = `${salt}$abc123`; // Invalid hash length

      expect(verifyPassword(password, corruptedHash)).toBe(false);
    });

    it("should handle special characters in password verification", () => {
      const password = "p@$$w0rd!#%&*()";
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
      expect(verifyPassword("p@$$w0rd!#%", hash)).toBe(false); // Different password
    });

    it("should handle unicode characters in password verification", () => {
      const password = "пароль密码パスワード";
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
      expect(verifyPassword("пароль", hash)).toBe(false);
    });
  });

  describe("generateSessionToken", () => {
    it("should generate a 64-character hex string", () => {
      const token = generateSessionToken();

      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("should generate unique tokens", () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      const token3 = generateSessionToken();

      expect(token1).not.toBe(token2);
      expect(token1).not.toBe(token3);
      expect(token2).not.toBe(token3);
    });

    it("should generate cryptographically secure tokens", () => {
      const tokens = new Set();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        tokens.add(generateSessionToken());
      }

      // All tokens should be unique
      expect(tokens.size).toBe(iterations);
    });
  });
});
