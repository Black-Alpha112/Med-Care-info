import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-teal-500/20 bg-white/60 px-5 py-2.5 text-sm text-slate-600 shadow-sm backdrop-blur-md dark:bg-white/5 dark:text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
          {t.loading}
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
