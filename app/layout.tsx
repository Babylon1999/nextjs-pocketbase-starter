import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "../styles/globals.css";
import SiteHeader from "@/components/site-header";
import { Toaster } from "sonner";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      {/* suppressHydrationWarning is needed because of a bug in shadcn, for more context
      : https://github.com/shadcn-ui/ui/issues/5552
      */}
      <html suppressHydrationWarning lang="en">
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <Toaster richColors={true} position={"top-center"} />

          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              {await SiteHeader()}
              <div className="flex-1">{children}</div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
