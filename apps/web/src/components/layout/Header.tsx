'use client';

import Link from 'next/link';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { useCartStore } from '@/src/lib/useCartStore';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authAPI } from '@/src/services/auth';

// Cast icons to any to avoid "LucideIcon is not a valid JSX element type" error
const MenuIcon = Menu as any;
const XIcon = X as any;
const ShoppingBagIcon = ShoppingBag as any;

export function Header() {
  const { user, logout, setUser } = useAuthStore();
  const { totalItems, setIsOpen, fetchCart } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const cartItemCount = totalItems();

  // Fetch cart when user is present
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  // Check valid session on mount and refresh profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storeToken = useAuthStore.getState().token;
        const localToken = localStorage.getItem('auth_token');
        if (storeToken || localToken) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Token invalid or expired
        logout();
      }
    };
    checkAuth();
  }, [setUser, logout]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              Gen Wear
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors font-medium">
              Trang chủ
            </Link>
            <Link href="/products" className="text-gray-300 hover:text-white transition-colors font-medium">
              Sản phẩm
            </Link>
            <Link href="/studio" className="text-gray-300 hover:text-white transition-colors font-medium">
              AI Studio
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-white transition-colors font-medium">
              Blog
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
              Bảng giá
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-gray-300 hover:text-white transition-colors relative"
                 >
                    <ShoppingBagIcon className="w-6 h-6" />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-[10px] items-center justify-center flex font-bold text-white">
                            {cartItemCount}
                        </span>
                    )}
                 </button>
                <div className="relative group flex items-center pl-4 border-l border-white/10">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="text-right hidden lg:block">
                            <div className="flex items-center justify-end gap-2 text-white">
                                <p className="text-sm font-medium">{user.full_name}</p>
                                {user.account_tier === 'PRO' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">PRO</span>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">FREE</span>
                                )}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                            {user.full_name.charAt(0)}
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 pt-3 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden">
                            {user.role === 'ADMIN' && (
                                <Link href="/admin" className="block px-4 py-2.5 text-sm text-pink-400 hover:bg-white/5 font-bold transition-colors">
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link href="/designs" className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                Thiết kế của tôi
                            </Link>
                            <Link href="/orders" className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                Lịch sử đơn hàng
                            </Link>
                            <div className="border-t border-white/10 my-1"></div>
                            <button 
                                onClick={() => logout()}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors font-medium"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/register" 
                  className="px-6 py-2.5 bg-white text-purple-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors transform hover:scale-105"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 py-6 space-y-4">
            <Link href="/" className="block text-lg text-gray-300 hover:text-white font-medium">
              Trang chủ
            </Link>
            <Link href="/pricing" className="block text-lg text-gray-300 hover:text-white font-medium">
              Bảng giá
            </Link>
            <Link href="/products" className="block text-lg text-gray-300 hover:text-white font-medium">
              Sản phẩm
            </Link>
            <Link href="/studio" className="block text-lg text-gray-300 hover:text-white font-medium">
              AI Studio
            </Link>
            <Link href="/blog" className="block text-lg text-gray-300 hover:text-white font-medium">
              Blog
            </Link>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
              {user ? (
                 <>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {user.full_name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-white">{user.full_name}</p>
                                {user.account_tier === 'PRO' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">PRO</span>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">FREE</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{user.phone_number}</p>
                            {user.role === 'ADMIN' && (
                                <Link href="/admin" className="block text-sm text-pink-400 font-bold mt-1">
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link href="/designs" className="block text-sm text-gray-300 hover:text-white mt-1">
                                Thiết kế của tôi
                            </Link>
                            <Link href="/orders" className="block text-sm text-gray-300 hover:text-white mt-1">
                                Lịch sử đơn hàng
                            </Link>
                        </div>
                    </div>
                    <button 
                        onClick={() => logout()}
                        className="text-left text-red-400 font-medium"
                    >
                        Đăng xuất
                    </button>
                 </>
              ) : (
                <>
                    <Link 
                        href="/login" 
                        className="w-full py-3 text-center text-white font-medium border border-white/20 rounded-xl hover:bg-white/5"
                    >
                        Đăng nhập
                    </Link>
                    <Link 
                        href="/register" 
                        className="w-full py-3 text-center bg-white text-purple-900 font-bold rounded-xl"
                    >
                        Đăng ký
                    </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
