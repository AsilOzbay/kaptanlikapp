import { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Anchor, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FormErrors {
  email?: string;
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

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

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

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [email]);

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
        await resetPassword(email.trim());
        setSuccess(true);
      } catch {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        setErrors({ general: 'Bir hata olustu. Lutfen tekrar deneyin.' });
      } finally {
        setIsLoading(false);
      }
    },
    [validate, resetPassword, email]
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
            <Anchor className="w-16 h-16 text-gold-500 mx-auto" />
          </motion.div>
          <motion.h1
            variants={titleVariants}
            className="text-2xl font-bold text-white tracking-tight"
            style={{ letterSpacing: '-0.01em' }}
          >
            KaptanlikApp
          </motion.h1>
          <motion.p variants={subtitleVariants} className="text-sm text-[#E2E8F0] mt-2">
            Sifrenizi sifirlayin
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
          {success ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
              className="text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                }}
              >
                <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#10B981' }} />
              </motion.div>
              <p className="text-base mb-1" style={{ color: '#E2E8F0' }}>
                Sifre sifirlama baglantisi e-postaniza gonderildi.
              </p>
              <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                Lutfen gelen kutunuzu kontrol edin.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  border: '1px solid #D4A017',
                  color: '#D4A017',
                  backgroundColor: 'transparent',
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Giris sayfasina don
              </Link>
            </motion.div>
          ) : (
            <>
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
                    htmlFor="forgot-email"
                    className="text-sm font-semibold text-[#E2E8F0]"
                  >
                    E-posta
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="ornek@email.com"
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
                      'Sifre Sifirlama Baglantisi Gonder'
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Back to login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-4 text-center"
              >
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm transition-colors hover:underline"
                  style={{ color: '#D4A017' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giris sayfasina don
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
