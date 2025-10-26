"use client";

import { Settings, User, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountPageSideBar() {
  const pathname = usePathname();

  const isAccountPage = pathname === "/protected/account";
  const isSecurityPage = pathname === "/protected/account/security";

  return (
    <div className="bg-background">
      <div className="flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link
            href="/protected/account"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <Settings className="h-5 w-5" />
            <span className="text-foreground">Account</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <Link
              href="/protected/account"
              className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all w-full ${
                isAccountPage
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>

            <Link
              href="/protected/account/security"
              className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all w-full ${
                isSecurityPage
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Lock className="h-4 w-4" />
              Security
            </Link>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <Link
            href="/protected/dashboard"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline w-full py-2"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
