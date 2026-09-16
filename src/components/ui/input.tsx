import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type InputProps = Omit<ComponentProps<typeof InputPrimitive>, "className"> & {
  className?: string
}

function Input({ className, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[invalid]:border-destructive data-[invalid]:ring-3 data-[invalid]:ring-destructive/20 dark:data-[invalid]:border-destructive/50 dark:data-[invalid]:ring-destructive/40 md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
