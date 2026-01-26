'use client';

import Link from 'next/link';
import { useAuthStore } from '@/src/lib/useAuthStore';
// Button import removed as we use standard elements
import { Menu, X, ShoppingBag } from 'lucide-react';

// Cast icons to any to avoid "LucideIcon is not a valid JSX element type" error
const MenuIcon = Menu as any;
const XIcon = X as any;
const ShoppingBagIcon = ShoppingBag as any;
import { useState, useEffect } from 'react';
import { authAPI } from '@/src/services/auth';

export function Header() {
  const { user, logout, setUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check valid session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user && localStorage.getItem('auth_token')) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Token invalid or expired
        logout();
      }
    };
    checkAuth();
  }, [user, setUser, logout]);

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
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors font-medium">
              Về chúng tôi
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                 <Link href="/cart" className="p-2 text-gray-300 hover:text-white transition-colors relative">
                    <ShoppingBagIcon className="w-6 h-6" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
                 </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-medium text-white">{user.full_name}</p>
                        <button 
                            onClick={() => logout()}
                            className="text-xs text-purple-400 hover:text-purple-300"
                        >
                            Đăng xuất
                        </button>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.full_name.charAt(0)}
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
            <Link href="/products" className="block text-lg text-gray-300 hover:text-white font-medium">
              Sản phẩm
            </Link>
            <Link href="/studio" className="block text-lg text-gray-300 hover:text-white font-medium">
              AI Studio
            </Link>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
              {user ? (
                 <>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {user.full_name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-white">{user.full_name}</p>
                            <p className="text-sm text-gray-400">{user.phone_number}</p>
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
