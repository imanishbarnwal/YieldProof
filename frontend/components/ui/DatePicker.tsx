"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
    label?: string;
    helperText?: string;
    error?: string;
    value?: string;
    onChange?: (date: string) => void;
    minDate?: string | Date;
    maxDate?: string | Date;
    className?: string;
    placeholder?: string;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
    ({ className, label, helperText, error, value, onChange, minDate, maxDate, placeholder = "Pick a date", ...props }, ref) => {
        const [open, setOpen] = React.useState(false);

        const parseDate = (dateStr: string | Date | undefined): Date | undefined => {
            if (!dateStr) return undefined;
            if (typeof dateStr === 'string') {
                return new Date(dateStr);
            }
            return dateStr;
        };

        const formatDateString = (date: Date): string => {
            return date.toISOString().split('T')[0];
        };

        const selectedDate = parseDate(value);
        const minDateObj = parseDate(minDate);
        const maxDateObj = parseDate(maxDate);

        const handleSelect = (date: Date | undefined) => {
            if (date) {
                onChange?.(formatDateString(date));
            }
            setOpen(false);
        };

        return (
            <div className="space-y-2" ref={ref} {...props}>
                {label && (
                    <label className="block text-sm font-medium text-foreground/80">
                        {label}
                    </label>
                )}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal bg-card/80 border-primary/20 rounded-2xl hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-ring/20 shadow-none",
                                !selectedDate && "text-muted-foreground",
                                error && "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20",
                                className
                            )}
                            style={{ boxShadow: 'none' }}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 min-w-[320px]" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelect}
                            disabled={(date) => {
                                if (minDateObj && date < minDateObj) return true;
                                if (maxDateObj && date > maxDateObj) return true;
                                return false;
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {helperText && !error && (
                    <p className="text-xs text-muted-foreground">{helperText}</p>
                )}
                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";

export { DatePicker };