import { describe, it, expect } from 'vitest'
import * as Select from '@/components/ui/select'

describe('Select exports', () => {
	it('exports the expected components', () => {
		expect(typeof Select.Select).toBe('function')
		expect(typeof Select.SelectTrigger).toBe('function')
		expect(typeof Select.SelectContent).toBe('function')
		expect(typeof Select.SelectItem).toBe('function')
		expect(typeof Select.SelectValue).toBe('function')
	})
})
