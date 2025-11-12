import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ExampleChart } from '@/components/ExampleChart'

const getUtcMidnight = (offsetDays = 0) => {
  const today = new Date()
  const utc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  utc.setUTCDate(utc.getUTCDate() - offsetDays)
  utc.setUTCHours(0, 0, 0, 0)
  return utc
}

const toTimestamp = (date: Date) => Math.floor(date.getTime() / 1000).toString()

describe('ExampleChart branch coverage', () => {
  let errorSpy: ReturnType<typeof vi.spyOn> | undefined
  let logSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy?.mockRestore()
    logSpy?.mockRestore()
  })

  it('parses double-escaped JSON payloads', () => {
    const todayTs = toTimestamp(getUtcMidnight())
    const payload = JSON.stringify({ [todayTs]: 4 })
    const doubleEscaped = JSON.stringify(payload)

    const { container } = render(<ExampleChart submissionCalendar={doubleEscaped} />)

    const squares = container.querySelectorAll('.aspect-square')
    expect(squares.length).toBeGreaterThan(0)
    expect(container.textContent).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
  })

  it('falls back gracefully when submissionCalendar cannot be parsed', () => {
    const { container } = render(<ExampleChart submissionCalendar={'not-json'} />)

    expect(errorSpy).toHaveBeenCalled()
    const squares = container.querySelectorAll('.aspect-square')
    expect(squares.length).toBeGreaterThan(0)
    expect(container.textContent).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
  })

  it('renders color intensity buckets for varying submission counts', () => {
    const baseDate = getUtcMidnight()
    const data = {
      [toTimestamp(baseDate)]: 5, // max intensity
      [toTimestamp(getUtcMidnight(1))]: 3, // >= 0.75
      [toTimestamp(getUtcMidnight(2))]: 2, // >= 0.5
      [toTimestamp(getUtcMidnight(3))]: 1, // < 0.25
    }

    const json = JSON.stringify(data)
    const { container } = render(<ExampleChart submissionCalendar={json} />)

    expect(container.querySelector('[class~="bg-primary"]')).toBeTruthy()
    expect(container.querySelector('[class*="bg-primary/80"]')).toBeTruthy()
    expect(container.querySelector('[class*="bg-primary/60"]')).toBeTruthy()
    expect(container.querySelector('[class*="bg-primary/40"]')).toBeTruthy()
    expect(container.querySelector('[class*="opacity-30"]')).toBeTruthy()
  })
})

