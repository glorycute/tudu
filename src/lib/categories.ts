import type { CategoryColor } from "./types";

/** Tailwind classes for each category color token. Keep in sync with globals.css. */
export const CATEGORY_COLORS: Record<CategoryColor, { dot: string; text: string; label: string }> = {
  gray: { dot: "bg-cat-gray", text: "text-cat-gray", label: "Gray" },
  blue: { dot: "bg-cat-blue", text: "text-cat-blue", label: "Blue" },
  green: { dot: "bg-cat-green", text: "text-cat-green", label: "Green" },
  pink: { dot: "bg-cat-pink", text: "text-cat-pink", label: "Pink" },
  orange: { dot: "bg-cat-orange", text: "text-cat-orange", label: "Orange" },
  purple: { dot: "bg-cat-purple", text: "text-cat-purple", label: "Purple" },
  red: { dot: "bg-cat-red", text: "text-cat-red", label: "Red" },
  yellow: { dot: "bg-cat-yellow", text: "text-cat-yellow", label: "Yellow" },
};
