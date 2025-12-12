import type { Metadata } from "next";
import { ShoppingListGenerator } from "@/components/planning/ShoppingListGenerator";

export const metadata: Metadata = {
  title: "Daftar Belanja",
};

export default function ShoppingListPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <ShoppingListGenerator />
    </div>
  );
}

