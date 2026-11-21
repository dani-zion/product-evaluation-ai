import "server-only";
import type { SignUpInput } from "@/features/auth/schemas";
import { generateId as defaultGenerateId } from "@/lib/id";
import {
  hashPassword as defaultHashPassword,
  type HashedPassword,
} from "@/lib/password";
import { EmailAlreadyInUseError } from "@/server/errors";
import type { AccountRepository } from "@/server/repositories/account-repository";

/** What the API returns for an account. Never includes password or salt. */
export type PublicAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  createdAt: string;
};

export type AccountServiceDeps = {
  repository: AccountRepository;
  hashPassword?: (password: string) => Promise<HashedPassword>;
  generateId?: () => string;
};

export function createAccountService({
  repository,
  hashPassword = defaultHashPassword,
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

      return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        active: row.active,
        createdAt: row.created_at,
      };
    },
  };
}

export type AccountService = ReturnType<typeof createAccountService>;
