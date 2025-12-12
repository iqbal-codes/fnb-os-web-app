import type { Metadata } from "next";
import { HelpCenter } from "@/components/settings/HelpCenter";

export const metadata: Metadata = {
  title: "Bantuan",
};

export default function HelpPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <HelpCenter />
    </div>
  );
}

