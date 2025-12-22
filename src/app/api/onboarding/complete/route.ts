import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface OnboardingCompleteRequest {
  // Business
  businessName: string;
  businessType: string;
  city?: string;
  operatingModel?: string;
  openDays?: number[];

  // Menu
  menuData: {
    name: string;
    category?: string;
    description?: string;
    estimatedCogs: number;
    suggestedPrice: number;
    ingredients: Array<{
      name: string;
      usageQuantity: number;
      usageUnit: string;
      buyingQuantity?: number;
      buyingUnit?: string;
      buyingPrice?: number;
    }>;
  };

  // OPEX (stored as metadata for now)
  opexData?: Array<{
    id: string;
    name: string;
    amount: number;
    frequency: string;
  }>;

  // Equipment/CAPEX (stored as metadata for now)
  equipmentData?: Array<{
    id: string;
    name: string;
    price: number;
    lifeYears?: number;
    priority?: string;
  }>;
}

/**
 * POST - Complete onboarding and create all entities
 *
 * This endpoint creates:
 * 1. Business entity
 * 2. Menu with COGS and selling price
 * 3. Ingredients from menu ingredients
 * 4. Menu-ingredient relationships
 * 5. Initial inventory records (stock = 0)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: OnboardingCompleteRequest = await request.json();
    const { businessName, businessType, city, openDays, menuData, opexData, equipmentData } = body;

    if (!businessName || !businessType) {
      return NextResponse.json({ error: 'Business name and type are required' }, { status: 400 });
    }

    if (!menuData?.name) {
      return NextResponse.json({ error: 'Menu name is required' }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Create Business
    // ─────────────────────────────────────────────────────────────────────────

    // Store opex and equipment as JSON metadata
    const metadata = {
      openDays: openDays || [1, 2, 3, 4, 5, 6, 7],
      opexData: opexData || [],
      equipmentData: equipmentData || [],
    };

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: businessName,
        type: businessType,
        location: city || null,
        target_margin: 0.6, // Default 60%
        is_planning_mode: true,
        onboarding_completed: true,
        currency: 'IDR',
        metadata: metadata,
      })
      .select()
      .single();

    if (businessError) {
      console.error('Error creating business:', businessError);
      throw businessError;
    }

    const businessId = business.id;

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Create Ingredients (from menu ingredients)
    // ─────────────────────────────────────────────────────────────────────────

    const ingredientMap: Map<string, string> = new Map(); // name -> id

    if (menuData.ingredients && menuData.ingredients.length > 0) {
      for (const ing of menuData.ingredients) {
        const { data: ingredient, error: ingError } = await supabase
          .from('ingredients')
          .insert({
            business_id: businessId,
            name: ing.name,
            category: 'other',
            market_unit: ing.buyingUnit || ing.usageUnit,
            market_qty: ing.buyingQuantity || 1,
            price_per_market_unit: ing.buyingPrice || 0,
            recipe_unit: ing.usageUnit,
            conversion_factor: 1,
            is_active: true,
          })
          .select('id')
          .single();

        if (ingError) {
          console.error('Error creating ingredient:', ingError);
          // Continue with other ingredients
          continue;
        }

        ingredientMap.set(ing.name, ingredient.id);

        // ─────────────────────────────────────────────────────────────────────
        // 3. Create Inventory record for each ingredient (initial stock = 0)
        // ─────────────────────────────────────────────────────────────────────

        await supabase.from('inventory').insert({
          business_id: businessId,
          ingredient_id: ingredient.id,
          current_stock: 0,
          unit: ing.usageUnit,
          min_stock: 0,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Create Menu
    // ─────────────────────────────────────────────────────────────────────────

    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({
        business_id: businessId,
        name: menuData.name,
        category: menuData.category || 'minuman',
        description: menuData.description || null,
        selling_price: menuData.suggestedPrice || 0,
        cogs: menuData.estimatedCogs || 0,
        is_active: true,
        sort_order: 1,
      })
      .select()
      .single();

    if (menuError) {
      console.error('Error creating menu:', menuError);
      throw menuError;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Create Menu-Ingredient relationships
    // ─────────────────────────────────────────────────────────────────────────

    if (menuData.ingredients && menuData.ingredients.length > 0) {
      const menuIngredients = menuData.ingredients
        .filter((ing) => ingredientMap.has(ing.name))
        .map((ing) => ({
          menu_id: menu.id,
          ingredient_id: ingredientMap.get(ing.name),
          quantity: ing.usageQuantity,
          unit: ing.usageUnit,
        }));

      if (menuIngredients.length > 0) {
        const { error: miError } = await supabase.from('menu_ingredients').insert(menuIngredients);

        if (miError) {
          console.error('Error creating menu_ingredients:', miError);
          // Non-fatal, continue
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Clean up onboarding state
    // ─────────────────────────────────────────────────────────────────────────

    await supabase.from('onboarding_states').delete().eq('user_id', user.id);

    return NextResponse.json(
      {
        success: true,
        business,
        menu,
        ingredientsCreated: ingredientMap.size,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error completing onboarding:', error);
    const message = error instanceof Error ? error.message : 'Failed to complete onboarding';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
