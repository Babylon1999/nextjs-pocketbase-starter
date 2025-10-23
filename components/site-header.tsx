"use server";

import AvatarDropDown from "./avatarDropDown";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getTheUserFromCookie, IsLoggedIn } from "@/pb/pbFunctions";
import Link from "next/link";

export default async function SiteHeader() {
  const isLoggedIn = await IsLoggedIn();
  const user = isLoggedIn ? await getTheUserFromCookie() : null;

  const avatarSrc =
    isLoggedIn && user.avatar !== ""
      ? `${process.env.PB_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`
      : "/avatar.svg";

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-lg">☰</span>
            </div>
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="flex items-center justify-between px-4 py-6">
            <Link href="#" prefetch={false}>
              <div className="w-9 h-9 bg-black text-white rounded flex items-center justify-center font-bold">
                N
              </div>
              <span className="sr-only">Acme Inc</span>
            </Link>
          </div>
          <nav className="grid gap-2 px-4 py-6">
            <Link
              href="/"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Home
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="hidden items-center gap-6 lg:flex">
        <Link href="#" className="mr-6" prefetch={false}>
          <div className="w-9 h-9 bg-black text-white rounded flex items-center justify-center font-bold">
            N
          </div>
          <span className="sr-only">Acme Inc</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="hover:text-primary text-lg font-semibold transition-colors"
            prefetch={false}
          >
            Home
          </Link>
        </nav>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <a href={isLoggedIn ? "/protected/dashboard" : "/login"}>
          <Button variant="outline" size="sm" className="inline-flex">
            {isLoggedIn ? "Dashboard" : "Login"}
          </Button>
        </a>{" "}
        {isLoggedIn ? await AvatarDropDown({ SrcLink: avatarSrc }) : <></>}
        <ThemeToggle />
      </div>
    </header>
  );
}
