'use client'

import { Brain, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface LearningPanelProps {
  progress: number
}

export function LearningPanel({ progress }: LearningPanelProps) {
  const learningModules = [
    { name: 'Pattern Recognition', status: 'complete', accuracy: 94 },
    { name: 'Risk Assessment', status: 'complete', accuracy: 89 },
    { name: 'Market Sentiment', status: 'active', accuracy: 78 },
    { name: 'Position Sizing', status: 'pending', accuracy: null },
  ]

  const recentLearnings = [
    { text: 'Tightened stop-loss parameters by 2.5%', time: '32m ago' },
    { text: 'Adjusted momentum threshold for ES futures', time: '1h ago' },
    { text: 'Updated volatility scaling factors', time: '2h ago' },
    { text: 'Refined entry signal confidence weighting', time: '4h ago' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case 'active':
        return <Clock className="h-4 w-4 text-amber-400" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-slate-400" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            <CardTitle className="text-base font-medium">Learning Engine</CardTitle>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Learning Modules */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-foreground">Active Modules</h4>
          <div className="space-y-2">
            {learningModules.map((module, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(module.status)}
                  <span className="text-sm text-foreground">{module.name}</span>
                </div>
                {module.accuracy !== null && (
                  <span className="text-xs text-muted-foreground">{module.accuracy}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Self-Corrections */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-foreground">Recent Self-Corrections</h4>
          <div className="space-y-2">
            {recentLearnings.map((learning, index) => (
              <div
                key={index}
                className="flex items-start justify-between border-l-2 border-accent/50 pl-3"
              >
                <span className="text-xs text-muted-foreground">{learning.text}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground/60">{learning.time}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
