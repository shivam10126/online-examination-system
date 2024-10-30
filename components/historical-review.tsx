'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Eye, FileX2, Search } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TestDetailsModal } from './test-details-modal'
import jsPDF from 'jspdf'

interface User {
  name: string;
  email: string;
}

interface HistoricalReviewProps {
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

export function HistoricalReview({ user }: HistoricalReviewProps) {
  const [historicalData, setHistoricalData] = useState<TestResult[]>([])
  const [filteredData, setFilteredData] = useState<TestResult[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('All')
  const [selectedLevel, setSelectedLevel] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [minScore, setMinScore] = useState<number>(0)
  const [maxScore, setMaxScore] = useState<number>(100)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null)

  useEffect(() => {
    const storedData = localStorage.getItem('results')
    if (storedData) {
      setHistoricalData(JSON.parse(storedData))
    }
  }, [])

  useEffect(() => {
    filterData()
  }, [historicalData, selectedSubject, selectedLevel, searchTerm, minScore, maxScore, startDate, endDate])

  const subjects = ['All', ...new Set(historicalData.map(result => result.subject))]
  const levels = ['All', ...new Set(historicalData.map(result => result.level))]

  const filterData = () => {
    let filtered = historicalData

    if (selectedSubject !== 'All') {
      filtered = filtered.filter(result => result.subject === selectedSubject)
    }

    if (selectedLevel !== 'All') {
      filtered = filtered.filter(result => result.level === selectedLevel)
    }

    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.date.includes(searchTerm) ||
        result.level.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered = filtered.filter(result => {
      const percentage = (result.score / result.questions.length) * 100
      return percentage >= minScore && percentage <= maxScore
    })

    if (startDate) {
      filtered = filtered.filter(result => result.date >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(result => result.date <= endDate)
    }

    setFilteredData(filtered)
  }

  const handleViewTest = (test: TestResult) => {
    setSelectedTest(test)
    setIsModalOpen(true)
  }

  const handleDownloadTest = (test: TestResult) => {
    const pdf = new jsPDF()
    let yOffset = 20

    // Set font styles
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(18)
    pdf.text("Online Examination - LearnEdge", 105, yOffset, { align: "center" })
    yOffset += 15

    pdf.setFontSize(12)
    pdf.text(`Name: ${user.name}`, 20, yOffset)
    pdf.text(`Email: ${user.email}`, 120, yOffset)
    yOffset += 10

    pdf.text(`Subject: ${test.subject}`, 20, yOffset)
    pdf.text(`Level: ${test.level}`, 120, yOffset)
    yOffset += 10

    pdf.text(`Date: ${test.date}`, 20, yOffset)
    pdf.text(`Time: ${test.time}`, 120, yOffset)
    yOffset += 10

    const percentage = ((test.score / test.questions.length) * 100).toFixed(2)
    pdf.text(`Score: ${test.score}/${test.questions.length}`, 20, yOffset)
    pdf.text(`Percentage: ${percentage}%`, 120, yOffset)
    yOffset += 20

    pdf.setFont("helvetica", "bold")
    pdf.text("Questions and Solutions:", 20, yOffset)
    yOffset += 10

    pdf.setFont("helvetica", "normal")
    test.questions.forEach((question, index) => {
      if (yOffset > 270) {
        pdf.addPage()
        yOffset = 20
      }

      pdf.setFont("helvetica", "bold")
      pdf.text(`Question ${index + 1}: ${question.question}`, 20, yOffset)
      yOffset += 10

      pdf.setFont("helvetica", "normal")
      question.options.forEach((option, optionIndex) => {
        let optionText = `${String.fromCharCode(97 + optionIndex)}) ${option}`
        if (option === question.chosen) optionText += " (Your Answer)"
        if (option === question.correctOption) optionText += " (Correct Answer)"
        pdf.text(optionText, 30, yOffset)
        yOffset += 7
      })

      const result = question.chosen === question.correctOption ? "Correct" : question.chosen ? "Incorrect" : "Not Answered"
      pdf.text(`Result: ${result}`, 30, yOffset)
      yOffset += 15
    })

    pdf.save(`${test.subject}_${test.level}_${test.date}.pdf`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject-select">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject-select">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search-input">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  placeholder="Search subjects, dates, or levels"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level-select">Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger id="level-select">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Score Range (%)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((result) => (
                  <TableRow key={result.testID}>
                    <TableCell className="font-medium">{result.date} {result.time}</TableCell>
                    <TableCell>{result.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{result.level}</Badge>
                    </TableCell>
                    <TableCell>{result.score} / {result.questions.length}</TableCell>
                    <TableCell>
                      <Badge variant={result.score / result.questions.length >= 0.7 ? "success" : "destructive"}>
                        {((result.score / result.questions.length) * 100).toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleViewTest(result)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadTest(result)}>
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileX2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No results found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {selectedTest && (
        <TestDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          testData={selectedTest}
        />
      )}
    </Card>
  )
}