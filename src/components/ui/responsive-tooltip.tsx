import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

// Context used to ensure provider and all responsive tooltip subcomponents
// read the same `isMobile` value during the same render. This prevents
// mismatches where a Trigger mounts outside its Root when mode flips.
const ResponsiveTooltipModeContext = React.createContext<boolean | null>(null)

// ResponsiveTooltip exports the same small API as Tooltip so callers can swap easily.
function ResponsiveTooltipProvider({ children, ...props }: React.ComponentProps<typeof TooltipProvider>) {
  // Compute mode here so the whole provider subtree can remount when mode changes.
  const isMobile = useIsMobile()

  // When mobile, don't render the TooltipProvider (Radix tooltip provider) at all —
  // instead render a Fragment. Use keys so React completely remounts children when
  // switching between modes to avoid Radix mounting mismatches.
  if (isMobile) {
    return (
      <ResponsiveTooltipModeContext.Provider value={true}>
        <React.Fragment key="tooltip-provider-mobile">{children}</React.Fragment>
      </ResponsiveTooltipModeContext.Provider>
    )
  }

  return (
    // @ts-ignore - forward props to TooltipProvider
    <ResponsiveTooltipModeContext.Provider value={false}>
      <TooltipProvider key="tooltip-provider-desktop" {...(props as any)}>
        {children}
      </TooltipProvider>
    </ResponsiveTooltipModeContext.Provider>
  )
}

function ResponsiveTooltip({ children, ...props }: React.ComponentProps<typeof Tooltip>) {
  // Read mode from context so provider and children are consistent.
  const isMobile = React.useContext(ResponsiveTooltipModeContext)

  // Fallback to desktop behavior if context is not available for some reason.
  const mobile = isMobile ?? false

  // Use a key so React will fully remount the subtree when switching modes.
  if (mobile) {
    return (
      <Popover key="responsive-tooltip-mobile" {...(props as any)}>
        {children}
      </Popover>
    )
  }
  return (
    <Tooltip key="responsive-tooltip-desktop" {...(props as any)}>
      {children}
    </Tooltip>
  )
}

function ResponsiveTooltipTrigger({ children, ...props }: React.ComponentProps<typeof TooltipTrigger>) {
  const isMobile = React.useContext(ResponsiveTooltipModeContext)
  const mobile = isMobile ?? false
  if (mobile) {
    // Use PopoverTrigger on mobile - click to open
    return (
      <PopoverTrigger key="responsive-trigger-mobile" {...(props as any)}>
        {children}
      </PopoverTrigger>
    )
  }
  return (
    <TooltipTrigger key="responsive-trigger-desktop" {...(props as any)}>
      {children}
    </TooltipTrigger>
  )
}

function ResponsiveTooltipContent({ children, ...props }: React.ComponentProps<typeof TooltipContent>) {
  const isMobile = React.useContext(ResponsiveTooltipModeContext)
  const mobile = isMobile ?? false
  if (mobile) {
    return (
      <PopoverContent key="responsive-content-mobile" {...(props as any)}>
        {children}
      </PopoverContent>
    )
  }
  return (
    <TooltipContent key="responsive-content-desktop" {...(props as any)}>
      {children}
    </TooltipContent>
  )
}

export {
  ResponsiveTooltip as Tooltip,
  ResponsiveTooltipTrigger as TooltipTrigger,
  ResponsiveTooltipContent as TooltipContent,
  ResponsiveTooltipProvider as TooltipProvider,
}
