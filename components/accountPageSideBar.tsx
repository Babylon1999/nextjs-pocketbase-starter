"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function AccountPageSideBar() {
  const pathname = usePathname();

  const isAccountPage = pathname === "/protected/account";
  const isSecurityPage = pathname === "/protected/account/security";

  return (
    <div className="grid w-full lg:min-h-screen">
      {" "}
      <div className="border-r lg:block ">
        <div className="flex flex-col gap-2">
          <div className="flex h-[60px] items-center px-6">
            <Link
              href="#"
              className="flex items-center gap-2 font-semibold"
              prefetch={false}
            >
              <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">⚙</span>
              </div>
              <span className="">My Account</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-4 text-sm font-medium">
              <a
                href="/protected/account"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isAccountPage
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                }`}
              >
                <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">👤</span>
                </div>
                Profile
              </a>
              <a
                href="/protected/account/security"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isSecurityPage
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                }`}
              >
                <div className="w-4 h-4 bg-gray-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">🔒</span>
                </div>
                Security
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
