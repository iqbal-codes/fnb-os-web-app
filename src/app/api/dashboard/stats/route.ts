import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Get dashboard stats (today's sales, orders count, etc.)
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json({
        todaySales: 0,
        todayOrders: 0,
        healthScore: null,
      });
    }

    // Get today's stats
    const today = new Date().toISOString().split("T")[0];

    // Try to get daily summary (will fail if table doesn't exist yet)
    let todaySales = 0;
    let todayOrders = 0;

    try {
      const { data: summary } = await supabase
        .from("daily_summaries")
        .select("total_sales, total_orders")
        .eq("business_id", business.id)
        .eq("date", today)
        .single();

      if (summary) {
        todaySales = summary.total_sales || 0;
        todayOrders = summary.total_orders || 0;
      }
    } catch {
      // Tables might not exist yet
    }

    return NextResponse.json({
      todaySales,
      todayOrders,
      healthScore: null, // Will be calculated by AI later
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

