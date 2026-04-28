import type { TileCategory } from "@/components/shell/types";

/**
 * Resolves the CSS hsl-triplet variable for a tile category. Wrapped at the
 * call-site with `hsl(...)` (and combined with `/ alpha` as needed) so the
 * same token can drive borders, sheen radial gradients, status dots, etc.
 */
export const categoryTintVar = (category: TileCategory): string => {
  switch (category) {
    case "advisory-accelerators":
      return "var(--category-advisory)";
    case "technical-accelerators":
      return "var(--category-technical)";
    case "client-deployable":
      return "var(--category-agents)";
  }
};
