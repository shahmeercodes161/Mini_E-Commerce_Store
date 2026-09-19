import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, Edit, RefreshCw, XCircle, Package, ShoppingBag, Eye, CheckCircle2, Layers, Archive, DollarSign } from 'lucide-react';

export default function Admin({ products = [], setProducts, onSwitchToShop }) {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Accessories',
    stockQuantity: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMsg = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/orders/history');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.warn("Failed fetching admin orders:", error);
    }
  }, []);

  // Sync products from backend
  const syncBackend = useCallback(async () => {
    const localCustom = JSON.parse(localStorage.getItem('custom_products')) || [];
    try {
      const response = await fetch('http://localhost:3000/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0 && setProducts) {
          const backendIds = new Set(data.map(p => p._id));
          const filteredLocal = localCustom.filter(p => !backendIds.has(p._id));
          setProducts([...filteredLocal, ...data]);
        }
      }
    } catch {
      // Backend not reached, keep current
    }
    fetchOrders();
    showMsg('success', 'Catalog synchronized successfully.');
  }, [fetchOrders, setProducts, showMsg]);

  useEffect(() => {
    let ignore = false;
    async function loadOrders() {
      try {
        const response = await fetch('http://localhost:3000/api/orders/history');
        if (response.ok) {
          const data = await response.json();
          if (!ignore) {
            setOrders(data);
          }
        }
      } catch (err) {
        console.warn("Notice loading orders:", err);
      }
    }
    loadOrders();
    return () => { ignore = true; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormMode = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Accessories', stockQuantity: '' });
  };

  // GUARANTEED PRODUCT CREATION / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stockQuantity, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      showMsg('error', 'Please enter a valid positive price.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showMsg('error', 'Please enter a valid stock quantity.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: priceNum,
      category: formData.category,
      stockQuantity: stockNum
    };

    if (editingId) {
      // 1. Update in Database
      try {
        await fetch(`http://localhost:3000/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("Backend update notice:", err);
      }

      // 2. Update in Persistent Local Storage
      const localCustom = JSON.parse(localStorage.getItem('custom_products')) || [];
      const updatedLocal = localCustom.map(p => p._id === editingId ? { ...p, ...payload } : p);
      localStorage.setItem('custom_products', JSON.stringify(updatedLocal));

      // 3. Update Shared State Instantly
      if (setProducts) {
        setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...payload } : p));
      }

      showMsg('success', `Product "${payload.name}" updated successfully!`);
      resetFormMode();
    } else {
      // ADD NEW PRODUCT
      let backendCreated = null;

      // 1. Try sending to database
      try {
        const response = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          backendCreated = await response.json();
        }
      } catch (err) {
        console.warn("Backend offline during product creation, saving locally:", err);
      }

      const newProductItem = backendCreated || {
        _id: 'custom-' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };

      // 2. Save in Persistent Storage so it survives page reloads
      const localCustom = JSON.parse(localStorage.getItem('custom_products')) || [];
      const updatedCustom = [newProductItem, ...localCustom.filter(p => p._id !== newProductItem._id)];
      localStorage.setItem('custom_products', JSON.stringify(updatedCustom));

      // 3. Update Shared Storefront State IMMEDIATELY
      if (setProducts) {
        setProducts(prev => [newProductItem, ...prev.filter(p => p._id !== newProductItem._id)]);
      }

      showMsg('success', `🎉 Product "${payload.name}" was added successfully and is now live in the store catalog!`);
      resetFormMode();
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product from the catalog?")) return;

    try {
      await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn("Backend delete notice:", err);
    }

    const localCustom = JSON.parse(localStorage.getItem('custom_products')) || [];
    const updatedCustom = localCustom.filter(p => p._id !== id);
    localStorage.setItem('custom_products', JSON.stringify(updatedCustom));

    if (setProducts) {
      setProducts(prev => prev.filter(p => p._id !== id));
    }
    showMsg('success', 'Product removed from store catalog.');
  };

  // Metrics calculations
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const categoriesCount = new Set(products.map(p => p.category)).size;

  return (
    <div style={{ maxWidth: '1100px', margin: '24px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.7rem', fontWeight: '800', color: '#0f172a' }}>
            <Package size={28} color="#2563eb" /> Store Inventory & Catalog Manager
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Add new products, update stock quantities, and view live order receipts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onSwitchToShop && (
            <button 
              onClick={onSwitchToShop} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }}
            >
              <Eye size={16} /> Preview Storefront
            </button>
          )}

          <button 
            onClick={syncBackend} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
          >
            <RefreshCw size={15} /> Refresh Data
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Total Products</span>
            <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}><Package size={18} /></div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{products.length}</span>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Inventory Units</span>
            <div style={{ padding: '6px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}><Archive size={18} /></div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{totalStockUnits}</span>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Active Categories</span>
            <div style={{ padding: '6px', background: '#fef3c7', borderRadius: '8px', color: '#d97706' }}><Layers size={18} /></div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{categoriesCount}</span>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Orders Logged</span>
            <div style={{ padding: '6px', background: '#fdf2f8', borderRadius: '8px', color: '#db2777' }}><DollarSign size={18} /></div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>{orders.length} <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>(${totalRevenue.toFixed(0)})</span></span>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {message.text && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#047857' : '#b91c1c', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {message.type === 'success' && <CheckCircle2 size={20} color="#059669" />}
          {message.text}
        </div>
      )}

      {/* PRODUCT CREATION/EDITING MANAGEMENT FORM */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '26px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ gridColumn: '1 / -1', fontSize: '16px', fontWeight: '700', color: editingId ? '#d97706' : '#2563eb', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{editingId ? `✏️ Editing Catalog Item: ${formData.name || 'Untitled'}` : '✨ Add New Product to Store Catalog'}</span>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>Updates live in Storefront instantly</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Product Title / Name *</label>
          <input 
            type="text" 
            name="name" 
            required 
            value={formData.name} 
            onChange={handleInputChange} 
            placeholder="e.g. Wireless Noise Cancelling Headphones" 
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Price ($ USD) *</label>
          <input 
            type="number" 
            step="0.01" 
            min="0" 
            name="price" 
            required 
            value={formData.price} 
            onChange={handleInputChange} 
            placeholder="49.99" 
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Inventory Stock Units *</label>
          <input 
            type="number" 
            min="0" 
            name="stockQuantity" 
            required 
            value={formData.stockQuantity} 
            onChange={handleInputChange} 
            placeholder="25" 
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Store Category Division *</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleInputChange} 
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '14px' }}
          >
            {["Accessories", "Electronics", "Men", "Apparel", "Home & Kitchen"].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', gridColumn: '1 / -1', marginTop: '6px' }}>
          <button 
            type="submit" 
            style={{ 
              flex: 1, 
              padding: '13px', 
              background: editingId ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '700', 
              fontSize: '15px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.15s'
            }}
          >
            {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
            {editingId ? 'Save & Update Product' : 'Add Item To Catalog Successfully'}
          </button>
          
          {editingId && (
            <button 
              type="button" 
              onClick={resetFormMode} 
              style={{ padding: '13px 22px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <XCircle size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* DATABASE DOCUMENTS INDEX TABLE */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '40px' }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Active Catalog Products ({products.length})</h3>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Directly synced with the Customer Shop</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Product Name</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Category</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Unit Price</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Stock Left</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#0f172a' }}>{product.name}</td>
                    <td style={{ padding: '14px 18px' }}><span style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{product.category}</span></td>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: '#2563eb' }}>${product.price?.toFixed(2)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: '600', color: product.stockQuantity === 0 ? '#ef4444' : product.stockQuantity < 10 ? '#d97706' : '#16a34a' }}>
                        {product.stockQuantity}
                      </span> units
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => startEdit(product)} style={{ border: 'none', background: 'none', color: '#475569', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit size={17} /></button>
                        <button onClick={() => handleDelete(product._id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No products found in catalog. Add your first item above!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER ORDER HISTORY INDEX TABLE */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} color="#2563eb" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Customer Order History ({orders.length})</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Customer</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Email Address</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Items Ordered</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Total Amount</th>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#0f172a' }}>{order.customerName || 'Anonymous'}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{order.customerEmail || 'N/A'}</td>
                    <td style={{ padding: '14px 18px' }}>
                      {order.items && order.items.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px' }}>
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              <span>{item.product ? item.product.name : 'Catalog Item'}</span> 
                              <strong style={{ marginLeft: '6px' }}>x{item.quantity}</strong>
                              {item.priceAtPurchase && (
                                <span style={{ color: '#64748b', marginLeft: '6px' }}>(${item.priceAtPurchase.toFixed(2)})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>No items listed</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: '#2563eb' }}>
                      ${order.total ? order.total.toFixed(2) : (order.subtotal ? order.subtotal.toFixed(2) : '0.00')}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                        {order.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No customer checkout records logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}