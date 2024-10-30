'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, LayoutDashboard } from 'lucide-react'

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

export function Results({ results }: { results: TestResult }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const handleBackToDashboard = () => {
    router.push('/')
  }

  const handleAttemptNextLevel = () => {
    const percentage = (results.score / results.questions.length) * 100
    if (percentage > 50) {
      const nextLevel = getNextLevel(results.level)
      router.push(`/test?subject=${results.subject}&level=${nextLevel}`)
    } else {
      setShowModal(true)
    }
  }

  const getNextLevel = (currentLevel: string) => {
    const levels = ['level1', 'level2', 'level3', 'level4', 'level5']
    const currentIndex = levels.indexOf(currentLevel)
    return levels[currentIndex + 1] || currentLevel
  }

  const percentage = ((results.score / results.questions.length) * 100).toFixed(2)
  const isPassing = parseFloat(percentage) > 50

  return (
    <>
      <Card className="max-w-2xl mx-auto mt-8 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative inline-flex">
              <Progress
                value={parseFloat(percentage)}
                className="w-40 h-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{percentage}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="text-lg font-semibold">{results.subject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-lg font-semibold">{results.level}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-lg font-semibold">{results.score} / {results.questions.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={isPassing ? "success" : "destructive"} className="mt-1">
                {isPassing ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1" /> Pass</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-1" /> Fail</>
                )}
              </Badge>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-4">
            To review your detailed test score and answers, please check the Results section on your dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleBackToDashboard} variant="outline">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={handleAttemptNextLevel}>
            Attempt Next Level
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Unable to Attempt Next Level
            </DialogTitle>
            <DialogDescription>
              Sorry, you don't meet the requirements to attempt the next level of {results.subject}. 
              <br /><br />
              <strong>Tip:</strong> Score above 50% to unlock the next level.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}