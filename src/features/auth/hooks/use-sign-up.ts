"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useSignUp() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.signUp.mutationOptions());
}
