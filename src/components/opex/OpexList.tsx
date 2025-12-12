"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Building2,
  Zap,
  Users,
  Megaphone,
  Package,
  Wrench,
  Shield,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useOpex,
  useCreateOpex,
  useUpdateOpex,
  useDeleteOpex,
  OPEX_CATEGORIES,
  OPEX_FREQUENCIES,
  getCategoryLabel,
  getFrequencyLabel,
  formatRupiah,
  toMonthlyAmount,
  type OpexItem,
  type OpexFormData,
  type OpexCategory,
} from "@/hooks/useOpex";

const categoryValues = OPEX_CATEGORIES.map((c) => c.value) as [
  OpexCategory,
  ...OpexCategory[]
];
const frequencyValues = OPEX_FREQUENCIES.map((f) => f.value) as [
  "daily" | "weekly" | "monthly" | "yearly" | "one-time",
  ...("daily" | "weekly" | "monthly" | "yearly" | "one-time")[]
];

const opexSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  category: z.enum(categoryValues, {
    message: "Kategori wajib diisi",
  }),
  amount: z.number().min(1, "Nominal harus lebih dari 0"),
  frequency: z.enum(frequencyValues, {
    message: "Frekuensi wajib diisi",
  }),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

const categoryIcons: Record<OpexCategory, React.ReactNode> = {
  rent: <Building2 className="h-4 w-4" />,
  utilities: <Zap className="h-4 w-4" />,
  salary: <Users className="h-4 w-4" />,
  marketing: <Megaphone className="h-4 w-4" />,
  supplies: <Package className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  insurance: <Shield className="h-4 w-4" />,
  license: <FileText className="h-4 w-4" />,
  other: <DollarSign className="h-4 w-4" />,
};

export function OpexList() {
  const { data, isLoading } = useOpex();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<OpexItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="space-y-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Biaya Operasional</h1>
          <p className="text-sm text-muted-foreground">
            Kelola OPEX bulanan bisnis Anda
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Tambah OPEX
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Biaya Operasional</DialogTitle>
            </DialogHeader>
            <OpexForm onSuccess={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total OPEX Bulanan
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatRupiah(data?.totalMonthly || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary/50" />
          </div>
        </CardContent>
      </Card>

      {/* OPEX Items List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Belum ada biaya operasional</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan OPEX untuk perhitungan yang akurat
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <OpexCard
              key={item.id}
              item={item}
              onEdit={() => setEditItem(item)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Biaya Operasional</DialogTitle>
          </DialogHeader>
          {editItem && (
            <OpexForm
              initialData={editItem}
              onSuccess={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OpexCard({ item, onEdit }: { item: OpexItem; onEdit: () => void }) {
  const deleteOpex = useDeleteOpex();
  const updateOpex = useUpdateOpex(item.id);
  const monthlyAmount = toMonthlyAmount(item.amount, item.frequency);

  const handleDelete = async () => {
    if (confirm("Hapus biaya operasional ini?")) {
      try {
        await deleteOpex.mutateAsync(item.id);
        toast.success("OPEX berhasil dihapus");
      } catch {
        toast.error("Gagal menghapus OPEX");
      }
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateOpex.mutateAsync({ is_active: !item.is_active });
      toast.success(item.is_active ? "OPEX dinonaktifkan" : "OPEX diaktifkan");
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  return (
    <Card className={!item.is_active ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              {categoryIcons[item.category]}
            </div>
            <div>
              <p className="font-medium">{item.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {getCategoryLabel(item.category)}
                </Badge>
                <span>{getFrequencyLabel(item.frequency)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold">{formatRupiah(item.amount)}</p>
              {item.frequency !== "monthly" && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatRupiah(monthlyAmount)}/bln
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleActive}>
                  <Switch className="h-4 w-4 mr-2" />
                  {item.is_active ? "Nonaktifkan" : "Aktifkan"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OpexForm({
  initialData,
  onSuccess,
}: {
  initialData?: OpexItem;
  onSuccess: () => void;
}) {
  const createOpex = useCreateOpex();
  const updateOpex = useUpdateOpex(initialData?.id || "");
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OpexFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(opexSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          amount: initialData.amount,
          frequency: initialData.frequency,
          is_active: initialData.is_active,
          notes: initialData.notes,
        }
      : {
          name: "",
          category: "other",
          amount: 0,
          frequency: "monthly",
          is_active: true,
        },
  });

  const onSubmit = async (data: OpexFormData) => {
    try {
      if (isEditing) {
        await updateOpex.mutateAsync(data);
        toast.success("OPEX berhasil diperbarui");
      } else {
        await createOpex.mutateAsync(data);
        toast.success("OPEX berhasil ditambahkan");
      }
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama *</Label>
        <Input
          id="name"
          placeholder="cth. Gaji Barista"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategori *</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {OPEX_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Frekuensi *</Label>
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih frekuensi" />
                </SelectTrigger>
                <SelectContent>
                  {OPEX_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Nominal (Rp) *</Label>
        <Input
          id="amount"
          type="number"
          placeholder="5000000"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Status Aktif</Label>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Switch
              id="is_active"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? "Menyimpan..."
          : isEditing
          ? "Simpan Perubahan"
          : "Tambah OPEX"}
      </Button>
    </form>
  );
}

