import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import '../setup'

import { ExampleChart } from '@/components/ExampleChart'

describe('ExampleChart edge cases', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders empty calendar when submissionCalendar is null', async () => {
    const { container } = render(<ExampleChart submissionCalendar={null} />)
    // month labels should still render and calendar squares exist
    await waitFor(() => expect(container.textContent).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/))
    const squares = container.querySelectorAll('.aspect-square')
    expect(squares.length).toBeGreaterThan(0)
  })

  it('renders empty calendar when submissionCalendar is empty string', async () => {
    const { container } = render(<ExampleChart submissionCalendar={''} />)
    await waitFor(() => expect(container.textContent).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/))
    const squares = container.querySelectorAll('.aspect-square')
    expect(squares.length).toBeGreaterThan(0)
  })

  it('handles non-numeric counts gracefully', async () => {
    const json = JSON.stringify({ '1762646400': 'NaN', '1762732800': 2 })
    const { container } = render(<ExampleChart submissionCalendar={json} />)
    // ensure months and squares render and no crash occurs
    await waitFor(() => expect(container.textContent).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/))
    const squares = container.querySelectorAll('.aspect-square')
    expect(squares.length).toBeGreaterThan(0)
  })
})
