import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getSession } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Sign in | Product Evaluation AI",
};

export default function SignInPage() {
  return (
    <>
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pt-12 pb-20 sm:pt-20">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-5xl">Welcome back.</h1>
          <p className="max-w-[44ch] text-muted-foreground">
            Sign in to pick up your evaluations where you left off.
          </p>
        </div>
        <SignInForm />
        <p className="text-muted-foreground text-sm">
          No account yet?{" "}
          <Link
            href="/auth/sign-up"
            className="rounded-sm font-medium text-foreground underline decoration-marker decoration-2 underline-offset-4 outline-none hover:text-marker focus-visible:ring-3 focus-visible:ring-ring/60"
          >
            Create one
          </Link>
        </p>
      </main>
    </>
  );
}

/** A signed-in account has nothing to do here, so it goes home. */
async function RedirectIfSignedIn() {
  if (await getSession()) redirect("/");
  return null;
}
