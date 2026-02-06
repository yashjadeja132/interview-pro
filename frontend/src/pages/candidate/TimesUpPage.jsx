import React from 'react'
import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress' 
export default function TimesUpPage() {
  return (
  <>
     <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Time's Up!</h2>
          <p className="text-lg text-gray-600 max-w-md text-center">
            We are wrapping up your test and saving your answers. This may take a few seconds...
          </p>
          <div className="mt-8 w-64">
            <Progress value={100} className="h-2 animate-pulse" />
          </div>
        </div>
  </>
  )
}