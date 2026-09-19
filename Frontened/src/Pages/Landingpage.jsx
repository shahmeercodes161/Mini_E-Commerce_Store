import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Minus, ArrowLeft, CheckCircle, ShoppingBag, Check, Search } from 'lucide-react';
import Navbar from '../Components/Navbar';
import About from './About';
import Contact from './Contact';
import Admin from './Admin';

const DEFAULT_CATALOG = [
  { _id: 'seed-1', name: 'Wireless Headphones', category: 'Electronics', price: 79.99, stockQuantity: 25 },
  { _id: 'seed-2', name: 'Mechanical Keyboard', category: 'Electronics', price: 99.99, stockQuantity: 18 },
  { _id: 'seed-3', name: 'Gaming Mouse', category: 'Electronics', price: 49.99, stockQuantity: 30 },
  { _id: 'seed-4', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stockQuantity: 14 },
  { _id: 'seed-5', name: 'Leather Wallet', category: 'Accessories', price: 34.99, stockQuantity: 22 },
  { _id: 'seed-6', name: 'Modern Analog Watch', category: 'Accessories', price: 129.99, stockQuantity: 10 },
  { _id: 'seed-7', name: 'Geometric Backpack', category: 'Accessories', price: 65.00, stockQuantity: 15 },
  { _id: 'seed-8', name: 'Classic Denim Shirt', category: 'Men', price: 45.00, stockQuantity: 20 },
  { _id: 'seed-9', name: 'React Bomber Jacket', category: 'Men', price: 89.99, stockQuantity: 8 },
  { _id: 'seed-10', name: 'Casual Suede Loafers', category: 'Men', price: 75.00, stockQuantity: 12 },
  { _id: 'seed-11', name: 'Running Shoes', category: 'Apparel', price: 85.00, stockQuantity: 16 },
  { _id: 'seed-12', name: 'Fleece Active Jacket', category: 'Apparel', price: 69.50, stockQuantity: 0 },
  { _id: 'seed-13', name: 'Stainless Water Bottle', category: 'Home & Kitchen', price: 24.99, stockQuantity: 35 },
  { _id: 'seed-14', name: 'LED Desk Lamp', category: 'Home & Kitchen', price: 39.99, stockQuantity: 20 },
  { _id: 'seed-15', name: 'Ceramic Coffee Mug', category: 'Home & Kitchen', price: 15.00, stockQuantity: 40 }
];

