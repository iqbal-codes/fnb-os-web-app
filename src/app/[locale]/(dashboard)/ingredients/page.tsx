import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IngredientList } from '@/components/ingredients/IngredientList';

export const metadata: Metadata = {
  title: 'Ingredients',
};

export default function IngredientsPage() {
  return (
    <div className='animate-fade-in space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold'>Bahan / Ingredients</h1>
        <p className='text-muted-foreground text-sm'>Kelola daftar bahan dan harga untuk resep</p>
      </div>

      {/* Tabs for future: Ingredients / Suppliers / Price History */}
      <Tabs defaultValue='ingredients'>
        <TabsList>
          <TabsTrigger value='ingredients'>Daftar Bahan</TabsTrigger>
          <TabsTrigger value='prices' disabled>
            Riwayat Harga
          </TabsTrigger>
        </TabsList>
        <TabsContent value='ingredients' className='mt-4'>
          <IngredientList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
