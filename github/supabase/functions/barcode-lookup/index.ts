import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({ error: "Barcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Open Food Facts API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          "User-Agent": "Nutrify - Meal Planning App",
        },
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch product data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return new Response(
        JSON.stringify({ error: "Product not found", found: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    // Extract nutrition data
    const result = {
      found: true,
      name: product.product_name || product.product_name_en || "Unknown Product",
      brand: product.brands || null,
      image_url: product.image_front_url || product.image_url || null,
      kcal_per_100g: nutriments["energy-kcal_100g"] || nutriments["energy_100g"] / 4.184 || 0,
      protein_per_100g: nutriments.proteins_100g || 0,
      carbs_per_100g: nutriments.carbohydrates_100g || 0,
      fat_per_100g: nutriments.fat_100g || 0,
      fiber_per_100g: nutriments.fiber_100g || 0,
      serving_size: product.serving_size || null,
      categories: product.categories_tags?.slice(0, 5) || [],
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Barcode lookup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
