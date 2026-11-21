"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getHeaderAccountState } from "@/components/header-account-state";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import type { Session } from "@/server/auth/session";

type HeaderAccountProps = {
  session: Session | null;
  /** The rendered <UserAvatar /> for a signed-in account. */
  avatar: ReactNode;
};

/** The right side of the header: the account menu, or "Sign in" for visitors. */
export function HeaderAccount({ session, avatar }: HeaderAccountProps) {
  const state = getHeaderAccountState(session, usePathname());

  if (state.kind === "signed-in") {
    return <UserMenu session={state.session} avatar={avatar} />;
  }
  if (state.kind === "visitor") {
    return (
      <Button
        variant="outline"
        className="h-10 px-4 text-sm"
        nativeButton={false}
        render={<Link href={state.signInHref} />}
      >
        Sign in
      </Button>
    );
  }
  return null;
}
