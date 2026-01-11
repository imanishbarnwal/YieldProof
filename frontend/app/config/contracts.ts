export const MANTLE_SEPOLIA = {
    chainId: 5003,
    rpcUrl: "https://rpc.sepolia.mantle.xyz",
};

export const CONTRACTS = {
    AttestorRegistry: {
        address: "0x0C36f096f7677D4aD9351b2a511D41F6B6d05FD1",
        abi: [
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "OwnableInvalidOwner",
                "type": "error"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                ],
                "name": "OwnableUnauthorizedAccount",
                "type": "error"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "attestor",
                        "type": "address"
                    }
                ],
                "name": "AttestorRegistered",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "attestor",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "slasher",
                        "type": "address"
                    }
                ],
                "name": "AttestorSlashed",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "attestor",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "stakeAmount",
                        "type": "uint256"
                    }
                ],
                "name": "ClaimAttested",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "previousOwner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "OwnershipTransferred",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "attestor",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "StakeAdded",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    }
                ],
                "name": "attestToClaim",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "attestors",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "isRegistered",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "stake",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "hasAttested",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "register",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "renounceOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "attestor",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "slash",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "stakeETH",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "totalStakePerClaim",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "newOwner",
                        "type": "address"
                    }
                ],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    },
    YieldProof: {
        address: "0xB4b394aac616eDB000dD9d8b7E6745A09DC25F14",
        abi: [
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_attestorRegistry",
                        "type": "address"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "enum YieldProof.ClaimStatus",
                        "name": "newStatus",
                        "type": "uint8"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "updatedBy",
                        "type": "address"
                    }
                ],
                "name": "ClaimStatusUpdated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "issuer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "assetId",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "yieldAmount",
                        "type": "uint256"
                    }
                ],
                "name": "YieldClaimSubmitted",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "admin",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "attestorRegistry",
                "outputs": [
                    {
                        "internalType": "contract AttestorRegistry",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "claims",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "assetId",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "period",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "yieldAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "documentHash",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "issuer",
                        "type": "address"
                    },
                    {
                        "internalType": "enum YieldProof.ClaimStatus",
                        "name": "status",
                        "type": "uint8"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getTotalClaims",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_assetId",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_period",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_yieldAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_documentHash",
                        "type": "string"
                    }
                ],
                "name": "submitClaim",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    }
                ],
                "name": "updateClaimStatus",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_claimId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum YieldProof.ClaimStatus",
                        "name": "_newStatus",
                        "type": "uint8"
                    }
                ],
                "name": "updateClaimStatus",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    },
    YieldVault: {
        address: "0xf8fE246A7CA72113ABf5aF5fEE740a69D9EdFf82",
        abi: [
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "_yieldProof",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "_attestorRegistry",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_minTotalStake",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "Deposited",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "Withdrawn",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "totalStake",
                        "type": "uint256"
                    }
                ],
                "name": "YieldUnlocked",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "attestorRegistry",
                "outputs": [
                    {
                        "internalType": "contract AttestorRegistry",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "name": "balances",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    }
                ],
                "name": "canUnlockYield",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "minTotalStake",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalDeposits",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "claimId",
                        "type": "uint256"
                    }
                ],
                "name": "unlockYield",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "yieldProof",
                "outputs": [
                    {
                        "internalType": "contract YieldProof",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    }
};
