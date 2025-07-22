export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#166534' }}>The Plant Store</h1>
            </div>
            <nav style={{ display: 'none' }}>
              <a href="#" style={{ color: '#374151', marginRight: '2rem' }}>Home</a>
              <a href="#" style={{ color: '#374151', marginRight: '2rem' }}>Products</a>
              <a href="#" style={{ color: '#374151', marginRight: '2rem' }}>About</a>
              <a href="#" style={{ color: '#374151' }}>Contact</a>
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

      {/* Featured Products */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <h3 style={{ fontSize: '1.875rem', fontWeight: '700', textAlign: 'center', color: '#1f2937', marginBottom: '3rem' }}>
            Featured Plants
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Product Card 1 */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
              <div style={{ height: '12rem', backgroundColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.25rem' }}>🌿</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Monstera Deliciosa
                </h4>
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                  Beautiful Swiss cheese plant perfect for any room
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>R299</span>
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

            {/* Product Card 2 */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
              <div style={{ height: '12rem', backgroundColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.25rem' }}>🌱</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Fiddle Leaf Fig
                </h4>
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                  Elegant indoor tree that makes a statement
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>R399</span>
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

            {/* Product Card 3 */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
              <div style={{ height: '12rem', backgroundColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.25rem' }}>🌵</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Snake Plant
                </h4>
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                  Low-maintenance plant that purifies the air
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>R199</span>
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
          </div>
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
              <p style={{ color: '#d1d5db' }}>Email: info@theplantstore.com</p>
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