"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
    id: string
    title?: string
    description?: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
    onClose?: (id: string) => void
}

export function Toast({
    id,
    title,
    description,
    type = 'info',
    duration = 4000,
    onClose
}: ToastProps) {
    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose?.(id)
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, id, onClose])

    const icons = {
        success: CheckCircle2,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info
    }

    const styles = {
        success: {
            container: "border-emerald-500/30 bg-card/95",
            icon: "text-emerald-500"
        },
        error: {
            container: "border-destructive/30 bg-card/95",
            icon: "text-destructive"
        },
        warning: {
            container: "border-amber-500/30 bg-card/95",
            icon: "text-amber-500"
        },
        info: {
            container: "border-primary/30 bg-card/95",
            icon: "text-primary"
        }
    }

    const Icon = icons[type]
    const style = styles[type]

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
                "relative flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl shadow-lg",
                style.container
            )}
        >
            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", style.icon)} />
            <div className="flex-1 space-y-1">
                {title && (
                    <div className="text-sm font-medium text-foreground">{title}</div>
                )}
                {description && (
                    <div className="text-sm text-muted-foreground">{description}</div>
                )}
            </div>
            <button
                onClick={() => onClose?.(id)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    )
}

export interface ToastContextType {
    toasts: ToastProps[]
    addToast: (toast: Omit<ToastProps, 'id'>) => void
    removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastProps[]>([])

    const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts(prev => [...prev, { ...toast, id }])
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onClose={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
