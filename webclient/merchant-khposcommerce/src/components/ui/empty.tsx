import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { FolderCode, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const emptyVariants = cva(
  "flex min-h-[220px] w-full flex-col items-center justify-center p-6 text-center animate-in fade-in-50 duration-200",
  {
    variants: {
      variant: {
        default: "rounded-2xl border border-dashed border-border/70 bg-muted/10",
        subtle: "border-0 bg-transparent min-h-[160px] p-4",
        card: "rounded-2xl border border-border/80 bg-card shadow-xs",
        outline: "rounded-2xl border border-border/80 bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface EmptyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyVariants> {}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(emptyVariants({ variant, className }))}
      {...props}
    />
  )
)
Empty.displayName = "Empty"

const EmptyHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex max-w-sm flex-col items-center gap-1.5 text-center mx-auto", className)}
    {...props}
  />
))
EmptyHeader.displayName = "EmptyHeader"

const emptyMediaVariants = cva(
  "mb-2 flex items-center justify-center text-muted-foreground transition-transform duration-200",
  {
    variants: {
      variant: {
        default: "size-10",
        icon: "size-12 rounded-2xl bg-muted/60 dark:bg-slate-800/80 border border-border/60 text-muted-foreground/80 shadow-2xs [&>svg]:size-6",
        avatar: "size-14 rounded-full bg-muted/60 border border-border/60 [&>svg]:size-7",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  }
)

export interface EmptyMediaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyMediaVariants> {}

const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
)
EmptyMedia.displayName = "EmptyMedia"

const EmptyTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold tracking-tight text-foreground", className)}
    {...props}
  />
))
EmptyTitle.displayName = "EmptyTitle"

const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground/80 leading-relaxed max-w-sm mx-auto", className)}
    {...props}
  />
))
EmptyDescription.displayName = "EmptyDescription"

const EmptyContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 flex flex-wrap items-center justify-center gap-2", className)}
    {...props}
  />
))
EmptyContent.displayName = "EmptyContent"

export function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCode className="size-6 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button>Create Project</Button>
        <Button variant="outline">Import Project</Button>
      </EmptyContent>
      <Button
        variant="link"
        className="text-muted-foreground mt-2 inline-flex items-center gap-1"
        size="sm"
        nativeButton={false}
        render={
          <a href="#">
            Learn More <ArrowUpRight className="size-3.5 inline ml-0.5" />
          </a>
        }
      />
    </Empty>
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
}
