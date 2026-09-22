import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, FlaskConical, Lock, Pill, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ResultView from '../components/ui/ResultView';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const { t, lang } = useLanguage();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const analyzeRef = useRef(null);
  const fileRef = useRef(null);

  const [text, setText] = useState('');
  const [reportType, setReportType] = useState('auto');
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [samplesLoading, setSamplesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/samples');
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setSamples(data);
      } catch {
        /* keep empty */
      } finally {
        if (!cancelled) setSamplesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToAnalyze = () => {
    analyzeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const simplify = async (overrideText) => {
    const payload = (overrideText ?? text).trim();
    if (payload.length < 12) {
      setError(t.emptyText);
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setSaveState('idle');
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payload, language: lang, report_type: reportType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.error);
      setResult(data);
      setText(payload);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = String(reader.result || '');
      setText(next);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const useSample = (sample) => {
    const body = lang === 'es' && sample.body_es ? sample.body_es : sample.body_en;
    setText(body);
    setReportType(sample.doc_type || 'auto');
    simplify(body);
  };

  const onSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!result) return;
    setSaveState('saving');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          title: result.title || 'Untitled report',
          original_text: text,
          report_type: result.report_type,
          simplified_summary: result.summary,
          findings: result,
          language: lang,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t.error);
      }
      setSaveState('saved');
    } catch {
      setSaveState('idle');
      setError(t.error);
    }
  };

  const types = [
    { id: 'auto', label: t.typeAuto },
    { id: 'lab', label: t.typeLab },
    { id: 'prescription', label: t.typeRx },
    { id: 'report', label: t.typeReport },
  ];

  return (
    <div className="pb-8 pt-10 sm:pt-16">
      <motion.section variants={container} initial="hidden" animate="show" className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-white/70 px-3 py-1 text-xs font-medium text-teal-700 shadow-[0_0_24px_rgba(45,212,191,0.25)] backdrop-blur-md dark:border-teal-300/20 dark:bg-white/5 dark:text-teal-200">
            <Sparkles size={13} />
            {t.heroBadge}
          </motion.div>

          <motion.h1 variants={item} className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            {t.heroTitle1}{' '}
            <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            {t.heroSub}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={scrollToAnalyze}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(20,184,166,0.7)]"
            >
              {t.ctaAnalyze}
            </motion.button>
            <a
              href="#how"
              className="rounded-full border border-slate-200/80 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {t.ctaHow}
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 grid gap-3 sm:grid-cols-3"
          >
            {[
              { icon: FlaskConical, title: t.typeLab, tint: 'from-teal-400/20 to-cyan-400/10' },
              { icon: Pill, title: t.typeRx, tint: 'from-indigo-400/20 to-fuchsia-400/10' },
              { icon: FileText, title: t.typeReport, tint: 'from-cyan-400/20 to-indigo-400/10' },
            ].map((card) => (
              <motion.div
                key={card.title}
                whileHover={{ y: -4, scale: 1.015 }}
                className={`rounded-2xl border border-white/70 bg-gradient-to-br ${card.tint} p-4 shadow-sm backdrop-blur-md dark:border-white/10`}
              >
                <card.icon size={18} className="text-teal-600 dark:text-teal-300" />
                <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">{card.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={item} className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-400/25 via-cyan-400/10 to-indigo-500/25 blur-2xl" />
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/40 shadow-[0_40px_80px_-32px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40"
          >
            <img src="/images/hero-glow.png" alt="" className="h-64 w-full object-cover sm:h-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-md">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-200">ClearMed AI</p>
              <p className="mt-1 text-sm font-medium text-white">{t.heroBadge}</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      <section ref={analyzeRef} id="analyze" className="mt-16 scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.5)] backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-slate-900/50"
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-teal-400/20" />
          <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-70 [background:linear-gradient(120deg,rgba(45,212,191,0.35),transparent_30%,transparent_70%,rgba(99,102,241,0.35))] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] [mask-composite:exclude] p-px" />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t.analyzeTitle}</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">{t.analyzeHint}</p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <Upload size={13} /> {t.upload}
            </button>
            <input ref={fileRef} type="file" accept=".txt,text/plain" className="hidden" onChange={onUpload} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {types.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setReportType(type.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  reportType === type.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'border border-slate-200/80 bg-white/50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            rows={8}
            className="mt-4 w-full resize-y rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-sm leading-relaxed text-slate-800 outline-none ring-teal-400/40 placeholder:text-slate-400 focus:ring-2 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100"
          />

          {error && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={() => simplify()}
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {loading ? t.simplifying : t.simplify}
            </motion.button>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{t.trySample}</p>
            {samplesLoading ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {samples.map((s) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    onClick={() => useSample(s)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-left dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {lang === 'es' && s.title_es ? s.title_es : s.title_en}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {lang === 'es' && s.blurb_es ? s.blurb_es : s.blurb_en}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {loading && !result && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-teal-400/30 bg-white/70 px-5 py-2 text-sm text-slate-600 backdrop-blur-md dark:bg-white/5 dark:text-slate-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
            {t.simplifying}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8">
          <ResultView result={result} originalText={text} onSave={onSave} saveState={saveState} />
        </div>
      )}

      <section id="how" className="mt-20 scroll-mt-24">
        <div className="mb-6 overflow-hidden rounded-3xl border border-white/70 shadow-sm dark:border-white/10">
          <img src="/images/lab-soft.jpg" alt="" className="h-36 w-full object-cover sm:h-44" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{t.howTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { n: '01', title: t.how1t, d: t.how1d },
            { n: '02', title: t.how2t, d: t.how2d },
            { n: '03', title: t.how3t, d: t.how3d },
          ].map((step) => (
            <motion.article
              key={step.n}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-white/70 bg-white/60 p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold tracking-[0.2em] text-teal-500">{step.n}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.d}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mt-16 overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-teal-50/80 via-white/50 to-indigo-50/80 backdrop-blur-md dark:border-white/10 dark:from-teal-950/30 dark:via-slate-900/40 dark:to-indigo-950/30">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[220px]">
            <img src="/images/clinic-calm.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent" />
          </div>
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t.trustTitle}</h2>
            <ul className="mt-4 grid gap-3">
              {[
                { icon: Lock, text: t.trust1 },
                { icon: Sparkles, text: t.trust2 },
                { icon: ShieldCheck, text: t.trust3 },
              ].map((row) => (
                <li key={row.text} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <row.icon size={16} className="mt-0.5 text-teal-600 dark:text-teal-300" />
                  {row.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
