"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { addCollection } from "@iconify/react";
import { icons as solarIcons } from "@iconify-json/solar";
import { useState, type ReactNode } from "react";

addCollection(solarIcons);

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
