"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Filter,
} from "lucide-react";

import { useMenus, useDeleteMenu } from "@/hooks/useMenus";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Menu } from "@/types";
import Image from "next/image";

interface MenuListProps {
  initialCategory?: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MenuList({ initialCategory }: MenuListProps) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || ""
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useMenus({
    category: selectedCategory || undefined,
    active: false,
  });
  const deleteMenu = useDeleteMenu();

  const menus = data?.menus || [];

  // Filter by search
  const filteredMenus = menus.filter(
    (menu) =>
      menu.name.toLowerCase().includes(search.toLowerCase()) ||
      menu.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Get unique categories
  const categories = [...new Set(menus.map((m) => m.category).filter(Boolean))];

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMenu.mutateAsync(deleteId);
      toast.success("Menu deleted successfully");
      setDeleteId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete";
      toast.error(message);
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center text-destructive">
          Failed to load menus. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search") + "..."}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedCategory("")}>
              All Categories
            </DropdownMenuItem>
            {categories.map((cat) => (
              <DropdownMenuItem
                key={cat}
                onClick={() => setSelectedCategory(cat || "")}
              >
                {cat}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="py-0!">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMenus.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">
              {menus.length === 0 ? "No menu items yet" : "No results found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {menus.length === 0
                ? "Create your first menu item to get started"
                : "Try adjusting your search or filter"}
            </p>
            {menus.length === 0 && (
              <Button asChild>
                <Link href="/menu/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Menu Item
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Menu List */}
      {!isLoading && filteredMenus.length > 0 && (
        <div className="space-y-3">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onDelete={() => setDeleteId(menu.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The menu item and its recipe will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMenu.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MenuCard({ menu, onDelete }: { menu: Menu; onDelete: () => void }) {
  const margin =
    menu.selling_price > 0 && menu.cogs
      ? (((menu.selling_price - menu.cogs) / menu.selling_price) * 100).toFixed(
          0
        )
      : null;

  return (
    <Card className="hover:shadow-md transition-shadow py-0!">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Image placeholder */}
          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
            {menu.image_url ? (
              <Image
                src={menu.image_url}
                alt={menu.name}
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{menu.name}</h3>
              {!menu.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{menu.category}</p>
            {margin && (
              <p className="text-xs text-muted-foreground mt-1">
                Margin: {margin}%
              </p>
            )}
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <p className="font-semibold text-primary">
              {formatCurrency(menu.selling_price)}
            </p>
            {(menu.cogs ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                COGS: {formatCurrency(menu.cogs ?? 0)}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/menu/${menu.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

