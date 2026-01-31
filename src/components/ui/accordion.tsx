import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccordionContextValue = {
  value: string[]
  onValueChange: (value: string[]) => void
  type: 'single' | 'multiple'
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within Accordion')
  }
  return context
}

type AccordionProps = {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children: React.ReactNode
  className?: string
}

function Accordion({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }
    return []
  })

  const isControlled = controlledValue !== undefined
  const value = isControlled
    ? Array.isArray(controlledValue)
      ? controlledValue
      : [controlledValue]
    : uncontrolledValue

  const handleValueChange = React.useCallback(
    (newValue: string[]) => {
      if (!isControlled) {
        setUncontrolledValue(newValue)
      }
      if (onValueChange) {
        if (type === 'single') {
          onValueChange(newValue[0] || '')
        } else {
          onValueChange(newValue)
        }
      }
    },
    [isControlled, onValueChange, type]
  )

  const contextValue = React.useMemo<AccordionContextValue>(
    () => ({
      value,
      onValueChange: handleValueChange,
      type,
    }),
    [value, handleValueChange, type]
  )

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('space-y-1', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

type AccordionItemProps = {
  value: string
  children: React.ReactNode
  className?: string
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div className={cn('border-b border-border', className)} data-value={value}>
      {children}
    </div>
  )
}

type AccordionTriggerProps = {
  children: React.ReactNode
  className?: string
}

function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps & React.ComponentProps<'button'>) {
  const { value, onValueChange, type } = useAccordionContext()
  const itemContext = React.useContext(AccordionItemContext)
  if (!itemContext) {
    throw new Error('AccordionTrigger must be used within AccordionItem')
  }

  const isOpen = value.includes(itemContext.value)

  const handleClick = () => {
    if (type === 'single') {
      onValueChange(isOpen ? [] : [itemContext.value])
    } else {
      onValueChange(isOpen ? value.filter((v) => v !== itemContext.value) : [...value, itemContext.value])
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </button>
  )
}

type AccordionContentProps = {
  children: React.ReactNode
  className?: string
}

const AccordionItemContext = React.createContext<{ value: string } | null>(null)

function AccordionContent({ children, className }: AccordionContentProps) {
  const { value } = useAccordionContext()
  const itemContext = React.useContext(AccordionItemContext)
  if (!itemContext) {
    throw new Error('AccordionContent must be used within AccordionItem')
  }

  const isOpen = value.includes(itemContext.value)

  return (
    <div
      className={cn(
        'overflow-hidden text-sm text-muted-foreground transition-all',
        isOpen ? 'animate-in slide-down-from-top-2' : 'animate-out slide-up-to-top-2'
      )}
      style={{
        maxHeight: isOpen ? '1000px' : '0',
        transition: 'max-height 0.3s ease-out',
      }}
    >
      <div className={cn('pb-4 pt-0', className)}>{children}</div>
    </div>
  )
}

// Wrapper to provide item context
function AccordionItemWithContext({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <AccordionItem value={value} className={className}>
        {children}
      </AccordionItem>
    </AccordionItemContext.Provider>
  )
}

export {
  Accordion,
  AccordionItemWithContext as AccordionItem,
  AccordionTrigger,
  AccordionContent,
}
