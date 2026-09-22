import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ResultView from '../components/ui/ResultView';

export default function Saved() {
  const { session } = useAuth();
  const { t, lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  });

  const fetchItems = async () => {
    setError('');
    try {
      const res = await fetch('/api/reports', { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.error);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) fetchItems();
  }, [session?.access_token]);

  const remove = async (id) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(t.error);
      setActive((cur) => (cur?.id === id ? null : cur));
      fetchItems();
    } catch {
      setError(t.error);
    }
  };

  const saveTitle = async (id) => {
    if (!titleDraft.trim()) {
      setRenaming(null);
      return;
    }
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ id, title: titleDraft.trim() }),
      });
      if (!res.ok) throw new Error(t.error);
      setRenaming(null);
      fetchItems();
    } catch {
      setError(t.error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-teal-400/30 bg-white/70 px-5 py-2 text-sm text-slate-600 backdrop-blur-md dark:bg-white/5 dark:text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
          {t.loading}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
            ClearMed AI
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{t.savedTitle}</h1>
        </div>
        <Link to="/" className="text-sm text-teal-700 dark:text-teal-300">
          {t.back}
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {items.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300/80 bg-white/50 p-10 text-center dark:border-white/15 dark:bg-white/5">
          <Bookmark className="mx-auto text-teal-500" />
          <p className="mt-3 text-sm text-slate-500">{t.savedEmpty}</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-teal-700 dark:text-teal-300">
            {t.ctaAnalyze}
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-3">
        {items.map((row) => (
          <motion.article
            key={row.id}
            layout
            className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
                  <FileText size={16} />
                </span>
                <div>
                  {renaming === row.id ? (
                    <input
                      autoFocus
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onBlur={() => saveTitle(row.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveTitle(row.id)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm dark:border-white/10 dark:bg-slate-950"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRenaming(row.id);
                        setTitleDraft(row.title || '');
                      }}
                      className="text-left text-sm font-semibold text-slate-900 dark:text-white"
                    >
                      {row.title || 'Untitled'}
                    </button>
                  )}
                  <p className="mt-0.5 text-xs text-slate-500">
                    {row.report_type} · {row.language || lang} · {row.created_at ? new Date(row.created_at).toLocaleString() : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActive(active?.id === row.id ? null : row)}
                  className="rounded-full border border-slate-200/80 px-3 py-1 text-xs font-medium dark:border-white/10"
                >
                  {t.open}
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200/70 px-3 py-1 text-xs font-medium text-rose-600 dark:border-rose-400/20"
                >
                  <Trash2 size={12} /> {t.delete}
                </button>
              </div>
            </div>
            {active?.id === row.id && (
              <div className="mt-4">
                <ResultView
                  result={row.findings || { summary: row.simplified_summary, title: row.title, overall: 'attention', highlights: [], labs: [], terms: [], medications: [], questions: [] }}
                  originalText={row.original_text}
                  onSave={() => {}}
                  saveState="saved"
                />
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </div>
  );
}
