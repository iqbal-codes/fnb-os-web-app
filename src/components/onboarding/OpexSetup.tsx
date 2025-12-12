'use client';

import { useState } from 'react';
import { Banknote, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OpexCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isAiSuggested: boolean;
}

interface OpexSetupProps {
  businessName?: string;
  businessType: string;
  description?: string;
  location?: string;
  operatingModel: string;
  teamSize?: string;
  targetDailySales?: number;
  initialData?: OpexCategory[];
  onSave: (data: OpexCategory[]) => void;
  onBack?: () => void;
}

const DEFAULT_CATEGORIES: OpexCategory[] = [
  // ... (omitting unchanged lines for brevity if possible, but replace_file_content needs contiguous block. I will just target the props interface and function start separately if needed, or use multi_replace. Let's use multi_replace for safety or just two calls. I'll do two calls to be safe and clear.)

  // Actually, I can just update the interface and props in one go if they are close, but they are far apart.
  // Let's update the interface first.

  {
    id: '1',
    name: 'Listrik',
    amount: 500000,
    frequency: 'monthly',
    isAiSuggested: true,
  },
  {
    id: '2',
    name: 'Air',
    amount: 150000,
    frequency: 'monthly',
    isAiSuggested: true,
  },
  {
    id: '3',
    name: 'Internet',
    amount: 300000,
    frequency: 'monthly',
    isAiSuggested: true,
  },
  {
    id: '4',
    name: 'Packaging',
    amount: 200000,
    frequency: 'monthly',
    isAiSuggested: true,
  },
  {
    id: '5',
    name: 'Gas/LPG',
    amount: 100000,
    frequency: 'monthly',
    isAiSuggested: true,
  },
  {
    id: '6',
    name: 'Lain-lain',
    amount: 200000,
    frequency: 'monthly',
    isAiSuggested: true,
  },
];

export function OpexSetup({ initialData, onSave, onBack }: OpexSetupProps) {
  const [categories, setCategories] = useState<OpexCategory[]>(initialData || DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');

  const updateAmount = (id: string, amount: number | undefined) => {
    if (amount === undefined) return;
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, amount, isAiSuggested: false } : cat)),
    );
  };

  const updateFrequency = (id: string, frequency: OpexCategory['frequency']) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, frequency } : cat)));
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: OpexCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName,
      amount: 0,
      frequency: 'monthly',
      isAiSuggested: false,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName('');
  };

  const calculateMonthlyTotal = () => {
    return categories.reduce((sum, cat) => {
      const monthly =
        cat.frequency === 'daily'
          ? cat.amount * 30
          : cat.frequency === 'weekly'
            ? cat.amount * 4
            : cat.frequency === 'yearly'
              ? cat.amount / 12
              : cat.amount;
      return sum + monthly;
    }, 0);
  };

  const handleSave = () => {
    onSave(categories);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='flex items-center gap-2 font-semibold'>
            <Banknote className='text-primary h-5 w-5' />
            Estimasi Biaya Operasional
          </h3>
          <p className='text-muted-foreground text-sm'>Atur estimasi OPEX bulanan Anda</p>
        </div>
      </div>

      <Card>
        <CardContent className='space-y-3 p-4'>
          {categories.map((cat) => (
            <div key={cat.id} className='bg-muted/40 rounded-lg border p-3'>
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>{cat.name}</span>
                  {cat.isAiSuggested && (
                    <Badge variant='secondary' className='h-5 px-1.5 text-xs'>
                      AI
                    </Badge>
                  )}
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-destructive -mr-2 h-8 w-8'
                  onClick={() => removeCategory(cat.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>

              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <NumberInput
                    value={cat.amount}
                    onValueChange={(val) => updateAmount(cat.id, val)}
                    className='pl-3 text-right' // Adjusted padding, prefix handled by component logic visually usually, but let's check NumberInput prefix implementation
                    placeholder='0'
                    prefix='Rp '
                    thousandSeparator='.'
                    decimalSeparator=','
                  />
                </div>
                <div className='w-[110px]'>
                  <Select
                    value={cat.frequency}
                    onValueChange={(v) => updateFrequency(cat.id, v as OpexCategory['frequency'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='daily'>Harian</SelectItem>
                      <SelectItem value='weekly'>Mingguan</SelectItem>
                      <SelectItem value='monthly'>Bulanan</SelectItem>
                      <SelectItem value='yearly'>Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {/* Add new category */}
          <div className='flex items-center gap-2 pt-2'>
            <Input
              placeholder='Tambah kategori baru...'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button variant='outline' size='icon' onClick={addCategory}>
              <Plus className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Total */}
      <Card className='bg-primary/5 border-primary/20'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <span className='font-medium'>Total OPEX Bulanan</span>
            <span className='text-primary text-xl font-bold'>
              Rp {calculateMonthlyTotal().toLocaleString('id-ID')}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className='flex gap-3'>
        {onBack && (
          <Button variant='outline' className='flex-1' onClick={onBack}>
            Kembali
          </Button>
        )}
        <Button className='flex-1' onClick={handleSave}>
          Simpan & Lanjut
        </Button>
      </div>
    </div>
  );
}
