import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, X, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '../Components/Navbar';
import About from './About';
import Contact from './Contact';
import Admin from './Admin';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [formData, setFormData] = useState({ name: '', email: '' }); 
  const [currentPage, setCurrentPage] = useState("shop");

  // DYNAMIC UNIQUE DESCRIPTION GENERATOR ENGINE
  const getProductDescription = (name, category) => {
    if (!name) return "";
    const itemName = name.toLowerCase();
    
    if (itemName.includes("headphones") || itemName.includes("earbuds")) {
      return "Experience premium sound with immersive audio depth and active isolation filters. These headphones feature cloud-comfort padding and high-fidelity sonic drivers engineered for pristine clarity during all-day listening sessions.";
    }
    if (itemName.includes("keyboard")) {
      return "Upgrade your typing precision with high-durability key stabilization, customizable response dynamics, and an ergonomic build layout. Designed to deliver quiet tactile feedback and modern sleek aesthetics to your work space.";
    }
    if (itemName.includes("mouse")) {
      return "Navigate complex tasks effortlessly using high-precision tracking sensors, customizable polling speeds, and a structural mold optimized to reduce wrist fatigue through extended hours of productivity.";
    }
    if (itemName.includes("wallet")) {
      return "Organize your essential travel items safely within this premium wallet. Built with modern security protection, low-profile card layering slots, and reinforced wear-resistant stitching to prevent pocket bulk.";
    }
    if (itemName.includes("watch")) {
      return "A masterfully balanced wristwatch pairing precise movement tracking with robust scratch-resistant housing layers. Clean minimalist indices offer clear readability suitable for professional or casual settings.";
    }
    if (itemName.includes("backpack") || itemName.includes("bag")) {
      return "Built with durable, weather-shielded canvas materials and smart organizational dividers. This multi-compartment storage bag provides heavy-load laptop shielding sleeves ideal for commute routines.";
    }
    if (itemName.includes("jacket") || itemName.includes("windbreaker") || itemName.includes("sweater")) {
      return "Defend against cold climates using advanced thermal layering properties and light wind-resistant fiber weaving. Tailored comfortably to give you functional mobility without heavy layering constraints.";
    }
    if (itemName.includes("shoes") || itemName.includes("loafers") || itemName.includes("sneakers")) {
      return "Step forward on an advanced shock-absorbing tread chassis that cushions heel pressure fields evenly. Built using breathable mesh panels to provide long-distance flexibility and active moisture venting.";
    }
    if (itemName.includes("bottle")) {
      return "Keep your drinks at the perfect temperature all day. This heavy-duty, double-walled insulated Stainless Water Bottle is designed for maximum temperature retention, leak-proof travel, and a clean, modern aesthetic perfect for hydration on the go.";
    }
    if (itemName.includes("lamp") || itemName.includes("light")) {
      return "Cast flicker-free, ambient luminosity across your desk layout using high-efficiency color tuning controls. Calibrated specifically to limit visual eye strain and support evening focus hours comfortably.";
    }
    
    return `Discover the brand new ${name}. A high-performance item meticulously refined within our signature ${category} catalog division, balancing structural engineering with daily comfort.`;
  };
  // Live-Produkte beim Laden der Seite aus der MongoDB abrufen
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error connecting frontend to backend API:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); 

  // ARTIKEL MIT BESTANDSKONTROLLE ZUM WARENKORB HINZUFÜGEN
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        // KONTROLLE: Verhindert, dass mehr Artikel hinzugefügt werden, als im Lager vorhanden sind
        if (existingItem.quantity >= product.stockQuantity) {
          alert(`Cannot add more. Only ${product.stockQuantity} items are available in stock!`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };
  // UPDATE QUANTITY WITH STOCK QUANTITY CAP PROTECTION
  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            
            // MANDATORY CHECK: Prevent addition from exceeding available database inventory
            if (delta > 0 && newQty > item.stockQuantity) {
              alert(`Cannot add more items. Only ${item.stockQuantity} items are available in stock.`);
              return item;
            }
            
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const filteredProducts = products.filter((product) => {
    if (!product || !product.name) return false;
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
  
  // METRIC PRICE DEFINITIONS AS PER PROJECT REQUIREMENT
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTax = subtotal * 0.08; // 8% sales tax calculation rule configuration
  const totalPrice = subtotal + estimatedTax;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    try {
      const cartItemsPayload = cart.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }));

      const response = await fetch('http://localhost:3000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          cartItems: cartItemsPayload
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setCheckoutStep("success");
        setCart([]);
        fetchProducts(); // Refresh live catalog items to reflect reduced stock layout numbers
      } else {
        alert(result.message || "Checkout failed.");
      }
    } catch (error) {
      console.error("Network error during checkout:", error);
      alert("Checkout failed. Is the server running?");
    }
  };
  return (
    <div className="app-container">
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
        {currentPage === "admin" && <Admin />}

        {currentPage === "shop" && (
          <>
            {!selectedProduct ? (
              <>
                <aside className="sidebar">
                  <h3>Category</h3>
                  <ul>
                    {["All", "Men", "Accessories", "Electronics", "Apparel", "Home & Kitchen"].map((cat) => (
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
                    <p>Discover clean, modern storefront layouts pulling from your MongoDB Atlas cluster</p>
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

                  <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', padding: '20px 0' }}>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div key={product._id} className="product-card" style={{ border: '1px solid #eef2f6', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '350px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                          
                          <div className="product-image" onClick={() => setSelectedProduct(product)} style={{ fontSize: '54px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', width: '100%', borderRadius: '8px', marginBottom: '14px' }}>
                            {product.name?.toLowerCase().includes("headphones") && "🎧"}
                            {product.name?.toLowerCase().includes("keyboard") && "⌨️"}
                            {product.name?.toLowerCase().includes("mouse") && "🖱️"}
                            {product.name?.toLowerCase().includes("wallet") && "💼"}
                            {product.name?.toLowerCase().includes("shoes") && "👟"}
                            {product.name?.toLowerCase().includes("bottle") && "🥤"}
                            {product.name?.toLowerCase().includes("lamp") && "💡"}
                            {!["headphones", "keyboard", "mouse", "wallet", "shoes", "bottle", "lamp"].some(el => product.name?.toLowerCase().includes(el)) && "📦"}
                          </div>

                          <div style={{ textAlign: 'center', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '12px' }}>
                            <h4 onClick={() => setSelectedProduct(product)} style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', cursor: 'pointer', color: '#1e293b', lineHeight: '1.4' }}>{product.name}</h4>
                            <p className="price" style={{ margin: '0 0 6px 0', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>${product.price ? product.price.toFixed(2) : '0.00'}</p>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0', color: product.stockQuantity === 0 ? '#ef4444' : '#10b981' }}>
                              {product.stockQuantity === 0 ? 'Out of Stock' : `In Stock: ${product.stockQuantity}`}
                            </p>
                          </div>

                          <button 
                            onClick={() => addToCart(product)} 
                            disabled={product.stockQuantity === 0}
                            style={{ 
                              width: '100%', 
                              padding: '11px', 
                              borderRadius: '8px', 
                              border: 'none',
                              fontWeight: '600',
                              fontSize: '14px',
                              cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer',
                              backgroundColor: product.stockQuantity === 0 ? '#cbd5e1' : '#2563eb',
                              color: product.stockQuantity === 0 ? '#64748b' : '#fff',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            {product.stockQuantity === 0 ? 'Sold Out' : 'Add to Cart'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p>No products found.</p>
                    )}
                  </div>
                </main>
              </>
              ) : (
              <div className="product-detail-view" style={{ padding: '20px' }}>
                <button className="back-btn" onClick={() => setSelectedProduct(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb', fontWeight: '600' }}>
                  <ArrowLeft size={16} /> Back to Products
                </button>
                <div className="product-detail-container" style={{ display: 'flex', gap: '40px', alignItems: 'center', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div className="detail-image-box" style={{ fontSize: '96px', background: '#f8fafc', padding: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '200px' }}>
                    {selectedProduct.name?.toLowerCase().includes("headphones") && "🎧"}
                    {selectedProduct.name?.toLowerCase().includes("keyboard") && "⌨️"}
                    {selectedProduct.name?.toLowerCase().includes("mouse") && "🖱️"}
                    {selectedProduct.name?.toLowerCase().includes("wallet") && "💼"}
                    {selectedProduct.name?.toLowerCase().includes("shoes") && "👟"}
                    {selectedProduct.name?.toLowerCase().includes("bottle") && "🥤"}
                    {selectedProduct.name?.toLowerCase().includes("lamp") && "💡"}
                    {!["headphones", "keyboard", "mouse", "wallet", "shoes", "bottle", "lamp"].some(el => selectedProduct.name?.toLowerCase().includes(el)) && "📦"}
                  </div>
                  <div className="detail-info" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span className="category-tag" style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', width: 'fit-content' }}>{selectedProduct.category}</span>
                    <h2>{selectedProduct.name}</h2>
                    <p className="detail-price">${selectedProduct.price ? selectedProduct.price.toFixed(2) : '0.00'}</p>
                    
                    <p className="description" style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: '10px 0', maxWidth: '500px' }}>
                      {getProductDescription(selectedProduct.name, selectedProduct.category)}
                    </p>
                    
                    <p className="stock-info" style={{ fontWeight: 'bold', color: selectedProduct.stockQuantity === 0 ? '#ef4444' : '#10b981', margin: '0 0 10px 0' }}>
                      Stock Count: {selectedProduct.stockQuantity}
                    </p>
                    <button 
                      className="primary-btn" 
                      onClick={() => addToCart(selectedProduct)}
                      disabled={selectedProduct.stockQuantity === 0}
                      style={{ padding: '12px 24px', background: selectedProduct.stockQuantity === 0 ? '#cbd5e1' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: selectedProduct.stockQuantity === 0 ? 'not-allowed' : 'pointer', width: 'fit-content' }}
                    >
                      {selectedProduct.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
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
                      <div key={item._id} className="cart-item">
                        <span>{item.name}</span>
                        <div className="cart-controls">
                          <button onClick={() => updateQuantity(item._id, -1)}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)}><Plus size={14} /></button>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="cart-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#475569' }}>
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#475569' }}>
                      <span>Estimated Tax (8%):</span>
                      <span>${estimatedTax.toFixed(2)}</span>
                    </div>
                    <div className="total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '16px' }}>
                      <span>Final Order Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <button className="checkout-btn" onClick={() => setCheckoutStep("form")} style={{ width: '100%' }}>
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
                    placeholder="Write your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Write your email address"
                  />
                </div>
                
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', margin: '14px 0', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: '4px' }}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1e293b' }}>
                    <span>Order Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="secondary-btn" onClick={() => setCheckoutStep("cart")}>Back</button>
                  <button type="submit" className="checkout-btn">Place Order (${totalPrice.toFixed(2)})</button>
                </div>
              </form>
            )}

            {checkoutStep === "success" && (
              <div className="success-screen">
                <CheckCircle size={64} className="success-icon" />
                <h3>Thank you for your order!</h3>
                <p>Your order has been placed successfully. A confirmation email with your receipt will be sent shortly!</p>
                <button className="checkout-btn" onClick={() => { setIsCartOpen(false); setCheckoutStep("cart"); }}>Continue Shopping</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}