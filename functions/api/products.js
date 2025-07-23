// Cloudflare Worker for Products API
// This will be deployed as a Cloudflare Function

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Get products
      if (path === '/api/products' && request.method === 'GET') {
        const { searchParams } = url;
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit')) || 50;
        const offset = parseInt(searchParams.get('offset')) || 0;

        let query = `
          SELECT p.*, c.name as category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id 
          WHERE p.is_active = 1
        `;
        const params = [];

        if (category) {
          query += ' AND c.slug = ?';
          params.push(category);
        }

        if (featured === 'true') {
          query += ' AND p.is_featured = 1';
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const products = await env.DB.prepare(query).bind(...params).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: products.results,
          total: products.results.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get single product
      if (path.startsWith('/api/products/') && request.method === 'GET') {
        const slug = path.split('/').pop();
        
        const product = await env.DB.prepare(`
          SELECT p.*, c.name as category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id 
          WHERE p.slug = ? AND p.is_active = 1
        `).bind(slug).first();

        if (!product) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Product not found'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          data: product
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get categories
      if (path === '/api/categories' && request.method === 'GET') {
        const categories = await env.DB.prepare(`
          SELECT * FROM categories ORDER BY name
        `).all();

        return new Response(JSON.stringify({
          success: true,
          data: categories.results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}; 