"use client";

import AccountPageSideBar from "@/components/accountPageSideBar";
import { H1, Lead } from "@/components/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import UpdateUser from "@/components/updateUser";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AccountPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="lg:w-80 lg:border-r lg:border-border">
          <AccountPageSideBar />
        </div>

        <main className="flex-1 overflow-auto">
          <div className="border-b border-border bg-background">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <H1>Profile Settings</H1>
              <Lead className="mt-2">
                Manage your account settings and preferences
              </Lead>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateUser user={user} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
