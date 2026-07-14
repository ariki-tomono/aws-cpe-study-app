import { useState, useMemo } from 'react'
import { CARDS, Card } from '../data/cards'
import { useStudyStore } from '../stores/useStudyStore'

const EXAM_SIZE = 20
const TIME_LIMIT = 10 * 60

interface ExamQuestion {
  card: Card
  choices: Card[]
}

export default function MockExam() {
  const [phase, setPhase] = useState<'start' | 'exam' | 'result'>('start')
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null)
  const { addQuizResult } = useStudyStore()

  const startExam = () => {
    const shuffled = [...CARDS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, EXAM_SIZE)
    const qs: ExamQuestion[] = selected.map((card) => {
      const others = CARDS.filter((c) => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      const choices = [card, ...others].sort(() => Math.random() - 0.5)
      return { card, choices }
    })
    setQuestions(qs)
    setAnswers(new Array(EXAM_SIZE).fill(null))
    setCurrentQ(0)
    setTimeLeft(TIME_LIMIT)
    setPhase('exam')

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          setPhase('result')
          return 0
        }
        return t - 1
      })
    }, 1000)
    setTimerRef(timer)
  }

  const handleAnswer = (choiceId: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQ] = choiceId
    setAnswers(newAnswers)
  }

  const finishExam = () => {
    if (timerRef) clearInterval(timerRef)
    questions.forEach((q, i) => {
      if (answers[i] !== null) {
        addQuizResult(q.card.id, answers[i] === q.card.id)
      }
    })
    setPhase('result')
  }

  const score = useMemo(() => {
    if (phase !== 'result') return 0
    return questions.filter((q, i) => answers[i] === q.card.id).length
  }, [phase, questions, answers])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (phase === 'start') {
    return (
      <div className="text-center space-y-5 py-10">
        <h2 className="text-base font-bold text-aws-orange">模擬試験</h2>
        <p className="text-sm text-gray-300">
          全Moduleからランダム{EXAM_SIZE}問、制限時間{TIME_LIMIT / 60}分
        </p>
        <p className="text-xs text-gray-400">
          説明文からサービス名を選ぶ4択形式です
        </p>
        <button
          onClick={startExam}
          className="px-6 py-2.5 bg-aws-orange text-aws-navy rounded-lg text-sm font-bold hover:bg-yellow-500"
        >
          試験開始
        </button>
      </div>
    )
  }

  if (phase === 'result') {
    const percentage = Math.round((score / EXAM_SIZE) * 100)
    return (
      <div className="space-y-5">
        <div className="text-center py-5">
          <h2 className="text-base font-bold text-aws-orange mb-3">結果</h2>
          <div className="text-4xl font-bold text-emerald-400">
            {score} / {EXAM_SIZE}
          </div>
          <div className="text-sm text-gray-400 mt-1">{percentage}% 正解</div>
          <div
            className={`text-sm mt-2 ${
              percentage >= 70 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {percentage >= 70 ? '合格ライン到達！' : 'もう少し頑張りましょう'}
          </div>
        </div>

        <div className="space-y-2">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`p-3 rounded text-sm border ${
                answers[i] === q.card.id
                  ? 'bg-emerald-900/30 border-emerald-700'
                  : 'bg-red-900/30 border-red-700'
              }`}
            >
              <span className="font-medium">Q{i + 1}:</span> {q.card.title}
              {answers[i] !== q.card.id && (
                <span className="text-red-300 ml-2 text-xs">
                  (あなたの回答: {questions[i].choices.find(c => c.id === answers[i])?.title || '未回答'})
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setPhase('start')}
            className="px-5 py-2 bg-aws-orange text-aws-navy rounded text-sm font-bold"
          >
            もう一度
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">
          Q{currentQ + 1} / {EXAM_SIZE}
        </span>
        <span
          className={`font-mono ${
            timeLeft < 60 ? 'text-red-400' : 'text-gray-400'
          }`}
        >
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>

      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-aws-orange transition-all"
          style={{ width: `${((currentQ + 1) / EXAM_SIZE) * 100}%` }}
        />
      </div>

      <div className="bg-gradient-to-br from-aws-blue to-aws-navy border border-blue-800 rounded-xl p-5 text-center">
        <div className="text-xs text-aws-orange mb-2">{q.card.module}</div>
        <div className="text-sm leading-relaxed">
          「{q.card.description}」に該当するサービスは？
        </div>
      </div>

      <div className="space-y-2">
        {q.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleAnswer(choice.id)}
            className={`w-full text-left px-4 py-3 border rounded-lg text-sm transition ${
              answers[currentQ] === choice.id
                ? 'bg-aws-orange/20 border-aws-orange'
                : 'bg-aws-blue border-gray-600 hover:bg-aws-blue/80'
            }`}
          >
            {choice.title}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 bg-aws-blue border border-gray-600 rounded text-sm disabled:opacity-40"
        >
          ◀ 前へ
        </button>
        {currentQ < EXAM_SIZE - 1 ? (
          <button
            onClick={() => setCurrentQ((q) => q + 1)}
            className="px-4 py-2 bg-aws-blue border border-gray-600 rounded text-sm"
          >
            次へ ▶
          </button>
        ) : (
          <button
            onClick={finishExam}
            className="px-5 py-2 bg-aws-orange text-aws-navy rounded text-sm font-bold"
          >
            提出する
          </button>
        )}
      </div>
    </div>
  )
}
