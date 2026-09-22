import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

function HoverLink({ to, children }) {
  return (
    <Link to={to} className="group relative text-sm text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-teal-400 to-indigo-400 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative mt-20 border-t border-slate-200/60 bg-gradient-to-b from-transparent via-teal-50/40 to-indigo-50/50 dark:border-white/10 dark:via-teal-950/20 dark:to-indigo-950/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-300/50 bg-amber-50/70 p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_20px_50px_-24px_rgba(245,158,11,0.45)] backdrop-blur-md dark:border-amber-400/25 dark:bg-amber-400/10">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-200">
              <ShieldAlert size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{t.safetyTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/80">{t.safetyBody}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.footerCopy}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <HoverLink to="/privacy">{t.footerPrivacy}</HoverLink>
            <HoverLink to="/terms">{t.footerTerms}</HoverLink>
            <HoverLink to="/disclaimer">{t.footerDisclaimer}</HoverLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
