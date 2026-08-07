"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "color-mix(in oklch, var(--popover) 76%, transparent)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "color-mix(in oklch, white 12%, transparent)",
          "--border-radius": "9999px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !min-h-14 !rounded-full !border-white/10 !bg-popover/70 !px-5 !py-3 !text-popover-foreground !shadow-[0_16px_50px_-16px_rgba(0,0,0,0.8)] !backdrop-blur-2xl",
          title: "!font-semibold !tracking-[-0.01em]",
          description: "!text-muted-foreground",
          icon: "!text-primary",
          actionButton: "!rounded-full !bg-primary !px-4 !text-primary-foreground",
          cancelButton: "!rounded-full !bg-secondary !px-4 !text-secondary-foreground",
          closeButton: "!rounded-full !border-white/10 !bg-background/80",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
