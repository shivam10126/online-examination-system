import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { message } from 'antd'

const subjects = ['Mathematics', 'Science', 'History', 'Literature']
const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']

export function SubjectSelection({ onStartTest }: { onStartTest: (subject: string, level: string) => void }) {
  const [selectedLevels, setSelectedLevels] = useState<Record<string, string>>({})

  const handleLevelChange = (subject: string, level: string) => {
    setSelectedLevels(prev => ({ ...prev, [subject]: level }))
  }

  const handleStartTest = (subject: string) => {
    if (!selectedLevels[subject]) {
      message.error(`Please select a level for ${subject} first`)
    } else {
      const levelString = selectedLevels[subject].toLowerCase().replace(' ', '')
      onStartTest(subject, levelString)
    }
  }

  return ( 
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {subjects.map((subject) => (
        <Card key={subject}>
          <CardHeader>
            <CardTitle>{subject}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${subject}-level-select`}>Select Level</Label>
              <Select 
                onValueChange={(value) => handleLevelChange(subject, value)} 
                value={selectedLevels[subject] || ""}
              >
                <SelectTrigger id={`${subject}-level-select`}>
                  <SelectValue placeholder="Choose a level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => handleStartTest(subject)} 
              className="w-full"
            >
              Start {subject} Test
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}