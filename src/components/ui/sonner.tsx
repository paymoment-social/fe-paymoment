"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-sky-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-rose-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "color-mix(in oklch, var(--popover) 76%, transparent)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "color-mix(in oklch, white 12%, transparent)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !w-[calc(100vw-1rem)] sm:!w-[22rem] !min-h-12 !rounded-2xl !border-white/10 !bg-popover/95 !px-3 !py-2.5 !text-popover-foreground !shadow-[0_16px_50px_-16px_rgba(0,0,0,0.8)] !backdrop-blur-2xl",
          content: "!min-w-0 !gap-1",
          title: "!text-sm !font-semibold !tracking-[-0.01em]",
          description: "!text-xs !text-muted-foreground",
          icon: "!shrink-0",
          actionButton: "!rounded-full !bg-primary !px-4 !text-primary-foreground",
          cancelButton: "!rounded-full !bg-secondary !px-4 !text-secondary-foreground",
          closeButton: "!rounded-full !border-white/10 !bg-background/80",
        },
      }}
      duration={3200}
      expand={false}
      visibleToasts={3}
      {...props}
    />
  )
}

export { Toaster }
