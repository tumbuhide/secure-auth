'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function AuthStatusComponent() {
  const params = useSearchParams()
  const router = useRouter()
  
  const hasError = params.get('error')
  const isSuccess = params.get('success')
  const nextUrl = params.get('next') || '/login' // Default ke /login jika tidak ada

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      const redirectTimeout = setTimeout(() => {
        router.push(nextUrl);
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimeout);
      };
    }
  }, [isSuccess, router, nextUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg text-center">
        {isSuccess && (
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Verifikasi Berhasil!</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Alamat email Anda telah berhasil diverifikasi. Anda sekarang dapat melanjutkan.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Anda akan diarahkan dalam {countdown} detik...
            </p>
            <div className="mt-6">
              <Link href={nextUrl} className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                Lanjutkan Sekarang
              </Link>
            </div>
          </div>
        )}
        
        {hasError && (
          <div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Verifikasi Gagal</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Link verifikasi tidak valid atau telah kedaluwarsa. Silakan coba lagi atau minta link baru.
            </p>
             <div className="mt-6">
              <Link href="/register" className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                Daftar Ulang
              </Link>
            </div>
          </div>
        )}

        {!isSuccess && !hasError && (
            <div>
                 <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Memverifikasi...</h1>
                 <p className="mt-4 text-gray-600 dark:text-gray-300">
                    Mohon tunggu sebentar selagi kami memproses verifikasi Anda.
                </p>
            </div>
        )}
      </div>
    </div>
  )
}


export default function AuthStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthStatusComponent />
        </Suspense>
    )
}
