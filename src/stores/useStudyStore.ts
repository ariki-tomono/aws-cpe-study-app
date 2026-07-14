import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CardProgress {
  cardId: number
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: number // timestamp
  lastReview: number
  correctCount: number
  incorrectCount: number
}

export interface DailyRecord {
  date: string // YYYY-MM-DD
  cardsStudied: number
  correctAnswers: number
  totalAnswers: number
  minutesStudied: number
}

interface StudyState {
  progress: Record<number, CardProgress>
  dailyRecords: DailyRecord[]
  currentStreak: number
  sessionStartTime: number | null
  quizHistory: { cardId: number; correct: boolean; timestamp: number }[]

  // Actions
  reviewCard: (cardId: number, quality: number) => void
  startSession: () => void
  endSession: () => void
  addQuizResult: (cardId: number, correct: boolean) => void
  getCardProgress: (cardId: number) => CardProgress
  getDueCards: (moduleFilter?: string) => number[]
  getTodayRecord: () => DailyRecord
  resetProgress: () => void
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

// SM-2 Algorithm
function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): { repetitions: number; easeFactor: number; interval: number } {
  if (quality < 3) {
    return { repetitions: 0, easeFactor, interval: 1 }
  }

  let newInterval: number
  if (repetitions === 0) {
    newInterval = 1
  } else if (repetitions === 1) {
    newInterval = 6
  } else {
    newInterval = Math.round(interval * easeFactor)
  }

  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  return {
    repetitions: repetitions + 1,
    easeFactor: newEaseFactor,
    interval: newInterval,
  }
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      progress: {},
      dailyRecords: [],
      currentStreak: 0,
      sessionStartTime: null,
      quizHistory: [],

      reviewCard: (cardId: number, quality: number) => {
        const state = get()
        const current = state.getCardProgress(cardId)
        const result = sm2(
          quality,
          current.repetitions,
          current.easeFactor,
          current.interval
        )

        const now = Date.now()
        const nextReview = now + result.interval * 24 * 60 * 60 * 1000

        set((s) => ({
          progress: {
            ...s.progress,
            [cardId]: {
              cardId,
              easeFactor: result.easeFactor,
              interval: result.interval,
              repetitions: result.repetitions,
              nextReview,
              lastReview: now,
              correctCount:
                current.correctCount + (quality >= 3 ? 1 : 0),
              incorrectCount:
                current.incorrectCount + (quality < 3 ? 1 : 0),
            },
          },
        }))
      },

      startSession: () => set({ sessionStartTime: Date.now() }),

      endSession: () => {
        const state = get()
        if (!state.sessionStartTime) return
        const minutes = Math.round(
          (Date.now() - state.sessionStartTime) / 60000
        )
        const today = getToday()
        const records = [...state.dailyRecords]
        const todayIdx = records.findIndex((r) => r.date === today)
        if (todayIdx >= 0) {
          records[todayIdx] = {
            ...records[todayIdx],
            minutesStudied: records[todayIdx].minutesStudied + minutes,
          }
        }
        set({ dailyRecords: records, sessionStartTime: null })
      },

      addQuizResult: (cardId: number, correct: boolean) => {
        const state = get()
        const today = getToday()
        const records = [...state.dailyRecords]
        const todayIdx = records.findIndex((r) => r.date === today)

        if (todayIdx >= 0) {
          records[todayIdx] = {
            ...records[todayIdx],
            cardsStudied: records[todayIdx].cardsStudied + 1,
            totalAnswers: records[todayIdx].totalAnswers + 1,
            correctAnswers:
              records[todayIdx].correctAnswers + (correct ? 1 : 0),
          }
        } else {
          records.push({
            date: today,
            cardsStudied: 1,
            correctAnswers: correct ? 1 : 0,
            totalAnswers: 1,
            minutesStudied: 0,
          })
        }

        // Update streak
        let streak = 1
        const sorted = records
          .map((r) => r.date)
          .sort()
          .reverse()
        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(sorted[i - 1])
          const curr = new Date(sorted[i])
          const diff =
            (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
          if (diff <= 1) streak++
          else break
        }

        set({
          dailyRecords: records,
          currentStreak: streak,
          quizHistory: [
            ...state.quizHistory,
            { cardId, correct, timestamp: Date.now() },
          ],
        })

        // Also update SM-2
        state.reviewCard(cardId, correct ? 4 : 1)
      },

      getCardProgress: (cardId: number): CardProgress => {
        const state = get()
        return (
          state.progress[cardId] || {
            cardId,
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReview: 0,
            lastReview: 0,
            correctCount: 0,
            incorrectCount: 0,
          }
        )
      },

      getDueCards: (_moduleFilter?: string): number[] => {
        const state = get()
        const now = Date.now()
        // This returns IDs of cards that are due for review
        // Filtering by module should be done by the caller using CARDS data
        return Object.entries(state.progress)
          .filter(([, p]) => p.nextReview <= now)
          .map(([id]) => Number(id))
      },

      getTodayRecord: (): DailyRecord => {
        const state = get()
        const today = getToday()
        return (
          state.dailyRecords.find((r) => r.date === today) || {
            date: today,
            cardsStudied: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            minutesStudied: 0,
          }
        )
      },

      resetProgress: () =>
        set({
          progress: {},
          dailyRecords: [],
          currentStreak: 0,
          quizHistory: [],
        }),
    }),
    { name: 'aws-cpe-study-store' }
  )
)
