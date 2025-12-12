import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/gemini";

interface BusinessAnalysis {
  business_type: string;
  complexity: "simple" | "moderate" | "complex";
  suggested_menu_categories: string[];
  estimated_startup_cost: {
    min: number;
    max: number;
  };
  key_equipment: string[];
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
      operating_model,
      team_size,
      location,
      target_daily_sales,
    } = body;

    const prompt = `
Kamu adalah konsultan bisnis F&B Indonesia yang berpengalaman.

Analisis ide bisnis berikut dan berikan rekomendasi:

INFORMASI BISNIS:
- Nama: ${business_name || "Belum ada"}
- Tipe: ${business_type || "F&B umum"}
- Deskripsi: ${description || "Belum ada deskripsi"}
- Model Operasi: ${operating_model || "Belum ditentukan"}
- Ukuran Tim: ${team_size || "Belum ditentukan"}
- Lokasi: ${location || "Indonesia"}
- Target Penjualan Harian: ${target_daily_sales || "Belum ditentukan"} transaksi

Berikan analisis dalam format JSON:
{
  "business_type": "<klasifikasi tipe bisnis>",
  "complexity": "simple" | "moderate" | "complex",
  "suggested_menu_categories": ["<kategori menu 1>", "<kategori menu 2>", ...],
  "estimated_startup_cost": {
    "min": <angka minimum dalam Rupiah>,
    "max": <angka maksimum dalam Rupiah>
  },
  "key_equipment": ["<peralatan 1>", "<peralatan 2>", ...],
  "typical_opex_categories": [
    {
      "name": "<nama kategori>",
      "estimated_amount": <estimasi biaya bulanan>,
      "frequency": "monthly"
    }
  ]
}

Berikan 3-5 kategori menu, 5-8 peralatan utama, dan 5-8 kategori OPEX.
Gunakan harga pasar Indonesia yang realistis untuk tahun 2024.
`;

    const analysis = await generateJSON<BusinessAnalysis>(prompt);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI analyze-idea error:", error);
    return NextResponse.json(
      { error: "Failed to analyze business idea" },
      { status: 500 }
    );
  }
}

