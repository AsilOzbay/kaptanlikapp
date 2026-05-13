import { Link } from 'wouter';
import { Anchor, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Anchor className="w-10 h-10 text-gold-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Kayit Ol</h1>
          <p className="text-sm text-gray-400 mt-1">Ucretsiz hesap olusturun</p>
        </div>
        <div className="bg-navy-800 rounded-2xl border border-navy-700/30 p-6 shadow-card">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1.5">Ad Soyad</label>
              <input
                type="text"
                placeholder="Ad Soyad"
                className="w-full h-12 px-4 rounded-lg bg-navy-800 border border-navy-700 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none focus:ring-[3px] focus:ring-gold-500/15 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1.5">E-posta</label>
              <input
                type="email"
                placeholder="ornek@email.com"
                className="w-full h-12 px-4 rounded-lg bg-navy-800 border border-navy-700 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none focus:ring-[3px] focus:ring-gold-500/15 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1.5">Sifre</label>
              <input
                type="password"
                placeholder="********"
                className="w-full h-12 px-4 rounded-lg bg-navy-800 border border-navy-700 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none focus:ring-[3px] focus:ring-gold-500/15 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full h-12 flex items-center justify-center gap-2 bg-gold-500 text-navy-950 font-semibold rounded-lg hover:bg-gold-400 transition-colors shadow-glow active:scale-[0.97]"
            >
              <UserPlus className="w-4 h-4" />
              Kayit Ol
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">
            Zaten hesabiniz var mi?{' '}
            <Link href="/login" className="text-gold-400 hover:text-gold-300 transition-colors">
              Giris yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
