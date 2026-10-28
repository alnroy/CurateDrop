import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  PlusCircle,
  ShieldCheck,
  Users,
  Search,
  ExternalLink,
  Trash2,
  CheckCircle,
  Phone,
  Sparkles,
  ArrowRight,
  LogOut,
  Zap,
  Lock,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  Clock,
  Upload,
  Image as ImageIcon,
  Camera,
  Check,
  Plus,
  ChevronDown
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8002/api' : '/api';
const SUPER_ADMIN_PHONE = '7511136171';

const DEFAULT_CATEGORY_MAP = {
  'Smartphones': [
    'Budget & Good (Under ₹10,000)',
    'Value for Money (Under ₹20,000)',
    'Mid-Range & Flagship Killers (Under ₹40,000)',
    'Premium & Ultra Flagships',
    'Best Camera & Photography',
    'Best Battery & Performance',
    'Under 4000 Budget Steals'
  ],
  'Electronics & Tech': [
    'Laptops & Ultrabooks',
    'Tablets & iPads',
    'Smartwatches & Fitness Bands',
    'Earbuds & Headphones',
    'Power Banks & Fast Chargers',
    'PC & Gaming Gear'
  ],
  'Desk Setup': [
    'Ergonomic Laptop & Monitor Stands',
    'Desk Mats & Leather Pads',
    'Mechanical Keyboards & Mice',
    'Desk Lighting & Lamps',
    'Cable Management & Hubs'
  ],
  'Outdoors & Travel': [
    'Backpacks & Luggage',
    'Fishing & Marine Gear',
    'Camping & Hiking Gear',
    'Insulated Bottles & Flasks',
    'Car Accessories & Gadgets'
  ],
  'Home & Lifestyle': [
    'Smart Home Devices',
    'Kitchen Appliances',
    'Air Purifiers & Fragrance',
    'Organization & Storage'
  ],
  'Pet Care': [
    'Dogs Gear & Care',
    'Cats Toys & Care',
    'Grooming & Health'
  ]
};

