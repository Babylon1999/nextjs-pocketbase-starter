"use client";

import AvatarDropDown from "./avatarDropDown";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/contexts/UserContext";
import { PB_URL } from "@/lib/auth";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function SiteHeader() {
  const { user, isLoading } = useUser();

  const isLoggedIn = !!user;
  const avatarSrc = user?.avatar
    ? `${PB_URL}/api/files/pbc_1736455494/${user.id}/${user.avatar}`
    : "";

  return (
    <header className="flex h-16 w-full shrink-0 items-center px-6 bg-background border-b border-border">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-background border-border">
          <div className="flex items-center justify-between px-4 py-6">
            <Link href="/" prefetch={false} className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">
                Acme Inc
              </span>
            </Link>
          </div>
          <nav className="grid gap-2 px-4 py-6">
            <Link
              href="/"
              className="flex w-full items-center py-2 text-lg font-medium text-foreground hover:text-primary transition-colors"
              prefetch={false}
            >
              Home
            </Link>
            {isLoggedIn && (
              <Link
                href="/protected/dashboard"
                className="flex w-full items-center py-2 text-lg font-medium text-foreground hover:text-primary transition-colors"
                prefetch={false}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="hidden items-center gap-6 lg:flex">
        <Link
          href="/"
          className="mr-6 flex items-center gap-2"
          prefetch={false}
        >
          <span className="text-xl font-bold text-foreground">Acme Inc</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            prefetch={false}
          >
            Home
          </Link>
        </nav>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Link href={isLoggedIn ? "/protected/dashboard" : "/login"}>
          <Button variant="outline" size="sm" className="inline-flex text-sm">
            {isLoggedIn ? "Dashboard" : "Login"}
          </Button>
        </Link>
        {isLoggedIn && <AvatarDropDown SrcLink={avatarSrc} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
