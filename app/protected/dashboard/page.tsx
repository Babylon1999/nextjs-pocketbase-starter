"use client";

import { H1, Lead } from "@/components/typography";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <H1>Dashboard</H1>
          <Lead className="mt-2">
            Welcome back! Here&apos;s your account information.
          </Lead>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              User Profile
            </h2>
            <p className="text-muted-foreground">
              Your account details and information
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto rounded-lg border bg-muted/20 p-4">
              <code className="text-sm">
                <ul className="space-y-2">
                  {Object.keys(user).map((key) => (
                    <li
                      key={key}
                      className="flex flex-col border-b border-border/50 pb-2 last:border-b-0"
                    >
                      <span className="font-medium text-foreground text-sm">
                        {key}
                      </span>
                      <span className="text-muted-foreground text-sm font-mono break-all">
                        {typeof user[key] === "object"
                          ? JSON.stringify(user[key])
                          : user[key]?.toString() || "null"}
                      </span>
                    </li>
                  ))}
                </ul>
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
