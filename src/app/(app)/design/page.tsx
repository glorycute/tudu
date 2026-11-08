import type { Metadata } from "next";
import { DesignSystem } from "./DesignSystem";

export const metadata: Metadata = { title: "Design system" };

export default function DesignPage() {
  return <DesignSystem />;
}
