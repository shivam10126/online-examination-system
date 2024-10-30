'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '../../components/login-form'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (name, email) => {
    // In a real app, you'd validate the login with a backend
    const user = { name, email }
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/')
  }

  return <LoginForm onLogin={handleLogin} />
}