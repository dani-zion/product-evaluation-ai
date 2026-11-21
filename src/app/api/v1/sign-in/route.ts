import { getAccountService } from "@/server/container";
import { createSignInHandler } from "@/server/http/sign-in-handler";

export const POST = createSignInHandler(getAccountService);
