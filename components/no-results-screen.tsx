import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileX2, BookOpen, Trophy } from "lucide-react"
import Link from "next/link"

export function NoResultsScreen() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <FileX2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">No Results Found</CardTitle>
        <CardDescription>You haven't taken any tests yet.</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Start your learning journey by taking a test. Your results will appear here once you've completed a test.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Learn</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Achieve</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/subject-selection">
          <Button>Start a Test</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}