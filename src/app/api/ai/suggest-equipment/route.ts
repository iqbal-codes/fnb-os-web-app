import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/gemini";

interface EquipmentItem {
  name: string;
  quantity: number;
  estimated_price: number;
  priority: "essential" | "recommended" | "optional";
}

interface EquipmentSuggestion {
  equipment: EquipmentItem[];
  total_estimated_cost: number;
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
Kamu adalah konsultan peralatan F&B Indonesia.

Berikan daftar peralatan starter kit untuk bisnis berikut:
- Nama Bisnis: ${business_name || "Bisnis F&B"}
- Tipe Bisnis: ${business_type || "cafe"}
- Deskripsi: ${description || "Tidak ada deskripsi"}
- Lokasi: ${location || "Indonesia"}
- Model Operasi: ${operating_model || "cafe"}
- Ukuran Tim: ${team_size || "solo"}
- Target Penjualan: ${target_daily_sales || "30"} transaksi/hari

Berikan rekomendasi dalam format JSON:
{
  "equipment": [
    {
      "name": "<nama peralatan>",
      "quantity": <jumlah>,
      "estimated_price": <harga per unit dalam Rupiah>,
      "priority": "essential" | "recommended" | "optional"
    }
  ],
  "total_estimated_cost": <total estimasi biaya>
}

Aturan:
- Berikan 8-12 item peralatan
- Prioritaskan peralatan essential (5-6 item) yang KRUSIAL untuk operasional dasar sesuai deskripsi bisnis.
- Gunakan harga pasar Indonesia 2025 yang realistis.
- Sesuaikan kapasitas alat dengan target penjualan harian.
`;

    const suggestion = await generateJSON<EquipmentSuggestion>(prompt);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("AI suggest-equipment error:", error);
    return NextResponse.json(
      { error: "Failed to suggest equipment" },
      { status: 500 }
    );
  }
}

