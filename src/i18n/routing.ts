import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales
  locales: ["id", "en"],
  // Default locale for Indonesian market
  defaultLocale: "id",
  // Locale prefix strategy
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

