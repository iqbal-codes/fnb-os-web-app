"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MenuItem {
  id: string;
  name: string;
  sellingPrice: number;
}

interface BulkMenuInputProps {
  onSave: (menus: MenuItem[]) => void;
  onBack?: () => void;
}

export function BulkMenuInput({ onSave, onBack }: BulkMenuInputProps) {
  const [menus, setMenus] = useState<MenuItem[]>([
    { id: "1", name: "", sellingPrice: 0 },
    { id: "2", name: "", sellingPrice: 0 },
    { id: "3", name: "", sellingPrice: 0 },
  ]);

  const addMenu = () => {
    setMenus((prev) => [
      ...prev,
      { id: `menu-${Date.now()}`, name: "", sellingPrice: 0 },
    ]);
  };

  const updateMenu = (
    id: string,
    field: keyof MenuItem,
    value: string | number
  ) => {
    setMenus((prev) =>
      prev.map((menu) => (menu.id === id ? { ...menu, [field]: value } : menu))
    );
  };

  const removeMenu = (id: string) => {
    if (menus.length <= 1) return;
    setMenus((prev) => prev.filter((menu) => menu.id !== id));
  };

  const handleSave = () => {
    const validMenus = menus.filter((m) => m.name.trim() && m.sellingPrice > 0);
    if (validMenus.length === 0) {
      return;
    }
    onSave(validMenus);
  };

  const validCount = menus.filter(
    (m) => m.name.trim() && m.sellingPrice > 0
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Tambah Menu yang Sudah Ada</h3>
        <p className="text-sm text-muted-foreground">
          Masukkan menu dan harga jual. Resep bisa ditambahkan nanti.
        </p>
      </div>

      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_40px] gap-2 px-1">
          <Label className="text-xs text-muted-foreground">Nama Menu</Label>
          <Label className="text-xs text-muted-foreground text-right">
            Harga Jual
          </Label>
          <div />
        </div>

        {/* Menu rows */}
        {menus.map((menu, idx) => (
          <div
            key={menu.id}
            className="grid grid-cols-[1fr_120px_40px] gap-2 items-center"
          >
            <Input
              placeholder={`Menu ${idx + 1}`}
              value={menu.name}
              onChange={(e) => updateMenu(menu.id, "name", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Rp"
              value={menu.sellingPrice || ""}
              onChange={(e) =>
                updateMenu(menu.id, "sellingPrice", Number(e.target.value))
              }
              className="text-right"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMenu(menu.id)}
              disabled={menus.length <= 1}
              className="text-muted-foreground"
            >
              ×
            </Button>
          </div>
        ))}

        {/* Add more */}
        <Button variant="outline" className="w-full" onClick={addMenu}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Menu
        </Button>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Menu valid</span>
            <span className="font-medium">{validCount} menu</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Kembali
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={validCount === 0}
        >
          Simpan & Lanjut
        </Button>
      </div>
    </div>
  );
}

