"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Building2,
  Bell,
  Palette,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { user, logout: authLogout } = useAuthStore();
  const { currentBusiness, clearBusiness } = useBusinessStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.auth.logout();
      authLogout();
      clearBusiness();
      router.push("/login");
    } catch {
      toast.error("Gagal logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola akun dan preferensi
        </p>
      </div>

      {/* Account Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Business Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Bisnis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">
                {currentBusiness?.name || "Bisnis"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentBusiness?.type || "F&B Business"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Target Margin</p>
              <p className="text-xs text-muted-foreground">
                {((currentBusiness?.target_margin || 0.3) * 100).toFixed(0)}%
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tampilan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <Label htmlFor="dark-mode">Mode Gelap</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="low-stock">Peringatan Stok Rendah</Label>
            <Switch id="low-stock" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="price-change">Perubahan Harga Bahan</Label>
            <Switch id="price-change" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}

