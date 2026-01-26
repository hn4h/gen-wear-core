import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

// Cast icons to any to avoid "LucideIcon is not a valid JSX element type" error
// This occurs due to a conflict between React 18 types and newer library definitions
const FacebookIcon = Facebook as any;
const TwitterIcon = Twitter as any;
const InstagramIcon = Instagram as any;
const LinkedinIcon = Linkedin as any;
const MailIcon = Mail as any;

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                Gen Wear
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nền tảng thiết kế khăn bandana & phụ kiện thời trang được hỗ trợ bởi AI tiên tiến. Tạo ra phong cách độc đáo của riêng bạn.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Sản phẩm</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Bộ sưu tập mới
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-gray-400 hover:text-white transition-colors text-sm">
                  AI Studio
                </Link>
              </li>
              <li>
                <Link href="/custom" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Thiết kế theo yêu cầu
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Bảng giá
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Công ty</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Blog tin tức
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Đăng ký nhận tin</h3>
            <p className="text-gray-400 text-sm mb-4">
              Nhận thông tin về các bộ sưu tập mới nhất và ưu đãi đặc biệt.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <MailIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Email của bạn"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm"
              >
                Đăng ký ngay
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Gen Wear. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
