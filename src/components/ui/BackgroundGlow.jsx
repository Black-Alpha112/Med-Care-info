import { motion } from 'framer-motion';

export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#f4f7fb] dark:bg-[#070b14]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.1),_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.12),_transparent_50%)]" />

      <motion.div
        className="absolute -left-24 top-[-8%] h-[420px] w-[420px] rounded-full bg-teal-500/10 blur-3xl will-change-transform dark:bg-teal-400/10"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, 10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-10%] top-[18%] h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-3xl will-change-transform dark:bg-indigo-400/10"
        animate={{ x: [0, -30, 20, 0], y: [0, 40, -15, 0], scale: [1, 0.94, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-12%] left-[28%] h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-3xl will-change-transform dark:bg-cyan-400/10"
        animate={{ x: [0, 25, -35, 0], y: [0, -20, 15, 0], scale: [1, 1.06, 0.92, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:56px_56px] dark:opacity-[0.12]" />
    </div>
  );
}
