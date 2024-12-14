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

// Add this to the window object so it's globally available
window.GAME_EVENTS = GAME_EVENTS; 