import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

// GET - Get single menu by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: menu, error } = await supabase
      .from('menus')
      .select(
        `
        *,
        recipes (
          id,
          yield_qty,
          yield_unit,
          notes,
          recipe_ingredients (
            id,
            ingredient_id,
            quantity,
            unit,
            cost,
            ingredients (id, name, category, price_per_market_unit)
          )
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update menu
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      selling_price,
      image_url,
      is_active,
      sort_order,
      cogs,
      margin_percent,
    } = body;

    const { data: menu, error } = await supabase
      .from('menus')
      .update({
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(selling_price !== undefined && { selling_price }),
        ...(image_url !== undefined && { image_url }),
        ...(is_active !== undefined && { is_active }),
        ...(sort_order !== undefined && { sort_order }),
        ...(cogs !== undefined && { cogs }),
        ...(margin_percent !== undefined && { margin_percent }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ menu });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete menu
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('menus').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
