// app/layout.tsx
import type { Metadata } from "next";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import ActiveStatus from "@/components/chat/ActiveStatus";
export const metadata: Metadata = {
  title: "shatterbox",
  description: "so whom do you trust?!!",
  icons: {
    icon: "/image.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background min-h-screen">
        <AuthProvider>
          {/* <PusherProvider> */}
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ActiveStatus />
              {children}
              <Toaster />
            </ThemeProvider>
          {/* </PusherProvider> */}
        </AuthProvider>
      </body>
    </html>
  );
}