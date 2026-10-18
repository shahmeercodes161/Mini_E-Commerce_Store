import { useState, useEffect, useCallback } from 'react';
import { 
  X, Plus, Minus, ArrowLeft, CheckCircle, ShoppingBag, 
  Search, CreditCard, ShieldCheck, Package, MapPin, Phone 
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import About from './About';
import Contact from './Contact';
import Admin from './Admin';
import { API_BASE_URL } from '../config/api';
import { resolveProductImage } from '../config/productImages';

export default function Shop({ currentUser, onLogout, initialPage = "shop" }) {
  // Store Catalog state - initialized empty so no mock products flash
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

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

  // Customer checkout form state (Full delivery information)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    orderNotes: ''
  });
  const [lastPaymentMethod, setLastPaymentMethod] = useState('Cash on Delivery');
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);

  // Sync logged in user details if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // Helper: Display brief toast banner
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // 1. Fetch catalog directly from Express API
  const loadCatalog = useCallback(async () => {
    if (!API_BASE_URL) {
      setIsLoadingProducts(false);
      return;
    }
    try {
      setIsLoadingProducts(true);
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      }
    } catch (err) {
      console.warn("Backend catalog fetch error:", err);
    } finally {
      setIsLoadingProducts(false);
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
              phone: savedOrder.phone || '',
              shippingAddress: savedOrder.shippingAddress || '',
              city: savedOrder.city || '',
              postalCode: savedOrder.postalCode || '',
              orderNotes: savedOrder.orderNotes || '',
              cartItems: savedOrder.cartItems,
              paymentMethod: 'Stripe Card Payment'
            }),
          }).finally(() => {
            localStorage.removeItem('pending_stripe_order');
            setCart([]);
            setIsCartOpen(true);
            setLastPaymentMethod('Stripe');
            setCheckoutStep('success');
            loadCatalog();
          });
        } else {
          setIsCartOpen(true);
          setLastPaymentMethod('Stripe');
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
        phone: formData.phone,
        shippingAddress: formData.shippingAddress,
        city: formData.city,
        postalCode: formData.postalCode,
        orderNotes: formData.orderNotes,
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

      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          res.status === 404
            ? "Payment API route not found. Make sure Vercel backend function is deployed."
            : `Server returned error (${res.status}): ${text.slice(0, 100)}`
        );
      }

      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe's secure page
      } else {
        showToast(`⚠️ Stripe error: ${data.message || 'Please check Stripe configuration'}`);
        setIsProcessingStripe(false);
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      showToast(`⚠️ ${err.message || 'Could not connect to payment server'}`);
      setIsProcessingStripe(false);
    }
  };

  // 6. Direct / Cash on Delivery checkout handler (Records full delivery address & contact)
  const handleCashOrder = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("⚠️ Please enter your Full Name and Email address!");
      return;
    }
    if (!formData.phone.trim()) {
      showToast("⚠️ Please provide a Contact / Mobile Number for delivery!");
      return;
    }
    if (!formData.shippingAddress.trim() || !formData.city.trim()) {
      showToast("⚠️ Please provide your Delivery Street Address and City for Cash on Delivery!");
      return;
    }

    // Snapshot current total before clearing cart
    const finalAmount = totalPrice;
    setLastOrderTotal(finalAmount);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name.trim(),
          customerEmail: formData.email.trim(),
          phone: formData.phone.trim(),
          shippingAddress: formData.shippingAddress.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          orderNotes: formData.orderNotes.trim(),
          cartItems: cart.map(item => ({ 
            productId: item._id, 
            name: item.name, 
            price: item.price, 
            quantity: item.quantity 
          })),
          paymentMethod: 'Cash on Delivery'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.order?.total) {
          setLastOrderTotal(data.order.total);
        }
      }

      setLastPaymentMethod('Cash on Delivery');
      setCheckoutStep("success");
      setCart([]);
      loadCatalog();
    } catch (err) {
      console.warn("Cash order submission notice:", err);
      setLastPaymentMethod('Cash on Delivery');
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
                            {isLoadingProducts ? '...' : count}
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
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>
                        {isLoadingProducts ? 'Loading catalog from database...' : `Showing ${filteredProducts.length} items`}
                      </span>
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
                    {isLoadingProducts ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="product-card" style={{ opacity: 0.7, pointerEvents: 'none' }}>
                          <div style={{ 
                            width: '100%', 
                            height: '180px', 
                            background: '#f1f5f9', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Package size={32} color="#cbd5e1" />
                          </div>
                          <div style={{ height: '16px', width: '75%', background: '#e2e8f0', borderRadius: '4px', margin: '14px 0 8px 0' }} />
                          <div style={{ height: '14px', width: '35%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '16px' }} />
                          <div style={{ height: '36px', width: '100%', background: '#e2e8f0', borderRadius: '8px', marginTop: 'auto' }} />
                        </div>
                      ))
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const imgUrl = resolveProductImage(product);
                        return (
                          <div key={product._id} className="product-card">
                            <span className="card-top-tag">{product.category}</span>

                            <div
                              className="product-image"
                              onClick={() => setSelectedProduct(product)}
                              title="Click to view details"
                            >
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={product.name}
                                  className="product-card-img"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div style={{ display: imgUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
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
                        );
                      })
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
                    {resolveProductImage(selectedProduct) ? (
                      <img
                        src={resolveProductImage(selectedProduct)}
                        alt={selectedProduct.name}
                        className="detail-product-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ display: resolveProductImage(selectedProduct) ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={64} color="#94a3b8" />
                    </div>
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
                          {resolveProductImage(item) ? (
                            <img 
                              src={resolveProductImage(item)} 
                              alt={item.name} 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
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
                  <div style={{ padding: '6px 10px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#2563eb" />
                    <span>Delivery Address & Contact for Doorstep Delivery</span>
                  </div>

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
                    <label>Contact / Mobile Phone (for delivery courier) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +92 300 1234567"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address (for order receipt) *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Delivery Street Address (House/Apt, Street, Area) *</label>
                    <input
                      type="text"
                      required
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      placeholder="e.g. House #14, Street 7, Sector F-10"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Lahore / Karachi"
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="e.g. 54000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      value={formData.orderNotes}
                      onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                      placeholder="e.g. Call before arrival or leave with security"
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
                  <h3>
                    {lastPaymentMethod === 'Cash on Delivery' 
                      ? 'Cash on Delivery Order Placed!' 
                      : 'Payment & Order Confirmed!'}
                  </h3>
                  <p>
                    {lastPaymentMethod === 'Cash on Delivery'
                      ? `Thank you, ${formData.name || 'valued customer'}! Your Cash on Delivery order has been saved in our system. Our delivery courier will bring your parcel to ${formData.shippingAddress ? `${formData.shippingAddress}, ${formData.city}` : 'your address'} and collect $${(lastOrderTotal > 0 ? lastOrderTotal : totalPrice).toFixed(2)} cash at your doorstep.`
                      : `Thank you for shopping with Doorstep! Your order of $${(lastOrderTotal > 0 ? lastOrderTotal : totalPrice).toFixed(2)} has been placed and payment confirmed. A receipt has been sent to your email.`}
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