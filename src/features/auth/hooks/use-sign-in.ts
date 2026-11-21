"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useSignIn() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.signIn.mutationOptions());
}

export function useSignOut() {
  const trpc = useTRPC();
  return useMutation(trpc.auth.signOut.mutationOptions());
}
