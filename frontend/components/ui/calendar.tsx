"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CustomCaption({ calendarMonth, displayIndex }: { calendarMonth: { date: Date }; displayIndex: number }) {
    const { goToMonth, nextMonth, previousMonth } = useDayPicker()

    return (
        <div className="flex items-center justify-center gap-1 h-8 mb-4">
            {displayIndex === 0 && (
                <button
                    type="button"
                    className={cn(
                        "h-6 w-6 bg-transparent rounded-md p-0",
                        "flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                        "transition-all duration-200",
                        !previousMonth && "opacity-30 cursor-not-allowed"
                    )}
                    disabled={!previousMonth}
                    onClick={() => previousMonth && goToMonth(previousMonth)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}
            <span className="text-sm font-medium text-foreground px-2">
                {format(calendarMonth.date, "MMMM yyyy")}
            </span>
            {displayIndex === 0 && (
                <button
                    type="button"
                    className={cn(
                        "h-6 w-6 bg-transparent rounded-md p-0",
                        "flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                        "transition-all duration-200",
                        !nextMonth && "opacity-30 cursor-not-allowed"
                    )}
                    disabled={!nextMonth}
                    onClick={() => nextMonth && goToMonth(nextMonth)}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4", className)}
            classNames={{
                root: "w-full",
                months: "flex flex-col sm:flex-row gap-4",
                month: "flex flex-col gap-2 w-full",
                month_caption: "hidden",
                nav: "hidden",
                month_grid: "w-full border-collapse",
                weekdays: "grid grid-cols-7 mb-1",
                weekday: "text-muted-foreground font-normal text-xs text-center py-2",
                week: "grid grid-cols-7",
                day: "text-center text-sm p-1 flex items-center justify-center",
                day_button: cn(
                    "h-9 w-9 p-0 font-normal rounded-lg transition-colors",
                    "hover:bg-primary/20 hover:text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30",
                    "flex items-center justify-center"
                ),
                range_end: "day-range-end",
                selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90",
                today: "[&>button]:bg-accent/20 [&>button]:text-foreground [&>button]:font-semibold",
                outside: "[&>button]:text-muted-foreground/40 [&>button]:hover:bg-muted/20",
                disabled: "[&>button]:text-muted-foreground/30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
                range_middle: "[&>button]:bg-primary/20 [&>button]:text-foreground [&>button]:rounded-none",
                range_start: "[&>button]:rounded-l-lg [&>button]:rounded-r-none",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                MonthCaption: CustomCaption,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
