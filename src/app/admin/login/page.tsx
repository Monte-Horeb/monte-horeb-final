import { Suspense } from 'react'
import Image from 'next/image'
import { churchInfo } from '@/content/church-info'
import LoginForm from '@/components/admin/LoginForm'

export const metadata = { title: 'Admin Login | Iglesia Monte Horeb' }

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src={churchInfo.logo}
            alt="Logo"
            width={64}
            height={64}
            className="mx-auto rounded-full mb-4"
          />
          <h1 className="text-2xl font-bold text-neutral-900">Admin Login</h1>
          <p className="text-neutral-500 text-sm mt-1">{churchInfo.name}</p>
        </div>

        {/*
          LoginForm reads search params, which requires a Suspense boundary
          during static prerendering - without it the build fails with
          "useSearchParams() should be wrapped in a suspense boundary".
        */}
        <Suspense
          fallback={<div className="card card-body h-64 animate-pulse bg-neutral-100" />}
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
