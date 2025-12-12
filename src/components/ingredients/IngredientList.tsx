'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, MoreVertical, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useIngredients, useCreateIngredient, useDeleteIngredient } from '@/hooks/useIngredients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getUnitOptions } from '@/lib/utils/units';
import type { Ingredient } from '@/types';

const INGREDIENT_CATEGORIES = [
  { value: 'protein', label: 'Protein' },
  { value: 'vegetable', label: 'Sayuran' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'dry_goods', label: 'Bahan Kering' },
  { value: 'beverage', label: 'Minuman' },
  { value: 'spices', label: 'Bumbu' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Lainnya' },
];

const ingredientSchema = z.object({
  name: z.string().min(1, 'Nama bahan wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  market_unit: z.string().min(1, 'Satuan beli wajib diisi'),
  market_qty: z.preprocess(
    (val) => Number(val),
    z.number().min(0.001, 'Kuantitas harus lebih dari 0'),
  ),
  price_per_market_unit: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Harga harus 0 atau lebih'),
  ),
  recipe_unit: z.string().optional(),
  conversion_factor: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function IngredientList() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useIngredients();
  const deleteIngredient = useDeleteIngredient();

  const ingredients = data?.ingredients || [];

  // Filter by search
  const filteredIngredients = ingredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      ing.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteIngredient.mutateAsync(deleteId);
      toast.success('Bahan berhasil dihapus');
      setDeleteId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus';
      toast.error(message);
    }
  };

  if (error) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='text-destructive p-6 text-center'>
          Gagal memuat bahan. Silakan coba lagi.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Search */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Cari bahan...'
            className='pl-10'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Tambah
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='grid gap-3 sm:grid-cols-2'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredIngredients.length === 0 && (
        <Card className='border-dashed'>
          <CardContent className='p-8 text-center'>
            <Package className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <h3 className='mb-2 font-medium'>
              {ingredients.length === 0 ? 'Belum ada bahan' : 'Tidak ditemukan'}
            </h3>
            <p className='text-muted-foreground mb-4 text-sm'>
              {ingredients.length === 0
                ? 'Tambahkan bahan untuk membuat resep'
                : 'Coba kata kunci lain'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ingredient Grid */}
      {!isLoading && filteredIngredients.length > 0 && (
        <div className='grid gap-3 sm:grid-cols-2'>
          {filteredIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onDelete={() => setDeleteId(ingredient.id)}
            />
          ))}
        </div>
      )}

      {/* Add Ingredient Dialog */}
      <AddIngredientDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Bahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Bahan yang sudah digunakan di resep mungkin terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteIngredient.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IngredientCard({
  ingredient,
  onDelete,
}: {
  ingredient: Ingredient;
  onDelete: () => void;
}) {
  const categoryLabel =
    INGREDIENT_CATEGORIES.find((c) => c.value === ingredient.category)?.label ||
    ingredient.category;

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          <div className='bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
            <Package className='text-muted-foreground h-5 w-5' />
          </div>

          <div className='min-w-0 flex-1'>
            <h3 className='truncate font-medium'>{ingredient.name}</h3>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary' className='text-xs'>
                {categoryLabel}
              </Badge>
              <span className='text-muted-foreground text-xs'>
                {ingredient.market_qty} {ingredient.market_unit}
              </span>
            </div>
          </div>

          <div className='shrink-0 text-right'>
            <p className='text-sm font-medium'>
              {formatCurrency(ingredient.price_per_market_unit)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='shrink-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className='text-destructive focus:text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function AddIngredientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createIngredient = useCreateIngredient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IngredientFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ingredientSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      market_unit: 'kg',
      market_qty: 1,
      price_per_market_unit: 0,
    },
  });

  const onSubmit = async (data: IngredientFormData) => {
    try {
      await createIngredient.mutateAsync(data);
      toast.success('Bahan berhasil ditambahkan');
      reset();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Bahan Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Nama Bahan *</Label>
            <Input id='name' placeholder='cth. Kopi Arabica' {...register('name')} />
            {errors.name && <p className='text-destructive text-sm'>{errors.name.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='category'>Kategori *</Label>
            <Controller
              name='category'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih kategori' />
                  </SelectTrigger>
                  <SelectContent>
                    {INGREDIENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className='text-destructive text-sm'>{errors.category.message}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='market_qty'>Kuantitas Beli</Label>
              <Input id='market_qty' type='number' step='0.01' {...register('market_qty')} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='market_unit'>Satuan Beli *</Label>
              <Controller
                name='market_unit'
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih satuan' />
                    </SelectTrigger>
                    <SelectContent>
                      {getUnitOptions().map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='price_per_market_unit'>Harga per Satuan (IDR)</Label>
            <Input
              id='price_per_market_unit'
              type='number'
              placeholder='50000'
              {...register('price_per_market_unit')}
            />
          </div>

          <div className='flex gap-3 pt-2'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type='submit' className='flex-1' disabled={createIngredient.isPending}>
              {createIngredient.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
