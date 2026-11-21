import "server-only";
import type { SignInInput, SignUpInput } from "@/features/auth/schemas";
import { generateId as defaultGenerateId } from "@/lib/id";
import {
  hashPassword as defaultHashPassword,
  verifyPassword as defaultVerifyPassword,
  type HashedPassword,
} from "@/lib/password";
import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
} from "@/server/errors";
import type {
  AccountRepository,
  AccountRow,
} from "@/server/repositories/account-repository";

/** What the API returns for an account. Never includes password or salt. */
export type PublicAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  createdAt: string;
};

/**
 * A bcrypt hash (cost 12, like real accounts) of a random value nobody knows.
 * Comparing against it when the email has no account makes that failure take
 * as long as a wrong password.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$12$UEnCfV31w1xtEnyz7waACu/0g2RFMHEJTnguWCWrIUsgM3Ztz0mUm";

export type AccountServiceDeps = {
  repository: AccountRepository;
  hashPassword?: (password: string) => Promise<HashedPassword>;
  verifyPassword?: (password: string, hash: string) => Promise<boolean>;
  generateId?: () => string;
};

function toPublicAccount(row: AccountRow): PublicAccount {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function createAccountService({
  repository,
  hashPassword = defaultHashPassword,
  verifyPassword = defaultVerifyPassword,
  generateId = defaultGenerateId,
}: AccountServiceDeps) {
  return {
    /** Creates a new account. Throws EmailAlreadyInUseError on a duplicate email. */
    async signUp(input: SignUpInput): Promise<PublicAccount> {
      if (await repository.emailExists(input.email)) {
        throw new EmailAlreadyInUseError();
      }

      const { hash, salt } = await hashPassword(input.password);

      const row = await repository.insert({
        id: generateId(),
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        password: hash,
        salt,
        active: true,
      });

      return toPublicAccount(row);
    },

    /**
     * Checks an email and password. Throws InvalidCredentialsError for an
     * unknown email, a wrong password and an inactive account alike.
     */
    async signIn(input: SignInInput): Promise<PublicAccount> {
      const row = await repository.findByEmail(input.email);
      // Always run exactly one bcrypt compare, so the response time doesn't
      // reveal whether the email has an account.
      const passwordMatches = await verifyPassword(
        input.password,
        row?.password ?? DUMMY_PASSWORD_HASH,
      );
      if (!row || !passwordMatches || !row.active) {
        throw new InvalidCredentialsError();
      }
      return toPublicAccount(row);
    },
  };
}

export type AccountService = ReturnType<typeof createAccountService>;
