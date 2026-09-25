import { useState } from 'react';
import { ShoppingCart, Search, LogOut, User, ShieldCheck, Menu, X, ShoppingBag } from 'lucide-react';

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  setSelectedProduct, 
  searchQuery, 
  setSearchQuery, 
  totalCartItems, 
  setIsCartOpen, 
  setCheckoutStep,
  currentUser,
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-brand" onClick={() => navigateTo("shop")}>
          <ShoppingBag size={22} color="#38bdf8" />
          <span>Doorstep</span>
        </div>

        {/* DESKTOP NAV LINKS */}
        <nav className="nav-links">
          <span 
            onClick={() => navigateTo("shop")} 
            className={`nav-link-item ${currentPage === "shop" ? "active" : ""}`}
          >
            Shop
          </span>
          <span 
            onClick={() => navigateTo("about")} 
            className={`nav-link-item ${currentPage === "about" ? "active" : ""}`}
          >
            About
          </span>
          <span 
            onClick={() => navigateTo("contact")} 
            className={`nav-link-item ${currentPage === "contact" ? "active" : ""}`}
          >
            Contact
          </span>
          
          {isAdmin && (
            <span 
              onClick={() => navigateTo("admin")} 
              className={`nav-link-item ${currentPage === "admin" ? "active" : ""}`}
              style={{ color: '#fbbf24', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <ShieldCheck size={16} /> Admin Dashboard
            </span>
          )}
        </nav> 

        {/* DESKTOP SEARCH */}
        <div className="nav-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ACTIONS: CART, USER, LOGOUT, MOBILE TOGGLE */}
        <div className="nav-actions">
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <User size={16} />
              <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
              </span>
              {isAdmin && (
                <span style={{ background: '#d97706', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                  Admin
                </span>
              )}
            </div>
          )}

          <button 
            className="cart-btn" 
            onClick={() => { setIsCartOpen(true); setCheckoutStep("cart"); }}
            aria-label="Open Cart"
          >
            <ShoppingCart size={20} />
            {totalCartItems > 0 && <span className="badge">{totalCartItems}</span>}
          </button>

          {onLogout && (
            <button 
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          )}

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE COLLAPSIBLE DRAWER */}
      {mobileMenuOpen && (
        <div className="mobile-drawer open">
          <div style={{ position: 'relative', width: '100%', marginBottom: '6px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => navigateTo("shop")}
              style={{
                background: currentPage === "shop" ? 'rgba(56, 189, 248, 0.15)' : 'none',
                color: currentPage === "shop" ? '#38bdf8' : '#cbd5e1',
                border: 'none',
                padding: '10px',
                textAlign: 'left',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={16} /> Shop Storefront
            </button>
            <button
              onClick={() => navigateTo("about")}
              style={{
                background: currentPage === "about" ? 'rgba(56, 189, 248, 0.15)' : 'none',
                color: currentPage === "about" ? '#38bdf8' : '#cbd5e1',
                border: 'none',
                padding: '10px',
                textAlign: 'left',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <User size={16} /> About Doorstep
            </button>
            <button
              onClick={() => navigateTo("contact")}
              style={{
                background: currentPage === "contact" ? 'rgba(56, 189, 248, 0.15)' : 'none',
                color: currentPage === "contact" ? '#38bdf8' : '#cbd5e1',
                border: 'none',
                padding: '10px',
                textAlign: 'left',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Search size={16} /> Contact Us
            </button>

            {isAdmin && (
              <button
                onClick={() => navigateTo("admin")}
                style={{
                  background: currentPage === "admin" ? 'rgba(251, 191, 36, 0.15)' : 'none',
                  color: '#fbbf24',
                  border: 'none',
                  padding: '10px',
                  textAlign: 'left',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={18} /> Admin Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}