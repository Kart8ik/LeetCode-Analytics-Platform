import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({ children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  // Support controlled and uncontrolled usage.
  const isControlled = props.open !== undefined
  const [openState, setOpenState] = React.useState<boolean>(() => !!props.defaultOpen)

  React.useEffect(() => {
    // keep internal state in sync if parent switches to controlled mode
    if (isControlled && typeof props.open === "boolean") {
      setOpenState(props.open)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open])

  const open = isControlled ? (props.open as boolean) : openState

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setOpenState(next)
    if (typeof props.onOpenChange === "function") props.onOpenChange(next)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} {...(props as any)}>
      {children}
    </PopoverPrimitive.Root>
  )
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />
}

function PopoverContent({ className, sideOffset = 0, children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          // remove global outline/border applied by base styles and match tooltip styling
          "outline-none focus:outline-none focus:ring-0 ring-0 border-0 bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...(props as any)}
      >
        {children}
        <PopoverPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]" />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }
