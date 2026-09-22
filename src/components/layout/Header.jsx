import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Bookmark, Globe, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const onSignOut = async () => {
    await signOut();
    close();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5" onClick={close}>
          <motion.span
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 text-white shadow-[0_0_24px_rgba(20,184,166,0.45)]"
            whileHover={{ scale: 1.06, rotate: -4 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          >
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex"
            >
              <Activity className="h-4.5 w-4.5" size={18} strokeWidth={2.4} />
            </motion.span>
          </motion.span>
          <span className="flex flex-col leading-none">
            <span className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 bg-clip-text text-[15px] font-semibold tracking-tight text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-indigo-300">
                ClearMed AI
              </span>
              <span className="hidden rounded-full border border-teal-400/40 bg-teal-50/80 px-2 py-0.5 text-[10px] font-medium tracking-wide text-teal-700 shadow-[0_0_12px_rgba(45,212,191,0.35)] sm:inline-flex dark:border-teal-300/30 dark:bg-teal-400/10 dark:text-teal-200">
                {t.badge}
              </span>
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1.5 md:flex">
          <div className="flex items-center rounded-full border border-slate-200/70 bg-white/60 p-0.5 dark:border-white/10 dark:bg-white/5">
            <Globe size={14} className="ml-2 text-slate-400" />
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${lang === 'en' ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${lang === 'es' ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
            >
              ES
            </button>
          </div>

          <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/70 text-slate-600 transition hover:border-teal-300/60 hover:text-teal-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-teal-200"
            aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate('/saved')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300/60 hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-indigo-200"
          >
            <Bookmark size={14} />
            {t.saved}
          </motion.button>

          {user ? (
            <motion.button
              type="button"
              onClick={onSignOut}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="rounded-full bg-gradient-to-r from-slate-800 to-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)] dark:from-white dark:to-slate-200 dark:text-slate-900"
            >
              {t.signOut}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_8px_22px_rgba(20,184,166,0.35)]"
            >
              {t.signIn}
            </motion.button>
          )}
        </div>

        <motion.button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-700 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.92 }}
          aria-label={open ? t.close : t.menu}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-slate-200/50 bg-white/90 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-slate-950/90"
          >
            <nav className="flex flex-col gap-1 px-4 py-3">
              <NavLink to="/" onClick={close} className="rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-teal-50 dark:text-slate-200 dark:hover:bg-white/5">
                {t.navHome}
              </NavLink>
              <NavLink to="/saved" onClick={close} className="rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-teal-50 dark:text-slate-200 dark:hover:bg-white/5">
                {t.saved}
              </NavLink>
              <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 dark:border-white/10">
                <span className="text-xs text-slate-500">{t.lang}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setLang('en')} className={`rounded-full px-2.5 py-1 text-xs ${lang === 'en' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}>EN</button>
                  <button type="button" onClick={() => setLang('es')} className={`rounded-full px-2.5 py-1 text-xs ${lang === 'es' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'}`}>ES</button>
                </div>
              </div>
              <button type="button" onClick={toggleTheme} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200">
                {theme === 'dark' ? t.themeLight : t.themeDark}
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              {user ? (
                <button type="button" onClick={onSignOut} className="mt-1 rounded-xl bg-slate-900 px-3 py-2.5 text-sm text-white dark:bg-white dark:text-slate-900">
                  {t.signOut}
                </button>
              ) : (
                <Link to="/login" onClick={close} className="mt-1 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-500 px-3 py-2.5 text-center text-sm text-white">
                  {t.signIn}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
