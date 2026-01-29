'use client';

import Link from 'next/link';
import { ArrowRight as ArrowRightIcon, Sparkles as SparklesIcon } from 'lucide-react';

const ArrowRight = ArrowRightIcon as any;
const Sparkles = SparklesIcon as any;
import dynamic from 'next/dynamic';
import { DesignControls, useDesignGeneration } from '@/src/features/design-studio';

const BandanaViewer = dynamic(
    () => import('@/src/features/design-studio').then((mod) => mod.BandanaViewer),
    { ssr: false }
);

export function Hero() {
  const { prompt, setPrompt, isLoading, textureUrl, generatePattern } = useDesignGeneration();

  return (
    <div className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">AI-Powered Fashion Design</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Design Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Unique Style
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Tạo ra những mẫu khăn bandana độc đáo chỉ trong vài giây với sức mạnh của AI. 
              Visualize trực tiếp trên mô hình 3D và đặt hàng ngay lập tức.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link 
                href="/studio" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Bắt đầu thiết kế
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/products" 
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all"
              >
                Xem bộ sưu tập
              </Link>
            </div>

            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-bold text-white">10k+</p>
                <p className="text-gray-400 text-sm">Design Generated</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-gray-400 text-sm">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">4.9/5</p>
                <p className="text-gray-400 text-sm">Rating</p>
              </div>
            </div>
          </div>

          {/* 3D Viewer Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl h-[500px] group">
               <BandanaViewer textureUrl={textureUrl} />
               
               {/* Floating Controls Overlay */}
               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <DesignControls
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onGenerate={generatePattern}
                    isLoading={isLoading}
                    minimal={true} // Assuming I'll modify controls to verify minimal mode or just styling helps
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
