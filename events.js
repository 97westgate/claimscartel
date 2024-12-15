const GAME_EVENTS = [
    {
        name: "Federal Grant Opportunity",
        emoji: "💰",
        description: "The government offers a grant for new HMOs. Do you apply?",
        minPolicies: 10,
        choices: [
            { 
                text: "Accept Grant", 
                effect: function(game) {
                    game.money += 5000;
                    game.showEventMessage("Accepted $5,000 grant! 💰");
                }
            },
            { 
                text: "Decline", 
                effect: function(game) {
                    game.showEventMessage("Declined grant. Reputation intact! ✨");
                }
            }
        ]
    },
    {
        name: "Provider Strike",
        emoji: "⚕️",
        description: "Healthcare providers threaten to strike over low payouts!",
        minPolicies: 20,
        choices: [
            { 
                text: "Raise Payouts ($1,000)", 
                effect: function(game) {
                    game.money -= 1000;
                    game.showEventMessage("Paid providers $1,000 to prevent strike 🤝");
                }
            },
            { 
                text: "Negotiate", 
                effect: function(game) {
                    if (Math.random() < 0.5) {
                        game.premiumRate *= 0.9;
                        game.showEventMessage("Negotiation failed! Premium rate reduced 10% 📉");
                    } else {
                        game.showEventMessage("Successfully negotiated! Crisis averted 🎉");
                    }
                }
            }
        ]
    },
    {
        name: "Market Fluctuation",
        emoji: "📈",
        minPolicies: 5,
        effect: function(game) {
            game.premiumRate *= 1.1;
            game.showEventMessage("Market rates increased! Premium rate up 10% 📈");
        }
    },
    {
        name: "Happy Customers",
        emoji: "😊",
        minPolicies: 3,
        effect: function(game) {
            game.money += 500;
            game.showEventMessage("Customer satisfaction bonus received! +$500 😊");
        }
    },
    {
        name: "Efficient Processing",
        emoji: "⚡",
        minPolicies: 8,
        effect: function(game) {
            game.money += game.policies * 10;
            game.showEventMessage("Claims processed efficiently! Bonus based on policies ⚡");
        }
    }
];

const CLAIMS_EVENTS = [
    {
        name: "Routine Checkup Claim",
        emoji: "🏥",
        description: "A policyholder filed a $500 claim for a routine checkup.",
        minPolicies: 5,
        choices: [
            { 
                text: CLAIM_CHOICES.DENY,
                effect: function(game) {
                    game.showEventMessage("Claim denied. Saved $500 but reputation may suffer 🚫");
                }
            },
            { 
                text: CLAIM_CHOICES.DEPOSE_PATIENT,
                effect: function(game) {
                    if (Math.random() < 0.7) {
                        game.showEventMessage("Found inconsistency in testimony! Claim invalidated 📝");
                    } else {
                        game.money -= 1000;
                        game.showEventMessage("Deposition backfired. Paid $1,000 in legal fees 👎");
                    }
                }
            },
            { 
                text: CLAIM_CHOICES.DELAY,
                effect: function(game) {
                    if (Math.random() < 0.5) {
                        game.showEventMessage("Patient gave up pursuing claim! 📨");
                    } else {
                        game.money -= 500;
                        game.showEventMessage("Had to pay claim with interest: $500 💸");
                    }
                }
            }
        ]
    },
    {
        name: "Emergency Surgery Claim",
        emoji: "🚑",
        description: "Urgent $5,000 claim for emergency appendectomy.",
        minPolicies: 15,
        choices: [
            { 
                text: CLAIM_CHOICES.DENY_RISKY,
                effect: function(game) {
                    if (Math.random() < 0.3) {
                        game.showEventMessage("Claim successfully denied! Saved $5,000 🎯");
                    } else {
                        game.money -= 10000;
                        game.showEventMessage("Lawsuit filed! Paid $10,000 in damages ⚖️");
                    }
                }
            },
            { 
                text: CLAIM_CHOICES.DEPOSE_STAFF,
                effect: function(game) {
                    if (Math.random() < 0.6) {
                        game.money -= 2000;
                        game.showEventMessage("Found procedure wasn't entirely necessary. Settled for $2,000 📊");
                    } else {
                        game.money -= 7000;
                        game.showEventMessage("Deposition supported claim. Paid $7,000 total 📉");
                    }
                }
            },
            { 
                text: CLAIM_CHOICES.DELAY_PAPERWORK,
                effect: function(game) {
                    game.money -= 5000;
                    game.showEventMessage("Eventually had to pay the full $5,000 plus bad PR 📋");
                }
            }
        ]
    }
];

// Add claims events to the main events array
GAME_EVENTS.push(...CLAIMS_EVENTS);

// Add this to the window object so it's globally available
window.GAME_EVENTS = GAME_EVENTS; 

// Add early-game events to reflect historical context
const EARLY_EVENTS = [
    {
        name: "HMO Act Opportunity",
        emoji: "📜",
        description: "The HMO Act of 1973 provides funding for new prepaid healthcare organizations. Apply for federal support?",
        minPolicies: 0,
        maxPolicies: 10,  // Only show very early
        choices: [
            {
                text: "Apply for Funding",
                effect: function(game) {
                    game.money += 1000;
                    game.showEventMessage("Received $1,000 in federal HMO Act funding! 💰");
                }
            },
            {
                text: "Remain Independent",
                effect: function(game) {
                    game.premiumRate *= 1.2;
                    game.showEventMessage("Maintaining independence. Premium rates increased! 📈");
                }
            }
        ]
    },
    {
        name: "Provider Partnership",
        emoji: "🏥",
        description: "A local hospital is interested in joining your prepaid care network.",
        minPolicies: 3,
        maxPolicies: 15,
        choices: [
            {
                text: "Partner ($500)",
                effect: function(game) {
                    game.money -= 500;
                    game.policiesPerSecond *= 1.2;
                    game.showEventMessage("New provider added to network! Growth rate increased 🤝");
                }
            },
            {
                text: "Decline Partnership",
                effect: function(game) {
                    game.showEventMessage("Maintained selective network standards ✨");
                }
            }
        ]
    },
    {
        name: "Preventive Care Initiative",
        emoji: "💉",
        description: "Implement a preventive care program to reduce long-term costs?",
        minPolicies: 8,
        maxPolicies: 20,
        choices: [
            {
                text: "Launch Program ($1,000)",
                effect: function(game) {
                    game.money -= 1000;
                    // Reduce claim frequency (if claims system is active)
                    if (game.claimsManager) {
                        game.claimsManager.claimProbability *= 0.8;
                    }
                    game.showEventMessage("Preventive care program launched! Claim rates reduced 📊");
                }
            },
            {
                text: "Focus on Treatment",
                effect: function(game) {
                    game.premiumRate *= 1.1;
                    game.showEventMessage("Maintaining traditional care model. Premiums adjusted 💰");
                }
            }
        ]
    }
];

// Add early events to main events array
GAME_EVENTS.unshift(...EARLY_EVENTS); 