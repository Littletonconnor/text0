"use client";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        disableTransitionOnChange
        defaultTheme="system"
      >
        {children}
      </ThemeProvider>
    </NuqsAdapter>
  );
};
