async function getProducts() {
  try {
    const response = await fetch('http://localhost:8787/api/products?featured=true', {
      cache: 'no-store'
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch('http://localhost:8787/api/categories', {
      cache: 'no-store'
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#166534' }}>The Plant Store</h1>
            </div>
            <nav style={{ display: 'flex', gap: '2rem' }}>
              <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Home</a>
              <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Products</a>
              <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>About</a>
              <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(to right, #4ade80, #16a34a)', 
        color: 'white',
        padding: '6rem 0'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem' }}>
            Welcome to The Plant Store
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
            Discover beautiful plants for your home and garden
          </p>
          <button style={{
            backgroundColor: 'white',
            color: '#16a34a',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer'
          }}>
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section style={{ padding: '2rem 0', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <h3 style={{ fontSize: '1.875rem', fontWeight: '700', textAlign: 'center', color: '#1f2937', marginBottom: '2rem' }}>
              Shop by Category
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {categories.map((category: any) => (
                <div key={category.id} style={{ 
                  backgroundColor: '#f0fdf4', 
                  padding: '1.5rem', 
                  borderRadius: '0.5rem', 
                  textAlign: 'center',
                  border: '2px solid #bbf7d0'
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#166534', marginBottom: '0.5rem' }}>
                    {category.name}
                  </h4>
                  <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <h3 style={{ fontSize: '1.875rem', fontWeight: '700', textAlign: 'center', color: '#1f2937', marginBottom: '3rem' }}>
            Featured Plants
          </h3>
          {products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {products.map((product: any) => (
                <div key={product.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
                  <div style={{ height: '12rem', backgroundColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.25rem' }}>🌿</span>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      {product.name}
                    </h4>
                    <p style={{ color: '#4b5563', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      {product.category_name}
                    </p>
                    <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                      {product.description}
                    </p>
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Care: {product.care_level} | Light: {product.light_requirements} | Water: {product.water_frequency}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>
                        R{product.price}
                      </span>
                      <button style={{
                        backgroundColor: '#16a34a',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <p>Loading products...</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '3rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>The Plant Store</h4>
              <p style={{ color: '#d1d5db' }}>Bringing nature into your home with beautiful plants and expert care.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>About Us</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Contact</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Shipping</a></li>
                <li><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Contact Info</h4>
              <p style={{ color: '#d1d5db' }}>Email: info@thehouseplantstore.co.za</p>
              <p style={{ color: '#d1d5db' }}>Phone: +27 11 123 4567</p>
              <p style={{ color: '#d1d5db' }}>Address: Johannesburg, South Africa</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#d1d5db' }}>&copy; 2025 The Plant Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 