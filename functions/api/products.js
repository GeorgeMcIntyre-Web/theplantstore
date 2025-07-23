// Cloudflare Worker for Products API
// This will be deployed as a Cloudflare Function

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers - allow both local and production domains
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check endpoint
      if (path === '/api/health' && request.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          message: 'API is running',
          timestamp: new Date().toISOString(),
          environment: 'production'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Database query endpoint for local development
      if (path === '/api/query' && request.method === 'POST') {
        const body = await request.json();
        const { query, params = [], type = 'all' } = body;

        if (!query) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Query is required'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        try {
          const prepared = env.DB.prepare(query);
          const bound = params.length > 0 ? prepared.bind(...params) : prepared;

          let result;
          switch (type) {
            case 'first':
              result = await bound.first();
              return new Response(JSON.stringify({
                success: true,
                data: result
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            case 'run':
              result = await bound.run();
              return new Response(JSON.stringify({
                success: true,
                data: result
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            case 'all':
            default:
              result = await bound.all();
              return new Response(JSON.stringify({
                success: true,
                data: result.results
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
          }
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Database query failed',
            message: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Database exec endpoint
      if (path === '/api/exec' && request.method === 'POST') {
        const body = await request.json();
        const { query } = body;

        if (!query) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Query is required'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        try {
          const result = await env.DB.exec(query);
          return new Response(JSON.stringify({
            success: true,
            data: result
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Database exec failed',
            message: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

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
        error: 'Endpoint not found',
        available_endpoints: [
          '/api/products',
          '/api/products?featured=true',
          '/api/products/{slug}',
          '/api/categories',
          '/api/health',
          '/api/query (POST)',
          '/api/exec (POST)'
        ]
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}; 