import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  CheckCircle2,
  Copy,
  Share2,
  X,
  Phone,
  MessageCircle,
  Plus,
  Trash2,
  Lock,
  Package,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Info,
  Check,
  AlertTriangle,
  ArrowUpDown,
  Compass,
  User,
  MapPin,
  Home,
  Briefcase,
  Layers,
  KeyRound,
  ShieldAlert,
  Clock,
  LogOut,
  AlertCircle
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8002/api' : '/api';
const SUPER_ADMIN_PHONE = '7511136171';
const WHATSAPP_NUMBER = '917511136171';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured Picks', icon: '✨', desc: 'Handpicked daily best value' },
  { id: 'price-low', label: 'Price: Low to High', icon: '💵', desc: 'Budget-friendly finds first' },
  { id: 'price-high', label: 'Price: High to Low', icon: '💎', desc: 'Premium top-tier products' },
  { id: 'rating', label: 'Highest Rated', icon: '⭐', desc: 'Top customer satisfaction (4.5+ ★)' }
];

const CATEGORY_OPTIONS = [
  { id: 'All', label: 'All Categories', icon: '🛍️', desc: 'Browse entire curated catalog' },
  { id: 'Smartphones', label: 'Smartphones', icon: '📱', desc: 'Budget & flagship phones' },
  { id: 'Electronics & Tech', label: 'Electronics & Tech', icon: '⚡', desc: 'Audio, gadgets & gear' },
  { id: 'Desk Setup', label: 'Desk Setup & Tech', icon: '💻', desc: 'Workspaces & peripherals' },
  { id: 'Outdoors & Travel', label: 'Outdoors & Travel', icon: '🏕️', desc: 'Adventure, hiking & gear' },
  { id: 'Home & Lifestyle', label: 'Home & Lifestyle', icon: '🏠', desc: 'Smart living & appliances' },
  { id: 'Pet Care', label: 'Pet Care', icon: '🐾', desc: 'Handpicked products for pets' }
];

const SUBCATEGORY_MAP = {
  'Smartphones': [
    'All Smartphones',
    'Budget & Good (Under ₹10,000)',
    'Value for Money (Under ₹20,000)',
    'Mid-Range & Flagship Killers (Under ₹40,000)',
    'Premium & Ultra Flagships',
    'Best Camera & Photography',
    'Best Battery & Performance',
    'Under 4000 Budget Steals'
  ],
  'Electronics & Tech': [
    'All Electronics',
    'Laptops & Ultrabooks',
    'Tablets & iPads',
    'Smartwatches & Fitness Bands',
    'Earbuds & Headphones',
    'Power Banks & Fast Chargers',
    'PC & Gaming Gear'
  ],
  'Desk Setup': [
    'All Desk Setup',
    'Ergonomic Laptop & Monitor Stands',
    'Desk Mats & Leather Pads',
    'Mechanical Keyboards & Mice',
    'Desk Lighting & Lamps',
    'Cable Management & Hubs'
  ],
  'Outdoors & Travel': [
    'All Outdoors',
    'Backpacks & Luggage',
    'Fishing & Marine Gear',
    'Camping & Hiking Gear',
    'Insulated Bottles & Flasks',
    'Car Accessories & Gadgets'
  ],
  'Home & Lifestyle': [
    'All Home',
    'Smart Home Devices',
    'Kitchen Appliances',
    'Air Purifiers & Fragrance',
    'Organization & Storage'
  ],
  'Pet Care': [
    'All Pet Care',
    'Dogs Gear & Care',
    'Cats Toys & Care',
    'Grooming & Health'
  ]
};

const FILTER_TYPE_OPTIONS = [
  { id: 'all', label: 'All Deals', icon: '⚡', desc: 'Warehouse COD & Amazon finds' },
  { id: 'real', label: 'Direct Warehouse (COD)', icon: '📦', desc: 'Cash on delivery with open-box' },
  { id: 'affiliate', label: 'Amazon Verified', icon: '🛒', desc: 'Verified Amazon India deals' }
];

