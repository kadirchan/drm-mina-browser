import { Badge } from "@/components/ui/badge";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const discountRateVariants = cva("absolute", {
    variants: {
        variant: {
            md: "top-2 left-2 text-sm text-green-600 bg-green-900 rounded-lg p-1 hover:bg-green-800 border-double border-lime-950",
            bg: "top-3 left-3 text-lg text-green-600 bg-green-900 rounded-lg p-2 hover:bg-green-800 border-double border-lime-950",
        },
    },
    defaultVariants: {
        variant: "md",
    },
});

export interface DiscountRateProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof discountRateVariants> {}

export default function DiscountRate({
    game,
    variant,
}: DiscountRateProps & { game: { discount: number; price: number } }) {
    const discountRate = Math.floor((game.discount / game.price) * 100);

    return discountRate > 0 ? (
        <Badge className={cn(discountRateVariants({ variant }))}>{"- " + discountRate + "%"}</Badge>
    ) : (
        <></>
    );
}
