import { CARDS, MODULES } from '../data/cards'
import { useStudyStore } from '../stores/useStudyStore'

export default function Dashboard() {
  const { progress, currentStreak, getTodayRecord } = useStudyStore()
  const today = getTodayRecord()

  const totalCards = CARDS.length
  const studiedCards = Object.keys(progress).length
  const masteredCards = Object.values(progress).filter(
    (p) => p.repetitions >= 3
  ).length

  const moduleStats = MODULES.map((mod) => {
    const cards = CARDS.filter((c) => c.module === mod)
    const studied = cards.filter((c) => progress[c.id]).length
    const mastered = cards.filter(
      (c) => progress[c.id]?.repetitions >= 3
    ).length
    return { module: mod, total: cards.length, studied, mastered }
  })

  return (
    <div className="space-y-4">
      {/* 全体サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="総カード" value={totalCards} />
        <StatCard label="学習済み" value={studiedCards} />
        <StatCard label="習得済み" value={masteredCards} />
        <StatCard label="連続学習" value={`${currentStreak}日`} />
      </div>

      {/* 今日の進捗 */}
      <div className="bg-aws-blue/50 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-aws-orange mb-2">
          今日の学習
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-emerald-400">
              {today.cardsStudied}
            </div>
            <div className="text-[10px] text-gray-400">カード</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400">
              {today.totalAnswers > 0
                ? Math.round(
                    (today.correctAnswers / today.totalAnswers) * 100
                  )
                : 0}
              %
            </div>
            <div className="text-[10px] text-gray-400">正答率</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400">
              {today.minutesStudied}分
            </div>
            <div className="text-[10px] text-gray-400">学習時間</div>
          </div>
        </div>
      </div>

      {/* Module別進捗 */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-aws-orange">
          Module別進捗
        </h3>
        {moduleStats.map((stat) => (
          <div key={stat.module} className="bg-aws-blue/30 rounded p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-gray-300 truncate max-w-[70%]">
                {stat.module}
              </span>
              <span className="text-[10px] text-gray-400">
                {stat.mastered}/{stat.total}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${(stat.mastered / stat.total) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-aws-blue/50 rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-emerald-400">{value}</div>
      <div className="text-[10px] text-gray-400">{label}</div>
    </div>
  )
}
