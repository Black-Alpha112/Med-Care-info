import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackgroundGlow from '../ui/BackgroundGlow';
import DisclaimerModal from '../modals/DisclaimerModal';

export default function MainLayout() {
  return (
    <div className="relative min-h-screen text-slate-800 antialiased dark:text-slate-100">
      <BackgroundGlow />
      <Header />
      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <DisclaimerModal />
    </div>
  );
}
