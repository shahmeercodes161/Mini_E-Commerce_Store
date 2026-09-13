import React from 'react';
import { ShoppingCart, Search } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage, setSelectedProduct, searchQuery, setSearchQuery, totalCartItems, setIsCartOpen, setCheckoutStep }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => { setCurrentPage("shop"); setSelectedProduct(null); }}>
        Doorstep
      </div>

      <nav className="nav-links" style={{ display: 'flex', gap: '1.5rem', cursor: 'pointer', fontWeight: '500' }}>
        <span onClick={() => { setCurrentPage("shop"); setSelectedProduct(null); }} style={{ color: currentPage === "shop" ? '#2563eb' : '#475569' }}>Shop</span>
        <span onClick={() => setCurrentPage("about")} style={{ color: currentPage === "about" ? '#2563eb' : '#475569' }}>About</span>
        <span onClick={() => setCurrentPage("contact")} style={{ color: currentPage === "contact" ? '#2563eb' : '#475569' }}>Contact</span>
      </nav>

      <div className="nav-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button className="cart-btn" onClick={() => { setIsCartOpen(true); setCheckoutStep("cart"); }}>
          <ShoppingCart size={22} />
          {totalCartItems > 0 && <span className="badge">{totalCartItems}</span>}
        </button>
      </div>
    </header>
  );
}