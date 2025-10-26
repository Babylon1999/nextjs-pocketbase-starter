import "@/styles/globals.css";
import SiteHeader from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      {/* suppressHydrationWarning is needed because of a bug in shadcn, for more context
      : https://github.com/shadcn-ui/ui/issues/5552
      */}
      <html suppressHydrationWarning lang="en">
        <head />
        <body
          className={cn(
            "min-h-screen bg-background text-foreground font-sans antialiased",
            fontSans.variable
          )}
        >
          <Toaster richColors={true} position={"top-center"} />
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <UserProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <div className="flex-1">{children}</div>
                <footer className="border-t border-border bg-background py-6">
                  <div className="max-w-4xl mx-auto px-6">
                    <p className="text-sm text-muted-foreground text-center">
                      © 2024 ACME. All rights reserved.
                    </p>
                  </div>
                </footer>
              </div>
            </UserProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
