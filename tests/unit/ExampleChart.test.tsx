import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { ExampleChart } from '@/components/ExampleChart'

describe('ExampleChart', () => {
  it('parses submissionCalendar and renders calendar squares', () => {
    const today = new Date()
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    const timestamp = Math.floor(todayUTC.getTime() / 1000).toString()
    const payload = { [timestamp]: 2 }
    const json = JSON.stringify(payload)

    const { container } = render(<ExampleChart submissionCalendar={json} />)

    // The rendered content should include month labels or calendar squares
    // month short labels (e.g., 'Nov') are rendered as text
    expect(container.textContent).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)

    // There should be at least one calendar square element
    const squares = container.querySelectorAll('.aspect-square')
    expect(squares.length).toBeGreaterThan(0)
  })
})
