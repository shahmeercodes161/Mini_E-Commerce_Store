import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, RefreshCw, XCircle } from 'lucide-react';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Accessories',
    stockQuantity: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  // Fetch all existing products from the database backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed fetching admin products:", error);
      showMsg('error', 'Could not sync with backend database server.');
    }
  };

  // FIXED: Changed API endpoint to '/history' to match backend configuration
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/orders/history');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed fetching admin orders:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Resets form fields and takes you out of Edit Mode back to Add Mode
  const resetFormMode = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Accessories', stockQuantity: '' });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:3000/api/products/${editingId}`
      : 'http://localhost:3000/api/products';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          stockQuantity: parseInt(formData.stockQuantity, 10)
        })
      });

      if (response.ok) {
        showMsg('success', editingId ? 'Product updated!' : 'Product added!');
        resetFormMode(); // Clears form fields back to empty state after success
        fetchProducts();
      } else {
        showMsg('error', 'Operation failed. Check server fields.');
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showMsg('error', 'Network error encountered.');
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showMsg('success', 'Product deleted.');
        fetchProducts();
      } else {
        showMsg('error', 'Failed to delete product.');
      }
    } catch (error) {
      console.error("Delete operation error:", error);
      showMsg('error', 'Network connection issue.');
    }
  };
  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Database Inventory Dashboard</h2>
        <button onClick={fetchProducts} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          <RefreshCw size={16} /> Sync Table
        </button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#15803d' : '#b91c1c', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      {/* PRODUCT CREATION/EDITING MANAGEMENT FORM */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ gridColumn: '1 / -1', fontSize: '14px', fontWeight: '600', color: editingId ? '#eab308' : '#2563eb', marginBottom: '-8px' }}>
          {editingId ? ' ' : ''}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>Item Name</label>
          <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Wireless Mouse" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>Price ($ USD)</label>
          <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} placeholder="29.99" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>Stock Quantity</label>
          <input type="number" name="stockQuantity" required value={formData.stockQuantity} onChange={handleInputChange} placeholder="15" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600' }}>Category Division</label>
          <select name="category" value={formData.category} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
            {["Men", "Accessories", "Electronics", "Apparel", "Home & Kitchen"].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
          <button type="submit" style={{ flex: 1, padding: '12px', background: editingId ? '#eab308' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
            {editingId ? 'Update Store Catalog' : 'Add Item To Catalog'}
          </button>
          
          {editingId && (
            <button type="button" onClick={resetFormMode} style={{ padding: '12px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <XCircle size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* DATABASE DOCUMENTS INDEX TABLE */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px 18px', fontWeight: '600' }}>Item Label</th>
              <th style={{ padding: '14px 18px', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '14px 18px', fontWeight: '600' }}>Cost Unit</th>
              <th style={{ padding: '14px 18px', fontWeight: '600' }}>Stock Left</th>
              <th style={{ padding: '14px 18px', fontWeight: '600', textTransform: 'none' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '500' }}>{product.name}</td>
                  <td style={{ padding: '14px 18px' }}><span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{product.category}</span></td>
                  <td style={{ padding: '14px 18px', fontWeight: '600' }}>${product.price?.toFixed(2)}</td>
                  <td style={{ padding: '14px 18px', color: product.stockQuantity === 0 ? '#ef4444' : '#1e293b' }}>{product.stockQuantity} items</td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => startEdit(product)} style={{ border: 'none', background: 'none', color: '#475569', cursor: 'pointer', padding: '0' }} title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(product._id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0' }} title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No products found in the database. Add one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CUSTOMER ORDER HISTORY INDEX TABLE */}
      <div style={{ marginTop: '50px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Customer Order History</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px 18px', fontWeight: '600' }}>Customer Name</th>
              <th style={{ padding: '14px 18px', fontWeight: '600' }}>Email Address</th>
              <th style={{ padding: '14px 18px', fontWeight: '600' }}>Items Ordered</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '500' }}>{order.customerName || 'Anonymous'}</td>
                  <td style={{ padding: '14px 18px' }}>{order.customerEmail || 'N/A'}</td>
                  <td style={{ padding: '14px 18px' }}>
                    {/* FIXED: Reading 'order.items' to look inside database document arrays correctly */}
                    {order.items && order.items.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {/* FIXED: Reading 'item.product.name' fields via populated records */}
                            <span>{item.product ? item.product.name : 'Unknown Product'}</span> 
                            <strong style={{ marginLeft: '8px' }}>x{item.quantity}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>No items listed</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No past checkout orders found in the database logs.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}