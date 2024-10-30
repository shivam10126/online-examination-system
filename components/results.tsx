'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingDown, TrendingUp, Minus, Calendar, Clock, Award } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { NoResultsScreen } from './no-results-screen'

interface User {
  name: string;
  email: string;
}

interface ResultsProps {
  user: User;
}

interface Question {
  question: string;
  options: string[];
  chosen: string;
  correctOption: string;
}

interface TestResult {
  testID: string;
  questions: Question[];
  score: number;
  date: string;
  time: string;
  subject: string;
  level: string;
}

interface SubjectResults {
  [subject: string]: TestResult[];
}

export default function Results({ user }: ResultsProps) {
  const [results, setResults] = useState<SubjectResults>({})
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedResults = localStorage.getItem('results')
    if (storedResults) {
      const parsedResults: TestResult[] = JSON.parse(storedResults)
      const groupedResults = parsedResults.reduce((acc, result) => {
        if (!acc[result.subject]) {
          acc[result.subject] = []
        }
        acc[result.subject].push(result)
        return acc
      }, {} as SubjectResults)

      setResults(groupedResults)
      setSelectedSubject(Object.keys(groupedResults)[0] || '')
    }
    setLoading(false)
  }, [])

  const getAverageScore = (subjectResults: TestResult[]) => {
    const totalScore = subjectResults.reduce((sum, result) => sum + (result.score / result.questions.length) * 100, 0)
    return (totalScore / subjectResults.length).toFixed(2)
  }

  const getScoreTrend = (subjectResults: TestResult[]) => {
    if (subjectResults.length < 2) return 'neutral'
    const sortedResults = [...subjectResults].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstScore = sortedResults[0].score / sortedResults[0].questions.length
    const lastScore = sortedResults[sortedResults.length - 1].score / sortedResults[sortedResults.length - 1].questions.length
    return lastScore > firstScore ? 'improving' : lastScore < firstScore ? 'declining' : 'neutral'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (Object.keys(results).length === 0) {
    return <NoResultsScreen />
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Performance Overview</CardTitle>
          <CardDescription>Your overall performance across all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results).map(([subject, subjectResults]) => {
              const averageScore = parseFloat(getAverageScore(subjectResults))
              const trend = getScoreTrend(subjectResults)
              return (
                <Card key={subject} className="relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{subject}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-3xl font-bold">{averageScore.toFixed(0)}%</span>
                      <Badge variant={trend === 'improving' ? 'success' : trend === 'declining' ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                        {getTrendIcon(trend)}
                        {trend.charAt(0).toUpperCase() + trend.slice(1)}
                      </Badge>
                    </div>
                    <Progress value={averageScore} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on {subjectResults.length} test{subjectResults.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={selectedSubject} onValueChange={setSelectedSubject}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-4">
          {Object.keys(results).map((subject) => (
            <TabsTrigger key={subject} value={subject} className="text-center">
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(results).map(([subject, subjectResults]) => (
          <TabsContent key={subject} value={subject}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Results - {subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {subjectResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((result, index) => (
                      <div key={index} className="mb-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{result.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{result.time}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{result.level}</Badge>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold">{((result.score / result.questions.length) * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                        <Progress value={(result.score / result.questions.length) * 100} className="mt-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Score: {result.score}/{result.questions.length}
                        </p>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Progress Over Time - {subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={subjectResults.map(result => ({
                          date: result.date,
                          score: (result.score / result.questions.length) * 100
                        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}