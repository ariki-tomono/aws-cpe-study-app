import { useState, useMemo, useCallback } from 'react'
import { CARDS, MODULES } from '../data/cards'
import { useStudyStore } from '../stores/useStudyStore'

export default function FlashCard() {
  const [moduleFilter, setModuleFilter] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const { reviewCard, getCardProgress } = useStudyStore()

  const filteredCards = useMemo(() => {
    const cards =
      moduleFilter === 'all'
        ? [...CARDS]
        : CARDS.filter((c) => c.module === moduleFilter)
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }
    return cards
  }, [moduleFilter])

  const card = filteredCards[currentIndex]
  const progress = card ? getCardProgress(card.id) : null

  const handleNext = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex((i) => (i + 1) % filteredCards.length)
  }, [filteredCards.length])

  const handlePrev = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex(
      (i) => (i - 1 + filteredCards.length) % filteredCards.length
    )
  }, [filteredCards.length])

  const handleRate = (quality: number) => {
    if (card) {
      reviewCard(card.id, quality)
    }
    handleNext()
  }

  if (!card) return <div className="text-center text-gray-400">カードがありません</div>

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <select
        value={moduleFilter}
        onChange={(e) => {
          setModuleFilter(e.target.value)
          setCurrentIndex(0)
          setIsFlipped(false)
        }}
        className="w-full bg-aws-blue border border-gray-600 rounded px-3 py-1.5 text-xs text-gray-200"
      >
        <option value="all">全Module</option>
        {MODULES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* 進捗 */}
      <div className="text-center text-[11px] text-gray-400">
        {currentIndex + 1} / {filteredCards.length}
        {progress && progress.repetitions > 0 && (
          <span className="ml-2 text-emerald-400">
            (復習{progress.repetitions}回目)
          </span>
        )}
      </div>

      {/* カード */}
      <div
        className="perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full min-h-[200px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* 表面 */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-aws-blue to-aws-navy border border-blue-800 rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <div className="text-[10px] text-aws-orange mb-2">
              {card.module}
            </div>
            <div className="text-sm font-bold">{card.title}</div>
            <div className="text-[10px] text-gray-500 mt-3">
              クリックで説明を表示
            </div>
          </div>

          {/* 裏面 */}
          <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] bg-gradient-to-br from-emerald-900/50 to-aws-navy border border-emerald-800 rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <div className="text-[10px] text-aws-orange mb-2">
              {card.module}
            </div>
            <div className="text-xs font-bold mb-2">{card.title}</div>
            <div className="text-xs text-gray-300 leading-relaxed">
              {card.description}
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-center gap-2">
        <button
          onClick={handlePrev}
          className="px-3 py-1.5 bg-aws-blue border border-gray-600 rounded text-xs hover:bg-opacity-80"
        >
          ◀ 前へ
        </button>
        <button
          onClick={() => handleRate(1)}
          className="px-3 py-1.5 bg-red-900/50 border border-red-700 rounded text-xs hover:bg-red-800/50"
        >
          ✗ 忘れた
        </button>
        <button
          onClick={() => handleRate(3)}
          className="px-3 py-1.5 bg-yellow-900/50 border border-yellow-700 rounded text-xs hover:bg-yellow-800/50"
        >
          △ 曖昧
        </button>
        <button
          onClick={() => handleRate(5)}
          className="px-3 py-1.5 bg-emerald-900/50 border border-emerald-700 rounded text-xs hover:bg-emerald-800/50"
        >
          ✓ 覚えた
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1.5 bg-aws-blue border border-gray-600 rounded text-xs hover:bg-opacity-80"
        >
          次へ ▶
        </button>
      </div>
    </div>
  )
}
