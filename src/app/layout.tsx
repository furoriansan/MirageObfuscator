import type { Metadata } from "next";
import "./globals.css";
import React, { Suspense } from "react";
import Loading from "@/app/loading";

export const metadata: Metadata = {
  title: "Mirage - Bedrock Obfuscation"
};

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
      <html lang="en" className={`dark `}>
      <body className={`dark text-white bg-gray-950 `}>
      <Suspense fallback={<Loading/>}>
        {children}
      </Suspense>
      </body>
      </html>
  );
}
