import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/saved';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!loading && user) return <Navigate to={from} replace />;

  const validate = () => {
    const next = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = true;
    if (!password || password.length < 6) next.password = true;
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setBusy(true);
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/70 bg-white/70 p-7 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 text-white">
            <Activity size={16} />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t.loginTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.loginSub}</p>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">{t.loginEmail}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full rounded-2xl border bg-white/80 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/50 dark:bg-slate-950/50 ${
                fieldErrors.email ? 'border-rose-400' : 'border-slate-200/80 dark:border-white/10'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">{t.loginPassword}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 w-full rounded-2xl border bg-white/80 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/50 dark:bg-slate-950/50 ${
                fieldErrors.password ? 'border-rose-400' : 'border-slate-200/80 dark:border-white/10'
              }`}
            />
          </div>
          {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}
          <motion.button
            type="submit"
            disabled={busy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? t.loading : isSignUp ? t.signupSubmit : t.loginSubmit}
          </motion.button>
        </form>

        <p className="mt-3 text-center text-xs text-slate-400">{t.demoHint}</p>

        <div className="my-4 text-center text-xs uppercase tracking-[0.2em] text-slate-400">{t.or}</div>

        <button
          type="button"
          onClick={() => signInWithGoogle('ClearMed AI')}
          className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          {t.google}
        </button>

        <button
          type="button"
          onClick={() => setIsSignUp((v) => !v)}
          className="mt-4 w-full text-center text-xs text-teal-700 dark:text-teal-300"
        >
          {isSignUp ? t.signupToggle : t.loginToggle}
        </button>
      </motion.div>
    </div>
  );
}
