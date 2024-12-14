const gameEvents = [
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
                effect: (game) => {
                    game.money -= 1000;
                    game.showEventMessage("Paid providers $1,000 to prevent strike 🤝");
                }
            },
            { 
                text: "Negotiate", 
                effect: (game) => {
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
        name: "Flu Outbreak",
        emoji: "🤒",
        description: "A flu outbreak is spreading! Opportunity or crisis?",
        minPolicies: 15,
        choices: [
            {
                text: "Raise Premiums",
                effect: (game) => {
                    game.premiumRate *= 1.2;
                    game.showEventMessage("Premiums increased by 20% during outbreak! 📈");
                }
            },
            {
                text: "Cover All Claims",
                effect: (game) => {
                    game.money *= 0.8;
                    game.showEventMessage("Covered all claims. Public approval increased! 🏥");
                }
            }
        ]
    },
    {
        name: "Startup Competition",
        emoji: "🚀",
        description: "A new insurance startup is stealing customers!",
        minPolicies: 25,
        choices: [
            {
                text: "Aggressive Marketing ($2,000)",
                effect: (game) => {
                    game.money -= 2000;
                    game.policiesPerSecond *= 1.5;
                    game.showEventMessage("Marketing campaign launched! Growth increased 📢");
                }
            },
            {
                text: "Undercut Prices",
                effect: (game) => {
                    game.premiumRate *= 0.8;
                    game.showEventMessage("Reduced premiums to stay competitive 📉");
                }
            }
        ]
    },
    {
        name: "Government Audit",
        emoji: "📋",
        description: "Regulators are reviewing your practices!",
        minPolicies: 30,
        choices: [
            {
                text: "Cooperate Fully",
                effect: (game) => {
                    game.money -= 3000;
                    game.showEventMessage("Passed audit with flying colors! ✅");
                }
            },
            {
                text: "Hide Documents",
                effect: (game) => {
                    if (Math.random() < 0.3) {
                        game.money -= 10000;
                        game.showEventMessage("Caught hiding documents! Heavy fine imposed 🚫");
                    } else {
                        game.showEventMessage("Successfully avoided scrutiny... for now 🤫");
                    }
                }
            }
        ]
    },
    {
        name: "Medical Breakthrough",
        emoji: "💊",
        description: "New treatment available! But it's expensive...",
        minPolicies: 40,
        choices: [
            {
                text: "Cover Treatment",
                effect: (game) => {
                    game.money -= 5000;
                    game.premiumRate *= 1.3;
                    game.showEventMessage("Covering new treatment. Premiums increased! 💉");
                }
            },
            {
                text: "Deny Coverage",
                effect: (game) => {
                    game.policiesPerSecond *= 0.9;
                    game.showEventMessage("Treatment denied. Customer satisfaction decreased 👎");
                }
            }
        ]
    },
    {
        name: "Hospital Merger",
        emoji: "🏥",
        description: "Local hospitals are merging. They want better rates.",
        minPolicies: 50,
        choices: [
            {
                text: "Negotiate Deal",
                effect: (game) => {
                    game.premiumRate *= 1.1;
                    game.showEventMessage("New deal reached with hospital group 🤝");
                }
            },
            {
                text: "Find New Providers",
                effect: (game) => {
                    game.money -= 4000;
                    game.showEventMessage("Contracted with new providers 🏥");
                }
            }
        ]
    },
    // ... I'll continue with more events in the next message due to length
];

export default gameEvents; 