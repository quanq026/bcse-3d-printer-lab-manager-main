import React, { useEffect, useState } from 'react';
import {
  Printer,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Globe,
  Eye,
  EyeOff,
  ArrowRight,
  MapPin,
  Layers,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useLang } from '../contexts/LanguageContext';

interface LandingPageProps {
  onLogin: (user: any) => void;
}

const VJU_REGEX = /@(st\.vju\.ac\.vn|vju\.ac\.vn)$/i;

const FLOATING_SHAPES = [
  { size: 120, top: '8%', left: '5%', delay: 0, opacity: 0.07 },
  { size: 80, top: '60%', left: '2%', delay: 1.5, opacity: 0.05 },
  { size: 60, top: '30%', right: '8%', delay: 0.8, opacity: 0.06 },
  { size: 100, bottom: '10%', right: '3%', delay: 2, opacity: 0.05 },
  { size: 40, top: '75%', left: '30%', delay: 1, opacity: 0.08 },
];

const FloatingShapes = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {FLOATING_SHAPES.map((shape, i) => (
      <div
        key={i}
        className="absolute rounded-full border-2 border-amber-400"
        style={{
          width: shape.size,
          height: shape.size,
          top: shape.top,
          left: (shape as any).left,
          right: (shape as any).right,
          bottom: (shape as any).bottom,
          opacity: shape.opacity,
          animation: `landing-float ${6 + i}s ease-in-out ${shape.delay}s infinite`,
        }}
      />
    ))}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, #d97706 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        opacity: 0.08,
      }}
    />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const { lang, setLang, t } = useLang();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [supervisor, setSupervisor] = useState('');

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(loginEmail, loginPass);
      localStorage.setItem('lab_token', res.token);
      onLogin(res.user);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!VJU_REGEX.test(email)) {
      setError(t('invalidEmail'));
      return;
    }
    if (password !== confirmPass) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await api.register({ email, password, fullName, studentId, phone, supervisor });
      setSuccess(t('registerSuccess'));
      setTab('login');
      setError('');
      setSuccess('');
      setLoginEmail(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const guideUrl = settings.guide_url;
  const contactEmail = settings.contact_email;
  const contactFb = settings.contact_facebook;
  const contactZalo = settings.contact_zalo;

  return (
    <main className="min-h-screen flex flex-col md:flex-row" style={{ background: '#fdf8f0' }}>
      <section
        className="relative flex flex-1 flex-col justify-between overflow-hidden p-6 sm:p-10 md:p-14"
        style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)' }}
      >
        <FloatingShapes />

        <div className="relative z-10">
          <div className="landing-enter flex items-center gap-3 mb-10 sm:mb-14">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
            >
              <Printer size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: 'Georgia, serif' }}>
                BCSE 3D Lab
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <MapPin size={10} className="text-amber-400" />
                <p className="text-xs font-medium tracking-wider" style={{ color: '#d97706' }}>
                  VJU Mỹ Đình · VJU Hòa Lạc
                </p>
              </div>
            </div>
          </div>

          <div className="landing-enter landing-enter-delay-1">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#d97706' }}>
              Hệ thống quản lý
            </p>
            <h2 className="mb-6 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl" style={{ fontFamily: 'Georgia, serif' }}>
              {t('heroTitle')} <br />
              <span style={{ color: '#d97706' }}>{t('heroHighlight')}</span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed sm:text-base" style={{ color: '#a8a29e' }}>
              {t('heroDesc')}
            </p>
          </div>

          <div className="landing-enter landing-enter-delay-2 mt-10 flex flex-wrap gap-3">
            {['VJU Mỹ Đình', 'VJU Hòa Lạc'].map((campus, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border px-4 py-2"
                style={{ borderColor: '#44403c', background: '#292524' }}
              >
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-white">{campus}</span>
              </div>
            ))}
          </div>

          <div className="landing-enter landing-enter-delay-3 mt-10 space-y-5">
            {[
              { icon: FileText, title: t('featurePolicy'), desc: t('featurePolicyDesc') },
              { icon: Layers, title: t('featureMaterial'), desc: t('featureMaterialDesc') },
              { icon: ShieldCheck, title: t('featureSafe'), desc: t('featureSafeDesc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0 rounded-lg p-1.5" style={{ background: '#292524', border: '1px solid #44403c' }}>
                  <Icon size={16} style={{ color: '#d97706' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#78716c' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap items-center gap-5 text-xs" style={{ color: '#57534e' }}>
          <span>{t('copyright')}</span>
          {guideUrl ? (
            <a href={guideUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber-400">
              {t('userGuide')}
            </a>
          ) : (
            <span className="opacity-40">{t('userGuide')}</span>
          )}
          {contactEmail || contactFb || contactZalo ? (
            <a
              href={contactFb || (contactEmail ? `mailto:${contactEmail}` : '#')}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-amber-400"
            >
              {t('contactSupport')}
            </a>
          ) : (
            <span className="opacity-40">{t('contactSupport')}</span>
          )}
        </div>
      </section>

      <section
        className="relative flex w-full flex-col justify-center border-t p-5 sm:p-8 md:w-[480px] md:border-l md:border-t-0 md:p-12"
        style={{ background: '#fffbf5', borderColor: '#e7e0d6' }}
      >
        <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-6 sm:top-6">
          <button
            onClick={() => setLang(lang === 'VN' ? 'JP' : 'VN')}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all hover:bg-amber-50"
            style={{ color: '#78716c', border: '1px solid #e7e0d6' }}
          >
            <Globe size={13} />
            {lang === 'VN' ? '🇻🇳 Tiếng Việt' : '🇯🇵 日本語'}
          </button>
        </div>

        <div className="mx-auto w-full max-w-md pt-10 sm:pt-0">
          <div className="mb-8 landing-enter">
            <div className="mb-4 h-1 w-10 rounded-full bg-amber-500" />
            <h2 id="auth-title" className="mb-1.5 text-2xl font-black" style={{ color: '#1c1917', fontFamily: 'Georgia, serif' }}>
              {tab === 'login' ? t('welcome') : t('registerTitle')}
            </h2>
            <p className="text-sm" style={{ color: '#78716c' }}>
              {tab === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
            </p>
          </div>

          <div className="mb-7 flex rounded-xl p-1" style={{ background: '#f0e9de' }}>
            {(['login', 'register'] as const).map((tabItem) => (
              <button
                key={tabItem}
                onClick={() => {
                  setTab(tabItem);
                  setError('');
                  setSuccess('');
                }}
                className={cn(
                  'flex-1 rounded-lg py-2 text-sm font-bold transition-all',
                  tab === tabItem ? 'bg-white shadow-sm' : 'hover:text-stone-700'
                )}
                style={{ color: tab === tabItem ? '#1c1917' : '#57534e' }}
              >
                {tabItem === 'login' ? t('login') : t('register')}
              </button>
            ))}
          </div>

          {error && (
            <div
              className="mb-4 flex items-start gap-2 rounded-xl p-3 text-sm landing-enter"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-4 flex items-start gap-2 rounded-xl p-3 text-sm landing-enter"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}
            >
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              {success}
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label={t('email')}>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="auth-input"
                />
              </Field>
              <Field label={t('password')}>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md"
                    style={{ color: '#78716c' }}
                    aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <SubmitBtn loading={loading} label={t('login')} />
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={t('fullName')}>
                  <input type="text" placeholder="Nguyễn Văn A" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="auth-input" />
                </Field>
                <Field label={t('studentId')}>
                  <input type="text" placeholder="2201xxxx" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="auth-input" />
                </Field>
              </div>
              <Field label={t('phone')}>
                <input type="tel" placeholder="09xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="auth-input" />
              </Field>
              <Field label={t('supervisor')}>
                <input type="text" placeholder="Dr. Nguyễn Văn B" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="auth-input" />
              </Field>
              <Field label={t('email')} hint={t('emailHint')}>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  style={{ borderColor: email && !VJU_REGEX.test(email) ? '#fca5a5' : '' }}
                />
                {email && !VJU_REGEX.test(email) && (
                  <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{t('invalidEmail')}</p>
                )}
              </Field>
              <Field label={t('password')}>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md"
                    style={{ color: '#78716c' }}
                    aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="Xác nhận mật khẩu">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="auth-input"
                  style={{ borderColor: confirmPass && confirmPass !== password ? '#fca5a5' : '' }}
                />
                {confirmPass && confirmPass !== password && (
                  <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>Mật khẩu không khớp</p>
                )}
              </Field>
              <SubmitBtn
                loading={loading}
                label={t('register')}
                disabled={(!!email && !VJU_REGEX.test(email)) || (!!confirmPass && confirmPass !== password)}
              />
            </form>
          )}
        </div>
      </section>

      <style>{`
        @keyframes landing-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(15deg); }
        }
        @keyframes landing-enter {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .landing-enter {
          animation: landing-enter 0.6s ease-out both;
        }
        .landing-enter-delay-1 { animation-delay: 0.1s; }
        .landing-enter-delay-2 { animation-delay: 0.2s; }
        .landing-enter-delay-3 { animation-delay: 0.3s; }
        .auth-input {
          width: 100%;
          padding: 10px 16px;
          background: #fffbf5;
          border: 1px solid #e7e0d6;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          color: #1c1917;
        }
        .auth-input:focus {
          border-color: #d97706;
          box-shadow: 0 0 0 3px rgba(217,119,6,0.12);
        }
        .auth-input::placeholder { color: #a8a29e; }
        .auth-input::-ms-reveal,
        .auth-input::-ms-clear {
          display: none;
        }
      `}</style>
    </main>
  );
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#44403c' }}>{label}</label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: '#a8a29e' }}>{hint}</p>}
    </div>
  );
}

function SubmitBtn({ loading, label, disabled = false }: { loading: boolean; label: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: disabled ? '#d6cfc4' : 'linear-gradient(135deg, #d97706, #b45309)',
        color: 'white',
        boxShadow: disabled ? 'none' : '0 4px 14px rgba(217,119,6,0.3)',
      }}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
      {label}
    </button>
  );
}
