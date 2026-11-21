"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useCreateEvaluation() {
  const trpc = useTRPC();
  return useMutation(trpc.evaluations.create.mutationOptions());
}
