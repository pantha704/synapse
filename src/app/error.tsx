'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorCode = searchParams.get('error_code');
  const errorDesc = searchParams.get('error_description');

  useEffect(() => {
    console.error(error);
  }, [error]);

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred.';

  if (errorCode === 'otp_expired') {
    title = 'Verification link expired';
    message = 'Your email verification link has expired. Please request a new one.';
  } else if (errorCode === 'access_denied') {
    title = 'Access denied';
    message = errorDesc || 'You do not have permission to access this page.';
  } else if (error.message?.includes('rate limit')) {
    title = 'Too many attempts';
    message = 'Please wait a moment before trying again.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,6%)] p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-white">Synapse</span>
        </div>

        <div className="bg-[hsl(220,15%,10%)]/80 border-white/[0.06] backdrop-blur-xl shadow-2xl rounded-2xl p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-sm text-white/50 mb-6">{message}</p>

          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium hover:from-violet-500 hover:to-violet-400 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
