import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BookmarkPlus,
  CheckCircle2,
  ChevronDown,
  Copy,
  FlaskConical,
  HelpCircle,
  Pill,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const statusStyles = {
  high: 'border-rose-300/60 bg-rose-50/80 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200',
  low: 'border-amber-300/60 bg-amber-50/80 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200',
  normal: 'border-teal-300/60 bg-teal-50/80 text-teal-800 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-200',
};

const overallMap = {
  good: { labelKey: 'overallGood', ring: 'from-teal-400 to-cyan-400', icon: CheckCircle2 },
  attention: { labelKey: 'overallAttention', ring: 'from-amber-400 to-orange-400', icon: AlertCircle },
  urgent: { labelKey: 'overallUrgent', ring: 'from-rose-400 to-fuchsia-500', icon: AlertCircle },
};

export default function ResultView({ result, originalText, onSave, saveState }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openTerm, setOpenTerm] = useState(null);

  if (!result) return null;

  const overall = overallMap[result.overall] || overallMap.attention;
  const Icon = overall.icon;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(result.summary || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-slate-900/55"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${overall.ring}`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
            {t.resultsTitle}
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {result.headline}
          </h3>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Icon size={14} className="text-teal-500" />
            {t[overall.labelKey]} · {result.title}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            onClick={copySummary}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            <Copy size={13} />
            {copied ? t.copied : t.copySummary}
          </motion.button>
          <motion.button
            type="button"
            onClick={onSave}
            disabled={saveState === 'saving' || saveState === 'saved'}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_10px_24px_-8px_rgba(20,184,166,0.7)] disabled:opacity-70"
          >
            <BookmarkPlus size={13} />
            {saveState === 'saving' ? t.saving : saveState === 'saved' ? t.savedOk : t.save}
          </motion.button>
        </div>
      </div>

      {!user && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t.saveNeedAuth}</p>
      )}

      {result.highlights?.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Sparkles size={15} className="text-indigo-500" /> {t.highlights}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {result.highlights.map((h) => (
              <li
                key={h}
                className="rounded-2xl border border-indigo-200/50 bg-indigo-50/50 px-4 py-3 text-sm text-slate-700 dark:border-indigo-400/15 dark:bg-indigo-400/10 dark:text-slate-200"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
        {result.summary}
      </div>

      {result.labs?.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <FlaskConical size={15} className="text-cyan-500" /> {t.labs}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.labs.map((lab) => (
              <motion.article
                key={`${lab.abbreviation}-${lab.name}`}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{lab.name}</p>
                    <p className="text-xs text-slate-500">{lab.abbreviation}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[lab.status] || statusStyles.normal}`}>
                    {t[lab.status] || lab.status}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {lab.value} <span className="text-sm font-medium text-slate-400">{lab.unit}</span>
                </p>
                {lab.low_normal != null && lab.high_normal != null && (
                  <p className="mt-1 text-xs text-slate-500">
                    {t.usualRange}: {lab.low_normal} – {lab.high_normal} {lab.unit}
                  </p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{lab.plain}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lab.meaning}</p>
              </motion.article>
            ))}
          </div>
        </div>
      )}
      {result.labs?.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">{t.noLabs}</p>
      )}

      {result.medications?.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Pill size={15} className="text-indigo-500" /> {t.meds}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.medications.map((med) => (
              <article key={med.name} className="rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="font-semibold text-slate-900 dark:text-white">{med.name}</p>
                {med.dosage && (
                  <p className="mt-1 text-xs text-slate-500">
                    {t.dosage}: {med.dosage} {med.frequency ? `· ${med.frequency}` : ''}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{t.purpose}: </span>
                  {med.purpose}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t.terms}</p>
        {result.terms?.length === 0 && <p className="text-sm text-slate-500">{t.noTerms}</p>}
        <div className="flex flex-wrap gap-2">
          {result.terms?.map((term) => (
            <button
              key={term.term}
              type="button"
              onClick={() => setOpenTerm(openTerm === term.term ? null : term.term)}
              className="rounded-full border border-cyan-200/70 bg-cyan-50/80 px-3 py-1 text-xs font-medium text-cyan-800 transition hover:scale-[1.03] dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100"
            >
              {term.term}
            </button>
          ))}
        </div>
        {openTerm && result.terms?.find((x) => x.term === openTerm) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl border border-cyan-200/50 bg-white/80 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            <p className="font-semibold text-slate-900 dark:text-white">{openTerm}</p>
            <p className="mt-1">{result.terms.find((x) => x.term === openTerm).plain}</p>
          </motion.div>
        )}
      </div>

      {result.questions?.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <HelpCircle size={15} className="text-teal-500" /> {t.questions}
          </p>
          <ol className="space-y-2">
            {result.questions.map((q, i) => (
              <li key={q} className="flex gap-3 rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-xs font-semibold text-teal-700 dark:text-teal-200">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowOriginal((v) => !v)}
        className="mt-8 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-700 dark:hover:text-teal-300"
      >
        <ChevronDown size={14} className={showOriginal ? 'rotate-180 transition' : 'transition'} />
        {showOriginal ? t.hideOriginal : t.showOriginal}
      </button>
      {showOriginal && (
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
          {originalText}
        </pre>
      )}
    </motion.section>
  );
}
