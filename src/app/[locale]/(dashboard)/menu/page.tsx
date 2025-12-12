import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MenuList } from "@/components/menu/MenuList";

export const metadata: Metadata = {
  title: "Menu",
};

export default async function MenuPage() {
  const t = await getTranslations("menu");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/menu/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu
          </Link>
        </Button>
      </div>

      {/* Menu List */}
      <MenuList />
    </div>
  );
}