// Premium Custom Dropdown with Exact Width Alignment & Direct Inline Creation
function FormSelectDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  allowAdd = false,
  addNewLabel = '+ Add New',
  onAddNew,
  icon = '📁'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [newInputVal, setNewInputVal] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAddingInline(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAddingInline && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingInline]);

  const filteredOptions = options.filter((opt) => {
    const text = typeof opt === 'string' ? opt : (opt.label || opt.id || '');
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = newInputVal.trim();
    if (!trimmed) return;
    if (onAddNew) {
      onAddNew(trimmed);
    } else {
      onChange(trimmed);
    }
    setNewInputVal('');
    setIsAddingInline(false);
    setIsOpen(false);
  };

  const selectedDisplay = typeof value === 'string' ? value : (value?.label || placeholder);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button - strictly matches form input height and design */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsAddingInline(false);
          setSearchQuery('');
        }}
        className={`w-full h-11 px-3.5 bg-gray-50 hover:bg-gray-100/80 border rounded-xl flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-900 transition-all outline-none cursor-pointer select-none ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="text-sm shrink-0">{icon}</span>
          <span className="truncate text-gray-900 font-bold">{selectedDisplay || placeholder}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu - EXACTLY matches trigger width with left-0 right-0 w-full */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-gray-200/90 z-50 overflow-hidden animate-sheet-up">
          {/* Quick Search if options > 5 */}
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-3 text-center text-xs text-gray-400 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = typeof opt === 'string' ? opt : opt.id;
                const optLabel = typeof opt === 'string' ? opt : (opt.label || opt.id);
                const isSelected = optVal === value;

                return (
                  <button
                    key={optVal}
                    type="button"
                    onClick={() => {
                      onChange(optVal);
                      setIsOpen(false);
                      setIsAddingInline(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 font-black border border-amber-300/80 shadow-2xs'
                        : 'hover:bg-gray-100/80 text-gray-700 font-bold'
                    }`}
                  >
                    <span className="truncate pr-2">{optLabel}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[3]" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* DIRECTLY INSIDE THE DROPDOWN: ADD NEW ACTION */}
          {allowAdd && (
            <div className="border-t border-gray-100 p-2 bg-gray-50/90">
              {!isAddingInline ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingInline(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />
                  <span>{addNewLabel}</span>
                </button>
              ) : (
                <div className="space-y-1.5 p-1 bg-white rounded-xl border border-amber-300 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newInputVal}
                      onChange={(e) => setNewInputVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubmit();
                        } else if (e.key === 'Escape') {
                          setIsAddingInline(false);
                          setNewInputVal('');
                        }
                      }}
                      placeholder={`Enter new ${label?.replace('*', '').trim().toLowerCase() || 'name'}...`}
                      className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-amber-300 rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubmit}
                      disabled={!newInputVal.trim()}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingInline(false);
                        setNewInputVal('');
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold px-1">
                    Press Enter to add directly
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('curatedrop_admin_user') || 'null');
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('catalog'); // catalog, add, delivery, staff
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Catalog State
  const [products, setProducts] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Dynamic Categories & Subcategories State
  const [categoryMap, setCategoryMap] = useState(() => {
    try {
      const saved = localStorage.getItem('curatedrop_category_map');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CATEGORY_MAP, ...parsed };
      }
    } catch (e) {
      console.log(e);
    }
    return DEFAULT_CATEGORY_MAP;
  });

  // Add Product Form State
  const [productType, setProductType] = useState('affiliate');
  const [urlToScrape, setUrlToScrape] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [subcategory, setSubcategory] = useState('Budget & Good (Under ₹10,000)');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [price, setPrice] = useState('₹499');
  const [mrp, setMrp] = useState('₹999');
  const [discount, setDiscount] = useState('50% OFF');
  const [uploadedImages, setUploadedImages] = useState([]); // Array of image URLs / base64 previews
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [curatedVerdict, setCuratedVerdict] = useState('');
  const [specsText, setSpecsText] = useState('Tested Quality\nTop Seller');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Delivery & OTP State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  // Staff State (Super Admin)
  const [adminsList, setAdminsList] = useState([]);
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');

  const fetchWithFallback = async (endpoint, options) => {
    try {
      let res = await fetch(`${API_BASE}${endpoint}`, options);
      return res;
    } catch {
      return await fetch(`http://localhost:8000/api${endpoint}`, options);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetchWithFallback('/products');
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetchWithFallback('/orders');
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.log(e);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetchWithFallback('/admin/list');
      if (res.ok) setAdminsList(await res.json());
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (adminUser) {
      fetchProducts();
      fetchOrders();
      if (adminUser.phone === SUPER_ADMIN_PHONE) fetchAdmins();
    }
  }, [adminUser]);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetchWithFallback('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput.trim(),
          password: passwordInput.trim()
        })
      });
      if (res.status === 429) {
        setLoginError('Too many login attempts. For security, please wait a minute before trying again.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setAdminUser(data.admin);
        localStorage.setItem('curatedrop_admin_user', JSON.stringify(data.admin));
      } else {
        setLoginError(data.message || 'Invalid phone or password.');
      }
    } catch {
      if (phoneInput.trim() === SUPER_ADMIN_PHONE && passwordInput.trim() === 'alan@2004') {
        const u = { phone: SUPER_ADMIN_PHONE, name: 'Super Admin', role: 'super_admin' };
        setAdminUser(u);
        localStorage.setItem('curatedrop_admin_user', JSON.stringify(u));
      } else {
        setLoginError('Authentication service unreachable. Please check your network connection.');
      }
    }
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('curatedrop_admin_user');
  };

  // MULTIPLE IMAGE UPLOAD HANDLER
  const handleImageFilesSelected = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);

    try {
      // Create FormData to send directly to Django backend
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await fetchWithFallback('/upload-images', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.urls) {
          setUploadedImages((prev) => [...prev, ...data.urls]);
        }
      } else {
        // Fallback: Convert to Base64 locally so it works even without backend file storage
        for (const file of files) {
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            setUploadedImages((prev) => [...prev, uploadEvent.target.result]);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch {
      // Local Base64 fallback
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          setUploadedImages((prev) => [...prev, uploadEvent.target.result]);
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Auto-Scrape Amazon URL
  const handleAutoScrape = async () => {
    if (!urlToScrape) return;
    setIsScraping(true);
    try {
      const res = await fetchWithFallback('/scrape-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScrape })
      });
      const data = await res.json();
      if (data) {
        if (data.title) setTitle(data.title);
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          setUploadedImages(data.images);
        } else if (data.image) {
          setUploadedImages((prev) => prev.includes(data.image) ? prev : [data.image, ...prev]);
        }
        if (data.price) setPrice(data.price);
        if (data.mrp) setMrp(data.mrp);
        if (data.discount) setDiscount(data.discount);
        if (data.specs) setSpecsText(data.specs.join('\n'));
        setAffiliateUrl(data.affiliateUrl || urlToScrape);
        setCuratedVerdict('Handpicked from Amazon for outstanding customer sentiment and verified build quality.');
        alert('Details & high-res images fetched! Review the details, select Category & Subcategory, then click "Publish Product" below.');
      }
    } catch (e) {
      alert('Could not auto-scrape. Please enter details manually.');
    } finally {
      setIsScraping(false);
    }
  };

  // Add Product Submit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      alert('Please upload at least 1 product image using the Upload button below.');
      return;
    }

    setIsSaving(true);
    try {
      const specsArr = specsText.split('\n').map((s) => s.trim()).filter(Boolean);
      const finalSub = subcategory === 'custom' ? customSubcategory.trim() : subcategory;
      
      // Update local category map if new custom values were used
      if (finalSub && category && (!categoryMap[category] || !categoryMap[category].includes(finalSub))) {
        setCategoryMap((prev) => {
          const list = prev[category] || [];
          const updated = { ...prev, [category]: [...list, finalSub] };
          localStorage.setItem('curatedrop_category_map', JSON.stringify(updated));
          return updated;
        });
      }

      const res = await fetchWithFallback('/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          subcategory: finalSub || 'General',
          price: productType === 'affiliate' ? 'Live on Amazon' : price,
          mrp: productType === 'affiliate' ? '' : mrp,
          discount: productType === 'affiliate' ? '' : discount,
          image: uploadedImages[0], // primary
          images: uploadedImages,    // all images gallery
          curatedVerdict: curatedVerdict || 'Inspected and certified for top value.',
          specs: specsArr,
          productType,
          affiliateUrl
        })
      });
      if (res.status === 429) {
        alert('Rate limit reached: Please wait a moment before saving another product.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert('Product published to store successfully!');
        setTitle('');
        setUrlToScrape('');
        setUploadedImages([]);
        fetchProducts();
        setActiveTab('catalog');
      } else {
        alert(data.message || 'Could not publish product. Please check the fields and try again.');
      }
    } catch {
      alert('Network error: Unable to reach the server. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      const res = await fetchWithFallback(`/products/${id}/delete`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || 'Could not delete product.');
      }
      fetchProducts();
    } catch {
      alert('Error deleting product.');
    }
  };

  // Verify Customer Open-Box Delivery OTP
  const handleVerifyOtp = async (orderId) => {
    try {
      const res = await fetchWithFallback('/orders/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, otp: otpInput })
      });
      const data = await res.json();
      if (data.success) {
        alert('SUCCESS: OTP verified! Order marked as Delivered.');
        setOtpInput('');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        alert('INVALID OTP: ' + data.message);
      }
    } catch {
      alert('Error verifying OTP.');
    }
  };

  // Super Admin: Add Staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithFallback('/admin/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterPhone: adminUser.phone,
          phone: newStaffPhone,
          name: newStaffName,
          password: newStaffPassword
        })
      });
      const data = await res.json();
      alert(data.message);
      setNewStaffPhone('');
      setNewStaffName('');
      setNewStaffPassword('');
      fetchAdmins();
    } catch {
      alert('Error adding staff.');
    }
  };

  // Super Admin: Delete Staff
  const handleDeleteStaff = async (targetPhone) => {
    if (!window.confirm(`Revoke admin access for ${targetPhone}?`)) return;
    try {
      const res = await fetchWithFallback('/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterPhone: adminUser.phone,
          targetPhone
        })
      });
      const data = await res.json();
      alert(data.message);
      fetchAdmins();
    } catch {
      alert('Error removing admin.');
    }
  };

  // LOGIN SCREEN
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-gray-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20 font-black">
              <Zap className="w-8 h-8 fill-gray-950" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] tracking-tight">CurateDrop Admin</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1.5">Staff Portal & Delivery Operations</p>
          </div>

          <form onSubmit={handleLogin} className="bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 backdrop-blur-xl">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>User ID / Phone Number</span>
              </label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. 7511136171"
                className="w-full px-4 py-3 bg-gray-950/80 border border-gray-700/80 rounded-2xl text-sm font-bold tracking-wider text-amber-400 placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-gray-950/80 border border-gray-700/80 rounded-2xl text-sm font-bold tracking-wider text-amber-400 placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98"
            >
              Sign In to Admin App
            </button>
          </form>

          
        </div>
      </div>
    );
  }

  // FILTERED CATALOG
  const displayedProducts = products.filter((p) =>
    searchFilter ? p.title.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-gray-900 text-white shadow-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-gray-950 font-black shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-gray-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg font-['Plus_Jakarta_Sans'] leading-none">
                  CurateDrop Suite
                </h1>
                <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">Logged in as {adminUser.name} ({adminUser.phone})</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-800/80 p-1 rounded-2xl border border-gray-700/60">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catalog ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'add' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-gray-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'delivery' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-gray-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Deliveries & OTP</span>
            </button>
            {adminUser.phone === SUPER_ADMIN_PHONE && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'staff' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff Team</span>
              </button>
            )}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-800/50 px-3 py-2 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {/* ========================================================
            TAB 1: CATALOG
        ======================================================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search catalog by title, category, type..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-bold text-gray-500">
                  Total: <strong className="text-gray-900 font-extrabold">{displayedProducts.length}</strong> Products
                </span>
                <button
                  onClick={fetchProducts}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setActiveTab('add')}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl transition-all shadow-sm shadow-amber-500/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              </div>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 text-base">No products found</h3>
                <p className="text-xs text-gray-500 mt-1">Try clearing your search query or add a new product.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3.5 mb-3">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 bg-gray-100 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                p.productType === 'affiliate'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {p.productType === 'affiliate' ? 'Amazon Affiliate' : 'Direct COD Store'}
                            </span>
                            <span className="text-[11px] text-gray-500 font-bold truncate">
                              • {p.category} {p.subcategory && p.subcategory !== 'General' ? `› ${p.subcategory}` : ''}
                            </span>
                          </div>
                          <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug">
                            {p.title}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="font-black text-sm sm:text-base text-gray-900">
                              {p.productType === 'affiliate' ? (p.price || 'Live Amazon Deal') : p.price}
                            </span>
                            {p.mrp && <span className="text-xs text-gray-400 line-through">{p.mrp}</span>}
                            {p.discount && <span className="text-[10px] font-bold text-red-600">{p.discount}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-600 line-clamp-2 mb-3">
                        <strong className="text-gray-800">Verdict: </strong>
                        {p.curatedVerdict}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400 font-medium truncate">ID: {p.id}</span>
                      <div className="flex items-center gap-1.5">
                        {p.affiliateUrl && (
                          <a
                            href={p.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: ADD PRODUCT (WITH MULTIPLE DIRECT IMAGE UPLOAD)
        ======================================================== */}
        {activeTab === 'add' && (
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleCreateProduct} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 font-['Plus_Jakarta_Sans']">
                  Add New Product to CurateDrop
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Upload multiple product images directly from your device or scrape them from Amazon.
                </p>
              </div>

              {/* Product Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Product Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProductType('affiliate')}
                    className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      productType === 'affiliate'
                        ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>Amazon Affiliate Link ↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType('real')}
                    className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      productType === 'real'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Direct Store (Open-Box COD)</span>
                  </button>
                </div>
              </div>

              {/* Auto-Scraper Card for Amazon URLs */}
              {productType === 'affiliate' && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-300 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>Auto-Fetch Amazon Details from URL</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Paste any Amazon India product URL. We will automatically fetch Title, Photos, Price, and Ratings!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlToScrape}
                      onChange={(e) => setUrlToScrape(e.target.value)}
                      placeholder="https://www.amazon.in/dp/B0..."
                      className="flex-1 px-3.5 py-2.5 bg-white rounded-xl border border-amber-300 outline-none text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAutoScrape}
                      disabled={isScraping || !urlToScrape}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50 shrink-0"
                    >
                      {isScraping ? 'Fetching...' : 'Fetch Details'}
                    </button>
                  </div>
                </div>
              )}

              {/* DIRECT MULTIPLE IMAGE UPLOAD SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>Product Images (Upload Multiple) *</span>
                  </label>
                  <span className="text-xs font-semibold text-gray-500">
                    {uploadedImages.length} photo{uploadedImages.length !== 1 ? 's' : ''} selected
                  </span>
                </div>

                {/* Upload Action Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-gray-50/70 hover:bg-amber-50/20 transition-all group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleImageFilesSelected}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-2 text-gray-500 group-hover:text-amber-600 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 mb-0.5">
                    Click to Upload Images or Drag & Drop
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Select multiple photos from your phone gallery or take pictures with your camera (JPG, PNG, WebP)
                  </p>
                </div>

                {/* Uploaded Thumbnails Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {uploadedImages.map((imgUrl, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-100">
                        <img src={imgUrl} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-amber-500 text-gray-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                            Main Photo
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ergonomic Aluminum Laptop Stand"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Category & Subcategory Hierarchical Selection with Custom Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <FormSelectDropdown
                    label="Main Category *"
                    value={category}
                    onChange={(newCat) => {
                      setCategory(newCat);
                      const subList = categoryMap[newCat] || [];
                      setSubcategory(subList[0] || 'General');
                    }}
                    options={Object.keys(categoryMap)}
                    allowAdd={true}
                    addNewLabel="+ Add New Category"
                    icon="📱"
                    onAddNew={(newCat) => {
                      setCategoryMap((prev) => {
                        const updated = {
                          ...prev,
                          [newCat]: prev[newCat] || ['General']
                        };
                        localStorage.setItem('curatedrop_category_map', JSON.stringify(updated));
                        return updated;
                      });
                      setCategory(newCat);
                      setSubcategory('General');
                    }}
                  />

                  <FormSelectDropdown
                    label="Subcategory / Price Bracket *"
                    value={subcategory}
                    onChange={setSubcategory}
                    options={categoryMap[category] || ['General']}
                    allowAdd={true}
                    addNewLabel="+ Add New Subcategory"
                    icon="🏷️"
                    onAddNew={(newSub) => {
                      setCategoryMap((prev) => {
                        const currentSubs = prev[category] || [];
                        const updatedSubs = currentSubs.includes(newSub) ? currentSubs : [...currentSubs, newSub];
                        const updated = {
                          ...prev,
                          [category]: updatedSubs
                        };
                        localStorage.setItem('curatedrop_category_map', JSON.stringify(updated));
                        return updated;
                      });
                      setSubcategory(newSub);
                    }}
                  />
                </div>

                {/* Conditional Pricing Section: ONLY FOR DIRECT STORE / COD */}
                {productType === 'real' ? (
                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Direct Store Pricing & COD Details (Handled by CurateDrop)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price *</label>
                        <input
                          type="text"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="₹499"
                          className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm outline-none font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">MRP (Original)</label>
                        <input
                          type="text"
                          value={mrp}
                          onChange={(e) => setMrp(e.target.value)}
                          placeholder="₹999"
                          className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Discount Tag (e.g. 50% OFF)</label>
                        <input
                          type="text"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          placeholder="50% OFF"
                          className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm outline-none text-red-600 font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-300 rounded-2xl flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-amber-950">Live Amazon Pricing Active</h4>
                      <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        No manual selling price, MRP, or discount percentage required. All pricing, live deal discounts, and stock availability are automatically fetched via your Amazon Affiliate link / API.
                      </p>
                    </div>
                  </div>
                )}

                {productType === 'affiliate' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Amazon Affiliate URL *</label>
                    <input
                      type="url"
                      required={productType === 'affiliate'}
                      value={affiliateUrl}
                      onChange={(e) => setAffiliateUrl(e.target.value)}
                      placeholder="https://www.amazon.in/dp/...?tag=yourtag-21"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Curator's 1-Sentence Recommendation Verdict
                  </label>
                  <textarea
                    rows={2}
                    value={curatedVerdict}
                    onChange={(e) => setCuratedVerdict(e.target.value)}
                    placeholder="Why this item stands out compared to competitors..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Feature Bullet Points (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={specsText}
                    onChange={(e) => setSpecsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-gray-950 hover:bg-gray-800 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md active:scale-98"
              >
                {isSaving ? 'Publishing Product...' : 'Publish to CurateDrop Catalog'}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 3: DELIVERIES & OPEN-BOX OTP VERIFICATION
        ======================================================== */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-3xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-950 leading-relaxed">
                <strong>Strict Open-Box Delivery Instructions:</strong> Open the outer packaging in front of the customer.
                Allow the customer to physically inspect the product integrity. Collect COD cash and ask for the{' '}
                <strong>4-digit Customer Delivery OTP</strong>. Enter it below to mark the order delivered.
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 font-['Plus_Jakarta_Sans']">
                Active COD Orders ({orders.length})
              </h2>
              <button onClick={fetchOrders} className="text-xs text-blue-600 font-bold hover:underline">
                Refresh Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 text-base">No COD orders right now</h3>
                <p className="text-xs text-gray-500 mt-1">Orders placed on the website with Cash on Delivery will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm text-gray-900">{ord.id}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          ord.status.includes('Verified') || ord.status.includes('Delivered')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Customer:</strong> {ord.customer_name} ({ord.customer_phone})</p>
                      <p><strong>Address:</strong> {ord.address}, Pincode: {ord.pincode}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-extrabold text-blue-600 text-sm">{ord.total_amount} (COD)</span>
                      {!ord.status.includes('Verified') && !ord.status.includes('Delivered') && (
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Verify Delivery OTP
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* OTP Verification Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
                  <div>
                    <h3 className="font-black text-gray-900 text-base">Verify Delivery OTP</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Order: <strong>{selectedOrder.id}</strong> ({selectedOrder.customer_name})
                    </p>
                  </div>

                  <input
                    type="number"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-center text-2xl font-black tracking-widest outline-none focus:border-amber-500"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleVerifyOtp(selectedOrder.id)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
                    >
                      Verify & Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: STAFF MANAGEMENT (SPACIOUS 2-COL LAYOUT)
        ======================================================== */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {adminUser.phone === SUPER_ADMIN_PHONE ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <form onSubmit={handleAddStaff} className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm sm:text-base font-['Plus_Jakarta_Sans']">
                      <KeyRound className="w-5 h-5 text-amber-500" />
                      <span>Authorize New Admin Staff</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Assign a User ID (Phone) and Password to delegate catalog or delivery responsibilities to staff members.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Staff Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Assigned User ID / Phone *</label>
                      <input
                        type="tel"
                        required
                        value={newStaffPhone}
                        onChange={(e) => setNewStaffPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Password *</label>
                      <input
                        type="text"
                        required
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        placeholder="Create secure staff password"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
                    >
                      Authorize Admin Access
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 font-['Plus_Jakarta_Sans']">
                      Authorized Admin Directory ({adminsList.length})
                    </h3>
                    <button onClick={fetchAdmins} className="text-xs text-amber-600 font-bold hover:underline">
                      Refresh
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs divide-y divide-gray-100 overflow-hidden">
                    {adminsList.map((adm) => (
                      <div key={adm.phone} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">{adm.name}</h4>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                adm.role === 'super_admin'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {adm.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">User ID / Phone: <strong className="text-gray-800 font-semibold">{adm.phone}</strong></p>
                        </div>

                        {adm.phone !== SUPER_ADMIN_PHONE && (
                          <button
                            onClick={() => handleDeleteStaff(adm.phone)}
                            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
                Staff management is restricted to Super Admin (7511136171).
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-around py-3 z-40 shadow-lg">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'catalog' ? 'text-amber-600' : 'text-gray-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'add' ? 'text-amber-600' : 'text-gray-400'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'delivery' ? 'text-amber-600' : 'text-gray-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Deliveries</span>
        </button>

        {adminUser.phone === SUPER_ADMIN_PHONE && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
              activeTab === 'staff' ? 'text-amber-600' : 'text-gray-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Staff</span>
          </button>
        )}
      </nav>
    </div>
  );
}
