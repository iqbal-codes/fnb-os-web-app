import type { Metadata } from "next";
import { POSInterface } from "@/components/pos/POSInterface";

export const metadata: Metadata = {
  title: "POS",
};

export default function POSPage() {
  return (
    <div className="animate-fade-in -mx-4 px-4">
      <POSInterface />
    </div>
  );
}

