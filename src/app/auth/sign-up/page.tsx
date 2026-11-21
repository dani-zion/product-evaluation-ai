import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { VerdictPreview } from "@/features/evaluation/components/verdict-preview";

export const metadata: Metadata = {
  title: "Create account | Product Evaluation AI",
};

export default function SignUpPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-16 px-6 pt-12 pb-20 sm:px-10 sm:pt-16 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-5xl">Create your account</h1>
            <p className="max-w-[44ch] text-muted-foreground">
              Save your evaluations and come back to them when you're ready to
              buy.
            </p>
          </div>
          <SignUpForm />
        </div>
        <VerdictPreview className="hidden lg:mt-20 lg:flex" />
      </main>
    </>
  );
}
