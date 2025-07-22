export default function Home() {
  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-green-800">The Plant Store</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-green-600">Home</a>
              <a href="#" className="text-gray-700 hover:text-green-600">Products</a>
              <a href="#" className="text-gray-700 hover:text-green-600">About</a>
              <a href="#" className="text-gray-700 hover:text-green-600">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-400 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">Welcome to The Plant Store</h2>
            <p className="text-xl mb-8">Discover beautiful plants for your home and garden</p>
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Featured Plants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product Card 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-green-200 flex items-center justify-center">
                <span className="text-green-600 text-4xl">🌿</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Monstera Deliciosa</h4>
                <p className="text-gray-600 mb-4">Beautiful Swiss cheese plant perfect for any room</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">R299</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-green-200 flex items-center justify-center">
                <span className="text-green-600 text-4xl">🌱</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Fiddle Leaf Fig</h4>
                <p className="text-gray-600 mb-4">Elegant indoor tree that makes a statement</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">R399</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-green-200 flex items-center justify-center">
                <span className="text-green-600 text-4xl">🌵</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Snake Plant</h4>
                <p className="text-gray-600 mb-4">Low-maintenance plant that purifies the air</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">R199</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">The Plant Store</h4>
              <p className="text-gray-300">Bringing nature into your home with beautiful plants and expert care.</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Shipping</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Info</h4>
              <p className="text-gray-300">Email: info@theplantstore.com</p>
              <p className="text-gray-300">Phone: +27 11 123 4567</p>
              <p className="text-gray-300">Address: Johannesburg, South Africa</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2025 The Plant Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 