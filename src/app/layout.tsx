import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

// Self-hosted (variable font, Latin subset; axes: opsz, wdth, wght) so dev and
// builds never depend on reaching Google Fonts. License: ./fonts/OFL.txt
const bricolage = localFont({
  src: "./fonts/bricolage-grotesque-latin.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

export const metadata: Metadata = {
  title: "Product Evaluation AI",
  description:
    "Know what you're buying before you buy it. Plain-language verdicts from reviews and specs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster theme="dark" position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
