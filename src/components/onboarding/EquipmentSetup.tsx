'use client';

import { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  estimated_price: number;
  priority: 'essential' | 'recommended' | 'optional';
  isAiSuggested: boolean;
  isSelected: boolean;
}

interface EquipmentSetupProps {
  businessName?: string;
  businessType: string;
  description?: string;
  location?: string;
  operatingModel: string;
  teamSize: string;
  targetDailySales?: number;
  initialData?: EquipmentItem[];
  onSave: (data: EquipmentItem[]) => void;
  onBack?: () => void;
}

const priorityColors = {
  essential: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  recommended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  optional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

const priorityLabels = {
  essential: 'Wajib',
  recommended: 'Disarankan',
  optional: 'Opsional',
};

export function EquipmentSetup({ initialData, onSave, onBack }: EquipmentSetupProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initialData || []);
  const [newItemName, setNewItemName] = useState('');

  const toggleSelected = (id: string) => {
    setEquipment((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item)),
    );
  };

  const updateQuantity = (id: string, quantity: number | undefined) => {
    if (quantity === undefined) return;
    setEquipment((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    );
  };

  const updatePrice = (id: string, estimated_price: number | undefined) => {
    if (estimated_price === undefined) return;
    setEquipment((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estimated_price, isAiSuggested: false } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setEquipment((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: EquipmentItem = {
      id: `custom-${Date.now()}`,
      name: newItemName,
      quantity: 1,
      estimated_price: 0,
      priority: 'optional',
      isAiSuggested: false,
      isSelected: true,
    };
    setEquipment((prev) => [...prev, newItem]);
    setNewItemName('');
  };

  const calculateTotal = () => {
    return equipment
      .filter((item) => item.isSelected)
      .reduce((sum, item) => sum + item.quantity * item.estimated_price, 0);
  };

  const handleSave = () => {
    onSave(equipment.filter((item) => item.isSelected));
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='flex items-center gap-2 font-semibold'>
            <Package className='text-primary h-5 w-5' />
            Peralatan Starter Kit
          </h3>
          <p className='text-muted-foreground text-sm'>Peralatan dasar untuk memulai bisnis</p>
        </div>
      </div>

      <div className='space-y-3'>
        {equipment.length === 0 && (
          <div className='text-muted-foreground bg-muted/20 rounded-lg border border-dashed py-4 text-center text-sm'>
            Belum ada peralatan. Tambahkan peralatan manual di bawah ini.
          </div>
        )}

        {equipment.map((item) => (
          <div
            key={item.id}
            className={`bg-muted/40 rounded-lg border p-3 transition-opacity ${
              !item.isSelected ? 'opacity-50' : ''
            }`}
          >
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex items-start gap-2'>
                <Checkbox
                  checked={item.isSelected}
                  onCheckedChange={() => toggleSelected(item.id)}
                  className='mt-1'
                />
                <div>
                  <div className='font-medium'>{item.name}</div>
                  <div className='mt-1 flex flex-wrap gap-1'>
                    <Badge className={`text-xs ${priorityColors[item.priority]}`}>
                      {priorityLabels[item.priority]}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:text-destructive -mr-2 h-8 w-8'
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex gap-2'>
              <div className='w-[100px]'>
                <Label className='text-muted-foreground mb-1 block text-xs'>Qty</Label>
                <NumberInput
                  value={item.quantity}
                  onValueChange={(val) => updateQuantity(item.id, val)}
                  className='text-center'
                  min={1}
                />
              </div>
              <div className='relative flex-1'>
                <Label className='text-muted-foreground mb-1 block text-xs'>Estimasi Harga</Label>
                <NumberInput
                  value={item.estimated_price}
                  onValueChange={(val) => updatePrice(item.id, val)}
                  className='pl-9 text-right'
                  placeholder='0'
                  prefix='Rp '
                  thousandSeparator='.'
                  decimalSeparator=','
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add custom item */}
        <div className='flex items-center gap-2 pt-2'>
          <Input
            placeholder='Tambah peralatan lain...'
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            autoFocus={equipment.length === 0}
          />
          <Button variant='outline' size='icon' onClick={addItem}>
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Total Cost */}
      <Card className='bg-primary/5 border-primary/20'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <span className='font-medium'>Estimasi Modal Peralatan</span>
              <p className='text-muted-foreground text-xs'>
                {equipment.filter((i) => i.isSelected).length} item dipilih
              </p>
            </div>
            <span className='text-primary text-xl font-bold'>
              Rp {calculateTotal().toLocaleString('id-ID')}
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
