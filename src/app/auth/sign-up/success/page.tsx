import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account created | Tally",
};

export default function SignUpSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start gap-6 px-6 pt-16 pb-20 sm:px-10 sm:pt-24">
        <h1 className="font-display text-6xl sm:text-7xl">
          <span className="marker -ml-[0.3em]">Account created.</span>
        </h1>
        <p className="max-w-[52ch] text-lg text-muted-foreground leading-relaxed">
          Your account is ready. Product evaluations are coming soon, and you'll
          find them here when they launch.
        </p>
        <Button
          size="lg"
          className="mt-2 h-12 px-6 text-base"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to home
        </Button>
      </main>
    </>
  );
}
