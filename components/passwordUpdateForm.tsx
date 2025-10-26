"use client";

import { UpdateUserButton } from "./submitButtons";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { getToken, clearToken, PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PasswordUpdateForm({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const currentPassword = formData.get("current-password") as string;
      const newPassword = formData.get("new-password") as string;
      const confirmPassword = formData.get("confirm-password") as string;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        setIsLoading(false);
        return;
      }

      // Validate password length
      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }

      const token = getToken();

      if (!token) {
        toast.error("You must be logged in to update your password");
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${PB_URL}/api/collections/users/records/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            password: newPassword,
            passwordConfirm: confirmPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Failed to update password"
        );
        toast.error(errorMessage);
        return;
      }

      toast.success("Password updated successfully! Please log in again.");

      clearToken();
      router.push("/auth/login");
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to update password. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">
          Change Password
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Update your password to keep your account secure
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="current-password"
              className="text-sm font-medium text-foreground mb-2"
            >
              Current password
            </Label>
            <Input
              id="current-password"
              name="current-password"
              type="password"
              placeholder="Enter your current password"
              required
              autoFocus
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-accent/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="new-password"
              className="text-sm font-medium text-foreground mb-2"
            >
              New password
            </Label>
            <Input
              id="new-password"
              name="new-password"
              type="password"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-accent/50 transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Must be at least 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-medium text-foreground mb-2"
            >
              Confirm new password
            </Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Re-enter your password"
              minLength={8}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-accent/50 transition-all"
            />
          </div>

          <div className="flex justify-end pt-4">
            <UpdateUserButton isLoading={isLoading} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