// Modern, Responsive Phone-Friendly Dropdown (Bottom Sheet on Phones, Floating Menu on Desktop)
function PhoneDropdown({ title, buttonPrefix, options, value, onChange, icon: IconComponent }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeOption = options.find((opt) => opt.id === value) || options[0] || { id: value, label: value, icon: '⚡' };
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 ${
          isOpen
            ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
            : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-800 hover:border-gray-400'
        }`}
      >
        {IconComponent && <IconComponent className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
        <span className="text-gray-400 font-semibold hidden lg:inline">{buttonPrefix}</span>
        <span className="truncate max-w-[120px] sm:max-w-none flex items-center gap-1">
          <span>{activeOption.icon}</span>
          <span className="text-gray-900 font-bold">{activeOption.label}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          {/* Backdrop Click Dismiss for Mobile */}
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] animate-backdrop-fade"
            onClick={() => setIsOpen(false)}
          />

          {/* MOBILE PHONE BOTTOM SHEET (shown on mobile screens < 640px) */}
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 p-5 pb-8 animate-sheet-up max-h-[85vh] flex flex-col">
            {/* Sheet Handle */}
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 shrink-0" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeOption.icon}</span>
                <h3 className="font-extrabold text-sm text-gray-900 font-['Plus_Jakarta_Sans']">{title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100 active:scale-90 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Options List */}
            <div className="overflow-y-auto space-y-1.5 pr-0.5 py-1">
              {options.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-amber-50/90 border-2 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-gray-50/70 hover:bg-gray-100/80 border-2 border-transparent text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-xl shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-gray-200/60">
                        {opt.icon}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-950 font-black' : 'text-gray-900'}`}>
                          {opt.label}
                        </p>
                        {opt.desc && (
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{opt.desc}</p>
                        )}
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESKTOP FLOATING CARD - Proportional width matching trigger */}
          <div className="hidden sm:block absolute left-0 top-full mt-1.5 min-w-full sm:min-w-[190px] max-w-[240px] bg-white rounded-2xl shadow-xl border border-gray-200/90 p-1.5 z-50 animate-sheet-up">
            <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{title}</span>
              <span className="text-[10px] text-gray-400 font-bold">{options.length}</span>
            </div>

            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 font-bold border border-amber-300/80 shadow-2xs'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1.5">
                      <span className="text-sm shrink-0">{opt.icon}</span>
                      <p className={`text-xs truncate ${isSelected ? 'font-black text-amber-950' : 'font-semibold text-gray-800'}`}>
                        {opt.label}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [activeFilterType, setActiveFilterType] = useState('all'); // all, affiliate, real
  const [sortBy, setSortBy] = useState('featured');
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Customer Authentication State
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('curatedrop_customer') || 'null');
    } catch {
      return null;
    }
  });

  // User Local Storage states
  const [likedProducts, setLikedProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('curatedrop_likes') || '[]');
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('curatedrop_cart') || '[]');
    } catch {
      return [];
    }
  });

  // UI Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [accountTab, setAccountTab] = useState('orders'); // 'orders' or 'addresses'
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // SweetAlert custom toast state
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ title, message, type });
    setTimeout(() => {
      setAlertConfig(null);
    }, 4500);
  };

  // Fetch live products from backend
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setProducts(data);
      }
    } catch (e) {
      console.log('Using local products fallback', e);
    }
  };

  // Fetch Customer Profile & Orders
  const refreshCustomerProfile = async () => {
    if (!customer?.phone) return;
    try {
      const res = await fetch(`${API_BASE}/customer/profile?phone=${customer.phone}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCustomer((prev) => ({
            ...prev,
            addresses: data.customer.addresses
          }));
          setCustomerOrders(data.customer.orders || []);
          localStorage.setItem(
            'curatedrop_customer',
            JSON.stringify({ ...customer, addresses: data.customer.addresses })
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (customer?.phone) refreshCustomerProfile();
  }, [customer?.phone]);

  // Save liked items
  useEffect(() => {
    localStorage.setItem('curatedrop_likes', JSON.stringify(likedProducts));
  }, [likedProducts]);

  // Save cart
  useEffect(() => {
    localStorage.setItem('curatedrop_cart', JSON.stringify(cart));
  }, [cart]);

  // URL Hash Sync for modal
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = products.find((p) => p.slug === hash);
        if (found) {
          setActiveImgIndex(0);
          setSelectedProduct(found);
        }
      } else {
        setSelectedProduct(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [products]);

  const openProductModal = (product) => {
    window.location.hash = product.slug;
    setActiveImgIndex(0);
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    window.location.hash = '';
    setSelectedProduct(null);
  };

  const toggleLike = (productId, e) => {
    e.stopPropagation();
    setLikedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // ADD TO CART (Direct COD products)
  const addToCart = (product, e) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showAlert('Added to Cart', `${product.title} added to your cart.`, 'success');
    setIsCartOpen(true);
  };

  // INITIATE CHECKOUT (Requires Customer Login)
  const handleProceedToCheckout = () => {
    if (!customer) {
      setIsCartOpen(false);
      setAuthMode('login');
      setIsAuthModalOpen(true);
      showAlert('Sign In Required', 'Please sign in or create an account to place Cash on Delivery orders.', 'info');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const updateCartQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const num = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0;
      return total + num * item.quantity;
    }, 0);
  }, [cart]);

  // Dynamically merge default categories & subcategories with any created in admin or database
  const dynamicSubcategoryMap = useMemo(() => {
    let map = { ...SUBCATEGORY_MAP };
    try {
      const saved = localStorage.getItem('curatedrop_category_map');
      if (saved) {
        map = { ...map, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.log(e);
    }

    // Auto-discover any custom category & subcategory from active products
    products.forEach((p) => {
      if (p.category) {
        if (!map[p.category]) {
          map[p.category] = [`All ${p.category}`];
        }
        if (p.subcategory && p.subcategory !== 'General' && !map[p.category].includes(p.subcategory)) {
          map[p.category].push(p.subcategory);
        }
      }
    });

    return map;
  }, [products]);

  const dynamicCategoryOptions = useMemo(() => {
    const list = [...CATEGORY_OPTIONS];
    const existingIds = new Set(list.map((c) => c.id.toLowerCase()));

    Object.keys(dynamicSubcategoryMap).forEach((cat) => {
      if (!existingIds.has(cat.toLowerCase())) {
        list.push({
          id: cat,
          label: cat,
          icon: '🏷️',
          desc: `Curated ${cat} collection`
        });
        existingIds.add(cat.toLowerCase());
      }
    });

    return list;
  }, [dynamicSubcategoryMap]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
          p.curatedVerdict.toLowerCase().includes(query);

        let matchesCategory = true;
        if (activeCategory !== 'All') {
          matchesCategory = p.category.toLowerCase() === activeCategory.toLowerCase();
        }

        let matchesSubcategory = true;
        if (activeSubcategory && !activeSubcategory.startsWith('All')) {
          matchesSubcategory = Boolean(p.subcategory && p.subcategory.toLowerCase() === activeSubcategory.toLowerCase());
        }

        let matchesType = true;
        if (activeFilterType === 'affiliate') matchesType = p.productType === 'affiliate';
        if (activeFilterType === 'real') matchesType = p.productType === 'real';

        return matchesSearch && matchesCategory && matchesSubcategory && matchesType;
      })
      .sort((a, b) => {
        const priceA = parseInt((a.price || '').replace(/[^\d]/g, ''), 10) || 0;
        const priceB = parseInt((b.price || '').replace(/[^\d]/g, ''), 10) || 0;
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, searchQuery, activeCategory, activeSubcategory, activeFilterType, sortBy]);

  const copyProductLink = (slug) => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    showAlert('Link Copied', 'Product link copied to your clipboard!', 'success');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleLogoutCustomer = () => {
    setCustomer(null);
    localStorage.removeItem('curatedrop_customer');
    setIsAccountDrawerOpen(false);
    showAlert('Logged Out', 'You have been logged out of your account.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans">
      {/* SWEETALERT / FLOATING TOAST NOTIFICATION */}
      {alertConfig && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 flex items-start gap-3 animate-slide-left">
          {alertConfig.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
          {alertConfig.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
          {alertConfig.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-gray-900">{alertConfig.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{alertConfig.message}</p>
          </div>
          <button onClick={() => setAlertConfig(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all">
        <div className="max-w-7xl mx-auto pl-3.5 pr-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                  CurateDrop
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Verified
                  </span>
                </span>
                <p className="text-xs text-gray-500 hidden sm:block font-medium">Tested & Handpicked Deals</p>
              </div>
            </a>
          </div>

          {/* Header Action Badges */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 pr-1.5 sm:pr-0">
            {/* WhatsApp Direct Help */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                'Hi CurateDrop Support! I have a question regarding a product/order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Strict Open-Box COD Badge */}
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Open-Box COD Policy</span>
            </button>

            {/* Liked Items counter */}
            <div className="relative">
              <button
                onClick={() => {
                  if (likedProducts.length > 0) {
                    showAlert('Saved Items', `You have bookmarked ${likedProducts.length} items on this device.`, 'info');
                  } else {
                    showAlert('Favorites', 'Tap the heart on any card to save your favorite picks!', 'info');
                  }
                }}
                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Saved Items"
              >
                <Heart className={`w-5 h-5 ${likedProducts.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                {likedProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {likedProducts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all flex items-center gap-1.5"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* CUSTOMER AUTH / ACCOUNT BUTTON (Right after Cart) */}
            {customer ? (
              <button
                onClick={() => setIsAccountDrawerOpen(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold px-2.5 py-1.5 sm:px-3.5 sm:py-2 mr-1 sm:mr-0 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-950 border border-amber-400/80 shadow-xs hover:shadow active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-gray-900 shrink-0" />
                <span className="max-w-[70px] sm:max-w-[100px] truncate">{customer.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold px-2.5 py-1.5 sm:px-3.5 sm:py-2 mr-1 sm:mr-0 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-950 border border-amber-400/80 shadow-xs hover:shadow active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 shrink-0 text-gray-900" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-10 bg-gradient-to-b from-white via-amber-50/20 to-[#F9FAFB] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold mb-4 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Curated, Rigorously Tested & Verified Daily Deals
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 font-['Plus_Jakarta_Sans'] leading-tight sm:leading-none mb-3">
            Stop Guessing. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500">
              Only The Best Gear & Daily Finds
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            Every product in this catalog is hand-tested for build quality, durability, and honest pricing. Compare
            authentic Amazon deals alongside our exclusive direct warehouse products.
          </p>

          {/* Central Live Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, feature, or category..."
                className="w-full pl-12 pr-10 py-3.5 bg-white rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base placeholder-gray-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Responsive Filters & Sort Dropdowns Bar (Phone Bottom Sheet / Desktop Menu) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 text-xs">
            <PhoneDropdown
              title="Sort Products By"
              buttonPrefix="Sort:"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={setSortBy}
              icon={ArrowUpDown}
            />

            <PhoneDropdown
              title="Filter by Category"
              buttonPrefix="Category:"
              options={dynamicCategoryOptions}
              value={activeCategory}
              onChange={(newCat) => {
                setActiveCategory(newCat);
                setActiveSubcategory('All');
              }}
              icon={SlidersHorizontal}
            />

            <PhoneDropdown
              title="Deals & Store Type"
              buttonPrefix="Deals:"
              options={FILTER_TYPE_OPTIONS}
              value={activeFilterType}
              onChange={setActiveFilterType}
              icon={Package}
            />
          </div>

          {/* Subcategories Horizontal Pill Bar (Active when Category is Selected) */}
          {activeCategory !== 'All' && dynamicSubcategoryMap[activeCategory] && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 max-w-4xl mx-auto px-2 mt-3 justify-center flex-wrap">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider mr-1">
                {activeCategory} Collections:
              </span>
              {dynamicSubcategoryMap[activeCategory].map((sub) => {
                const isSelected = activeSubcategory === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveSubcategory(sub)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-gray-950 shadow-xs'
                        : 'bg-white hover:bg-amber-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. PRODUCT GRID (WITH CSS CUTOUT BLEND TRICK) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-gray-600">
            Showing <span className="text-gray-900 font-bold">{filteredProducts.length}</span> curated items
          </p>
          {(searchQuery || activeCategory !== 'All' || activeSubcategory !== 'All' || activeFilterType !== 'all' || sortBy !== 'featured') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setActiveSubcategory('All');
                setActiveFilterType('all');
                setSortBy('featured');
              }}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
            <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No products match your criteria</h3>
            <p className="text-sm text-gray-500 mb-4">Try clearing your filters or search terms.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setActiveFilterType('all');
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isLiked = likedProducts.includes(product.id);
              const isAffiliate = product.productType === 'affiliate';

              return (
                <div
                  key={product.id}
                  onClick={() => openProductModal(product)}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Product Image with CSS Cutout Blend Effect */}
                  <div className="relative aspect-square w-full bg-gradient-to-b from-gray-50 to-gray-100/60 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500"
                      style={{
                        mixBlendMode: 'multiply',
                        filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.09))'
                      }}
                    />

                    {/* Discount Badge */}
                    {product.discount && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                        {product.discount}
                      </span>
                    )}

                    {/* Product Type Indicator */}
                    <span
                      className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        isAffiliate ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isAffiliate ? 'Amazon Deal ↗' : 'Direct Store (COD)'}
                    </span>

                    {/* Bookmark / Like Button */}
                    <button
                      onClick={(e) => toggleLike(product.id, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:scale-110 transition-transform"
                      title={isLiked ? 'Remove from Saved' : 'Save for later'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isLiked ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] truncate max-w-[200px]">
                          {product.category} {product.subcategory && product.subcategory !== 'General' ? `• ${product.subcategory}` : ''}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-gray-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{product.rating}</span>
                          <span className="text-gray-400 font-normal">({product.reviewsCount})</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-amber-600 transition-colors">
                        {product.title}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-extrabold text-gray-900">
                          {product.productType === 'affiliate' && (!product.price || product.price === 'Live on Amazon') ? (
                            <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              Live Deal ↗
                            </span>
                          ) : (
                            product.price
                          )}
                        </span>
                        {product.mrp && (
                          <span className="text-xs text-gray-400 line-through font-medium">{product.mrp}</span>
                        )}
                        {product.discount && (
                          <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            {product.discount}
                          </span>
                        )}
                      </div>

                      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-950 leading-relaxed mb-4">
                        <div className="flex items-center gap-1 font-bold text-[11px] text-amber-800 uppercase tracking-wider mb-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Curator's Verdict
                        </div>
                        <p className="line-clamp-2">{product.curatedVerdict}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openProductModal(product);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
                      >
                        Inspect
                      </button>

                      {isAffiliate ? (
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-[1.5] py-2 px-3 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <span>Buy Amazon</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          onClick={(e) => {
                            addToCart(product, e);
                          }}
                          className="flex-[1.5] py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buy COD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. PRODUCT INSPECT MODAL (WITH CSS CUTOUT GALLERY & SEPARATE POLICY CALLOUTS) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
          <div
            className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedProduct.productType === 'affiliate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedProduct.productType === 'affiliate' ? 'Amazon Verified Pick' : 'CurateDrop Direct Dispatch'}
                </span>
                <span className="text-xs text-gray-400 font-medium">• {selectedProduct.category}</span>
              </div>
              <button
                onClick={closeProductModal}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Visual with Interactive Gallery & CSS Cutout */}
                <div className="space-y-3">
                  <div className="aspect-square rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100/70 overflow-hidden border border-gray-200 flex items-center justify-center p-4">
                    <img
                      src={
                        selectedProduct.images && selectedProduct.images.length > 0
                          ? selectedProduct.images[activeImgIndex] || selectedProduct.images[0]
                          : selectedProduct.image
                      }
                      alt={selectedProduct.title}
                      className="max-h-full max-w-full object-contain transition-all duration-300"
                      style={{
                        mixBlendMode: 'multiply',
                        filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.1))'
                      }}
                    />
                  </div>

                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedProduct.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImgIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-gray-50 p-1 flex items-center justify-center ${
                            activeImgIndex === idx ? 'border-amber-500 scale-105 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                            style={{ mixBlendMode: 'multiply' }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2 font-['Plus_Jakarta_Sans']">
                      {selectedProduct.title}
                    </h2>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-bold text-amber-800">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{selectedProduct.rating} / 5</span>
                      </div>
                      <span className="text-xs text-gray-500">({selectedProduct.reviewsCount} customer reviews)</span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-2xl font-black text-gray-900">{selectedProduct.price}</span>
                      {selectedProduct.mrp && (
                        <span className="text-sm text-gray-400 line-through font-medium">
                          MRP: {selectedProduct.mrp}
                        </span>
                      )}
                      {selectedProduct.discount && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                          {selectedProduct.discount}
                        </span>
                      )}
                    </div>
                    {selectedProduct.productType === 'affiliate' && (
                      <p className="text-[11px] text-gray-500 mb-4 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                        <span>Verified Amazon Price • Final price & stock confirmed on Amazon.in</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => copyProductLink(selectedProduct.slug)}
                      className="flex-1 py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hi CurateDrop! I'm interested in: ${selectedProduct.title} (${window.location.origin}/#${selectedProduct.slug})`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      <span>Ask WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Curator's Detailed Verdict */}
              <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Why This Made Our Curated List
                </h4>
                <p className="text-sm text-amber-950 leading-relaxed font-medium">
                  {selectedProduct.curatedVerdict}
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Key Specifications & Features</h4>
                <ul className="space-y-2">
                  {selectedProduct.specs &&
                    selectedProduct.specs.map((spec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Policy Callout */}
              {selectedProduct.productType === 'real' ? (
                <div className="bg-blue-50 border border-blue-300 rounded-2xl p-4 text-xs text-blue-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>CurateDrop Direct Dispatch: Strict Open-Box Delivery</span>
                  </div>
                  <p className="leading-relaxed">
                    This is our direct inventory product. The delivery partner will open the box in front of you. 
                    <strong> Inspect physical condition before sharing OTP.</strong> Absolutely <strong>no returns or refunds</strong> 
                    are accepted post-delivery once OTP is given unless visible transit damage was proven at the open box moment.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ExternalLink className="w-4 h-4 text-amber-600" />
                    <span>Amazon Official Guarantee & Policy</span>
                  </div>
                  <p className="leading-relaxed">
                    This is an Amazon curated selection. <strong>Open-Box restrictions DO NOT apply here.</strong> 
                    You receive full Amazon customer benefits including <strong>Amazon 7-Day Hassle-Free Replacement / Return</strong>, 
                    Prime Delivery, and manufacturer warranty directly managed on Amazon.in.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
              {selectedProduct.productType === 'affiliate' ? (
                <a
                  href={selectedProduct.affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Buy on Amazon at Best Price ↗</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    closeProductModal();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart & Order Cash on Delivery</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. CART DRAWER (With Login Gatekeeper for COD Checkout) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-800" />
                <h3 className="font-bold text-base text-gray-900">Your Cart ({cart.length})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-600">Your cart is empty.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add our direct warehouse products to buy with Cash On Delivery.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                      <p className="text-xs font-extrabold text-blue-600 mt-1">{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-lg font-black text-gray-900">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                  <span>Open-Box Delivery</span>
                  <span className="font-bold">Free Cash on Delivery</span>
                </div>

                {!customer && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Customer sign-in required to book Cash on Delivery.</span>
                  </div>
                )}

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{customer ? 'Proceed to COD Checkout' : 'Sign In to Order COD'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. CUSTOMER AUTHENTICATION MODAL (LOGIN & SIGNUP WITH ADDRESS & CAPTCHA) */}
      {isAuthModalOpen && (
        <CustomerAuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(customerData) => {
            setCustomer(customerData);
            localStorage.setItem('curatedrop_customer', JSON.stringify(customerData));
            setIsAuthModalOpen(false);
            showAlert('Welcome to CurateDrop!', `Logged in successfully as ${customerData.name}`, 'success');
            // If they had items in cart, proceed to checkout directly
            if (cart.length > 0) {
              setIsCheckoutOpen(true);
            }
          }}
          showAlert={showAlert}
        />
      )}

      {/* 8. ACCOUNT MANAGEMENT DRAWER (AMAZON/FLIPKART STYLE) */}
      {isAccountDrawerOpen && (
        <CustomerAccountDrawer
          customer={customer}
          orders={customerOrders}
          activeTab={accountTab}
          setActiveTab={setAccountTab}
          onClose={() => setIsAccountDrawerOpen(false)}
          onLogout={handleLogoutCustomer}
          onRefresh={refreshCustomerProfile}
          showAlert={showAlert}
        />
      )}

      {/* 9. CHECKOUT MODAL WITH SAVED MULTI-ADDRESS SELECTOR */}
      {isCheckoutOpen && customer && (
        <CheckoutModal
          cart={cart}
          cartTotal={cartTotal}
          customer={customer}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setCart([]);
            setIsCheckoutOpen(false);
            refreshCustomerProfile();
          }}
          showAlert={showAlert}
        />
      )}

      {/* 10. STRICT COD RETURN POLICY MODAL */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsPolicyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Open-Box Delivery & Return Policy</h3>
            </div>
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-semibold">
                ℹ️ IMPORTANT NOTICE: The Strict Open-Box Delivery & No-Return Policy applies <strong>ONLY</strong> to products sold and dispatched directly by CurateDrop Admins. It does <strong>NOT</strong> apply to Amazon Affiliate products.
              </div>

              <div className="space-y-2 border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-blue-700">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  1. Direct Store Products (Sold by CurateDrop)
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Open-Box Inspection with OTP:</strong> Our delivery executive opens the package in front of you. You inspect the product physically before sharing the 4-digit OTP or making COD payment.
                  </li>
                  <li>
                    <strong>Strict No-Return Post OTP:</strong> Once you verify and share the OTP, the delivery is permanently finalized. Absolutely NO return requests will be accepted thereafter.
                  </li>
                  <li>
                    <strong>Transit Damage Exception:</strong> If the product is physically broken or wrong inside the box, reject the shipment right at the spot with the delivery agent and capture photo proof.
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-amber-700">
                  <ExternalLink className="w-4 h-4 text-amber-600" />
                  2. Amazon Affiliate Products (Curated Links)
                </h4>
                <p>
                  For all items tagged with <strong>Amazon Deal ↗</strong>, your purchase is completed on Amazon.
                  <strong> The open-box restriction does NOT apply to these.</strong> You enjoy standard Amazon customer protections:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Standard Amazon 7-day or 10-day replacement/refund guarantee.</li>
                  <li>Official brand manufacturer warranty.</li>
                  <li>Customer service handled directly by Amazon support.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setIsPolicyModalOpen(false)}
              className="w-full mt-5 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* 11. FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hello! I need help choosing a curated product on CurateDrop.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:scale-105 transition-transform group"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold">
          Chat (+91 7511136171)
        </span>
      </a>

      {/* 12. FOOTER WITH MANDATORY AFFILIATE DISCLAIMER */}
      <footer className="bg-white border-t border-gray-200 mt-16 text-gray-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-gray-900 font-['Plus_Jakarta_Sans']">CurateDrop</span>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-sm mb-4">
                We independently test, review, and curate everyday gear, tech accessories, and lifestyle essentials so
                you never buy low-grade junk online.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                <button onClick={() => setIsPolicyModalOpen(true)} className="hover:text-blue-600 underline">
                  Open-Box Policy
                </button>
                <span>•</span>
                <a href={`tel:${SUPER_ADMIN_PHONE}`} className="hover:text-blue-600">
                  Phone: +91 {SUPER_ADMIN_PHONE}
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Curation Standards</h4>
              <ul className="space-y-2">
                <li>• Real hands-on durability test</li>
                <li>• Zero paid fake reviews</li>
                <li>• Best historical price tracking</li>
                <li>• Genuine manufacturer warranty</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Direct Customer Care</h4>
              <p className="mb-1">Customer Helpline & WhatsApp:</p>
              <p className="font-bold text-gray-800 text-sm mb-2">+91 {SUPER_ADMIN_PHONE}</p>
              <p className="text-[11px] text-gray-400">Hours: 9:00 AM – 9:00 PM IST</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 text-center space-y-2">
            <p className="font-semibold text-gray-700 text-xs">
              <strong>Amazon Associates Program:</strong> "As an Amazon Associate I earn from qualifying purchases."
            </p>
            <p className="text-[11px] text-gray-500 max-w-3xl mx-auto leading-relaxed">
              CERTAIN CONTENT THAT APPEARS ON THIS SITE COMES FROM AMAZON. THIS CONTENT IS PROVIDED 'AS IS' AND IS SUBJECT TO CHANGE OR REMOVAL AT ANY TIME. Product prices and availability are accurate as of the date/time fetched and are subject to change. Any price and availability information displayed on Amazon.in at the time of purchase will apply.
            </p>
            <p className="text-[11px] text-gray-400 pt-2">
              © {new Date().getFullYear()} CurateDrop. All customer data encrypted & stored confidentially.
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING SECURE ALERT / NOTIFICATION TOAST */}
      {alertConfig && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full px-4 animate-bounce-in">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all ${
            alertConfig.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-100 shadow-rose-950/50'
              : alertConfig.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500/40 text-amber-100 shadow-amber-950/50'
              : 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              alertConfig.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : alertConfig.type === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {alertConfig.type === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : alertConfig.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-90">
                {alertConfig.title}
              </h4>
              <p className="text-xs font-medium leading-relaxed opacity-95">
                {alertConfig.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAlertConfig(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// CUSTOMER AUTHENTICATION MODAL (LOGIN & SIGNUP WITH ADDRESS & CAPTCHA)
// ========================================================
function CustomerAuthModal({ mode, setMode, onClose, onSuccess, showAlert }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('Home');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security CAPTCHA Challenge: Simple math verification
  const [num1] = useState(Math.floor(Math.random() * 8) + 2);
  const [num2] = useState(Math.floor(Math.random() * 5) + 1);
  const [userMathAnswer, setUserMathAnswer] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        showAlert('Security Pause', data.message || 'Too many login attempts. Please wait 1 minute before trying again.', 'warning');
        return;
      }
      if (data.success) {
        onSuccess(data.customer);
      } else {
        showAlert('Sign In Failed', data.message || 'Invalid mobile number or password.', 'error');
      }
    } catch {
      showAlert('Connection Interrupted', 'Unable to reach CurateDrop servers. Please check your internet connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(userMathAnswer, 10) !== num1 + num2 && !captchaPassed) {
      showAlert('Security Check Failed', `Please calculate ${num1} + ${num2} to prove you are human.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/customer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password,
          name,
          address,
          addressLabel,
          pincode,
          city,
          state,
          landmark
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        showAlert('Rate Limit Active', data.message || 'Too many registration requests. Please wait a moment.', 'warning');
        return;
      }
      if (data.success) {
        onSuccess(data.customer);
      } else {
        showAlert('Registration Issue', data.message || 'Could not complete registration. Please check the form.', 'error');
      }
    } catch {
      showAlert('Connection Interrupted', 'Unable to reach CurateDrop servers. Please check your internet connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-700 mb-2">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 font-['Plus_Jakarta_Sans']">
            {mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login'
              ? 'Access your saved addresses & Cash on Delivery orders.'
              : 'Sign up once to save your delivery addresses for 1-click COD orders.'}
          </p>
        </div>

        {mode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 sm:py-3.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-950 font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 text-xs sm:text-sm"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="pt-3 text-center border-t border-gray-100 text-xs">
              <span className="text-gray-500">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-amber-600 hover:underline"
              >
                Create an Account
              </button>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM WITH ADDRESSES */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikramaditya"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 digits"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Create Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Initial Delivery Address */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Primary Delivery Address
                </span>
                <div className="flex gap-1 text-[10px] font-bold">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressLabel(lbl)}
                      className={`px-2 py-0.5 rounded-md ${
                        addressLabel === lbl ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Street, Area"
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl outline-none text-xs"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode *"
                  className="px-2 py-1.5 bg-white border border-gray-300 rounded-xl outline-none text-xs"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="px-2 py-1.5 bg-white border border-gray-300 rounded-xl outline-none text-xs"
                />
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Landmark"
                  className="px-2 py-1.5 bg-white border border-gray-300 rounded-xl outline-none text-xs"
                />
              </div>
            </div>

            {/* Anti-Robot Security Verification */}
            <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Security Check: {num1} + {num2} = ?</span>
              </div>
              <input
                type="number"
                required
                value={userMathAnswer}
                onChange={(e) => setUserMathAnswer(e.target.value)}
                placeholder="Answer"
                className="w-20 px-2 py-1 bg-white border border-amber-400 rounded-lg text-center font-bold outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 sm:py-3.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-950 font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 text-xs sm:text-sm"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Sign Up'}
            </button>

            <div className="pt-2 text-center border-t border-gray-100 text-xs">
              <span className="text-gray-500">Already have an account? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-amber-600 hover:underline"
              >
                Sign In Instead
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ========================================================
// CUSTOMER ACCOUNT MANAGEMENT DRAWER (AMAZON / FLIPKART STYLE)
// ========================================================
function CustomerAccountDrawer({ customer, orders, activeTab, setActiveTab, onClose, onLogout, onRefresh, showAlert }) {
  const [newLabel, setNewLabel] = useState('Home');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/customer/address/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          label: newLabel,
          fullAddress: newFullAddress,
          pincode: newPincode,
          city: newCity,
          landmark: newLandmark
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Address Added', 'New delivery address has been saved.', 'success');
        setNewFullAddress('');
        setNewPincode('');
        setIsAddingAddress(false);
        onRefresh();
      }
    } catch {
      showAlert('Error', 'Could not save address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/customer/address/${id}/delete?phone=${customer.phone}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Address Removed', 'Delivery address removed.', 'info');
        onRefresh();
      }
    } catch {
      showAlert('Error', 'Could not delete address.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-gray-950 font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base font-['Plus_Jakarta_Sans']">{customer.name}</h3>
              <p className="text-xs text-gray-400">+91 {customer.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'orders' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-gray-500'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'addresses' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-gray-500'
            }`}
          >
            Saved Addresses ({customer.addresses?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="font-semibold text-gray-600">No orders placed yet.</p>
                  <p className="text-[11px] mt-0.5">Your Cash on Delivery orders will appear here with your delivery OTP.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-900">{ord.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          ord.status.includes('Verified') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    {/* Delivery OTP Callout */}
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">Open-Box Delivery OTP</span>
                        <span className="text-xs text-amber-900 font-semibold">Share only after inspecting parcel</span>
                      </div>
                      <span className="text-lg font-black tracking-widest text-amber-950 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
                        {ord.cod_otp}
                      </span>
                    </div>

                    <div className="text-gray-600 space-y-0.5 pt-1">
                      <p><strong>Deliver to:</strong> {ord.address_label} ({ord.pincode})</p>
                      <p><strong>Total Payable on Delivery:</strong> <span className="font-bold text-gray-900">{ord.total_amount}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700">Delivery Addresses</span>
                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              </div>

              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setNewLabel(lbl)}
                        className={`flex-1 py-1 rounded-lg font-bold text-[11px] ${
                          newLabel === lbl ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    rows={2}
                    value={newFullAddress}
                    onChange={(e) => setNewFullAddress(e.target.value)}
                    placeholder="House/Flat No., Road, Area"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="6-digit Pincode"
                      className="px-2 py-1.5 bg-white border border-gray-300 rounded-xl outline-none"
                    />
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      className="px-2 py-1.5 bg-white border border-gray-300 rounded-xl outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {customer.addresses?.map((addr) => (
                <div key={addr.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 relative">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1">
                    {addr.label === 'Home' && <Home className="w-3.5 h-3.5 text-blue-600" />}
                    {addr.label === 'Work' && <Briefcase className="w-3.5 h-3.5 text-amber-600" />}
                    {addr.label === 'Other' && <MapPin className="w-3.5 h-3.5 text-gray-600" />}
                    <span>{addr.label}</span>
                  </div>
                  <p className="text-gray-600 leading-snug">{addr.full_address}</p>
                  <p className="text-gray-500 mt-1">Pincode: {addr.pincode} • {addr.city}</p>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Bottom Logout */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// CHECKOUT MODAL WITH SAVED MULTI-ADDRESS SELECTOR
// ========================================================
function CheckoutModal({ cart, cartTotal, customer, onClose, onSuccess, showAlert }) {
  const [selectedAddressId, setSelectedAddressId] = useState(
    customer.addresses?.[0]?.id || 'custom'
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const selectedAddrObj = customer.addresses?.find((a) => a.id === selectedAddressId) || customer.addresses?.[0];

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      showAlert('Accept Terms', 'Please check and accept the Open-Box Delivery policy.', 'error');
      return;
    }

    if (!selectedAddrObj) {
      showAlert('Address Required', 'Please add or select a delivery address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: customer.phone,
          customerName: customer.name,
          address: selectedAddrObj.full_address,
          addressLabel: selectedAddrObj.label,
          pincode: selectedAddrObj.pincode,
          items: cart,
          totalAmount: `₹${cartTotal}`,
          paymentMode: 'Cash on Delivery (COD)',
          termsAccepted: true
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        showAlert('Order Limit Exceeded', data.message || 'You have placed multiple orders recently. For security, please wait a minute before submitting again.', 'warning');
        return;
      }
      if (data.success) {
        setOrderComplete(data);
      } else {
        showAlert('Unable to Confirm Order', data.message || 'Please review your delivery details and try again.', 'error');
      }
    } catch {
      showAlert('Connection Issue', 'Could not communicate with the CurateDrop order service. Please check your internet connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center animate-scale-up">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1">Order Confirmed!</h3>
          <p className="text-xs text-gray-500 mb-4">Order ID: {orderComplete.orderId}</p>

          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 mb-4">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
              Your Open-Box Delivery OTP
            </span>
            <span className="text-3xl font-black tracking-widest text-amber-900">{orderComplete.codOtp}</span>
            <p className="text-[11px] text-amber-700 mt-2 leading-relaxed">
              Inspect your item in front of the delivery partner. Give this OTP <strong>only after</strong> you verify the
              contents!
            </p>
          </div>

          <button
            onClick={onSuccess}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800"
          >
            Done & View in My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Cash on Delivery Checkout</h3>
            <p className="text-xs text-gray-500">Ordering as {customer.name} (+91 {customer.phone})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
          {/* Select Saved Address */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">Select Delivery Destination</label>
            <div className="space-y-2">
              {customer.addresses?.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="selected_addr"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900">{addr.label}</span>
                    <p className="text-gray-600 mt-0.5 leading-snug">{addr.full_address}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">Pincode: {addr.pincode} • {addr.city}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex justify-between items-center font-bold">
            <span>Payable in Cash on Delivery:</span>
            <span className="text-base text-blue-600">₹{cartTotal.toLocaleString()}</span>
          </div>

          {/* Strict Open-Box Agreement */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-gray-800 leading-snug font-medium cursor-pointer">
                <strong>I agree to the Strict Open-Box Delivery Policy:</strong> I will inspect the product when the
                delivery partner opens the box before sharing OTP. I understand <strong>NO returns or refunds</strong>{' '}
                are permitted once OTP is shared unless physical damage was proven at the time of delivery.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming Order...' : 'Confirm Cash on Delivery Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
