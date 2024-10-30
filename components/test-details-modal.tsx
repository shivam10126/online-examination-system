import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, MinusCircle } from "lucide-react"

interface Question {
  question: string;
  options: string[];
  chosen: string;
  correctOption: string;
}

interface TestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testData: {
    subject: string;
    level: string;
    questions: Question[];
  };
}

export function TestDetailsModal({ isOpen, onClose, testData }: TestDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {testData.subject} - {testData.level}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="space-y-6 p-4">
            {testData.questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h3 className="text-lg font-semibold flex items-center">
                  {question.chosen === question.correctOption && (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  )}
                  {question.chosen && question.chosen !== question.correctOption && (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  {!question.chosen && (
                    <MinusCircle className="w-5 h-5 text-gray-500 mr-2" />
                  )}
                  Question {index + 1}: {question.question}
                </h3>
                <ul className="space-y-1">
                  {question.options.map((option, optionIndex) => (
                    <li
                      key={optionIndex}
                      className={`pl-6 py-1 rounded ${
                        option === question.chosen
                          ? option === question.correctOption
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          : option === question.correctOption
                          ? "bg-blue-100 text-blue-800"
                          : ""
                      }`}
                    >
                      {option}
                      {option === question.chosen && option === question.correctOption && " ✓"}
                      {option === question.chosen && option !== question.correctOption && " ✗"}
                      {option === question.correctOption && option !== question.chosen && " (Correct)"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}