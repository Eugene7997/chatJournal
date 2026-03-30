import { chatPrompt, journalPrompt } from '@/lib/prompts/promptManager'

describe('chatPrompt', () => {
  it('is a non-empty string', () => {
    expect(typeof chatPrompt).toBe('string')
    expect(chatPrompt.length).toBeGreaterThan(0)
  })

  it('instructs the LLM to focus on journaling', () => {
    expect(chatPrompt.toLowerCase()).toContain('journal')
  })

  it('instructs the LLM not to execute user tasks', () => {
    expect(chatPrompt.toLowerCase()).toContain('do not execute')
  })
})

describe('journalPrompt', () => {
  const date = 'Monday, January 1, 2024'

  it('returns a non-empty string', () => {
    const result = journalPrompt(date)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('embeds the provided session date', () => {
    expect(journalPrompt(date)).toContain(date)
  })

  it('includes a Title format instruction', () => {
    expect(journalPrompt(date)).toContain('Title:')
  })

  it('includes a Feelings format instruction', () => {
    expect(journalPrompt(date)).toContain('Feelings:')
  })

  it('instructs the LLM to sort entries chronologically', () => {
    expect(journalPrompt(date).toLowerCase()).toContain('chronological')
  })
})
