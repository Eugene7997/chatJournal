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

  describe('guardrail coverage', () => {
    const lower = chatPrompt.toLowerCase()

    it('marks instructions as confidential and instructs the LLM never to reveal them', () => {
      expect(lower).toContain('confidential')
      expect(lower).toContain('never reveal')
    })

    it('provides a scripted deflection response for system prompt extraction attempts', () => {
      expect(lower).toContain("i'm just here to help you journal your day")
    })

    it('names the "ignore previous instructions" override pattern', () => {
      expect(lower).toContain('ignore previous instructions')
    })

    it('names the "your new instructions are" override pattern', () => {
      expect(lower).toContain('your new instructions are')
    })

    it('names "pretend you are" and "act as" persona hijacking patterns', () => {
      expect(lower).toContain('pretend you are')
      expect(lower).toContain('act as')
    })

    it('names DAN and developer mode jailbreaks', () => {
      expect(lower).toContain('dan')
      expect(lower).toContain('developer mode')
    })

    it('prohibits structured output formats used for data exfiltration', () => {
      expect(lower).toContain('json')
      expect(lower).toContain('xml')
      expect(lower).toContain('csv')
    })

    it("prohibits referencing other users' data", () => {
      expect(lower).toContain('other users')
    })
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

  describe('guardrail coverage', () => {
    const lower = journalPrompt(date).toLowerCase()

    it('frames conversation input as data to summarize, not commands to follow', () => {
      expect(lower).toContain('raw data')
    })

    it('names the "ignore previous instructions" override pattern', () => {
      expect(lower).toContain('ignore previous instructions')
    })

    it('instructs the LLM to silently omit injection attempts', () => {
      expect(lower).toContain('omit')
      expect(lower).toContain('injection')
    })

    it('locks output to the defined schema', () => {
      expect(lower).toContain('no additional sections')
    })

    it('marks instructions as confidential and instructs the LLM never to reveal them', () => {
      expect(lower).toContain('confidential')
    })

    it('security boundaries section appears before the format instructions', () => {
      // Security must be established before the model reads the format and any
      // injected content — the model frames all subsequent input through that lens.
      const prompt = journalPrompt(date)
      const guardrailIndex = prompt.indexOf('Security boundaries')
      const formatIndex = prompt.indexOf('Format your response EXACTLY')
      expect(guardrailIndex).toBeGreaterThanOrEqual(0)
      expect(guardrailIndex).toBeLessThan(formatIndex)
    })
  })
})
