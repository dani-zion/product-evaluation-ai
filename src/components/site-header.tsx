import Link from "next/link";
import { Suspense } from "react";
import { HeaderAccount } from "@/components/header-account";
import { TallyLogo } from "@/components/tally-logo";
import { UserAvatar } from "@/components/user-avatar";
import { getSession } from "@/server/auth/session";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8">
      <Link
        href="/"
        aria-label="Tally, home"
        className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        <TallyLogo />
      </Link>
      {/* The session is read per request; the rest of the header stays static. */}
      <Suspense fallback={<div aria-hidden className="h-10" />}>
        <SessionAccount />
      </Suspense>
    </header>
  );
}

async function SessionAccount() {
  const session = await getSession();
  return (
    <HeaderAccount
      session={session}
      avatar={
        session && (
          <UserAvatar
            seed={session.accountId}
            name={`${session.firstName} ${session.lastName}`}
            size={32}
          />
        )
      }
    />
  );
}
