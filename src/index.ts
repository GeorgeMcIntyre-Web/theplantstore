// House Plant Store - Cloudflare Worker
// Main entry point for API and static file serving

export interface Env {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle API routes
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, path);
    }

    // Handle static files
    if (path.startsWith('/images/')) {
      return handleImages(request, env, path);
    }

    // Serve static HTML/CSS/JS
    return env.ASSETS.fetch(request);
  },
};

async function handleAPI(request: Request, env: Env, path: string): Promise<Response> {
  const url = new URL(request.url);
  
  try {
    switch (path) {
      case '/api/products':
        return await getProducts(env.DB, url.searchParams);
      
      case '/api/products/[id]':
        const productId = path.split('/').pop() || '';
        return await getProduct(env.DB, productId);
      
      case '/api/cart':
        if (request.method === 'GET') {
          const sessionId = url.searchParams.get('session') || '';
          return await getCart(env.DB, sessionId);
        } else if (request.method === 'POST') {
          return await addToCart(env.DB, await request.json());
        }
      
      case '/api/orders':
        if (request.method === 'POST') {
          return await createOrder(env.DB, await request.json());
        }
      
      default:
        return new Response('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleImages(request: Request, env: Env, path: string): Promise<Response> {
  const key = path.substring(1); // Remove leading slash
  
  try {
    const object = await env.PRODUCT_IMAGES.get(key);
    
    if (!object) {
      return new Response('Image not found', { status: 404 });
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
      },
    });
  } catch (error) {
    console.error('Image Error:', error);
    return new Response('Image error', { status: 500 });
  }
}

// API Handlers
async function getProducts(db: D1Database, params: URLSearchParams) {
  const limit = parseInt(params.get('limit') || '20');
  const offset = parseInt(params.get('offset') || '0');
  const category = params.get('category');
  
  let query = 'SELECT * FROM products WHERE is_active = true';
  let bindings: any[] = [];
  
  if (category) {
    query += ' AND category = ?';
    bindings.push(category);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  bindings.push(limit, offset);
  
  const products = await db.prepare(query).bind(...bindings).all();
  
  return new Response(JSON.stringify(products.results), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getProduct(db: D1Database, productId: string) {
  const product = await db.prepare('SELECT * FROM products WHERE id = ? AND is_active = true')
    .bind(productId)
    .first();
  
  if (!product) {
    return new Response('Product not found', { status: 404 });
  }
  
  return new Response(JSON.stringify(product), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getCart(db: D1Database, sessionId: string) {
  if (!sessionId) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const cartItems = await db.prepare(`
    SELECT ci.*, p.name, p.price, p.image 
    FROM cart_items ci 
    JOIN products p ON ci.product_id = p.id 
    WHERE ci.session_id = ?
  `).bind(sessionId).all();
  
  return new Response(JSON.stringify(cartItems.results), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function addToCart(db: D1Database, data: { sessionId: string; productId: string; quantity: number }) {
  const { sessionId, productId, quantity } = data;
  
  await db.prepare(`
    INSERT INTO cart_items (session_id, product_id, quantity) 
    VALUES (?, ?, ?)
  `).bind(sessionId, productId, quantity).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function createOrder(db: D1Database, data: any) {
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await db.prepare(`
    INSERT INTO orders (id, order_number, product_id, quantity, customer_email, customer_name, customer_phone, shipping_address, total_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    orderNumber,
    data.productId,
    data.quantity,
    data.customerEmail,
    data.customerName,
    data.customerPhone,
    data.shippingAddress,
    data.totalAmount
  ).run();
  
  return new Response(JSON.stringify({ orderNumber }), {
    headers: { 'Content-Type': 'application/json' },
  });
} 