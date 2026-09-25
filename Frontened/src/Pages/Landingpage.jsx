import { useState, useEffect, useCallback } from 'react';
import { 
  X, Plus, Minus, ArrowLeft, CheckCircle, ShoppingBag, 
  Search, CreditCard, ShieldCheck, Package 
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import About from './About';
import Contact from './Contact';
import Admin from './Admin';
import { API_BASE_URL } from '../config/api';

// =========================================================================
// 1. DEFAULT PRODUCT CATALOG (High-Resolution Real Product Photography)
// =========================================================================
const DEFAULT_CATALOG = [
  { _id: 'seed-1', name: 'Wireless Headphones', category: 'Electronics', price: 79.99, stockQuantity: 25, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-2', name: 'Mechanical Keyboard', category: 'Electronics', price: 99.99, stockQuantity: 18, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-3', name: 'Gaming Mouse', category: 'Electronics', price: 49.99, stockQuantity: 30, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-4', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stockQuantity: 14, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-5', name: 'Leather Wallet', category: 'Accessories', price: 34.99, stockQuantity: 22, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-6', name: 'Modern Analog Watch', category: 'Accessories', price: 129.99, stockQuantity: 10, imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-7', name: 'Geometric Backpack', category: 'Accessories', price: 65.00, stockQuantity: 15, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-8', name: 'Classic Denim Shirt', category: 'Men', price: 45.00, stockQuantity: 20, imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-9', name: 'React Bomber Jacket', category: 'Men', price: 89.99, stockQuantity: 8, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-10', name: 'Casual Suede Loafers', category: 'Men', price: 75.00, stockQuantity: 12, imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-11', name: 'Running Shoes', category: 'Apparel', price: 85.00, stockQuantity: 16, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-12', name: 'Fleece Active Jacket', category: 'Apparel', price: 69.50, stockQuantity: 10, imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-13', name: 'Stainless Water Bottle', category: 'Home & Kitchen', price: 24.99, stockQuantity: 35, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-14', name: 'LED Desk Lamp', category: 'Home & Kitchen', price: 39.99, stockQuantity: 20, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80' },
  { _id: 'seed-15', name: 'Ceramic Coffee Mug', category: 'Home & Kitchen', price: 15.00, stockQuantity: 40, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' }
];

export default function Shop({ currentUser, onLogout, initialPage = "shop" }) {
  // Store Catalog state
  const [products, setProducts] = useState(DEFAULT_CATALOG);

  // Cart & Drawer state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("cart"); // 'cart', 'form', 'success'

  // Navigation & Filtering state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [toastMessage, setToastMessage] = useState("");

  // Customer checkout form state
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);

  // Helper: Display brief toast banner
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // 1. Fetch catalog directly from Express API
  const loadCatalog = useCallback(async () => {
    if (!API_BASE_URL) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setProducts(data);
      }
    } catch (err) {
      console.warn("Backend catalog fetch notice, using default catalog:", err);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // 2. Handle return from Stripe hosted payment (?payment=success or ?payment=cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');

    if (payment === 'success') {
      try {
        const savedOrder = JSON.parse(localStorage.getItem('pending_stripe_order') || '{}');
        if (savedOrder && savedOrder.cartItems && savedOrder.cartItems.length > 0) {
          fetch(`${API_BASE_URL}/api/orders/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: savedOrder.customerName || 'Customer',
              customerEmail: savedOrder.customerEmail || 'customer@example.com',
              cartItems: savedOrder.cartItems,
              paymentMethod: 'Stripe Card Payment'
            }),
          }).finally(() => {
            localStorage.removeItem('pending_stripe_order');
            setCart([]);
            setIsCartOpen(true);
            setCheckoutStep('success');
            loadCatalog();
          });
        } else {
          setIsCartOpen(true);
          setCheckoutStep('success');
        }
      } catch (err) {
        console.warn('Error recording completed Stripe order:', err);
        setIsCartOpen(true);
        setCheckoutStep('success');
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      showToast('⚠️ Payment was cancelled. Your items are still in your cart.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [loadCatalog]);

  // 3. Cart handlers
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          showToast(`⚠️ Only ${product.stockQuantity} items in stock!`);
          return prev;
        }
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`🛒 Added "${product.name}" to cart`);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            if (delta > 0 && newQty > item.stockQuantity) {
              showToast(`⚠️ Only ${item.stockQuantity} items available in stock.`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // 4. Totals calculations
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTax = subtotal * 0.08;
  const totalPrice = subtotal + estimatedTax;

  // 5. Stripe Checkout Session handler
  const handleStripeCheckout = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("⚠️ Please enter your Name and Email address first!");
      return;
    }
    if (cart.length === 0) {
      showToast("⚠️ Your shopping bag is empty!");
      return;
    }

    try {
      setIsProcessingStripe(true);

      // Save order info locally so we save the MongoDB order on return
      localStorage.setItem('pending_stripe_order', JSON.stringify({
        customerName: formData.name,
        customerEmail: formData.email,
        cartItems: cart.map(item => ({ productId: item._id, quantity: item.quantity }))
      }));

      // Call our backend to generate a Stripe Checkout Session
      const res = await fetch(`${API_BASE_URL}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          customerName: formData.name,
          customerEmail: formData.email,
          clientOrigin: window.location.origin,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe's secure page
      } else {
        showToast(`⚠️ Stripe error: ${data.message || 'Please try again'}`);
        setIsProcessingStripe(false);
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      showToast("⚠️ Could not connect to payment server");
      setIsProcessingStripe(false);
    }
  };

  // 6. Direct / Cash on Delivery checkout handler
  const handleCashOrder = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("⚠️ Please enter your Name and Email address first!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          cartItems: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
          paymentMethod: 'Cash on Delivery'
        }),
      });

      if (response.ok) {
        setCheckoutStep("success");
        setCart([]);
        loadCatalog();
      } else {
        setCheckoutStep("success");
        setCart([]);
      }
    } catch {
      setCheckoutStep("success");
      setCart([]);
    }
  };

  // 7. Product filtering & sorting
  const categoriesList = ["All", "Accessories", "Electronics", "Men", "Apparel", "Home & Kitchen"];

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
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <div className="main-layout">
        {currentPage === "about" && <About />}
        {currentPage === "contact" && <Contact />}

        {currentPage === "admin" && (
          currentUser?.role === 'admin' ? (
            <Admin
              products={products}
              setProducts={setProducts}
              onSwitchToShop={() => setCurrentPage("shop")}
            />
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', width: '100%', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Admin Portal Restricted</h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>Only authorized administrators can access this view.</p>
              <button onClick={() => setCurrentPage("shop")} className="primary-btn">
                Return to Store
              </button>
            </div>
          )
        )}

        {currentPage === "shop" && (
          <>
            {!selectedProduct ? (
              <>
                {/* CATEGORY SIDEBAR */}
                <aside className="sidebar">
                  <h3>Browse Categories</h3>
                  <ul>
                    {categoriesList.map((cat) => {
                      const count = cat === "All"
                        ? products.length
                        : products.filter(p => p.category === cat).length;
                      return (
                        <li
                          key={cat}
                          className={selectedCategory === cat ? "active" : ""}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          <span>{cat}</span>
                          <span style={{ fontSize: '11px', background: selectedCategory === cat ? '#2563eb' : '#f1f5f9', color: selectedCategory === cat ? '#fff' : '#64748b', padding: '2px 7px', borderRadius: '10px' }}>
                            {count}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </aside>

                <main className="product-grid-section">
                  {/* MOBILE CATEGORY STRIP */}
                  <div className="mobile-categories-strip">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* HERO BANNER */}
                  <div className="hero-banner">
                    <h2>Discover Everyday Essentials</h2>
                    <p>Premium lifestyle products, smart electronics, and designer accessories delivered right to your doorstep.</p>
                  </div>

                  {/* CATALOG CONTROLS */}
                  <div className="catalog-controls">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>Showing {filteredProducts.length} items</span>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Clear "{searchQuery}" <X size={12} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600' }}>Sort:</label>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                        <option value="default">Featured</option>
                        <option value="low-high">Price: Low to High</option>
                        <option value="high-low">Price: High to Low</option>
                        <option value="name">Alphabetical (A - Z)</option>
                      </select>
                    </div>
                  </div>

                  {/* PRODUCT GRID */}
                  <div className="product-grid">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div key={product._id} className="product-card">
                          <span className="card-top-tag">{product.category}</span>

                          <div
                            className="product-image"
                            onClick={() => setSelectedProduct(product)}
                            title="Click to view details"
                          >
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="product-card-img"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div style={{ display: product.imageUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={36} color="#94a3b8" />
                            </div>
                          </div>

                          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <h4
                              className="product-title"
                              onClick={() => setSelectedProduct(product)}
                            >
                              {product.name}
                            </h4>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', paddingTop: '6px' }}>
                              <p className="price">${product.price ? product.price.toFixed(2) : '0.00'}</p>

                              <span className={`stock-tag ${product.stockQuantity === 0 ? 'stock-out' : product.stockQuantity < 10 ? 'stock-low' : 'stock-in'}`}>
                                {product.stockQuantity === 0 ? 'Sold Out' : product.stockQuantity < 10 ? `Low: ${product.stockQuantity}` : `In Stock: ${product.stockQuantity}`}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stockQuantity === 0}
                            className={`add-cart-btn ${product.stockQuantity === 0 ? 'btn-disabled' : 'btn-active'}`}
                          >
                            {product.stockQuantity === 0 ? 'Sold Out' : (
                              <>
                                <ShoppingBag size={16} /> Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', padding: '48px 20px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <Search size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
                        <h4 style={{ color: '#0f172a', marginBottom: '6px' }}>No products found</h4>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Try searching with different keywords.</p>
                      </div>
                    )}
                  </div>
                </main>
              </>
            ) : (
              /* PRODUCT DETAIL VIEW */
              <div className="product-detail-view">
                <button className="back-btn" onClick={() => setSelectedProduct(null)}>
                  <ArrowLeft size={18} /> Back to Products Catalog
                </button>
                <div className="product-detail-container">
                  <div className="detail-image-box">
                    {selectedProduct.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="detail-product-img" />
                    ) : (
                      <Package size={64} color="#94a3b8" />
                    )}
                  </div>
                  <div className="detail-info">
                    <span className="category-tag">{selectedProduct.category}</span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{selectedProduct.name}</h2>
                    <p className="detail-price">${selectedProduct.price ? selectedProduct.price.toFixed(2) : '0.00'}</p>

                    <p className="description">
                      Premium {selectedProduct.category} item meticulously crafted with superior materials for durability, exceptional performance, and everyday convenience.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 16px 0' }}>
                      <span className={`stock-tag ${selectedProduct.stockQuantity === 0 ? 'stock-out' : 'stock-in'}`} style={{ fontSize: '14px' }}>
                        ● Available Inventory: {selectedProduct.stockQuantity} units
                      </span>
                    </div>

                    <button
                      className="primary-btn"
                      onClick={() => addToCart(selectedProduct)}
                      disabled={selectedProduct.stockQuantity === 0}
                      style={{ opacity: selectedProduct.stockQuantity === 0 ? 0.5 : 1, cursor: selectedProduct.stockQuantity === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      <ShoppingBag size={18} />
                      {selectedProduct.stockQuantity === 0 ? 'Currently Out of Stock' : 'Add to Shopping Cart'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* TOAST POPUP NOTIFICATION */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-item">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          CART DRAWER & CHECKOUT (LOCKED FOOTER - FULL BUTTON ALWAYS VISIBLE)
          ========================================================================= */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            
            {/* 1. HEADER (LOCKED AT TOP) */}
            <div className="cart-header">
              <div className="cart-header-title">
                <div className="cart-header-icon">
                  <ShoppingBag size={20} color="#2563eb" />
                </div>
                <div className="cart-header-text">
                  <h3>
                    {checkoutStep === "cart" && "Shopping Bag"}
                    {checkoutStep === "form" && "Secure Checkout"}
                    {checkoutStep === "success" && "Order Confirmed!"}
                  </h3>
                  <p>
                    {checkoutStep === "cart" && `${totalCartItems} items in bag`}
                    {checkoutStep === "form" && "Complete your order with Stripe"}
                    {checkoutStep === "success" && "Thank you for your purchase"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                aria-label="Close Cart" 
                className="cart-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. BODY (SCROLLS IF ITEMS OVERFLOW) */}
            <div className="cart-body">
              {checkoutStep === "cart" && (
                cart.length === 0 ? (
                  <div className="cart-empty-state">
                    <ShoppingBag size={48} color="#cbd5e1" />
                    <p className="empty-title">Your shopping bag is empty</p>
                    <p className="empty-sub">Explore our catalog and add items you like.</p>
                  </div>
                ) : (
                  <div className="cart-items-list">
                    {cart.map((item) => (
                      <div key={item._id} className="cart-item-row">
                        <div className="cart-item-thumb">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                          ) : (
                            <Package size={20} color="#94a3b8" />
                          )}
                        </div>
                        <div className="cart-item-info">
                          <span className="cart-item-name">{item.name}</span>
                          <span className="cart-item-price">${item.price.toFixed(2)} each</span>
                        </div>
                        <div className="cart-item-controls">
                          <button onClick={() => updateQuantity(item._id, -1)} aria-label="Decrease">
                            <Minus size={12} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} aria-label="Increase">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="cart-item-total">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {checkoutStep === "form" && (
                <div className="checkout-fields">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address (for receipt) *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                    />
                  </div>

                  {/* Order Financial Breakdown */}
                  <div className="order-summary-card">
                    <div className="summary-line">
                      <span>Items Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                      <span>Estimated Sales Tax (8%):</span>
                      <span>${estimatedTax.toFixed(2)}</span>
                    </div>
                    <div className="summary-line total-line">
                      <span>Total Payment:</span>
                      <span className="total-highlight">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="success-state">
                  <CheckCircle size={56} color="#10b981" />
                  <h3>Payment & Order Confirmed!</h3>
                  <p>
                    Thank you for shopping with Doorstep! Your order has been placed and payment confirmed. A receipt has been sent to your email.
                  </p>
                </div>
              )}
            </div>

            {/* 3. FOOTER ACTIONS (ALWAYS VISIBLE & LOCKED AT BOTTOM) */}
            <div className="cart-footer">
              {checkoutStep === "cart" && cart.length > 0 && (
                <div>
                  <div className="summary-line total-line" style={{ marginBottom: '12px' }}>
                    <span>Total:</span>
                    <span className="total-highlight">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button 
                    className="primary-action-btn" 
                    onClick={() => setCheckoutStep("form")}
                  >
                    Proceed to Checkout (${totalPrice.toFixed(2)})
                  </button>
                </div>
              )}

              {checkoutStep === "form" && (
                <div className="checkout-action-stack">
                  {/* FULL STRIPE BUTTON - PROMINENT & ALWAYS VISIBLE */}
                  <button
                    type="button"
                    className="stripe-btn"
                    onClick={handleStripeCheckout}
                    disabled={isProcessingStripe}
                  >
                    <CreditCard size={18} />
                    {isProcessingStripe ? 'Connecting to Stripe...' : `Pay $${totalPrice.toFixed(2)} with Stripe`}
                  </button>

                  <div className="secondary-action-row">
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => setCheckoutStep("cart")}
                    >
                      Back to Bag
                    </button>
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={handleCashOrder}
                    >
                      Cash on Delivery
                    </button>
                  </div>

                  <div className="security-footnote">
                    <ShieldCheck size={13} color="#10b981" />
                    <span>256-bit encrypted checkout powered by Stripe</span>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <button
                  className="primary-action-btn"
                  onClick={() => { setIsCartOpen(false); setCheckoutStep("cart"); }}
                >
                  Continue Shopping
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}