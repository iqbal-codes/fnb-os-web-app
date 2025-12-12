import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsPanel />
    </div>
  );
}

