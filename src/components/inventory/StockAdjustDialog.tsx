"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Package, Plus, Minus, Trash2 } from "lucide-react";

import { useAddInventoryLog } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { InventoryWithIngredient } from "@/hooks/useInventory";

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryWithIngredient | null;
  defaultType?: "purchase" | "usage" | "adjustment" | "waste";
}

interface FormData {
  quantity: number;
  reason: string;
}

const changeTypes = [
  {
    value: "purchase",
    label: "Purchase (Add)",
    icon: Plus,
    color: "text-green-600",
  },
  {
    value: "usage",
    label: "Usage (Subtract)",
    icon: Minus,
    color: "text-blue-600",
  },
  {
    value: "adjustment",
    label: "Adjustment",
    icon: Package,
    color: "text-yellow-600",
  },
  {
    value: "waste",
    label: "Waste/Spoilage",
    icon: Trash2,
    color: "text-red-600",
  },
] as const;

export function StockAdjustDialog({
  open,
  onOpenChange,
  item,
  defaultType = "adjustment",
}: StockAdjustDialogProps) {
  const [changeType, setChangeType] = useState<typeof defaultType>(defaultType);
  const { mutate: addLog, isPending } = useAddInventoryLog();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      quantity: 1,
      reason: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setChangeType(defaultType);
      reset({ quantity: 1, reason: "" });
    }
    onOpenChange(newOpen);
  };

  const onSubmit = (data: FormData) => {
    if (!item) return;

    addLog(
      {
        inventory_id: item.id,
        change_type: changeType,
        quantity: data.quantity,
        reason: data.reason || undefined,
      },
      {
        onSuccess: ({ newStock }) => {
          const actionLabel =
            changeType === "purchase"
              ? "added"
              : changeType === "usage"
              ? "used"
              : changeType === "waste"
              ? "recorded waste"
              : "adjusted";
          toast.success(`Stock ${actionLabel}`, {
            description: `${item.ingredient?.name}: ${newStock} ${item.unit}`,
          });
          handleOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to update stock");
        },
      }
    );
  };

  const selectedType = changeTypes.find((t) => t.value === changeType);
  const TypeIcon = selectedType?.icon || Package;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className={`h-5 w-5 ${selectedType?.color}`} />
            Adjust Stock
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {item && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">{item.ingredient?.name}</p>
              <p className="text-sm text-muted-foreground">
                Current: {item.current_stock} {item.unit}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={changeType}
              onValueChange={(v) => setChangeType(v as typeof changeType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {changeTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity ({item?.unit || "units"})</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              {...register("quantity", {
                required: "Required",
                min: { value: 0.01, message: "Must be > 0" },
                valueAsNumber: true,
              })}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Monthly restock..."
              rows={2}
              {...register("reason")}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

