import { useState, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Shield, LogIn, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.15, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, delay: 0.3 },
  },
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AdminLoginPage() {
  const { signIn, signOut } = useAuth();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};

    if (!email.trim()) {
      next.email = 'E-posta adresi gereklidir';
    } else if (!isValidEmail(email.trim())) {
      next.email = 'Gecerli bir e-posta adresi girin';
    }

    if (!password) {
      next.password = 'Sifre gereklidir';
    } else if (password.length < 6) {
      next.password = 'Sifreniz en az 6 karakter olmalidir';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        await signIn(email.trim(), password);

        // Admin rol kontrolu: sadece admin@kaptanlik.app kabul edilir
        if (email.trim().toLowerCase() !== 'admin@kaptanlik.app') {
          await signOut();
          setShake(true);
          setTimeout(() => setShake(false), 300);
          setErrors({ general: 'Bu sayfaya erisim yetkiniz bulunmuyor. Sadece admin kullanicilar girebilir.' });
          setIsLoading(false);
          return;
        }

        navigate('/admin');
      } catch {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        setErrors({ general: 'E-posta veya sifre hatali.' });
      } finally {
        setIsLoading(false);
      }
    },
    [validate, signIn, signOut, email, password, navigate]
  );

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4"
      style={{
        backgroundColor: '#03045E',
        backgroundImage:
          'radial-gradient(ellipse at top center, rgba(212, 160, 23, 0.03) 0%, transparent 60%)',
      }}
    >
      <div className="w-full max-w-[420px]">
        {/* LogoHeader */}
        <motion.div
          className="text-center mb-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={logoVariants} className="mb-4">
            <Shield className="w-16 h-16 text-gold-500 mx-auto" />
          </motion.div>
          <motion.h1
            variants={titleVariants}
            className="text-2xl font-bold text-white tracking-tight"
            style={{ letterSpacing: '-0.01em' }}
          >
            Admin Giris
          </motion.h1>
          <motion.p variants={subtitleVariants} className="text-sm text-[#E2E8F0] mt-2">
            Yonetim paneline giris
          </motion.p>
        </motion.div>

        {/* AuthForm Card */}
        <motion.div
          className="mt-8 rounded-2xl border p-6"
          style={{
            backgroundColor: '#14235A',
            borderColor: 'rgba(27, 46, 107, 0.4)',
            boxShadow: '0 2px 12px rgba(3, 4, 94, 0.4)',
          }}
          animate={shake ? { x: [0, -4, 4, -4, 4, -4, 0] } : {}}
          transition={{ duration: 0.3 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.general}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-sm font-semibold text-[#E2E8F0]"
              >
                E-posta
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@kaptanlik.app"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                onBlur={() => {
                  if (email.trim() && !isValidEmail(email.trim())) {
                    setErrors((p) => ({ ...p, email: 'Gecerli bir e-posta adresi girin' }));
                  }
                }}
                className="h-12 w-full rounded-lg border px-4 text-base text-white placeholder:text-[#94A3B8] transition-colors"
                style={{
                  backgroundColor: '#14235A',
                  borderColor: errors.email ? '#EF4444' : '#1B2E6B',
                }}
                disabled={isLoading}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs mt-1"
                  style={{ color: '#EF4444' }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="text-sm font-semibold text-[#E2E8F0]"
              >
                Sifre
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="******"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  className="h-12 w-full rounded-lg border px-4 pr-11 text-base text-white placeholder:text-[#94A3B8] transition-colors"
                  style={{
                    backgroundColor: '#14235A',
                    borderColor: errors.password ? '#EF4444' : '#1B2E6B',
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#E2E8F0] transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sifreyi gizle' : 'Sifreyi goster'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs mt-1"
                  style={{ color: '#EF4444' }}
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg font-semibold text-sm transition-all"
                style={{
                  backgroundColor: isLoading ? '#D4A01799' : '#D4A017',
                  color: '#03045E',
                }}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-[#03045E] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Admin Giris
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-4 text-center space-y-2"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm transition-colors hover:underline"
              style={{ color: '#D4A017' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Kullanici girisine don
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
