import type { Metadata } from "next";
import "./globals.css";
import appIcon from "./assets/images/app-icon-32.png";

export const metadata: Metadata = {
  title: "MacOS",
  description: "MacOS portfolio demo",
  icons: {
    icon: appIcon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta httpEquiv="Permissions-Policy" content="interest-cohort=()" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          type="text/css"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="m-0 h-full overflow-hidden bg-black antialiased">
        {children}
      </body>
    </html>
  );
}
