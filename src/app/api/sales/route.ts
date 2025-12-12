import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const businessId = searchParams.get("business_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const paymentType = searchParams.get("payment_type");
    const status = searchParams.get("status");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!businessId) {
      return NextResponse.json(
        { error: "business_id is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (paymentType) {
      query = query.eq("payment_type", paymentType);
    }
    if (status) {
      query = query.eq("payment_status", status);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to match frontend Transaction type
    const transactions = (data || []).map((order) => ({
      id: order.id,
      business_id: order.business_id,
      order_number: order.order_number,
      items: order.items || [],
      subtotal: order.subtotal,
      tax: order.tax_amount || 0,
      total: order.total,
      payment_type: order.payment_type,
      status:
        order.payment_status === "paid" ? "completed" : order.payment_status,
      notes: order.notes,
      created_at: order.created_at,
      completed_at: order.completed_at,
    }));

    return NextResponse.json({
      transactions,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Sales API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      business_id,
      items,
      subtotal,
      discount = 0,
      tax = 0,
      total,
      payment_type,
      notes,
    } = body;

    // Validate required fields
    if (!business_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "business_id and items are required" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Create order using existing orders table
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        business_id,
        order_number: orderNumber,
        items, // JSONB column we added
        subtotal,
        discount_amount: discount,
        tax_amount: tax,
        total,
        payment_type: payment_type || "cash",
        payment_status: "paid", // Default to paid for POS
        notes,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      transaction: order,
      order_number: orderNumber,
    });
  } catch (error) {
    console.error("Sales POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

