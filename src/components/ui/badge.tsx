import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-neutral-100 text-neutral-800",
                primary: "bg-primary-100 text-primary-800",
                secondary: "bg-secondary-100 text-secondary-800",
                success: "bg-green-100 text-green-800",
                warning: "bg-yellow-100 text-yellow-800",
                danger: "bg-red-100 text-red-800",
                outline: "border border-neutral-300 text-neutral-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
