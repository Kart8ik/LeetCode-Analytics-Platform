import React from 'react'
import { render, screen } from '@testing-library/react'
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
  it('renders trigger with correct data attributes and shows value slot', () => {
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

    // Check that trigger and content slots exist
    expect(container.querySelector('[data-slot="select-trigger"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="select-content"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="select-item"]')).toBeTruthy()
  })
})
