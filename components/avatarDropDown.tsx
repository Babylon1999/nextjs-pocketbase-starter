"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearToken } from "@/lib/auth";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AvatarDropDown({ SrcLink }: { SrcLink: string }) {
  const router = useRouter();

  const handleLogout = () => {
    try {
      clearToken();
      // Trigger auth state change event
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Logged out successfully");
      router.push("/auth/login?logout=true");
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to logout. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={SrcLink} alt="User avatar" />
            <AvatarFallback className="bg-accent text-accent-foreground border border-border">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-40 bg-popover border-border"
        align="end"
      >
        <Link href="/protected/account">
          <DropdownMenuItem className="cursor-pointer text-foreground">
            My Account
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-foreground"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
