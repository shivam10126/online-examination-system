'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dashboard } from '../components/dashboard'

export default function Home() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in (e.g., by checking localStorage or a cookie)
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    } else {
      router.push('/login')
    }
  }, [router])

  if (!user) {
    return null // or a loading spinner
  }

  return <Dashboard user={user} />
}