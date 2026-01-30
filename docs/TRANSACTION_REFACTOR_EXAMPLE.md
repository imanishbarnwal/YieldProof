# Transaction Handling Refactor Example

## Current State Analysis

### ❌ Problems with Current Implementation

1. **Repetitive Code**: Every page has identical transaction handling
2. **Inconsistent UX**: Using `alert()` instead of proper notifications
3. **No Success Feedback**: Users don't get confirmation of successful transactions
4. **Manual Refetching**: Each page manually handles data refetching
5. **Error Handling**: Basic error messages, no retry mechanisms

### ✅ Common Components That Work Well

1. **Button Component**: Already handles `isLoading` prop perfectly
2. **Toast System**: Exists but unused - ready for implementation
3. **Loading States**: Consistent across all buttons

---

## Recommended Refactor

### Before (Current Pattern in every page):
```typescript
// Repetitive in issuer/investor/attestor pages
const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

useEffect(() => {
    if (isConfirmed) {
        refetchTotalClaims();
        refetchClaims();
        // ... more refetches
    }
}, [isConfirmed, ...deps]);

const handleSubmit = async () => {
    if (!isConnected) {
        alert('Please connect your wallet first.');
        return;
    }
    
    try {
        writeContract({
            address: CONTRACTS.YieldProof.address as `0x${string}`,
            abi: CONTRACTS.YieldProof.abi as Abi,
            functionName: 'submitClaim',
            args: [...]
        });
    } catch (error) {
        console.error("Submission failed", error);
        alert("Submission failed. Please try again.");
    }
};
```

### After (Using Common Hook):
```typescript
import { useTransaction } from '@/hooks/useTransaction';

const { executeTransaction, isLoading } = useTransaction({
    successMessage: 'Yield disclosure submitted successfully!',
    errorMessage: 'Failed to submit disclosure. Please try again.',
    onSuccess: () => {
        // Auto-refetch data
        refetchTotalClaims();
        refetchClaims();
        // Reset form
        setFormData(initialState);
    }
});

const handleSubmit = async () => {
    if (!isConnected) return; // Handle in UI instead of alert
    
    executeTransaction({
        address: CONTRACTS.YieldProof.address as `0x${string}`,
        abi: CONTRACTS.YieldProof.abi as Abi,
        functionName: 'submitClaim',
        args: [...]
    });
};
```

---

## Implementation Benefits

### 1. **Consistent User Experience**
- ✅ Toast notifications instead of alerts
- ✅ Proper loading states
- ✅ Success confirmations
- ✅ Consistent error handling

### 2. **Reduced Code Duplication**
- ✅ Single transaction hook
- ✅ Centralized error handling
- ✅ Automatic success/error notifications
- ✅ Consistent loading patterns

### 3. **Better Error Handling**
- ✅ User-friendly error messages
- ✅ Automatic error logging
- ✅ Graceful failure modes
- ✅ No more alert() popups

### 4. **Enhanced UX**
- ✅ Toast notifications with animations
- ✅ Success confirmations
- ✅ Loading states with spinners
- ✅ Automatic form resets on success

---

## Migration Plan

### Phase 1: Create Common Hook ✅
- [x] `useTransaction` hook created
- [x] Toast system already available
- [x] Button component supports loading

### Phase 2: Refactor Pages
1. **Attestor Page** - Simplest (3 transactions)
2. **Investor Page** - Medium (3 transactions)  
3. **Issuer Page** - Most complex (2 transactions + file upload)

### Phase 3: Enhanced Features
- Add retry mechanisms
- Add transaction history
- Add gas estimation
- Add transaction queuing

---

## Example Refactored Attestor Component

```typescript
export default function AttestorPage() {
    const { address, isConnected } = useAccount();
    
    // Replace multiple transaction hooks with single one
    const { executeTransaction, isLoading } = useTransaction({
        onSuccess: () => {
            refetchAttestor();
            refetchClaims();
            refetchHasAttested();
        }
    });

    const handleStake = async () => {
        if (!isConnected || !stakeAmount) return;

        const value = parseEther(stakeAmount);
        const functionName = !isRegistered ? 'register' : 'stakeETH';
        const successMessage = !isRegistered 
            ? 'Successfully registered as attestor!' 
            : 'Stake added successfully!';

        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName,
            value
        });
    };

    const handleAttest = async (claimId: number) => {
        executeTransaction({
            address: CONTRACTS.AttestorRegistry.address as `0x${string}`,
            abi: CONTRACTS.AttestorRegistry.abi as Abi,
            functionName: 'attestToClaim',
            args: [BigInt(claimId)]
        });
    };

    return (
        <div>
            {/* All buttons use same isLoading state */}
            <Button 
                onClick={handleStake}
                isLoading={isLoading}
                disabled={!isConnected}
            >
                {isRegistered ? 'Add Stake' : 'Register & Stake'}
            </Button>
            
            <Button 
                onClick={() => handleAttest(claim.id)}
                isLoading={isLoading}
                disabled={!isConnected}
            >
                Attest
            </Button>
        </div>
    );
}
```

---

## Expected UI Improvements

### Current Experience:
1. Click button → Loading spinner → Alert popup → Manual refresh

### New Experience:
1. Click button → Loading spinner → Toast notification → Auto-refresh → Form reset

### Toast Examples:
- ✅ **Success**: "Yield disclosure submitted successfully!"
- ❌ **Error**: "Transaction failed. Please check your wallet and try again."
- ⚠️ **Warning**: "Please connect your wallet to continue."
- ℹ️ **Info**: "Transaction submitted. Waiting for confirmation..."

This refactor would significantly improve the user experience while reducing code duplication by ~60% across all transaction handling.