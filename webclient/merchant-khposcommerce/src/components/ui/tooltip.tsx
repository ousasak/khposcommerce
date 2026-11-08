import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined)

const TooltipProvider: React.FC<{ children: React.ReactNode; delayDuration?: number }> = ({
  children,
}) => {
  return <>{children}</>
}

const Tooltip: React.FC<{
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [isControlled, onOpenChange]
  )

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ children, asChild, className, ...props }, ref) => {
  const context = React.useContext(TooltipContext)
  if (!context) return <>{children}</>

  const triggerProps = {
    ref: ref as any,
    onMouseEnter: () => context.setOpen(true),
    onMouseLeave: () => context.setOpen(false),
    onFocus: () => context.setOpen(true),
    onBlur: () => context.setOpen(false),
    ...props,
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...triggerProps,
      className: cn((children.props as any)?.className, className),
      onMouseEnter: (e: any) => {
        ;(children.props as any)?.onMouseEnter?.(e)
        context.setOpen(true)
      },
      onMouseLeave: (e: any) => {
        ;(children.props as any)?.onMouseLeave?.(e)
        context.setOpen(false)
      },
      onFocus: (e: any) => {
        ;(children.props as any)?.onFocus?.(e)
        context.setOpen(true)
      },
      onBlur: (e: any) => {
        ;(children.props as any)?.onBlur?.(e)
        context.setOpen(false)
      },
    })
  }

  return (
    <span {...triggerProps} className={className}>
      {children}
    </span>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "bottom" | "left" | "right"
    sideOffset?: number
  }
>(({ className, side = "top", children, ...props }, ref) => {
  const context = React.useContext(TooltipContext)
  if (!context || !context.open) return null

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "absolute z-50 pointer-events-none whitespace-nowrap rounded-lg border border-border/80 bg-popover px-2.5 py-1 text-xs text-popover-foreground shadow-md transition-all animate-in fade-in-0 zoom-in-95",
        sideClasses[side] || sideClasses.top,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
