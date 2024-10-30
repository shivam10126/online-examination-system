'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TestTaking } from '../../components/test-taking'
import { Results } from '../../components/result'

interface User {
  name: string;
  email: string;
}

interface TestResult {
  testID: string;
  questions: {
    question: string;
    options: string[];
    chosen: string;
    correctOption: string;
  }[];
  score: number;
  date: string;
  time: string;
  subject: string;
  level: string;
}

export default function TestPage() {
  const [user, setUser] = useState<User | null>(null)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject')
  const level = searchParams.get('level')

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    } else {
      router.push('/login')
    }
  }, [router])

  const handleTestComplete = (results: TestResult) => {
    setTestResults(results)
    setTestCompleted(true)
    
    // Save the results to local storage
    const storedResults = JSON.parse(localStorage.getItem('results') || '[]')
    storedResults.push(results)
    localStorage.setItem('results', JSON.stringify(storedResults))
  }

  if (!user || !subject || !level) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (testCompleted && testResults) {
    return <Results results={testResults} />
  }

  return (
    <TestTaking onTestComplete={handleTestComplete} />
  )
}