import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Get current user's business
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

    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // Not found or table doesn't exist - return null business
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({ business: null });
      }
      throw error;
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new business
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
    const { name, type, description, location, targetMargin, isPlanningMode } =
      body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Business name and type are required" },
        { status: 400 }
      );
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .insert({
        user_id: user.id,
        name,
        type,
        description: description || null,
        location: location || null,
        target_margin: (targetMargin || 30) / 100,
        is_planning_mode: isPlanningMode ?? false,
        onboarding_completed: true,
        currency: "IDR",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "Database not set up. Please run migrations first." },
          { status: 500 }
        );
      }
      throw error;
    }

    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update business
export async function PUT(request: Request) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

