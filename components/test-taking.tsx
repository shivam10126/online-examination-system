'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { message } from 'antd'

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface TestData {
  description: string;
  questions: Question[];
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

type QuestionStatus = 'not-visited' | 'visited' | 'attempted' | 'revisit';

const DescriptionScreen = ({ description, subject, level, onStart }: { description: string; subject: string; level: string; onStart: () => void }) => (
  <Card className="max-w-2xl mx-auto mt-8">
    <CardHeader>
      <CardTitle>
        <h2 className='text-center mb-5 text-3xl'>Online Examination</h2>
        <div className='flex flex-row text-xl my-2 justify-between'>
          <div> Subject: <span className='font-normal '>{subject}</span></div>
          <div>level: <span className='font-normal '>{level}</span></div>
          </div></CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-4">{description}</p>
      <div className='px-4 py-2 border-2 border-black'>
        <h3 className='capitalize font-bold text-lg mb-2 border-b border-gray-400'>important notes</h3>
        <div className='flex flex-col mb-4'>
  <li>Each question carries 10 marks.</li>
  <li>All questions are multiple-choice with 5 options.</li>
  <li>Only one option can be selected for each question.</li>
  <li>There is no negative marking, so please attempt all questions.</li>
  <li>You can modify your answers at any time before submitting.</li>
  <li>You can navigate to any question using the sidebar buttons.</li>
  <li>There is no fixed time limit for completing the test. Take your time.</li>
  <li>Avoid refreshing or closing the browser during the test as it may result in loss of progress.</li>
  <li>Make sure your internet connection is stable throughout the test.</li>
</div>
      </div>
    </CardContent>
    <CardFooter>
      <Button onClick={onStart}>Start Test</Button>
    </CardFooter>
  </Card>
);

export function TestTaking({ onTestComplete }: { onTestComplete: (result: TestResult) => void }) {
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'Unknown'
  const level = searchParams.get('level') || 'Unknown'

  const [showDescription, setShowDescription] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [testData, setTestData] = useState<TestData | null>(null)
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus[]>([])
  const [answeredCount, setAnsweredCount] = useState(0)

  useEffect(() => {
    const fetchQuestions = async () => {
      if (subject) {
        const module = await import(`@/assets/questions/${subject.toLowerCase()}.jsx`)
        const subjectData = module[subject]
        setTestData(subjectData[level as keyof typeof subjectData] || null)
        setQuestionStatus(new Array(subjectData[level as keyof typeof subjectData].questions.length).fill('not-visited'))
      }
    }

    fetchQuestions()
  }, [subject, level])

  useEffect(() => {
    if (questionStatus.length > 0 && !showDescription) {
      setQuestionStatus(prev => {
        const newStatus = [...prev]
        if (newStatus[currentQuestion] === 'not-visited') {
          newStatus[currentQuestion] = 'visited'
        }
        return newStatus
      })
    }
  }, [currentQuestion, showDescription, questionStatus.length])

  const handleAnswer = useCallback((answer: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [currentQuestion]: answer }
      setAnsweredCount(Object.keys(newAnswers).length)
      return newAnswers
    })
    setQuestionStatus(prev => {
      const newStatus = [...prev]
      newStatus[currentQuestion] = 'attempted'
      return newStatus
    })
  }, [currentQuestion])

  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && currentQuestion < testData!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }, [currentQuestion, testData])

  const handleFinish = useCallback(() => {
    if (answeredCount < Math.ceil(testData!.questions.length / 2)) {
      message.warning('Please attempt at least half of the questions before finishing the test.', 5)
    } else {
      const now = new Date()
      const testResult: TestResult = {
        testID: `${subject}-${level}-${now.toISOString().split('T')[0]}-${now.toTimeString().split(' ')[0]}`,
        questions: testData!.questions.map((q, index) => ({
          question: q.question,
          options: q.options,
          chosen: answers[index] || '',
          correctOption: q.answer
        })),
        score: testData!.questions.reduce((acc, q, index) => acc + (answers[index] === q.answer ? 1 : 0), 0),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        subject: subject,
        level: level
      }
      
      onTestComplete(testResult)
    }
  }, [answers, level, onTestComplete, subject, testData, answeredCount])

  const handleRevisit = useCallback(() => {
    setQuestionStatus(prev => {
      const newStatus = [...prev]
      newStatus[currentQuestion] = 'revisit'
      return newStatus
    })
  }, [currentQuestion])

  const jumpToQuestion = useCallback((index: number) => {
    setCurrentQuestion(index)
  }, [])

  const getQuestionColor = useCallback((status: QuestionStatus, index: number) => {
    if (index === currentQuestion) return 'bg-blue-500'
    switch (status) {
      case 'not-visited': return 'bg-gray-300'
      case 'visited': return 'bg-red-500'
      case 'attempted': return 'bg-green-500'
      case 'revisit': return 'bg-yellow-500'
      default: return 'bg-gray-300'
    }
  }, [currentQuestion])

  const startTest = useCallback(() => {
    setShowDescription(false)
    setQuestionStatus(prev => {
      const newStatus = [...prev]
      newStatus[0] = 'visited'
      return newStatus
    })
  }, [])

  if (!testData) return <div>Loading...</div>

  if (showDescription) {
    return (
      <DescriptionScreen 
        description={testData.description}
        subject={subject}
        level={level}
        onStart={startTest}
      />
    )
  }

  const question = testData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Questions</h2>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {questionStatus.map((status, index) => (
            <button
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getQuestionColor(status, index)}`}
              onClick={() => jumpToQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="mt-auto">
          <h3 className="text-sm font-semibold mb-2">Status Colors</h3>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
            <span className="text-xs">Not Visited</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs">Current Question</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-xs">Visited (Not Attempted)</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs">Attempted</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-xs">Revisit</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">Subject: {subject}</span>
            <span className="text-lg font-semibold">Level: {level}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Question {currentQuestion + 1} of {testData.questions.length}</h2>
            <p className="mb-4">{question.question}</p>
            <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer}>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button 
            onClick={() => handleNavigation('prev')} 
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <div>
            <Button onClick={handleRevisit} variant="outline" className="mr-2">Revisit Later</Button>
            {currentQuestion < testData.questions.length - 1 ? (
              <Button 
                onClick={() => handleNavigation('next')}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleFinish}
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}