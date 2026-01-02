import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import '../setup'

import * as Select from '@/components/ui/select'

describe('Select primitives render', () => {
  it('renders SelectTrigger with data attributes when nested inside Select', () => {
    const { container } = render(
      // @ts-ignore - render the Select root with a trigger
      <Select.Select>
        <Select.SelectTrigger>
          <Select.SelectValue>Open</Select.SelectValue>
        </Select.SelectTrigger>
        <Select.SelectContent />
      </Select.Select>
    )

    const trigger = container.querySelector('[data-slot=select-trigger]')
    expect(trigger).toBeTruthy()
  })
})
