'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubjectSelection } from './subject-selection'
import  Results  from './results'
import { HistoricalReview } from './historical-review'
import { LogOut, BookOpen, ChartBar, History, User } from 'lucide-react'

interface User {
  name: string;
  email: string;
}

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('subjects')
  const router = useRouter()

  useEffect(() => {
    const storedResults = localStorage.getItem('results')
    if (!storedResults) {
      localStorage.setItem('results', JSON.stringify([]))
    }
  }, [])

  const handleSubjectSelect = (subject: string, level: string) => {
    router.push(`/test?subject=${encodeURIComponent(subject)}&level=${encodeURIComponent(level)}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Card className="mb-8 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-primary-foreground rounded-full p-3">
                <User size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome, {user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardHeader>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 gap-4">
                <TabsTrigger value="subjects" className="flex items-center justify-center">
                  <BookOpen className="mr-2 h-4 w-4" /> Subjects
                </TabsTrigger>
                <TabsTrigger value="review" className="flex items-center justify-center">
                  <History className="mr-2 h-4 w-4" /> Results
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center justify-center">
                  <ChartBar className="mr-2 h-4 w-4" /> Historical Review
                </TabsTrigger>
              </TabsList>
              <TabsContent value="subjects">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Subjects</CardTitle>
                    <CardDescription>Choose a subject to start a new test</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubjectSelection onStartTest={handleSubjectSelect} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Results</CardTitle>
                    <CardDescription>View your recent test results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Results user={user} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="review">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Review</CardTitle>
                    <CardDescription>Review your past performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HistoricalReview user={user} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}