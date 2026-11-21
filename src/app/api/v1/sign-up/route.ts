import { getAccountService } from "@/server/container";
import { createSignUpHandler } from "@/server/http/sign-up-handler";

export const POST = createSignUpHandler(getAccountService);
