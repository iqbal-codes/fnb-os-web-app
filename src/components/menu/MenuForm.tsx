'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/i18n/navigation';
import { useMenu, useCreateMenu, useUpdateMenu } from '@/hooks/useMenus';
import { useIngredients } from '@/hooks/useIngredients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getUnitOptions, getUnitCategory } from '@/lib/utils/units';
import { calculateIngredientCost } from '@/lib/calculations/cogs';

const MENU_CATEGORIES = [
  'Minuman Kopi',
  'Minuman Non-Kopi',
  'Makanan Ringan',
  'Makanan Berat',
  'Dessert',
  'Paket',
  'Lainnya',
];

const menuSchema = z.object({
  name: z.string().min(1, 'Nama menu wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  description: z.string().optional(),
  selling_price: z.coerce.number().min(0, 'Harga harus lebih dari 0'),
  is_active: z.boolean().default(true),
  recipe: z.object({
    yield_qty: z.coerce.number().min(1).default(1),
    yield_unit: z.string().default('porsi'),
    ingredients: z.array(
      z.object({
        ingredient_id: z.string().min(1, 'Pilih bahan'),
        quantity: z.coerce.number().min(0.001, 'Jumlah harus lebih dari 0'),
        unit: z.string().min(1, 'Masukkan satuan'),
      }),
    ),
  }),
});

type MenuFormData = z.infer<typeof menuSchema>;

interface MenuFormProps {
  menuId?: string;
}

export function MenuForm({ menuId }: MenuFormProps) {
  const router = useRouter();
  const isEditing = !!menuId;

  // Fetch existing menu if editing
  const { data: menuData, isLoading: menuLoading } = useMenu(menuId || '');

  // Fetch available ingredients
  const { data: ingredientsData } = useIngredients({ active: true });
  const ingredients = ingredientsData?.ingredients || [];

  // Mutations
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu(menuId || '');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MenuFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(menuSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      description: '',
      selling_price: 0,
      is_active: true,
      recipe: {
        yield_qty: 1,
        yield_unit: 'porsi',
        ingredients: [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'recipe.ingredients',
  });

  // Populate form when editing
  useEffect(() => {
    if (menuData?.menu) {
      const menu = menuData.menu;
      reset({
        name: menu.name,
        category: menu.category || '',
        description: menu.description || '',
        selling_price: menu.selling_price,
        is_active: menu.is_active,
        recipe: {
          yield_qty: 1,
          yield_unit: 'porsi',
          ingredients: [],
        },
      });
    }
  }, [menuData, reset]);

  // Calculate COGS from ingredients using proper unit conversion
  const recipeIngredients = watch('recipe.ingredients');
  const estimatedCogs = recipeIngredients.reduce((total, item) => {
    const ingredient = ingredients.find((i) => i.id === item.ingredient_id);
    if (!ingredient) return total;
    // Use proper unit conversion for accurate COGS
    const cost = calculateIngredientCost(
      item.quantity,
      item.unit,
      ingredient.price_per_market_unit,
      ingredient.market_qty,
      ingredient.market_unit,
    );
    return total + cost;
  }, 0);

  const sellingPrice = watch('selling_price');
  const margin = sellingPrice > 0 ? ((sellingPrice - estimatedCogs) / sellingPrice) * 100 : 0;

  const onSubmit = async (data: MenuFormData) => {
    try {
      if (isEditing) {
        await updateMenu.mutateAsync({
          name: data.name,
          category: data.category,
          description: data.description,
          selling_price: data.selling_price,
          is_active: data.is_active,
          cogs: estimatedCogs,
          margin_percent: margin / 100,
        });
        toast.success('Menu berhasil diperbarui');
      } else {
        await createMenu.mutateAsync({
          name: data.name,
          category: data.category,
          description: data.description,
          selling_price: data.selling_price,
        });
        toast.success('Menu berhasil ditambahkan');
      }
      router.push('/menu');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      toast.error(message);
    }
  };

  if (menuLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button type='button' variant='ghost' size='icon' asChild>
          <Link href='/menu'>
            <ArrowLeft className='h-5 w-5' />
          </Link>
        </Button>
        <div>
          <h1 className='text-xl font-semibold'>{isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}</h1>
          <p className='text-muted-foreground text-sm'>
            {isEditing ? 'Perbarui detail menu' : 'Buat item menu baru dengan resep'}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Informasi Menu</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Nama Menu *</Label>
              <Input id='name' placeholder='cth. Es Kopi Susu' {...register('name')} />
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
                      {MENU_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Deskripsi (opsional)</Label>
            <Textarea
              id='description'
              placeholder='Deskripsi singkat menu...'
              rows={2}
              {...register('description')}
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='selling_price'>Harga Jual (IDR) *</Label>
              <Input
                id='selling_price'
                type='number'
                placeholder='25000'
                {...register('selling_price')}
              />
              {errors.selling_price && (
                <p className='text-destructive text-sm'>{errors.selling_price.message}</p>
              )}
            </div>

            <div className='flex items-center justify-between pt-6'>
              <Label htmlFor='is_active'>Status Aktif</Label>
              <Controller
                name='is_active'
                control={control}
                render={({ field }) => (
                  <Switch id='is_active' checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Builder */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-base'>Resep / Bahan</CardTitle>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ ingredient_id: '', quantity: 0, unit: 'gram' })}
          >
            <Plus className='mr-2 h-4 w-4' />
            Tambah Bahan
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          {fields.length === 0 && (
            <p className='text-muted-foreground py-4 text-center text-sm'>
              Belum ada bahan ditambahkan. Klik &quot;Tambah Bahan&quot; untuk memulai.
            </p>
          )}

          {fields.map((field, index) => {
            // Get selected ingredient to filter unit options
            const selectedIngredientId = watch(`recipe.ingredients.${index}.ingredient_id`);
            const selectedIngredient = ingredients.find((i) => i.id === selectedIngredientId);
            const unitCategory = selectedIngredient
              ? getUnitCategory(selectedIngredient.market_unit)
              : 'all';
            const filteredUnitOptions =
              unitCategory !== 'unknown'
                ? getUnitOptions(unitCategory as 'weight' | 'volume' | 'count')
                : getUnitOptions();

            return (
              <div key={field.id} className='flex items-start gap-2'>
                <div className='flex-1'>
                  <Controller
                    name={`recipe.ingredients.${index}.ingredient_id`}
                    control={control}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder='Pilih bahan' />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className='w-24'>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='Qty'
                    {...register(`recipe.ingredients.${index}.quantity`)}
                  />
                </div>
                <div className='w-24'>
                  <Controller
                    name={`recipe.ingredients.${index}.unit`}
                    control={control}
                    render={({ field: unitField }) => (
                      <Select value={unitField.value} onValueChange={unitField.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Unit' />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredUnitOptions.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => remove(index)}
                  className='text-destructive hover:text-destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            );
          })}

          {/* COGS Summary */}
          {fields.length > 0 && (
            <div className='space-y-2 border-t pt-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Estimasi COGS:</span>
                <span className='font-medium'>
                  Rp {Math.round(estimatedCogs).toLocaleString('id-ID')}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Margin:</span>
                <span
                  className={`font-medium ${
                    margin >= 30
                      ? 'text-green-600'
                      : margin >= 20
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {margin.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className='flex gap-3'>
        <Button type='button' variant='outline' className='flex-1' asChild>
          <Link href='/menu'>Batal</Link>
        </Button>
        <Button type='submit' className='flex-1' disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : isEditing ? (
            'Simpan Perubahan'
          ) : (
            'Tambah Menu'
          )}
        </Button>
      </div>
    </form>
  );
}
