'use client';

import { StatCard } from './StatCard';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';
import { LineChart } from './charts/LineChart';
import { RatingChart } from './charts/RatingChart';
import type { NormalizedAnalytics, NormalizedQuestionMetric } from '@/hooks/useAnalytics';
import type { Question } from '@/services/forms/forms.types';

interface DashboardProps {
  analytics: NormalizedAnalytics;
  questions: Question[];
  groupBy: 'day' | 'week' | 'month';
  onGroupByChange: (value: 'day' | 'week' | 'month') => void;
}

function QuestionSection({
  metric,
  question,
}: {
  metric: NormalizedQuestionMetric;
  question?: Question;
}) {
  const label = question?.label ?? metric.questionId;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 font-medium">{label}</h3>
      {(metric.type === 'radio' || metric.type === 'dropdown') && metric.pieData && (
        <PieChart data={metric.pieData} />
      )}
      {metric.type === 'toggle' && metric.pieData && <PieChart data={metric.pieData} />}
      {metric.type === 'checkbox' && metric.barData && <BarChart data={metric.barData} />}
      {metric.type === 'number' && (
        <div className="space-y-3">
          {metric.numberStats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Média" value={metric.numberStats.avg.toFixed(1)} />
              <StatCard label="Mediana" value={metric.numberStats.median.toFixed(1)} />
              <StatCard label="Mínimo" value={metric.numberStats.min} />
              <StatCard label="Máximo" value={metric.numberStats.max} />
            </div>
          )}
          {metric.barData && <BarChart data={metric.barData} />}
        </div>
      )}
      {metric.type === 'date' && metric.lineData && <LineChart data={metric.lineData} />}
      {metric.type === 'rating' && metric.ratingData && (
        <RatingChart data={metric.ratingData} avg={metric.ratingAvg ?? 0} />
      )}
      {(metric.type === 'text' || metric.type === 'textarea' || metric.type === 'email') && (
        <ul className="space-y-1">
          {metric.recentResponses && metric.recentResponses.length > 0 ? (
            metric.recentResponses.map((r, i) => (
              <li key={i} className="rounded bg-muted/50 px-3 py-2 text-sm">
                {r}
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">Nenhuma resposta ainda.</li>
          )}
        </ul>
      )}
      {metric.type === 'file' && (
        <StatCard label="Total de uploads" value={metric.totalUploads ?? 0} />
      )}
    </div>
  );
}

export function Dashboard({ analytics, questions, groupBy, onGroupByChange }: DashboardProps) {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total de respostas" value={analytics.totalResponses} />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Respostas ao longo do tempo</h2>
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onGroupByChange(g)}
                className={`rounded px-3 py-1 text-sm ${
                  groupBy === g
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {g === 'day' ? 'Dia' : g === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>
        {analytics.overTimeData.length > 0 ? (
          <LineChart data={analytics.overTimeData} />
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Sem dados ainda.</p>
        )}
      </div>

      {analytics.questionMetrics.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold">Por pergunta</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {analytics.questionMetrics.map((metric) => (
              <QuestionSection
                key={metric.questionId}
                metric={metric}
                question={questionMap.get(metric.questionId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
