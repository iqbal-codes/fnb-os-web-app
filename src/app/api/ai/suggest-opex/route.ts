import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/ai/gemini';

interface OpexSuggestion {
  typical_opex_categories: {
    name: string;
    estimated_amount: number;
    frequency: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_name,
      business_type,
      description,
      location,
      operating_model,
      team_size,
      target_daily_sales,
    } = body;

    const prompt = `
Kamu adalah konsultan keuangan bisnis F&B Indonesia.

Berikan daftar estimasi biaya operasional (OPEX) bulanan untuk bisnis berikut:
- Nama Bisnis: ${business_name || 'Bisnis F&B'}
- Tipe Bisnis: ${business_type || 'cafe'}
- Deskripsi: ${description || 'Tidak ada deskripsi'}
- Lokasi: ${location || 'Indonesia'}
- Model Operasi: ${operating_model || 'cafe'}
- Ukuran Tim: ${team_size || 'solo'}
- Target Penjualan: ${target_daily_sales || '30'} transaksi/hari

Berikan rekomendasi dalam format JSON:
{
  "typical_opex_categories": [
    {
      "name": "<nama kategori>",
      "estimated_amount": <estimasi biaya dalam Rupiah>,
      "frequency": "monthly" | "weekly" | "daily" | "yearly"
    }
  ]
}

Aturan:
- Berikan 6-10 kategori biaya operasional rutin (Listrik, Air, Gaji Karyawan, Bahan Baku Habis Pakai non-makanan, Internet, Sewa, dll).
- Estimasi biaya HARUS realistis untuk ukuran bisnis dan target penjualan tersebut di Indonesia tahun 2025.
- Jangan masukkan COGS (biaya bahan baku makanan/minuman) di sini.
- Fokus pada biaya rutin (overhead).
`;

    const suggestion = await generateJSON<OpexSuggestion>(prompt);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('AI suggest-opex error:', error);
    return NextResponse.json({ error: 'Failed to suggest OPEX' }, { status: 500 });
  }
}
