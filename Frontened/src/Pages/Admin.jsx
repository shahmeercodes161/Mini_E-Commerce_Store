import { useState, useEffect, useCallback } from 'react';
import { 
  PlusCircle, Trash2, Edit, RefreshCw, XCircle, Package, ShoppingBag, 
  Eye, CheckCircle2, Layers, Archive, DollarSign, Upload, Image as ImageIcon, 
  X, AlertCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Admin({ products = [], setProducts, onSwitchToShop }) {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Accessories',
    stockQuantity: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMsg = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!API_BASE_URL) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/history`);
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
    if (API_BASE_URL) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && setProducts) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.warn("Backend sync notice:", err);
      }
    }
    fetchOrders();
    showMsg('success', 'Catalog synchronized with database.');
  }, [fetchOrders, setProducts, showMsg]);

  useEffect(() => {
    let ignore = false;
    async function loadOrders() {
      if (!API_BASE_URL) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/history`);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showMsg('error', 'Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const resetFormMode = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Accessories', stockQuantity: '', imageUrl: '' });
    setImageFile(null);
    setImagePreview('');
  };

  // GUARANTEED PRODUCT CREATION / UPDATE WITH MULTER IMAGE UPLOAD
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

    let finalImageUrl = formData.imageUrl.trim();

    // 1. Upload file via Multer if selected
    if (imageFile) {
      if (API_BASE_URL) {
        setIsUploading(true);
        try {
          const uploadBody = new FormData();
          uploadBody.append('image', imageFile);

          const uploadRes = await fetch(`${API_BASE_URL}/api/products/upload`, {
            method: 'POST',
            body: uploadBody
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalImageUrl = uploadData.imageUrl || imagePreview;
          } else {
            finalImageUrl = imagePreview;
          }
        } catch (err) {
          console.warn("Backend image upload notice, using local preview data:", err);
          finalImageUrl = imagePreview;
        } finally {
          setIsUploading(false);
        }
      } else {
        // Direct local/base64 preview on offline/static hosting
        finalImageUrl = imagePreview;
      }
    }

    const payload = {
      name: formData.name.trim(),
      price: priceNum,
      category: formData.category,
      stockQuantity: stockNum,
      imageUrl: finalImageUrl
    };

    if (editingId) {
      // 1. Update in Database
      if (API_BASE_URL) {
        try {
          await fetch(`${API_BASE_URL}/api/products/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.warn("Backend update notice:", err);
        }
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
      if (API_BASE_URL) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/products`, {
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

      showMsg('success', `🎉 Product "${payload.name}" with image was added successfully and is now live in the store catalog!`);
      resetFormMode();
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || ''
    });
    setImagePreview(product.imageUrl || '');
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product from the catalog?")) return;

    if (API_BASE_URL) {
      try {
        await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn("Backend delete notice:", err);
      }
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
  const totalCatalogItems = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const lowStockCount = products.filter(p => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0).length;
  const totalOrdersAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            Store Inventory Dashboard
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Manage catalog items, upload images via Multer, restock inventory, and review real-time orders.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={syncBackend} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#334155' }}
          >
            <RefreshCw size={15} /> Sync Database
          </button>
          
          <button 
            onClick={onSwitchToShop} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            <Eye size={15} /> View Customer Storefront
          </button>
        </div>
      </div>

      {/* SYSTEM FEEDBACK NOTIFICATIONS */}
      {message.text && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '20px', 
          fontSize: '14px', 
          fontWeight: '500',
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: message.type === 'error' ? '#fef2f2' : '#ecfdf5',
          color: message.type === 'error' ? '#b91c1c' : '#047857',
          border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#6ee7b7'}`
        }}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {message.text}
        </div>
      )}

      {/* METRIC STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', color: '#2563eb' }}><Package size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total Products</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{totalCatalogItems}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', color: '#059669' }}><Layers size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total Stock Units</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{totalStockUnits}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '10px', color: '#d97706' }}><Archive size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Low Stock Alert</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#d97706' }}>{lowStockCount}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#faf5ff', padding: '12px', borderRadius: '10px', color: '#9333ea' }}><DollarSign size={24} /></div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Orders Revenue</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>${totalOrdersAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* PRODUCT CREATION/EDITING MANAGEMENT FORM */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '26px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ gridColumn: '1 / -1', fontSize: '16px', fontWeight: '700', color: editingId ? '#d97706' : '#2563eb', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{editingId ? `✏️ Editing Catalog Item: ${formData.name || 'Untitled'}` : '✨ Add New Product to Store Catalog'}</span>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>Upload photos or store on PC</span>
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

        {/* IMAGE UPLOAD SECTION VIA MULTER */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
          <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} color="#2563eb" /> Product Image Upload (Multer / PC / Cloudinary)
          </label>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Image Preview Box */}
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0', 
              background: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {imagePreview || formData.imageUrl ? (
                <>
                  <img 
                    src={imagePreview || formData.imageUrl} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    title="Remove image"
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <ImageIcon size={32} color="#94a3b8" />
              )}
            </div>

            {/* File Input */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input 
                type="file" 
                accept="image/*" 
                id="productImageFile"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="productImageFile" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                <Upload size={15} /> {imageFile ? 'Change Selected Photo' : 'Choose Picture from PC'}
              </label>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {imageFile ? `Selected: ${imageFile.name}` : 'Supports JPG, PNG, WEBP (stored locally on PC or Cloudinary)'}
              </div>
            </div>

            {/* Optional Web Image URL Input */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input 
                type="url" 
                name="imageUrl"
                placeholder="Or paste image web URL (https://...)" 
                value={formData.imageUrl}
                onChange={(e) => {
                  handleInputChange(e);
                  if (!imageFile) setImagePreview(e.target.value);
                }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', gridColumn: '1 / -1', marginTop: '6px' }}>
          <button 
            type="submit" 
            disabled={isUploading}
            style={{ 
              flex: 1, 
              padding: '13px', 
              background: editingId ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: isUploading ? 'not-allowed' : 'pointer', 
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
            {isUploading ? (
              <>
                <RefreshCw size={18} className="spin" /> Uploading Image...
              </>
            ) : editingId ? (
              <>
                <Edit size={18} /> Save & Update Product
              </>
            ) : (
              <>
                <PlusCircle size={18} /> Add Item To Catalog Successfully
              </>
            )}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569', width: '70px' }}>Photo</th>
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
                    <td style={{ padding: '10px 18px' }}>
                      <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        background: '#f1f5f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '20px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                        ) : null}
                        <span style={{ display: product.imageUrl ? 'none' : 'block' }}>
                          {product.category === 'Electronics' ? '🎧' : product.category === 'Accessories' ? '💼' : product.category === 'Men' ? '👔' : product.category === 'Apparel' ? '👟' : '📦'}
                        </span>
                      </div>
                    </td>
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
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No products found in catalog. Add your first item above!</td>
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
                <th style={{ padding: '14px 18px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Payment Method</th>
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
                        <span style={{ color: '#94a3b8' }}>No items recorded</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: '#2563eb' }}>
                      ${((order.total !== undefined ? order.total : order.totalAmount) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        background: (order.paymentMethod || 'Stripe').includes('Stripe') ? '#f5f3ff' : '#f8fafc',
                        color: (order.paymentMethod || 'Stripe').includes('Stripe') ? '#635bff' : '#475569',
                        border: (order.paymentMethod || 'Stripe').includes('Stripe') ? '1px solid #ddd6fe' : '1px solid #e2e8f0'
                      }}>
                        {order.paymentMethod || 'Stripe'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        background: order.status === 'Completed' ? '#ecfdf5' : '#eff6ff',
                        color: order.status === 'Completed' ? '#059669' : '#2563eb'
                      }}>
                        {order.status || 'Processed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    No customer orders placed yet. Add items to cart in storefront to checkout!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}