import argon2 from "argon2";

export const hashPassword = (password: string): Promise<string> => {
  const hashedPassword = argon2.hash(password);

  return hashedPassword;
};

export const checkPasswordHash = (
  password: string,
  hash: string,
): Promise<boolean> => {
  const result = argon2.verify(hash, password);

  return result;
};
