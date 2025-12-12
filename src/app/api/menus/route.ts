import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Get all menus for current user's business
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("active") === "true";

    // Get user's business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json({ menus: [] });
    }

    let query = supabase
      .from("menus")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data: menus, error } = await query;

    if (error) throw error;

    return NextResponse.json({ menus: menus || [] });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new menu item
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, description, selling_price, image_url } = body;

    if (!name || selling_price === undefined) {
      return NextResponse.json(
        { error: "Name and selling price are required" },
        { status: 400 }
      );
    }

    // Get user's business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json(
        { error: "Business not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    const { data: menu, error } = await supabase
      .from("menus")
      .insert({
        business_id: business.id,
        name,
        category: category || "uncategorized",
        description,
        selling_price,
        image_url,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

