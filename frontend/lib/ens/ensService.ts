import { normalize } from "viem/ens";

export const DEFAULT_ENS_PARENT = process.env.NEXT_PUBLIC_YIELDPROOF_ENS_PARENT || "yieldproof.eth";

/**
 * Normalizes an ENS name or subname safely using official ENS normalization algorithms
 */
export function safeNormalizeENS(name: string): string {
    try {
        if (!name) return "";
        return normalize(name.trim());
    } catch (err) {
        console.warn("ENS normalization fallback:", err);
        return name.toLowerCase().trim();
    }
}

/**
 * Validates a subname label (alphanumeric and hyphens only, no dots)
 */
export function validateSubnameLabel(label: string): { valid: boolean; error?: string } {
    const clean = label.trim().toLowerCase();
    if (!clean) {
        return { valid: false, error: "Label cannot be empty" };
    }
    if (clean.length < 3 || clean.length > 32) {
        return { valid: false, error: "Label must be between 3 and 32 characters" };
    }
    if (!/^[a-z0-9-]+$/.test(clean)) {
        return { valid: false, error: "Label can only contain lowercase letters, numbers, and hyphens" };
    }
    if (clean.startsWith("-") || clean.endsWith("-")) {
        return { valid: false, error: "Label cannot start or end with a hyphen" };
    }
    return { valid: true };
}
