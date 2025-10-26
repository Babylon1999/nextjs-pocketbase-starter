"use client";

import { UpdateUserButton } from "./submitButtons";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";
import { Button } from "@/components/ui/button";
import { getToken, clearToken, PB_URL } from "@/lib/auth";
import { extractPocketBaseErrorMessage } from "@/lib/error-utils";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function UpdateUser({ user }: { user: any }) {
  const [name, setName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getToken();

      if (!token) {
        toast.error("You must be logged in to update your profile");
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
            name: name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Failed to update profile"
        );
        toast.error(errorMessage);
        return;
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      const token = getToken();

      if (!token) {
        toast.error("You must be logged in");
        router.push("/auth/login");
        return;
      }

      const response = await fetch(
        `${PB_URL}/api/collections/users/records/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Extract PocketBase error message with better formatting
        const errorMessage = extractPocketBaseErrorMessage(
          errorData,
          "Failed to delete account"
        );
        toast.error(errorMessage);
        return;
      }

      clearToken();
      // Trigger auth state change event
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to delete account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <Card>
        <CardHeader className="border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">
            Profile Information
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Update your personal details
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground mb-2"
              >
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-accent/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground mb-2"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted border-border text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Email cannot be changed for security reasons
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <UpdateUserButton isLoading={isLoading} />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-destructive/10 border-destructive/30">
        <CardHeader className="border-b border-destructive/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="text-lg font-semibold text-destructive">
              Danger Zone
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Irreversible actions for your account
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {!showDeleteConfirm ? (
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-foreground">
                  Delete Account
                </h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-destructive">
                    Warning: This action cannot be undone
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete your account and all associated
                    data. All your posts, comments, and settings will be lost
                    forever.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="delete-confirm"
                  className="text-sm font-medium text-foreground"
                >
                  Type{" "}
                  <span className="font-mono text-destructive">DELETE</span> to
                  confirm
                </Label>
                <Input
                  id="delete-confirm"
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="bg-background border-destructive/30 text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-destructive/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  variant="outline"
                  className="flex-1 border-border text-muted-foreground hover:bg-accent/50"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
