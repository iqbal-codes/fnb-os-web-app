import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Get all ingredients for current user's business
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') === 'true';

    // Get user's business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ ingredients: [] });
    }

    let query = supabase
      .from('ingredients')
      .select('*')
      .eq('business_id', business.id)
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: ingredients, error } = await query;

    if (error) throw error;

    return NextResponse.json({ ingredients: ingredients || [] });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new ingredient
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

    const body = await request.json();
    const {
      name,
      category,
      market_unit,
      market_qty,
      price_per_market_unit,
      recipe_unit,
      conversion_factor,
    } = body;

    if (!name || !market_unit) {
      return NextResponse.json({ error: 'Name and market unit are required' }, { status: 400 });
    }

    // Get user's business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found. Please complete onboarding.' },
        { status: 404 },
      );
    }

    const { data: ingredient, error } = await supabase
      .from('ingredients')
      .insert({
        business_id: business.id,
        name,
        category: category || 'other',
        market_unit,
        market_qty: market_qty || 1,
        price_per_market_unit: price_per_market_unit || 0,
        recipe_unit,
        conversion_factor: conversion_factor || 1,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Record price history
    if (price_per_market_unit) {
      await supabase.from('ingredient_price_history').insert({
        ingredient_id: ingredient.id,
        price: price_per_market_unit,
        source: 'manual',
      });
    }

    return NextResponse.json({ ingredient }, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
