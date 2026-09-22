import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const STORAGE_KEY = 'clearmed_disclaimer_accepted';

export default function DisclaimerModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY) === '1';
    if (!accepted) setOpen(true);
  }, []);

  const confirm = () => {
    if (!checked) {
      setShake(true);
      setTimeout(() => setShake(false), 420);
      return;
    }
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
            <div className="flex items-start gap-3">
              <motion.span
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300"
                animate={{ rotate: [0, -10, 10, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4 }}
              >
                <AlertTriangle size={22} />
              </motion.span>
              <div>
                <h2 id="disclaimer-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t.discTitle}
                </h2>
                <p className="mt-1 text-sm font-medium text-teal-700 dark:text-teal-300">{t.discLead}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.discBody}</p>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-400"
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">{t.discCheck}</span>
            </label>

            <motion.button
              type="button"
              onClick={confirm}
              animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-8px_rgba(20,184,166,0.55)]"
            >
              {t.discConfirm}
            </motion.button>
            {!checked && shake && (
              <p className="mt-2 text-center text-xs text-amber-700 dark:text-amber-300">{t.discNeedCheck}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