export default function Shop({ currentUser, onLogout, initialPage = "shop" }) {
  const [products, setProducts] = useState(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('custom_products')) || [];
      const customIds = new Set(custom.map(p => p._id));
      const filteredDefault = DEFAULT_CATALOG.filter(p => !customIds.has(p._id));
      return [...custom, ...filteredDefault];
    } catch {
      return DEFAULT_CATALOG;
    }
  });

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [toastMessage, setToastMessage] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [currentPage, setCurrentPage] = useState(initialPage);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Dynamic unique description generator
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

  const getFallbackEmoji = (name = "") => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("headphones") || lower.includes("earbuds")) return "🎧";
    if (lower.includes("keyboard")) return "⌨️";
    if (lower.includes("mouse")) return "🖱️";
    if (lower.includes("wallet")) return "💼";
    if (lower.includes("shoes") || lower.includes("loafers") || lower.includes("sneakers")) return "👟";
    if (lower.includes("bottle")) return "🥤";
    if (lower.includes("lamp") || lower.includes("light")) return "💡";
    if (lower.includes("watch")) return "⌚";
    if (lower.includes("backpack") || lower.includes("bag")) return "🎒";
    if (lower.includes("jacket") || lower.includes("windbreaker") || lower.includes("sweater")) return "🧥";
    return "📦";
  };

  const renderItemVisual = (product, isDetail = false) => {
    if (!product) return "📦";
    if (product.imageUrl) {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className={isDetail ? "detail-product-img" : "product-card-img"}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
          <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: isDetail ? '6rem' : '3.8rem' }}>
            {getFallbackEmoji(product.name)}
          </div>
        </div>
      );
    }
    return getFallbackEmoji(product.name);
  };

  // Sync products from backend + custom products on mount
  const syncProductsFromSources = useCallback(async () => {
    const custom = JSON.parse(localStorage.getItem('custom_products')) || [];
    try {
      const response = await fetch('http://localhost:3000/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const backendIds = new Set(data.map(p => p._id));
          const filteredCustom = custom.filter(p => !backendIds.has(p._id));
          setProducts([...filteredCustom, ...data]);
          return;
        }
      }
    } catch {
      // Backend not running, use custom + defaults
    }
    const customIds = new Set(custom.map(p => p._id));
    const filteredDefault = DEFAULT_CATALOG.filter(p => !customIds.has(p._id));
    setProducts([...custom, ...filteredDefault]);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadCatalog() {
      const custom = JSON.parse(localStorage.getItem('custom_products')) || [];
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
          const data = await response.json();
          if (!ignore && Array.isArray(data) && data.length > 0) {
            const backendIds = new Set(data.map(p => p._id));
            const filteredCustom = custom.filter(p => !backendIds.has(p._id));
            setProducts([...filteredCustom, ...data]);
            return;
          }
        }
      } catch {
        // Backend not running, use local custom + default catalog
      }
      if (!ignore) {
        const customIds = new Set(custom.map(p => p._id));
        const filteredDefault = DEFAULT_CATALOG.filter(p => !customIds.has(p._id));
        setProducts([...custom, ...filteredDefault]);
      }
    }
    loadCatalog();
    return () => { ignore = true; };
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        if (existingItem.quantity >= product.stockQuantity) {
          showToast(`⚠️ Cannot add more. Only ${product.stockQuantity} items are available in stock!`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showToast(`🛒 Added "${product.name}" to cart`);
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            if (delta > 0 && newQty > item.stockQuantity) {
              showToast(`⚠️ Cannot add more items. Only ${item.stockQuantity} items are in stock.`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

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

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTax = subtotal * 0.08;
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

      if (response.ok) {
        setCheckoutStep("success");
        setCart([]);
        syncProductsFromSources();
      } else {
        setCheckoutStep("success");
        setCart([]);
      }
    } catch {
      setCheckoutStep("success");
      setCart([]);
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
              <p style={{ color: '#64748b', marginBottom: '20px' }}>Only authorized administrators can access the inventory dashboard.</p>
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
                {/* DESKTOP CATEGORY SIDEBAR */}
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
                  {/* MOBILE HORIZONTAL CATEGORY PILLS */}
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
                    <p>Premium lifestyle, smart electronics, and designer accessories delivered right to your doorstep.</p>
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
                            {renderItemVisual(product, false)}
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
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Try adjusting your search query or selecting a different category division.</p>
                      </div>
                    )}
                  </div>
                </main>
              </>
            ) : (
              <div className="product-detail-view">
                <button className="back-btn" onClick={() => setSelectedProduct(null)}>
                  <ArrowLeft size={18} /> Back to Products Catalog
                </button>
                <div className="product-detail-container">
                  <div className="detail-image-box">
                    {renderItemVisual(selectedProduct, true)}
                  </div>
                  <div className="detail-info">
                    <span className="category-tag">{selectedProduct.category}</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{selectedProduct.name}</h2>
                    <p className="detail-price">${selectedProduct.price ? selectedProduct.price.toFixed(2) : '0.00'}</p>

                    <p className="description">
                      {getProductDescription(selectedProduct.name, selectedProduct.category)}
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
            <Check size={18} color="#34d399" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="cart-drawer-overlay">
          <div className="cart-drawer">
            <div className="cart-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} color="#2563eb" />
                {checkoutStep === "cart" && "Your Shopping Bag"}
                {checkoutStep === "form" && "Customer Checkout"}
                {checkoutStep === "success" && "Order Confirmed!"}
              </h3>
              <button onClick={() => setIsCartOpen(false)} aria-label="Close Cart"><X size={20} /></button>
            </div>

            {checkoutStep === "cart" && (
              <>
                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                      <ShoppingBag size={48} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                      <p style={{ fontWeight: '600', color: '#475569' }}>Your cart is empty</p>
                      <p style={{ fontSize: '13px' }}>Explore the shop and add items to your cart.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item._id} className="cart-item">
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0, border: '1px solid #e2e8f0', fontSize: '20px' }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block'; }} />
                          ) : null}
                          <span style={{ display: item.imageUrl ? 'none' : 'block' }}>{getFallbackEmoji(item.name)}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>{item.name}</span>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>${item.price.toFixed(2)} each</span>
                        </div>
                        <div className="cart-controls">
                          <button onClick={() => updateQuantity(item._id, -1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                          <span style={{ fontWeight: '700', fontSize: '14px', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} aria-label="Increase quantity"><Plus size={13} /></button>
                        </div>
                        <span style={{ fontWeight: '700', color: '#2563eb', minWidth: '60px', textAlign: 'right' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="cart-footer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#475569' }}>
                      <span>Subtotal:</span>
                      <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#475569' }}>
                      <span>Estimated Sales Tax (8%):</span>
                      <span style={{ fontWeight: '600' }}>${estimatedTax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.2rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '16px', color: '#0f172a' }}>
                      <span>Final Order Total:</span>
                      <span style={{ color: '#2563eb' }}>${totalPrice.toFixed(2)}</span>
                    </div>
                    <button className="checkout-btn" onClick={() => setCheckoutStep("form")}>
                      Proceed to Checkout (${totalPrice.toFixed(2)})
                    </button>
                  </div>
                )}
              </>
            )}

            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, padding: '10px 0' }}>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Email Address (for receipt) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>

                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', margin: '8px 0', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px' }}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '6px' }}>
                    <span>Tax (8%):</span>
                    <span>${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                    <span>Total Payment:</span>
                    <span style={{ color: '#2563eb' }}>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setCheckoutStep("cart")}
                    style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Back to Bag
                  </button>
                  <button
                    type="submit"
                    className="checkout-btn"
                    style={{ flex: 2 }}
                  >
                    Confirm & Place Order
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === "success" && (
              <div className="success-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '14px' }}>
                <CheckCircle size={64} color="#10b981" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>Order Placed Successfully!</h3>
                <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '300px' }}>
                  Thank you for shopping with Doorstep! A confirmation receipt has been sent to your email.
                </p>
                <button
                  className="checkout-btn"
                  onClick={() => { setIsCartOpen(false); setCheckoutStep("cart"); }}
                  style={{ width: 'auto', padding: '10px 24px', marginTop: '10px' }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}