import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary:
                    "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 active:scale-95",
                secondary:
                    "bg-secondary-500 text-white shadow-md hover:shadow-lg hover:bg-secondary-600 active:scale-95",
                outline:
                    "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:scale-95",
                ghost:
                    "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
                link:
                    "text-primary-600 underline-offset-4 hover:underline",
                destructive:
                    "bg-red-500 text-white shadow-md hover:bg-red-600 active:scale-95",
            },
            size: {
                sm: "h-9 px-4 text-xs",
                md: "h-11 px-6",
                lg: "h-13 px-8 text-base",
                xl: "h-14 px-10 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
