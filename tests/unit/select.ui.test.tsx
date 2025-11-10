import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import '../setup'

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

describe('Select UI component', () => {
  it('renders trigger with correct data attributes and shows value slot', async () => {
    const { container } = render(
      <Select defaultValue="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    )

    // Check that trigger slot exists
    const trigger = container.querySelector('[data-slot="select-trigger"]')
    expect(trigger).toBeTruthy()

  // Open the select (content is portal-mounted and only appears when open)
  fireEvent.click(trigger!)

    // Wait for the portal-mounted content to appear in the document
    await waitFor(() => {
      expect(document.querySelector('[data-slot="select-content"]')).toBeTruthy()
      expect(document.querySelector('[data-slot="select-item"]')).toBeTruthy()
    })
  })
})
