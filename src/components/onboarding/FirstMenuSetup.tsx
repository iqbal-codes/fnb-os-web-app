'use client';

import { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  UNIT_CATEGORIES,
  getUnitCategory,
  calculateMenuCOGS,
  calculateOpexPerUnit,
} from '@/lib/businessLogic';

interface RecipeIngredient {
  id: string;
  name: string;
  usageQuantity: number;
  usageUnit: string;
  buyingQuantity: number;
  buyingUnit: string;
  buyingPrice: number;
  isAiSuggested: boolean;
}

interface FirstMenuData {
  name: string;
  category: string;
  description: string;
  ingredients: RecipeIngredient[];
  estimatedCogs: number;
  suggestedPrice: number;
}

interface FirstMenuSetupProps {
  businessType: string;
  opexTotal: number;
  targetDailySales: number;
  onSave: (data: FirstMenuData) => void;
  onBack?: () => void;
}

const CATEGORY_OPTIONS = ['minuman', 'makanan', 'snack', 'dessert'];

const CATEGORY_OPTIONS = ['minuman', 'makanan', 'snack', 'dessert'];

export function FirstMenuSetup({
  opexTotal,
  targetDailySales,
  onSave,
  onBack,
}: FirstMenuSetupProps) {
  const [menuName, setMenuName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState(0);

  // State for calculation results
  const [isCalculated, setIsCalculated] = useState(false);
  const [materialCogs, setMaterialCogs] = useState(0);
  const [opexPerCup, setOpexPerCup] = useState(0);
  const [totalCogs, setTotalCogs] = useState(0);

  const addIngredient = () => {
    const newIng: RecipeIngredient = {
      id: `custom-${Date.now()}`,
      name: '',
      usageQuantity: 0,
      usageUnit: 'gram',
      buyingQuantity: 1,
      buyingUnit: 'kg', // Default compatible with gram
      buyingPrice: 0,
      isAiSuggested: false,
    };
    setIngredients((prev) => [...prev, newIng]);
    setIsCalculated(false);
  };

  const updateIngredient = (
    id: string,
    field: keyof RecipeIngredient,
    value: string | number | undefined,
  ) => {
    if (value === undefined && typeof value !== 'string') return;

    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;

        const updatedIng = { ...ing, [field]: value, isAiSuggested: false };

        // Auto-adjust Buying Unit options if Usage Unit changes
        if (field === 'usageUnit') {
          const newCategory = getUnitCategory(value as string);
          if (newCategory !== 'unknown') {
            const defaultBuyUnit =
              newCategory === 'mass' ? 'kg' : newCategory === 'volume' ? 'liter' : 'pack';
            // Only change buying unit if incompatible
            const currentBuyCategory = getUnitCategory(ing.buyingUnit);
            if (currentBuyCategory !== newCategory) {
              updatedIng.buyingUnit = defaultBuyUnit;
            }
          }
        }

        return updatedIng;
      }),
    );
    setIsCalculated(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    setIsCalculated(false);
  };

  const calculateDetailedCogs = () => {
    return calculateMenuCOGS(ingredients);
  };

  const handleCalculate = () => {
    if (ingredients.length === 0) {
      toast.error('Tambahkan minimal 1 bahan');
      return;
    }

    const calculatedMatCogs = calculateDetailedCogs();
    setMaterialCogs(calculatedMatCogs);

    // Calculate OPEX per cup
    // Assume 30 days/month
    const monthlySales = (targetDailySales || 30) * 30;
    const calcOpexPerCup = calculateOpexPerUnit(opexTotal, monthlySales);
    setOpexPerCup(calcOpexPerCup);

    const total = calculatedMatCogs + calcOpexPerCup;
    setTotalCogs(total);

    // Suggest price (Margin 50% => Price = Total * 2)
    setSuggestedPrice(Math.ceil(total * 2));

    setIsCalculated(true);
    toast.success('COGS & Harga berhasil dihitung!');
  };

  const handleSave = () => {
    if (!isCalculated) {
      toast.error("Mohon klik 'Cek COGS & Harga' terlebih dahulu");
      return;
    }
    if (!menuName.trim()) {
      toast.error('Nama menu wajib diisi');
      return;
    }

    onSave({
      name: menuName,
      category: category || 'minuman',
      description,
      ingredients,
      estimatedCogs: materialCogs,
      suggestedPrice: suggestedPrice,
    });
  };

  // Helper to get buying options based on usage unit
  const getBuyingOptions = (usageUnit: string) => {
    const cat = getUnitCategory(usageUnit);
    if (cat === 'unknown') return UNIT_CATEGORIES.unit.units;
    return UNIT_CATEGORIES[cat].units;
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='flex items-center gap-2 font-semibold'>
          <UtensilsCrossed className='text-primary h-5 w-5' />
          Buat Menu Pertama
        </h3>
        <p className='text-muted-foreground text-sm'>Buat satu menu contoh dengan resepnya</p>
      </div>

      <div className='space-y-4'>
        {/* Menu Name */}
        <div className='space-y-2'>
          <Label>Nama Menu *</Label>
          <Input
            placeholder='e.g., Es Kopi Susu'
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className='space-y-2'>
          <Label>Kategori</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder='Pilih kategori' />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description (Optional) */}
        <div className='space-y-2'>
          <Label>Deskripsi (Opsional)</Label>
          <Input
            placeholder='Deskripsi singkat menu...'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Ingredients */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label>Bahan-bahan</Label>
            <Button variant='ghost' size='sm' onClick={addIngredient}>
              <Plus className='mr-1 h-4 w-4' />
              Tambah
            </Button>
          </div>

          {ingredients.length === 0 ? (
            <div className='text-muted-foreground bg-muted/20 rounded-lg border border-dashed py-6 text-center text-sm'>
              Belum ada bahan. Tambahkan bahan manual untuk menghitung HPP.
            </div>
          ) : (
            <div className='space-y-3'>
              {ingredients.map((ing) => (
                <Card key={ing.id} className='overflow-hidden border shadow-sm'>
                  <CardContent className='space-y-3 p-4'>
                    {/* Top Row: Name & Usage - Grid Layout */}
                    <div className='grid grid-cols-[1fr_100px_110px_40px] items-end gap-3'>
                      <div className='space-y-1.5'>
                        <Label className='text-muted-foreground text-xs font-medium'>
                          Nama Bahan
                        </Label>
                        <Input
                          value={ing.name}
                          onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                          placeholder='Nama bahan'
                          className='h-9'
                        />
                      </div>
                      <div className='space-y-1.5'>
                        <Label className='text-muted-foreground text-xs font-medium'>Pakai</Label>
                        <NumberInput
                          value={ing.usageQuantity}
                          onValueChange={(val) => updateIngredient(ing.id, 'usageQuantity', val)}
                          className='h-9 text-center'
                          placeholder='0'
                          allowDecimals
                          allowLeadingZeros
                        />
                      </div>
                      <div className='space-y-1.5'>
                        <Label className='text-muted-foreground text-xs font-medium'>Satuan</Label>
                        <Select
                          value={ing.usageUnit}
                          onValueChange={(v) => updateIngredient(ing.id, 'usageUnit', v)}
                        >
                          <SelectTrigger className='h-9'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <div className='text-muted-foreground px-2 py-1.5 text-xs font-semibold'>
                              Berat
                            </div>
                            {UNIT_CATEGORIES.mass.units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                            <div className='text-muted-foreground mt-1 border-t px-2 py-1.5 text-xs font-semibold'>
                              Volume
                            </div>
                            {UNIT_CATEGORIES.volume.units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                            <div className='text-muted-foreground mt-1 border-t px-2 py-1.5 text-xs font-semibold'>
                              Unit
                            </div>
                            {UNIT_CATEGORIES.unit.units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex justify-end pb-[2px]'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-muted-foreground hover:text-destructive h-9 w-9'
                          onClick={() => removeIngredient(ing.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Row: Buying Info (Bg muted) */}
                    <div className='bg-muted/40 rounded-lg border p-3 text-sm'>
                      <div className='flex items-center gap-3'>
                        <div className='flex min-w-fit items-center gap-2'>
                          <span className='text-muted-foreground text-xs font-medium'>
                            Info Beli:
                          </span>
                        </div>

                        <div className='flex flex-1 items-center gap-2'>
                          <div className='w-[90px]'>
                            <NumberInput
                              value={ing.buyingQuantity}
                              onValueChange={(val) =>
                                updateIngredient(ing.id, 'buyingQuantity', val)
                              }
                              className='bg-background h-9 text-center shadow-sm'
                              placeholder='Qty'
                            />
                          </div>

                          <Select
                            value={ing.buyingUnit}
                            onValueChange={(v) => updateIngredient(ing.id, 'buyingUnit', v)}
                          >
                            <SelectTrigger className='bg-background h-9 w-[100px] shadow-sm'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getBuyingOptions(ing.usageUnit).map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span className='text-muted-foreground px-1 text-xs'>@</span>

                          <div className='flex-1'>
                            <NumberInput
                              value={ing.buyingPrice}
                              onValueChange={(val) => updateIngredient(ing.id, 'buyingPrice', val)}
                              className='bg-background h-9 shadow-sm'
                              placeholder='Harga Beli'
                              prefix='Rp '
                              thousandSeparator='.'
                              decimalSeparator=','
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logic to Show Calculation Button or Results */}
      {!isCalculated ? (
        <Button
          variant='secondary'
          className='border-primary/20 hover:border-primary/50 w-full border-2'
          onClick={handleCalculate}
          disabled={ingredients.length === 0}
        >
          <Calculator className='mr-2 h-4 w-4' />
          Cek COGS & Estimasi Harga
        </Button>
      ) : (
        <div className='animate-in fade-in slide-in-from-bottom-4 space-y-4 duration-500'>
          <Card className='bg-primary/5 border-primary/20'>
            <CardContent className='space-y-3 p-4'>
              <div className='border-primary/10 flex items-center justify-between border-b pb-3'>
                <span className='text-sm font-medium'>Material COGS</span>
                <span className='font-bold'>Rp {materialCogs.toLocaleString('id-ID')}</span>
              </div>
              <div className='text-muted-foreground flex items-center justify-between text-sm'>
                <span>Est. OPEX / porsi</span>
                <span>+ Rp {opexPerCup.toLocaleString('id-ID')}</span>
              </div>
              <div className='border-primary/20 flex items-center justify-between border-t pt-2'>
                <span className='text-primary font-bold'>Total COGS</span>
                <span className='text-primary text-lg font-bold'>
                  Rp {totalCogs.toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-muted-foreground mb-1 text-sm'>
                  Rekomendasi Harga Jual (Margin 50%)
                </p>
                <div className='flex items-center justify-center gap-2'>
                  <p className='text-3xl font-bold text-green-600'>
                    Rp {suggestedPrice.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className='mt-4 flex justify-center gap-2'>
                  <Button variant='outline' size='sm' onClick={() => setIsCalculated(false)}>
                    Edit Bahan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3 pt-2'>
        {onBack && (
          <Button variant='outline' className='flex-1' onClick={onBack}>
            Kembali
          </Button>
        )}
        <Button
          className='flex-1'
          onClick={handleSave}
          disabled={!isCalculated} // DISABLED UNTIL CALCULATED
        >
          Simpan Menu & Lanjut
        </Button>
      </div>
    </div>
  );
}
