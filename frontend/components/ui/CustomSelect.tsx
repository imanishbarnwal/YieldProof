"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectProps {
    label?: string;
    helperText?: string;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
    className?: string;
}

const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
    ({ className, label, helperText, error, value, onChange, placeholder, options, ...props }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [selectedValue, setSelectedValue] = React.useState(value || "");

        const handleSelect = (optionValue: string) => {
            setSelectedValue(optionValue);
            onChange?.(optionValue);
            setIsOpen(false);
        };

        const selectedOption = options.find(option => option.value === selectedValue);

        return (
            <div className="space-y-2" ref={ref} {...props}>
                {label && (
                    <label className="block text-sm font-medium text-foreground/80">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <button
                        type="button"
                        className={cn(
                            "w-full bg-card/80 border border-primary/20 rounded-2xl px-3 py-2 text-foreground text-sm backdrop-blur-sm hover:border-primary/40 focus:border-primary/60 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all duration-200 cursor-pointer pr-10 text-left shadow-none",
                            error && "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20",
                            !selectedValue && "text-muted-foreground",
                            className
                        )}
                        onClick={() => setIsOpen(!isOpen)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                        style={{ boxShadow: 'none' }}
                    >
                        {selectedOption?.label || placeholder || "Select an option"}
                    </button>
                    <ChevronDown
                        className={cn(
                            "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none transition-transform duration-200",
                            isOpen && "rotate-180"
                        )}
                    />

                    {isOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-card border border-primary/20 rounded-2xl backdrop-blur-sm overflow-hidden" style={{ boxShadow: 'none' }}>
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={cn(
                                        "w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl",
                                        selectedValue === option.value && "bg-primary/20 text-primary font-medium"
                                    )}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
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

CustomSelect.displayName = "CustomSelect";

export { CustomSelect };