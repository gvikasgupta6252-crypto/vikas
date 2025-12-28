
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Phone, 
  MessageCircle, 
  Truck, 
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  Plus,
  Trash2,
  Edit,
  ArrowUpDown,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Settings,
  MapPin,
  Tag,
  Check,
  Star,
  Lock,
  Smartphone
} from 'lucide-react';
import { INITIAL_PRODUCTS, CATEGORIES, WHATSAPP_NUMBER, STORE_PHONE, DELIVERY_FEE, MIN_FREE_DELIVERY, STORE_ADDRESS, VALID_COUPONS } from './constants';
import { Category, Product, CartItem, Order, OrderStatus } from './types';
import { getSmartProductRecommendations } from './services/gemini';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'Home' | 'Admin' | 'Cart' | 'Checkout' | 'Orders'>('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'discount' | 'none'>('none');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const WELCOME_MESSAGE = "नमस्ते 😊 Rakesh Kirana Store में आपका स्वागत है। मैं अभी ऑनलाइन हूँ, आप अपना ऑर्डर बता सकते हैं।";
  
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        aiSuggestions.includes(p.id)
      );
    }
    
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') result.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
    
    return result;
  }, [products, selectedCategory, searchQuery, sortBy, aiSuggestions]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 3) {
        const suggestions = await getSmartProductRecommendations(searchQuery, products);
        setAiSuggestions(suggestions);
      } else {
        setAiSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setActiveTab('Checkout');
      setIsCartOpen(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const deliveryCharge = (subtotal - discountAmount) >= MIN_FREE_DELIVERY || (subtotal - discountAmount) === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal - discountAmount + deliveryCharge;

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (VALID_COUPONS[cleanCode]) {
      setAppliedCoupon({ code: cleanCode, discount: VALID_COUPONS[cleanCode] });
      return true;
    }
    return false;
  };

  const placeOrder = (customerData: any) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      ...customerData,
      items: cart,
      totalAmount: total,
      status: OrderStatus.Pending,
      createdAt: Date.now()
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setAppliedCoupon(null);
    setActiveTab('Orders');
    
    const message = `*Order Confirmation*\n${WELCOME_MESSAGE}\n\n*Order ID: ${newOrder.id}*\nCustomer: ${newOrder.customerName}\nMobile: ${newOrder.mobile}\nTotal: ₹${total.toFixed(0)}\n\n*Items:*\n${newOrder.items.map(i => `- ${i.name} x ${i.quantity}`).join('\n')}\n\n*Address:* ${newOrder.address}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('Home'); setIsAdmin(false); }}>
            {storeLogo ? (
              <img src={storeLogo} className="w-10 h-10 rounded-lg object-cover" alt="Store Logo" />
            ) : (
              <div className="bg-green-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            )}
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent hidden sm:block">
              Rakesh Kirana Store
            </span>
          </div>

          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600" />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-green-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700">
                <UserIcon className="w-4 h-4" />
                <span>{userPhone}</span>
                <button onClick={() => { setIsLoggedIn(false); setUserPhone(''); }} title="Logout">
                  <LogOut className="w-4 h-4 ml-1 cursor-pointer hover:text-red-500" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <UserIcon className="w-4 h-4" />
                Login
              </button>
            )}
            
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {isAdmin ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isAdmin ? 'Admin View' : 'Admin Login'}
            </button>
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const LoginModal = () => {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const handleSendOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if (phone.length === 10) {
        setStep(2);
      } else {
        alert("Please enter a valid 10-digit mobile number");
      }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if (otp === '1234') {
        setIsLoggedIn(true);
        setUserPhone(phone);
        setShowLoginModal(false);
        if (cart.length > 0) setActiveTab('Checkout');
      } else {
        alert("Invalid OTP! Use 1234 for testing.");
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
        <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Login to Order</h2>
            <p className="text-gray-500 text-sm">Please enter your mobile number to receive a one-time password (OTP).</p>
            
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4 pt-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+91</span>
                    <input 
                      required
                      type="tel" 
                      maxLength={10}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold"
                      placeholder="8208XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Enter OTP (sent to {phone})</label>
                  <input 
                    required
                    type="text" 
                    maxLength={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-center text-2xl font-bold tracking-widest"
                    placeholder="0000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-center italic">Use 1234 to login</p>
                </div>
                <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
                  Verify & Login
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-bold text-green-600 hover:underline">Resend OTP / Change Number</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  const MobileSearch = () => (
    <div className="md:hidden px-4 py-3 bg-white border-b border-gray-100">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );

  const ProductGrid = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'All' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-600'}`}
        >
          All Items
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat as Category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center my-6">
        <h2 className="text-xl font-bold text-gray-800">
          {selectedCategory === 'All' ? 'Popular Products' : selectedCategory}
          <span className="text-sm font-normal text-gray-500 ml-2">({filteredProducts.length} items)</span>
        </h2>
        <div className="flex items-center gap-3">
           <select 
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-green-500"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
          >
            <option value="none">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Biggest Savings</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map(product => {
          const inCart = cart.find(i => i.id === product.id);
          const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
          
          return (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-lg transition-all flex flex-col group">
              <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                    {discount}% OFF
                  </span>
                )}
                <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] text-gray-600 px-2 py-1 rounded font-medium border border-gray-100">
                  {product.weight}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.brand}</p>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] leading-tight mb-1">{product.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                  )}
                </div>
              </div>
              
              {inCart ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-1">
                  <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-green-100 rounded text-green-700"><Trash2 className="w-4 h-4" /></button>
                  <span className="text-sm font-bold text-green-700">{inCart.quantity}</span>
                  <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-green-100 rounded text-green-700"><Plus className="w-4 h-4" /></button>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const CartSidebar = () => (
    <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold">Your Cart ({cart.length})</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-green-600 font-bold hover:underline">Start Shopping</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 border border-gray-100 rounded-xl">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{item.weight}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-gray-50"><Trash2 className="w-3 h-3 text-red-500" /></button>
                      <span className="px-3 text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-gray-50"><Plus className="w-3 h-3 text-green-600" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-gray-50 rounded-t-3xl shadow-lg">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Subtotal</span>
              <span className="text-green-700">₹{subtotal}</span>
            </div>
            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
              {!isLoggedIn ? <Lock className="w-4 h-4" /> : null}
              {isLoggedIn ? 'Checkout' : 'Login to Checkout'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const CheckoutForm = () => {
    const [formData, setFormData] = useState({
      customerName: '',
      mobile: userPhone || '',
      address: '',
      timeSlot: 'Morning (8AM - 12PM)',
      paymentMethod: 'COD' as 'COD' | 'UPI'
    });
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState(false);

    const handleApply = () => {
      if (handleApplyCoupon(couponInput)) {
        setCouponError(false);
      } else {
        setCouponError(true);
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8">Delivery Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                <input required className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.mobile} readOnly placeholder="10 digit mobile number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea required className="w-full p-3 bg-gray-50 border rounded-xl h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Enter your full address" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-green-700"><Tag className="w-5 h-5" /> Apply Coupon</h3>
              <div className="flex gap-2">
                <input 
                  className={`flex-1 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-1 focus:ring-green-500 ${couponError ? 'border-red-500' : 'border-gray-200'}`} 
                  placeholder="Enter Code (e.g. RAKESH15)" 
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                />
                <button 
                  onClick={handleApply}
                  className="px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-green-600 text-sm mt-3 flex items-center gap-1 font-medium bg-green-50 p-2 rounded-lg border border-green-100">
                  <Check className="w-4 h-4" /> Code <b>{appliedCoupon.code}</b> applied! ({appliedCoupon.discount}% OFF)
                </p>
              )}
              {couponError && <p className="text-red-500 text-xs mt-2 font-medium">Invalid or expired coupon code!</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm border-b pb-4 mb-4">
                <div className="flex justify-between text-gray-500">
                  <span>Cart Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Charge</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-bold" : ""}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-3xl font-bold mb-6 text-green-800">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <button 
                onClick={() => placeOrder(formData)}
                disabled={!formData.customerName || !formData.mobile || !formData.address || cart.length === 0}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl disabled:opacity-50 shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Order on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboard = () => {
    const [view, setView] = useState<'stats' | 'products' | 'orders' | 'settings'>('stats');
    const [isEditing, setIsEditing] = useState<Product | null>(null);

    const handleUpdateProduct = (p: Product) => {
      setProducts(prev => {
        const exists = prev.find(item => item.id === p.id);
        if (exists) return prev.map(item => item.id === p.id ? p : item);
        return [...prev, p];
      });
      setIsEditing(null);
    };

    const handleUpdateOrderStatus = (id: string, s: OrderStatus) => {
      setOrders(prev => prev.map(o => o.id === id ? {...o, status: s} : o));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setStoreLogo(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-2">
          <button onClick={() => setView('stats')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'stats' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'hover:bg-gray-100'}`}><BarChart className="w-5 h-5" /> Analytics</button>
          <button onClick={() => setView('products')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'products' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'hover:bg-gray-100'}`}><ShoppingCart className="w-5 h-5" /> Manage Products</button>
          <button onClick={() => setView('orders')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'orders' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'hover:bg-gray-100'}`}><Truck className="w-5 h-5" /> Orders</button>
          <button onClick={() => setView('settings')} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${view === 'settings' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'hover:bg-gray-100'}`}><Settings className="w-5 h-5" /> Store Settings</button>
          <div className="pt-8"><button onClick={() => setIsAdmin(false)} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-50"><LogOut className="w-5 h-5" /> Exit Admin View</button></div>
        </div>

        <div className="flex-1">
          {view === 'settings' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-green-600" /> Store Profile</h3>
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-56 space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Store Logo</p>
                  <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                    {storeLogo ? (
                      <img src={storeLogo} className="w-full h-full object-cover" alt="Store Logo" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <span className="text-[10px] text-gray-400 font-bold">Upload Logo</span>
                      </div>
                    )}
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 text-white flex flex-col items-center justify-center gap-2 transition-all backdrop-blur-sm"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase">Change Logo</span>
                    </button>
                  </div>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Store Name</label>
                    <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700" defaultValue="Rakesh Kirana Store" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address</label>
                    <textarea className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-24 text-sm text-gray-600" defaultValue={STORE_ADDRESS} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {view === 'products' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
                <h3 className="text-xl font-bold">Inventory List</h3>
                <button 
                  onClick={() => setIsEditing({ id: Date.now().toString(), name: '', brand: '', category: Category.Grocery, mrp: 0, price: 0, image: 'https://picsum.photos/400/400', stock: 10, weight: '1kg', description: '' })}
                  className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr><th className="px-6 py-4">Item</th><th className="px-6 py-4">Brand</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Price/MRP</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                            <p className="text-sm font-bold text-gray-800">{p.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{p.brand}</td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">{p.category}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-green-700">₹{p.price}</p>
                          <p className="text-[10px] text-gray-400 line-through">₹{p.mrp}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${p.stock < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                              {p.stock} units
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setIsEditing(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-green-600">₹{orders.reduce((a,b)=>a+b.totalAmount,0).toFixed(0)}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
              </div>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(null)} />
            <div className="relative bg-white w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Product Details Editor</h2>
              <div className="space-y-6">
                <div className="flex gap-6 items-center p-4 bg-gray-50 rounded-2xl border">
                  <div className="w-24 h-24 bg-white rounded-xl border overflow-hidden relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <img src={isEditing.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload className="text-white w-5 h-5" /></div>
                  </div>
                  <div className="flex-1 space-y-2">
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                       const f = e.target.files?.[0];
                       if(f){
                         const r = new FileReader();
                         r.onloadend = () => setIsEditing({...isEditing, image: r.result as string});
                         r.readAsDataURL(f);
                       }
                     }} />
                     <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-green-600 hover:underline">Change Image</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Name</label>
                      <input className="w-full p-3 bg-gray-50 border rounded-xl font-bold" value={isEditing.name} onChange={e=>setIsEditing({...isEditing, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Brand</label>
                      <input className="w-full p-3 bg-gray-50 border rounded-xl" value={isEditing.brand} onChange={e=>setIsEditing({...isEditing, brand: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Category</label>
                      <select className="w-full p-3 bg-gray-50 border rounded-xl text-sm" value={isEditing.category} onChange={(e:any)=>setIsEditing({...isEditing, category: e.target.value})}>
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">MRP (₹)</label>
                      <input type="number" className="w-full p-3 bg-gray-50 border rounded-xl" value={isEditing.mrp} onChange={e=>setIsEditing({...isEditing, mrp: Number(e.target.value)})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Price (₹)</label>
                      <input type="number" className="w-full p-3 bg-gray-50 border rounded-xl font-bold text-green-700" value={isEditing.price} onChange={e=>setIsEditing({...isEditing, price: Number(e.target.value)})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Weight/Unit</label>
                      <input className="w-full p-3 bg-gray-50 border rounded-xl" value={isEditing.weight} onChange={e=>setIsEditing({...isEditing, weight: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Stock</label>
                      <input type="number" className="w-full p-3 bg-gray-50 border rounded-xl" value={isEditing.stock} onChange={e=>setIsEditing({...isEditing, stock: Number(e.target.value)})} />
                   </div>
                </div>
                <button onClick={() => handleUpdateProduct(isEditing)} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100">Save Product</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const OrderHistory = () => (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Your Orders History</h2>
      {!isLoggedIn ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
           <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500 text-lg">Please login to view your order history.</p>
           <button onClick={() => setShowLoginModal(true)} className="mt-4 px-8 py-2.5 bg-green-600 text-white rounded-full font-bold shadow-lg shadow-green-100">Login to Continue</button>
        </div>
      ) : orders.filter(o => o.mobile === userPhone).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found for {userPhone}.</p>
          <button onClick={() => setActiveTab('Home')} className="mt-4 px-8 py-2.5 bg-green-600 text-white rounded-full font-bold">Explore Store</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.filter(o => o.mobile === userPhone).map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex flex-wrap justify-between gap-4 items-center">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                  <p className="font-bold text-gray-800">{order.id}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-widest">
                  {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Footer = () => (
    <footer className="bg-gray-900 text-white pt-16 pb-32 md:pb-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {storeLogo ? (
              <img src={storeLogo} className="w-10 h-10 rounded-lg object-cover" alt="Logo" />
            ) : (
              <div className="bg-green-600 p-2 rounded-lg"><ShoppingCart className="w-6 h-6 text-white" /></div>
            )}
            <span className="text-xl font-bold">Rakesh Kirana Store</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">🏪 Sab Kuch Milega Yahan! We provide all kinds of quality groceries and daily essentials under one roof. Fresh stock and best prices always.</p>
          <div className="flex gap-4">
            <a href={`tel:${STORE_PHONE}`} className="p-3 bg-gray-800 rounded-xl hover:bg-green-600 transition-all shadow-lg"><Phone className="w-5 h-5" /></a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WELCOME_MESSAGE)}`} className="p-3 bg-gray-800 rounded-xl hover:bg-green-600 transition-all shadow-lg"><MessageCircle className="w-5 h-5" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-lg uppercase tracking-widest text-green-500">Contact Us</h4>
          <ul className="space-y-4 text-sm text-gray-400 font-medium">
             <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-green-600 shrink-0" /> <span>{STORE_ADDRESS}</span></li>
             <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-green-600" /> <span>+91 {STORE_PHONE}</span></li>
             <li className="flex items-center gap-3">
               <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WELCOME_MESSAGE)}`} className="flex items-center gap-3 hover:text-green-500 transition-colors">
                 <MessageCircle className="w-5 h-5 text-green-600" /> <span>WhatsApp: {STORE_PHONE}</span>
               </a>
             </li>
          </ul>
        </div>
        <div>
           <h4 className="font-bold mb-6 text-lg uppercase tracking-widest text-green-500">Store Hours</h4>
           <div className="space-y-4 text-sm text-gray-400 font-medium">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                 <span>Every Day:</span>
                 <span className="text-green-500 font-bold">07:00 AM - 11:00 PM</span>
              </div>
           </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} Rakesh Kirana Store. Bhiwandi, Maharashtra.
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <MobileSearch />
      
      <main className="flex-1">
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <>
            {activeTab === 'Home' && (
              <>
                <div className="max-w-7xl mx-auto px-4 pt-6">
                  <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-green-100">
                    <div className="relative z-10 max-w-lg">
                      <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold mb-4 uppercase tracking-widest">📍 Bhiwandi's Favourite Store</span>
                      <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Sab Kuch Milega Yahan!</h1>
                      <p className="text-white/80 mb-8 font-medium italic">Use Code: <span className="font-bold bg-white text-green-800 px-3 py-1 rounded-lg">RAKESH15</span> for 15% OFF on first order.</p>
                      <button 
                        onClick={() => setSelectedCategory(Category.Grocery)}
                        className="bg-white text-green-700 px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-green-900/20 flex items-center gap-2"
                      >
                        Start Shopping <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <Tag className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 -rotate-12 pointer-events-none" />
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12">
                   <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-10 shadow-sm">
                     <div className="w-full md:w-1/3 bg-gray-50 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative shadow-inner border border-gray-100">
                        {storeLogo ? (
                          <img src={storeLogo} className="w-full h-full object-cover" alt="Store Branding" />
                        ) : (
                          <div className="text-center p-10">
                             <ShoppingCart className="w-16 h-16 text-green-600 mx-auto mb-4 opacity-20" />
                             <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Rakesh Kirana Store</p>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-green-600 text-white p-2 rounded-full shadow-lg"><Star className="w-4 h-4 fill-current" /></div>
                     </div>
                     <div className="flex-1 space-y-5">
                        <div className="flex items-center gap-2 text-green-600 font-bold uppercase text-[10px] tracking-widest"><MapPin className="w-3 h-3" /> Best Groceries in Bhiwandi</div>
                        <h2 className="text-3xl font-bold text-gray-800">🏪 Rakesh Kirana Store –📍 Sab Kuch Milega Yahan!</h2>
                        <p className="text-gray-600 leading-relaxed text-sm font-medium">
                          We provide all kinds of quality groceries, general items, and daily essentials under one roof. 🛒 Wide range of grocery items, 🎁 general & household products. ✅ Trusted by local customers, fresh stock, and the best price. 📍 Visit today for all your home needs — your one-stop shop for everything!
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                           <span className="px-4 py-2 bg-green-50 text-green-700 text-[10px] font-bold rounded-xl border border-green-100 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Trusted Local Store</span>
                           <span className="px-4 py-2 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-xl border border-orange-100 flex items-center gap-2"><Tag className="w-4 h-4" /> Best Price Guarantee</span>
                        </div>
                     </div>
                   </div>
                </div>

                <ProductGrid />
              </>
            )}
            {activeTab === 'Checkout' && <CheckoutForm />}
            {activeTab === 'Orders' && <OrderHistory />}
          </>
        )}
      </main>

      <Footer />
      <CartSidebar />
      {showLoginModal && <LoginModal />}

      <div className="fixed right-6 bottom-10 z-40 flex flex-col gap-4">
        <a href={`tel:${STORE_PHONE}`} className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all border-b-4 border-blue-800 active:translate-y-1 active:border-b-0"><Phone className="w-6 h-6" /></a>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WELCOME_MESSAGE)}`} className="bg-green-500 text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all border-b-4 border-green-700 active:translate-y-1 active:border-b-0">
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      <div className="fixed left-6 bottom-10 z-40 hidden md:block">
         <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-2xl space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Open Daily</p>
            <div className="flex flex-col gap-1">
               <div className="flex justify-between gap-6 text-[10px] font-bold"><span className="text-gray-500">07:00 AM</span> <span className="text-green-600">11:00 PM</span></div>
            </div>
         </div>
      </div>
    </div>
  );
}
