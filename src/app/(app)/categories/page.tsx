import type { Metadata } from "next";
import { CategoriesView } from "./CategoriesView";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return <CategoriesView />;
}
