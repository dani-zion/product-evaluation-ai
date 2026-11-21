import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Shown to visitors in place of the evaluation form. */
export function SignInPrompt({ productId }: { productId: string }) {
  const next = encodeURIComponent(`/products/${productId}`);

  return (
    <div className="flex flex-col items-start gap-5 rounded-2xl border border-dashed p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-xl">
          Sign in to add your evaluation
        </h2>
        <p className="text-muted-foreground">
          Score it from 1 to 5 and tell others what you think.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button
          className="h-11 px-5 text-sm"
          nativeButton={false}
          render={<Link href={`/auth/sign-in?next=${next}`} />}
        >
          Sign in
        </Button>
        <Link
          href="/auth/sign-up"
          className="rounded-sm font-medium text-sm underline decoration-marker decoration-2 underline-offset-4 outline-none hover:text-marker focus-visible:ring-3 focus-visible:ring-ring/60"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
