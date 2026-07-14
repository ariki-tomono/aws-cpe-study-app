import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts'
import { CARDS, MODULES } from '../data/cards'
import { useStudyStore } from '../stores/useStudyStore'

export default function Analytics() {
  const { progress, dailyRecords, quizHistory, resetProgress } = useStudyStore()

  // 日別学習データ（直近7日）
  const dailyData = useMemo(() => {
    const last7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const record = dailyRecords.find((r) => r.date === dateStr)
      last7.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        cards: record?.cardsStudied || 0,
        correct: record?.correctAnswers || 0,
      })
    }
    return last7
  }, [dailyRecords])

  // Module別正答率（レーダーチャート用）
  const radarData = useMemo(() => {
    return MODULES.map((mod) => {
      const moduleCards = CARDS.filter((c) => c.module === mod)
      const cardIds = moduleCards.map((c) => c.id)
      const results = quizHistory.filter((h) => cardIds.includes(h.cardId))
      const correct = results.filter((r) => r.correct).length
      const total = results.length
      const rate = total > 0 ? Math.round((correct / total) * 100) : 0
      const shortName = mod.replace(/Module \d+: /, '').slice(0, 10)
      return { module: shortName, rate }
    })
  }, [quizHistory])

  // 苦手カードTop10
  const weakCards = useMemo(() => {
    return Object.values(progress)
      .filter((p) => p.incorrectCount > 0)
      .sort((a, b) => {
        const aRate = a.correctCount / (a.correctCount + a.incorrectCount)
        const bRate = b.correctCount / (b.correctCount + b.incorrectCount)
        return aRate - bRate
      })
      .slice(0, 10)
      .map((p) => {
        const card = CARDS.find((c) => c.id === p.cardId)
        const rate = Math.round(
          (p.correctCount / (p.correctCount + p.incorrectCount)) * 100
        )
        return { title: card?.title || '', rate, module: card?.module || '' }
      })
  }, [progress])

  const totalAnswered = quizHistory.length
  const totalCorrect = quizHistory.filter((h) => h.correct).length
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <div className="space-y-5">
      {/* 全体統計 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-aws-blue/50 rounded p-2 text-center">
          <div className="text-base font-bold text-emerald-400">{totalAnswered}</div>
          <div className="text-[10px] text-gray-400">回答数</div>
        </div>
        <div className="bg-aws-blue/50 rounded p-2 text-center">
          <div className="text-base font-bold text-emerald-400">{overallRate}%</div>
          <div className="text-[10px] text-gray-400">正答率</div>
        </div>
        <div className="bg-aws-blue/50 rounded p-2 text-center">
          <div className="text-base font-bold text-emerald-400">
            {Object.values(progress).filter((p) => p.repetitions >= 3).length}
          </div>
          <div className="text-[10px] text-gray-400">習得済み</div>
        </div>
      </div>

      {/* 日別学習グラフ */}
      <div className="bg-aws-blue/30 rounded-lg p-3">
        <h3 className="text-[11px] font-semibold text-aws-orange mb-2">
          直近7日間の学習
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={dailyData}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#888' }} />
            <YAxis tick={{ fontSize: 9, fill: '#888' }} width={25} />
            <Tooltip
              contentStyle={{ fontSize: 10, background: '#1a1a2e', border: '1px solid #333' }}
            />
            <Bar dataKey="cards" fill="#10b981" name="学習カード" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Module別レーダーチャート */}
      <div className="bg-aws-blue/30 rounded-lg p-3">
        <h3 className="text-[11px] font-semibold text-aws-orange mb-2">
          Module別正答率
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="module" tick={{ fontSize: 8, fill: '#aaa' }} />
            <Radar
              dataKey="rate"
              stroke="#ff9900"
              fill="#ff9900"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 苦手カード */}
      {weakCards.length > 0 && (
        <div className="bg-aws-blue/30 rounded-lg p-3">
          <h3 className="text-[11px] font-semibold text-aws-orange mb-2">
            苦手カード Top {weakCards.length}
          </h3>
          <div className="space-y-1">
            {weakCards.map((card, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[11px] py-1 border-b border-gray-700/50"
              >
                <span className="text-gray-300 truncate max-w-[70%]">
                  {card.title}
                </span>
                <span className="text-red-400 font-mono">{card.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* リセット */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            if (confirm('学習データをすべてリセットしますか？')) {
              resetProgress()
            }
          }}
          className="text-[10px] text-gray-500 hover:text-red-400 underline"
        >
          学習データをリセット
        </button>
      </div>
    </div>
  )
}
