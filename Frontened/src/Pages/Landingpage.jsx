import React, { useState } from 'react';
import { ShoppingCart, Search, X, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '../Components/Navbar';
import About from './About';
import Contact from './Contact';

const PRODUCTS = [
  { id: 1, name: "Men's React Jacket", price: 95, category: "Men", image: "🧥", description: "A stylish and lightweight jacket designed for everyday comfort and modern streetwear." },
  { id: 2, name: "Modern Analog Watch", price: 189, category: "Accessories", image: "⌚", description: "Precision-crafted analog watch featuring a durable leather strap and minimalist dial." },
  { id: 3, name: "Premium Headphones", price: 249, category: "Electronics", image: "🎧", description: "Immersive sound quality with active noise cancellation and 30-hour battery life." },
  { id: 4, name: "Geometric Backpack", price: 75, category: "Accessories", image: "🎒", description: "Durable water-resistant backpack with multiple compartments for your laptop and gear." },
  { id: 5, name: "Wireless Earbuds", price: 129, category: "Electronics", image: "🎧", description: "Compact wireless earbuds with deep bass and crystal-clear call performance." },
  { id: 6, name: "Classic Denim Shirt", price: 65, category: "Men", image: "👔", description: "Soft cotton denim shirt tailored for a smart casual look." }
];

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [formData, setFormData] = useState({ name: '', address: '', city: '' });
  const [currentPage, setCurrentPage] = useState("shop"); // 'shop', 'about', 'contact'

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setCheckoutStep("success");
    setCart([]);
  };

  return (
    <div className="app-container">
      {/* Reusable Navbar Component */}
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSelectedProduct={setSelectedProduct}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalCartItems={totalCartItems}
        setIsCartOpen={setIsCartOpen}
        setCheckoutStep={setCheckoutStep}
      />

      <div className="main-layout">
        {currentPage === "about" && <About />}

        {currentPage === "contact" && <Contact />}

        {currentPage === "shop" && (
          <>
            {!selectedProduct ? (
              <>
                <aside className="sidebar">
                  <h3>Category</h3>
                  <ul>
                    {["All", "Men", "Accessories", "Electronics"].map((cat) => (
                      <li
                        key={cat}
                        className={selectedCategory === cat ? "active" : ""}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                </aside>

                <main className="product-grid-section">
                  <div className="hero-banner">
                    <h2>Summer Collection 2026</h2>
                    <p>Discover clean, modern frontend layouts built with React</p>
                  </div>

                  <div className="catalog-controls">
                    <span>Showing {filteredProducts.length} results</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                      <option value="default">Sort by: Featured</option>
                      <option value="low-high">Price: Low to High</option>
                      <option value="high-low">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>

                  <div className="product-grid">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                          <div className="product-image" onClick={() => setSelectedProduct(product)}>
                            {product.image}
                          </div>
                          <h4 onClick={() => setSelectedProduct(product)}>{product.name}</h4>
                          <p className="price">${product.price}</p>
                          <button onClick={() => addToCart(product)}>Add to Cart</button>
                        </div>
                      ))
                    ) : (
                      <p>No products found.</p>
                    )}
                  </div>
                </main>
              </>
            ) : (
              <div className="product-detail-view">
                <button className="back-btn" onClick={() => setSelectedProduct(null)}>
                  <ArrowLeft size={16} /> Back to Products
                </button>
                <div className="product-detail-container">
                  <div className="detail-image-box">{selectedProduct.image}</div>
                  <div className="detail-info">
                    <span className="category-tag">{selectedProduct.category}</span>
                    <h2>{selectedProduct.name}</h2>
                    <p className="detail-price">${selectedProduct.price}</p>
                    <p className="description">{selectedProduct.description}</p>
                    <button className="primary-btn" onClick={() => addToCart(selectedProduct)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isCartOpen && (
        <div className="cart-drawer-overlay">
          <div className="cart-drawer">
            <div className="cart-header">
              <h3>
                {checkoutStep === "cart" && "Your Cart"}
                {checkoutStep === "form" && "Checkout Details"}
                {checkoutStep === "success" && "Order Confirmed!"}
              </h3>
              <button onClick={() => setIsCartOpen(false)}><X size={20} /></button>
            </div>

            {checkoutStep === "cart" && (
              <>
                <div className="cart-items">
                  {cart.length === 0 ? (
                    <p className="empty-cart">Your cart is empty</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <span>{item.image} {item.name}</span>
                        <div className="cart-controls">
                          <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                        </div>
                        <span>${item.price * item.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="cart-footer">
                    <div className="total">
                      <span>Total:</span>
                      <span>${totalPrice}</span>
                    </div>
                    <button className="checkout-btn" onClick={() => setCheckoutStep("form")}>
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </>
            )}

            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Muhammad Shahmir"
                  />
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="House / Street details"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Karachi"
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="secondary-btn" onClick={() => setCheckoutStep("cart")}>Back</button>
                  <button type="submit" className="checkout-btn">Place Order (${totalPrice})</button>
                </div>
              </form>
            )}

            {checkoutStep === "success" && (
              <div className="success-screen">
                <CheckCircle size={64} className="success-icon" />
                <h3>Thank you for your order!</h3>
                <p>Your frontend mock order has been successfully placed.</p>
                <button className="checkout-btn" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}