import { NextRequest, NextResponse } from "next/server";
import { generateJSON, type BusinessAnalysis } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { business_id } = body;

    if (!business_id) {
      return NextResponse.json(
        { error: "business_id is required" },
        { status: 400 }
      );
    }

    // Fetch business data
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .single();

    // Fetch menus with COGS
    const { data: menus } = await supabase
      .from("menus")
      .select("name, category, selling_price, cogs, margin_percent, is_active")
      .eq("business_id", business_id)
      .eq("is_active", true);

    // Fetch OPEX
    const { data: opex } = await supabase
      .from("opex_categories")
      .select("name, amount, frequency, is_active")
      .eq("business_id", business_id)
      .eq("is_active", true);

    // Fetch recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orders } = await supabase
      .from("orders")
      .select("total, created_at")
      .eq("business_id", business_id)
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Calculate metrics
    const totalSales = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const orderCount = orders?.length || 0;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    const totalOpex =
      opex?.reduce((sum, o) => {
        const monthly =
          o.frequency === "monthly"
            ? o.amount
            : o.frequency === "daily"
            ? o.amount * 30
            : o.frequency === "yearly"
            ? o.amount / 12
            : o.amount;
        return sum + monthly;
      }, 0) || 0;

    const menuData =
      menus?.map((m) => ({
        name: m.name,
        price: m.selling_price,
        cogs: m.cogs,
        margin:
          (((m.selling_price - (m.cogs || 0)) / m.selling_price) * 100).toFixed(
            1
          ) + "%",
      })) || [];

    const prompt = `
Kamu adalah konsultan bisnis F&B berpengalaman di Indonesia.

Analisis data bisnis berikut dan berikan rekomendasi:

INFORMASI BISNIS:
- Nama: ${business?.name || "Bisnis F&B"}
- Tipe: ${business?.type || "cafe"}
- Target Margin: ${((business?.target_margin || 0.3) * 100).toFixed(0)}%

DATA PENJUALAN (30 hari terakhir):
- Total Penjualan: Rp ${totalSales.toLocaleString("id-ID")}
- Jumlah Transaksi: ${orderCount}
- Rata-rata per Transaksi: Rp ${avgOrderValue.toLocaleString("id-ID")}

MENU (${menuData.length} item):
${menuData
  .slice(0, 10)
  .map(
    (m) =>
      `- ${m.name}: Rp ${m.price?.toLocaleString("id-ID")} (margin: ${
        m.margin
      })`
  )
  .join("\n")}

BIAYA OPERASIONAL BULANAN:
- Total OPEX: Rp ${totalOpex.toLocaleString("id-ID")}
${
  opex
    ?.slice(0, 5)
    .map((o) => `- ${o.name}: Rp ${o.amount?.toLocaleString("id-ID")}`)
    .join("\n") || "- Tidak ada data"
}

Berikan analisis dalam format JSON:
{
  "health_score": <skor 0-100>,
  "issues": [
    {
      "type": "pricing" | "cogs" | "opex" | "inventory" | "sales",
      "severity": "low" | "medium" | "high",
      "title": "<judul masalah>",
      "description": "<penjelasan singkat>"
    }
  ],
  "recommendations": [
    {
      "priority": <1-5>,
      "action": "<tindakan yang disarankan>",
      "impact": "<dampak yang diharapkan>",
      "category": "revenue" | "cost" | "efficiency" | "pricing"
    }
  ],
  "summary": "<ringkasan kondisi bisnis dalam 1-2 kalimat>"
}

Berikan maksimal 3 issues dan 5 recommendations, urutkan berdasarkan prioritas.
Jika data terbatas, berikan rekomendasi umum untuk bisnis F&B di Indonesia.
`;

    const analysis = await generateJSON<BusinessAnalysis>(prompt);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("AI business analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze business" },
      { status: 500 }
    );
  }
}

