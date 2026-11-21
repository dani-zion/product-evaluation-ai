"use client";

import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/features/auth/hooks/use-sign-in";
import type { Session } from "@/server/auth/session";

type UserMenuProps = {
  session: Session;
  /** The rendered <UserAvatar />, drawn on the server. */
  avatar: ReactNode;
};

export function UserMenu({ session, avatar }: UserMenuProps) {
  const router = useRouter();
  const signOut = useSignOut();
  const fullName = `${session.firstName} ${session.lastName}`;

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSuccess: () => router.refresh(),
      onError: () =>
        toast.error("You're still signed in", {
          description: "Signing out didn't go through. Try again.",
        }),
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${fullName}`}
        className="group flex h-10 min-w-10 items-center gap-2.5 rounded-full p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 data-popup-open:bg-muted sm:pr-3"
      >
        {avatar}
        <span className="hidden max-w-[16ch] truncate font-medium text-sm sm:inline">
          {fullName}
        </span>
        <ChevronDownIcon
          aria-hidden
          className="hidden size-4 text-muted-foreground transition-transform group-data-popup-open:rotate-180 sm:inline"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-1.5">
        <div className="flex flex-col gap-0.5 px-2 pt-1.5 pb-2">
          <p className="truncate font-semibold text-sm">{fullName}</p>
          <p className="truncate text-muted-foreground text-sm">
            {session.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="h-9 px-2"
          disabled={signOut.isPending}
          onClick={handleSignOut}
        >
          <LogOutIcon />
          {signOut.isPending ? "Signing out" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
