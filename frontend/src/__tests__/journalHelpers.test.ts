import {
  dayTs,
  isSameDay,
  isInRange,
  rangeEdge,
  extractDateLine,
  reconstructContent,
} from '@/components/JournalsClient'

// ─── dayTs ────────────────────────────────────────────────────────────────────

describe('dayTs', () => {
  it('returns midnight timestamp for a given date', () => {
    const date = new Date('2024-01-15T14:30:00')
    const expected = new Date(2024, 0, 15).getTime()
    expect(dayTs(date)).toBe(expected)
  })

  it('returns the same timestamp for two times on the same day', () => {
    const morning = new Date('2024-06-10T06:00:00')
    const night = new Date('2024-06-10T23:59:59')
    expect(dayTs(morning)).toBe(dayTs(night))
  })

  it('returns different timestamps for different days', () => {
    expect(dayTs(new Date('2024-01-15'))).not.toBe(dayTs(new Date('2024-01-16')))
  })
})

// ─── isSameDay ────────────────────────────────────────────────────────────────

describe('isSameDay', () => {
  it('returns true for same day at different times', () => {
    const a = new Date('2024-01-15T08:00:00')
    const b = new Date('2024-01-15T22:00:00')
    expect(isSameDay(a, b)).toBe(true)
  })

  it('returns false for adjacent days', () => {
    const a = new Date('2024-01-15')
    const b = new Date('2024-01-16')
    expect(isSameDay(a, b)).toBe(false)
  })

  it('returns true when comparing a date to itself', () => {
    const d = new Date('2024-03-20T12:00:00')
    expect(isSameDay(d, d)).toBe(true)
  })
})

// ─── isInRange ────────────────────────────────────────────────────────────────

describe('isInRange', () => {
  const start = new Date('2024-01-10')
  const end = new Date('2024-01-20')

  it('returns false when both bounds are null', () => {
    expect(isInRange(new Date('2024-01-15'), null, null)).toBe(false)
  })

  it('returns false when one bound is null', () => {
    const day = new Date('2024-01-15')
    expect(isInRange(day, start, null)).toBe(false)
    expect(isInRange(day, null, end)).toBe(false)
  })

  it('returns true for a day inside the range', () => {
    expect(isInRange(new Date('2024-01-15'), start, end)).toBe(true)
  })

  it('returns true for days on the range boundaries', () => {
    expect(isInRange(start, start, end)).toBe(true)
    expect(isInRange(end, start, end)).toBe(true)
  })

  it('returns false for a day before the range', () => {
    expect(isInRange(new Date('2024-01-05'), start, end)).toBe(false)
  })

  it('returns false for a day after the range', () => {
    expect(isInRange(new Date('2024-01-25'), start, end)).toBe(false)
  })

  it('handles reversed bounds (end before start)', () => {
    expect(isInRange(new Date('2024-01-15'), end, start)).toBe(true)
  })
})

// ─── rangeEdge ────────────────────────────────────────────────────────────────

describe('rangeEdge', () => {
  const start = new Date('2024-01-10')
  const end = new Date('2024-01-20')

  it('returns null when both bounds are null', () => {
    expect(rangeEdge(new Date('2024-01-15'), null, null)).toBeNull()
  })

  it('returns "single" when start and end are the same day', () => {
    const d = new Date('2024-01-15')
    expect(rangeEdge(d, d, d)).toBe('single')
  })

  it('returns "start" for the lower-bound day', () => {
    expect(rangeEdge(start, start, end)).toBe('start')
  })

  it('returns "end" for the upper-bound day', () => {
    expect(rangeEdge(end, start, end)).toBe('end')
  })

  it('returns null for a day in the middle of the range', () => {
    expect(rangeEdge(new Date('2024-01-15'), start, end)).toBeNull()
  })

  it('correctly identifies edges when bounds are passed in reversed order', () => {
    // end passed as "a", start passed as "b"
    expect(rangeEdge(start, end, start)).toBe('start')
    expect(rangeEdge(end, end, start)).toBe('end')
  })
})

// ─── extractDateLine ──────────────────────────────────────────────────────────

describe('extractDateLine', () => {
  it('extracts the Date: line and removes it from editable content', () => {
    const content = 'Title: A day\n\nDate: Monday, January 1, 2024\n\n09:00 - Entry: Did something.'
    const { dateLine, editableContent } = extractDateLine(content)
    expect(dateLine).toBe('Date: Monday, January 1, 2024')
    expect(editableContent).not.toContain('Date:')
  })

  it('returns empty dateLine and full content when no Date: line exists', () => {
    const content = 'No date here\nJust content'
    const { dateLine, editableContent } = extractDateLine(content)
    expect(dateLine).toBe('')
    expect(editableContent).toBe(content)
  })

  it('trims leading and trailing blank lines from editable content', () => {
    const content = 'Date: 2024-01-01\n\nSome content'
    const { editableContent } = extractDateLine(content)
    expect(editableContent).not.toMatch(/^\n/)
    expect(editableContent).not.toMatch(/\n$/)
  })
})

// ─── reconstructContent ───────────────────────────────────────────────────────

describe('reconstructContent', () => {
  it('prepends the date line with a blank line separator', () => {
    const result = reconstructContent('09:00 - Entry: Did something.', 'Date: 2024-01-01')
    expect(result).toBe('Date: 2024-01-01\n\n09:00 - Entry: Did something.')
  })

  it('returns the editable content unchanged when dateLine is empty', () => {
    const result = reconstructContent('Some content', '')
    expect(result).toBe('Some content')
  })

  it('round-trips correctly with extractDateLine', () => {
    const original = 'Date: Monday, January 1, 2024\n\n09:00 - Entry: Did something.\nFeelings: Good.'
    const { dateLine, editableContent } = extractDateLine(original)
    const reconstructed = reconstructContent(editableContent, dateLine)
    expect(reconstructed).toBe(original)
  })
})
