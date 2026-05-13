import { Anchor } from 'lucide-react';

const links = [
  'Anasayfa',
  'Ozellikler',
  'Fiyatlandirma',
  'Gizlilik Politikasi',
  'Kullanim Kosullari',
  'Iletisim',
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-700/30">
      <div className="max-w-[1200px] mx-auto px-4 py-12 pb-8">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start mb-6">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-gold-500" />
            <span className="text-gold-400 font-bold text-base tracking-tight">
              KaptanlikApp
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-gray-400 hover:text-gold-500 transition-colors relative group"
            >
              {link}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-gold-500 transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-navy-700/50 mb-4" />

        {/* Copyright */}
        <p className="text-center text-xs text-gray-600">
          &copy; 2025 KaptanlikApp. Tum haklari saklidir.
        </p>
      </div>
    </footer>
  );
}
