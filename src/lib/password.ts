import "server-only";
import bcrypt from "bcrypt";

export const BCRYPT_COST = 12;

export type HashedPassword = {
  /** bcrypt hash; it also embeds the salt, so it is all `verifyPassword` needs. */
  hash: string;
  /** The salt used for the hash, stored on its own as the spec requires. */
  salt: string;
};

export async function hashPassword(
  password: string,
  cost: number = BCRYPT_COST,
): Promise<HashedPassword> {
  const salt = await bcrypt.genSalt(cost);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
