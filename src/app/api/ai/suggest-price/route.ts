import { NextRequest, NextResponse } from "next/server";
import { generateJSON, type PriceSuggestion } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredient_name, category, current_price, market_unit, location } =
      body;

    if (!ingredient_name) {
      return NextResponse.json(
        { error: "ingredient_name is required" },
        { status: 400 }
      );
    }

    const prompt = `
Kamu adalah ahli harga bahan makanan dan minuman di Indonesia, khususnya untuk bisnis F&B.

Berikan estimasi harga untuk bahan berikut:
- Nama Bahan: ${ingredient_name}
- Kategori: ${category || "umum"}
- Satuan: ${market_unit || "kg"}
- Lokasi: ${location || "Indonesia"}
${
  current_price
    ? `- Harga saat ini: Rp ${current_price.toLocaleString("id-ID")}`
    : ""
}

Berikan respons dalam format JSON:
{
  "suggested_price": <angka dalam Rupiah>,
  "confidence": "low" | "medium" | "high",
  "reasoning": "<penjelasan singkat>",
  "market_range": {
    "min": <harga minimum>,
    "max": <harga maksimum>
  }
}

Gunakan harga pasar Indonesia yang realistis untuk tahun 2024.
`;

    const suggestion = await generateJSON<PriceSuggestion>(prompt);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("AI price suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to get AI suggestion" },
      { status: 500 }
    );
  }
}

