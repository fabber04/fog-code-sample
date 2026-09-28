import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Search, 
  Filter,
  Plus,
  Minus,
  Tag,
  Truck,
  Shield,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Merch = () => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);

  // Mock merchandise data
  const merchandise = [
    {
      id: 1,
      name: "IHC Youth Connect T-Shirt",
      category: "clothing",
      price: 25.99,
      originalPrice: 29.99,
      image: "/images/merch/tshirt.jpg",
      description: "Comfortable cotton t-shirt with our youth ministry logo",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Navy"],
      rating: 4.8,
      reviews: 24,
      inStock: true,
      featured: true
    },
    {
      id: 2,
      name: "Youth Ministry Hoodie",
      category: "clothing",
      price: 39.99,
      originalPrice: 44.99,
      image: "/images/merch/hoodie.jpg",
      description: "Warm and cozy hoodie perfect for chilly evenings",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Gray", "Black", "Navy"],
      rating: 4.9,
      reviews: 18,
      inStock: true,
      featured: true
    },
    {
      id: 3,
      name: "Faith Journal",
      category: "accessories",
      price: 12.99,
      originalPrice: 15.99,
      image: "/images/merch/journal.jpg",
      description: "Beautiful journal for daily devotions and prayer notes",
      colors: ["Brown", "Blue", "Pink"],
      rating: 4.7,
      reviews: 31,
      inStock: true,
      featured: false
    },
    {
      id: 4,
      name: "Youth Camp Water Bottle",
      category: "accessories",
      price: 18.99,
      image: "/images/merch/water-bottle.jpg",
      description: "Stainless steel water bottle with youth ministry design",
      colors: ["Silver", "Black", "Blue"],
      rating: 4.6,
      reviews: 22,
      inStock: true,
      featured: false
    },
    {
      id: 5,
      name: "Bible Study Notebook",
      category: "accessories",
      price: 9.99,
      image: "/images/merch/notebook.jpg",
      description: "Organized notebook for Bible study and sermon notes",
      colors: ["Black", "Brown"],
      rating: 4.5,
      reviews: 28,
      inStock: true,
      featured: false
    },
    {
      id: 6,
      name: "Youth Ministry Cap",
      category: "clothing",
      price: 19.99,
      image: "/images/merch/cap.jpg",
      description: "Stylish cap with embroidered youth ministry logo",
      sizes: ["One Size"],
      colors: ["Black", "Navy", "Gray"],
      rating: 4.4,
      reviews: 15,
      inStock: true,
      featured: false
    },
    {
      id: 7,
      name: "Prayer Bracelet",
      category: "accessories",
      price: 7.99,
      image: "/images/merch/bracelet.jpg",
      description: "Elegant bracelet with faith-inspired design",
      colors: ["Silver", "Gold", "Rose Gold"],
      rating: 4.8,
      reviews: 42,
      inStock: true,
      featured: true
    },
    {
      id: 8,
      name: "Youth Ministry Stickers Pack",
      category: "accessories",
      price: 4.99,
      image: "/images/merch/stickers.jpg",
      description: "Set of 10 unique stickers for laptops and water bottles",
      rating: 4.3,
      reviews: 19,
      inStock: true,
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', count: merchandise.length },
    { id: 'clothing', name: 'Clothing', count: merchandise.filter(item => item.category === 'clothing').length },
    { id: 'accessories', name: 'Accessories', count: merchandise.filter(item => item.category === 'accessories').length }
  ];

  // Filter products based on category and search
  const filteredProducts = merchandise.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart functions
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Wishlist functions
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
        toast.success('Removed from wishlist');
      } else {
        newWishlist.add(productId);
        toast.success('Added to wishlist! ❤️');
      }
      return newWishlist;
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative p-8 md:p-12 text-white">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Youth Ministry Merch
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Show your faith and support our ministry with quality merchandise
            </p>
            <div className="flex flex-wrap gap-4 text-sm md:text-base">
              <div className="flex items-center space-x-2">
                <Truck size={20} />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield size={20} />
                <span>100% quality guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search merchandise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ShoppingCart size={20} />
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-gray-500 text-sm">${item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-xl">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors">
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      {filteredProducts.filter(item => item.featured).length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.filter(item => item.featured).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlist.has(product.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Products */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isInWishlist={wishlist.has(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Support Our Ministry</h2>
        <p className="text-primary-100 mb-6">
          Every purchase helps fund our youth programs and activities
        </p>
        <button className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
          View All Products
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      {/* Product Image */}
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
        <button
          onClick={() => onToggleWishlist(product.id)}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-xs text-gray-600">{product.rating}</span>
          </div>
        </div>

        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>

        {/* Size Selection */}
        {product.sizes && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Size:</label>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    selectedSize === size
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {product.colors && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Color:</label>
            <div className="flex flex-wrap gap-1">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    selectedColor === color
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              product.inStock
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>

        {/* Stock Status */}
        <div className="mt-2 text-xs text-gray-500">
          {product.inStock ? (
            <span className="text-green-600">✓ In Stock</span>
          ) : (
            <span className="text-red-600">✗ Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Merch;
