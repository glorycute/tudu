import type { CategoryColor } from "./types";

/**
 * Tailwind classes for each category color token. Keep in sync with globals.css.
 * `fill` is the plain pastel background (chips). `dot` adds a thin ring so the
 * palest colors stay visible as small dots on white.
 * The color keys are stored in the database, so only the labels were renamed.
 */
const ring = "ring-1 ring-inset ring-border-strong";
export const CATEGORY_COLORS: Record<CategoryColor, { fill: string; dot: string; text: string; label: string }> = {
  gray: { fill: "bg-cat-gray", dot: `bg-cat-gray ${ring}`, text: "text-cat-gray", label: "Lavender" },
  blue: { fill: "bg-cat-blue", dot: `bg-cat-blue ${ring}`, text: "text-cat-blue", label: "Sky" },
  green: { fill: "bg-cat-green", dot: `bg-cat-green ${ring}`, text: "text-cat-green", label: "Sand" },
  pink: { fill: "bg-cat-pink", dot: `bg-cat-pink ${ring}`, text: "text-cat-pink", label: "Pink" },
  orange: { fill: "bg-cat-orange", dot: `bg-cat-orange ${ring}`, text: "text-cat-orange", label: "Peach" },
  purple: { fill: "bg-cat-purple", dot: `bg-cat-purple ${ring}`, text: "text-cat-purple", label: "Orchid" },
  red: { fill: "bg-cat-red", dot: `bg-cat-red ${ring}`, text: "text-cat-red", label: "Blush" },
  yellow: { fill: "bg-cat-yellow", dot: `bg-cat-yellow ${ring}`, text: "text-cat-yellow", label: "Lemon" },
};
