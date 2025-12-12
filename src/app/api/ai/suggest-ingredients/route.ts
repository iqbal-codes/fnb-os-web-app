import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/ai/gemini';

interface IngredientSuggestion {
  name: string;
  usage_quantity: number;
  usage_unit: string;
  buying_quantity: number;
  buying_unit: string;
  buying_price: number;
}

interface MenuIngredientsSuggestion {
  menu_name: string;
  category: string;
  ingredients: IngredientSuggestion[];
  estimated_cogs: number;
  suggested_selling_price: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menu_name, menu_description, business_type } = body;

    if (!menu_name) {
      return NextResponse.json({ error: 'menu_name is required' }, { status: 400 });
    }

    const prompt = `
Kamu adalah chef dan konsultan F&B Indonesia.

Berikan resep dan estimasi bahan untuk menu berikut:
- Nama Menu: ${menu_name}
- Deskripsi: ${menu_description || 'Tidak ada deskripsi'}
- Tipe Bisnis: ${business_type || 'cafe'}

Berikan dalam format JSON:
{
  "menu_name": "${menu_name}",
  "category": "<kategori menu: minuman/makanan/dessert/snack>",
  "ingredients": [
    {
      "name": "<nama bahan>",
      "usage_quantity": <jumlah pemakaian per porsi>,
      "usage_unit": "<satuan resep: gram/ml/pcs/sdm>",
      "buying_quantity": <jumlah kemasan beli>,
      "buying_unit": "<satuan kemasan beli: kg/liter/pack/botol>",
      "buying_price": <harga beli per kemasan>
    }
  ],
  "estimated_cogs": <total biaya bahan per porsi>,
  "suggested_selling_price": <harga jual dengan margin 50-60%>
}

Aturan:
- Berikan 3-8 bahan utama
- "buying_quantity" dan "buying_unit" adalah ukuran kemasan umum di pasar (contoh: Kopi 1 kg, Susu 1 Liter).
- "buying_price" adalah harga pasar Indonesia 2025 untuk kemasan tersebut.
- Estimasi harga harus realistis.
`;

    const suggestion = await generateJSON<MenuIngredientsSuggestion>(prompt);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('AI suggest-ingredients error:', error);
    return NextResponse.json({ error: 'Failed to suggest ingredients' }, { status: 500 });
  }
}
