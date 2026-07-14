import { useState, useMemo } from 'react'
import { CARDS, MODULES, Card } from '../data/cards'
import { useStudyStore } from '../stores/useStudyStore'

type QuizMode = 'desc-to-title' | 'title-to-desc'

export default function Quiz() {
  const [moduleFilter, setModuleFilter] = useState('all')
  const [mode, setMode] = useState<QuizMode>('desc-to-title')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const { addQuizResult } = useStudyStore()

  const filteredCards = useMemo(() => {
    const cards =
      moduleFilter === 'all'
        ? [...CARDS]
        : CARDS.filter((c) => c.module === moduleFilter)
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }
    return cards
  }, [moduleFilter])

  const card = filteredCards[currentIndex]

  const choices = useMemo(() => {
    if (!card) return []
    const others = CARDS.filter((c) => c.id !== card.id)
    const picks: Card[] = [card]
    while (picks.length < 4 && others.length > 0) {
      const idx = Math.floor(Math.random() * others.length)
      picks.push(others.splice(idx, 1)[0])
    }
    for (let i = picks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[picks[i], picks[j]] = [picks[j], picks[i]]
    }
    return picks
  }, [card])

  const handleSelect = (choiceId: number) => {
    if (answered) return
    setSelected(choiceId)
    setAnswered(true)
    const correct = choiceId === card.id
    addQuizResult(card.id, correct)
  }

  const handleNext = () => {
    setSelected(null)
    setAnswered(false)
    setCurrentIndex((i) => (i + 1) % filteredCards.length)
  }

  if (!card) return <div className="text-center text-gray-400">カードがありません</div>

  return (
    <div className="space-y-5">
      {/* コントロール */}
      <div className="flex gap-2">
        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value)
            setCurrentIndex(0)
            setSelected(null)
            setAnswered(false)
          }}
          className="flex-1 bg-aws-blue border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
        >
          <option value="all">全Module</option>
          {MODULES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as QuizMode)
            setCurrentIndex(0)
            setSelected(null)
            setAnswered(false)
          }}
          className="bg-aws-blue border border-gray-600 rounded px-3 py-2 text-sm text-gray-200"
        >
          <option value="desc-to-title">説明→サービス名</option>
          <option value="title-to-desc">サービス名→説明</option>
        </select>
      </div>

      {/* 進捗 */}
      <div className="text-center text-sm text-gray-400">
        {currentIndex + 1} / {filteredCards.length}
      </div>

      {/* 問題 */}
      <div className="bg-gradient-to-br from-aws-blue to-aws-navy border border-blue-800 rounded-xl p-5 text-center">
        <div className="text-xs text-aws-orange mb-2">{card.module}</div>
        <div className="text-sm leading-relaxed">
          {mode === 'desc-to-title'
            ? `「${card.description}」に該当するサービスは？`
            : `「${card.title}」の説明はどれですか？`}
        </div>
      </div>

      {/* 選択肢 */}
      <div className="space-y-2">
        {choices.map((choice) => {
          let btnClass = 'bg-aws-blue border-gray-600 hover:bg-aws-blue/80'
          if (answered) {
            if (choice.id === card.id) {
              btnClass = 'bg-emerald-900/60 border-emerald-600'
            } else if (choice.id === selected) {
              btnClass = 'bg-red-900/60 border-red-600'
            }
          }
          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              disabled={answered}
              className={`w-full text-left px-4 py-3 border rounded-lg text-sm transition ${btnClass} disabled:cursor-default`}
            >
              {mode === 'desc-to-title' ? choice.title : choice.description}
            </button>
          )
        })}
      </div>

      {/* 結果 */}
      {answered && (
        <div
          className={`text-center text-sm p-3 rounded ${
            selected === card.id
              ? 'bg-emerald-900/40 text-emerald-300'
              : 'bg-red-900/40 text-red-300'
          }`}
        >
          {selected === card.id
            ? '✓ 正解！'
            : `✗ 不正解… 正解は「${mode === 'desc-to-title' ? card.title : card.description}」`}
        </div>
      )}

      {/* 次へ */}
      <div className="text-center">
        <button
          onClick={handleNext}
          className="px-5 py-2 bg-aws-orange text-aws-navy rounded text-sm font-bold hover:bg-yellow-500"
        >
          次の問題 ▶
        </button>
      </div>
    </div>
  )
}
