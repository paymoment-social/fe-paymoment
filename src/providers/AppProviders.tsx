"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { addCollection } from "@iconify/react";
import { icons as solarIcons } from "@iconify-json/solar";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";

addCollection(solarIcons);

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            refetchOnWindowFocus: "always",
            refetchOnReconnect: true,
            retry: (failureCount, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
          },
          mutations: { retry: false },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
