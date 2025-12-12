import type { Metadata } from "next";
import { OpexList } from "@/components/opex/OpexList";

export const metadata: Metadata = {
  title: "Biaya Operasional",
};

export default function OpexPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <OpexList />
    </div>
  );
}

