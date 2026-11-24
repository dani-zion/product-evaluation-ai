import type { Metadata } from "next";
import Link from "next/link";
import { TallyLogo } from "@/components/tally-logo";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create account | Tally",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pt-10 pb-20 sm:pt-16">
      <Link
        href="/"
        aria-label="Tally, home"
        className="self-start rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        <TallyLogo size="sm" />
      </Link>
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-5xl">Create your account</h1>
        <p className="max-w-[44ch] text-muted-foreground">
          Save your evaluations and come back to them when you're ready to buy.
        </p>
      </div>
      <SignUpForm />
      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="rounded-sm font-medium text-foreground underline decoration-marker decoration-2 underline-offset-4 outline-none hover:text-marker focus-visible:ring-3 focus-visible:ring-ring/60"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}
