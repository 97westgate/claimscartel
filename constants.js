// Define common claim choice texts
const CLAIM_CHOICES = {
    PAY: "💰 Pay Claim",
    DENY: "❌ Deny Claim",
    DENY_RISKY: "❌ Deny (High Risk)",
    DELAY: "⏳ Delay Processing",
    DELAY_PAPERWORK: "⏳ Delay with Paperwork",
    DEPOSE_PATIENT: "👨‍⚖️ Depose Patient",
    DEPOSE_STAFF: "👨‍⚖️ Depose Medical Staff"
};

// Define initial states for testing based on milestone progression
const INITIAL_STATES = {
    NEW_GAME: {
        policies: 0,
        money: 0,
        employees: 0,
        premiumRate: 5
    },
    FUNDED: {
        policies: 5,
        money: 1000,
        employees: 1,
        premiumRate: 5
    },
    NETWORK_ESTABLISHED: {
        policies: 10,
        money: 5000,
        employees: 3,
        premiumRate: 8
    },
    REGIONAL: {
        policies: 50,
        money: 25000,
        employees: 8
    },
    CORPORATE: {
        policies: 100,
        money: 50000,
        employees: 10
    },
    NATIONAL: {
        policies: 5000,
        money: 1000000,
        employees: 25
    },
    ENDGAME: {
        policies: 50000,
        money: 500000000,
        employees: 100
    }
};

const MILESTONES = {
    FIRST_NETWORK: {
        name: "Provider Network",
        policies: 10,
        description: "Build your first network of healthcare providers.",
        reward: "The work itself is reward enough"
    },
    STARTUP_FUNDING: {
        name: "HMO Act Funding",
        policies: 25,
        money: 1000,
        description: "Secure federal funding under the HMO Act of 1973.",
        reward: "Employees available"
    },
    PREPAID_PIONEER: {
        name: "Prepaid Care Pioneer",
        policies: 100,
        description: "Establish a working prepaid care model.",
        reward: "Premium rate +20%"
    },
    REGIONAL_PLAYER: {
        name: "Minnesota Coverage",
        policies: 5000,
        description: "Expand coverage across Minnesota.",
        reward: "Public opinion system unlocked"
    },
    CORPORATE_POWER: {
        name: "Corporate Power",
        policies: 10000,
        employees: 10,
        description: "Your size attracts government attention.",
        reward: "Lobbying system unlocked"
    },
    HMO_PIONEER: {
        name: "HMO Pioneer",
        policies: 20000,
        description: "Introduce managed care and redefine the industry.",
        reward: "HMO plans unlocked"
    },
    NETWORK_BUILDER: {
        name: "Network Builder",
        policies: 50000,
        description: "Establish partnerships with providers nationwide.",
        reward: "Provider network system unlocked"
    },
    NATIONAL_PLAYER: {
        name: "National Player",
        policies: 100000,
        money: 1000000,
        description: "Expand operations across the country.",
        reward: "Corporate branding boost (+20% premium revenue)"
    },
    HEALTHCARE_MONOPOLY: {
        name: "Healthcare Monopoly",
        policies: 200000,
        employees: 50,
        description: "Dominate the private insurance market.",
        reward: "Market control: reduce competition penalties"
    },
    GLOBAL_EXPANSION: {
        name: "Global Expansion",
        policies: 500000,
        money: 5000000,
        publicOpinion: 80,
        description: "Launch operations in international markets.",
        reward: "Global network unlocked (+50% policy growth rate)"
    },
    POLICY_CARTEL: {
        name: "Policy Cartel",
        policies: 1000000,
        money: 20000000,
        description: "Control healthcare access at an unprecedented scale.",
        reward: "Dynamic pricing unlocked (adjust premiums for profit)"
    },
    PUBLIC_HEALTH_INNOVATOR: {
        name: "Public Health Innovator",
        policies: 2000000,
        description: "Invest in preventative care and public health programs.",
        reward: "Preventative care reduces claim frequency by 25%"
    },
    INSURANCE_EMPIRE: {
        name: "Insurance Empire",
        policies: 5000000,
        money: 500000000,
        description: "Achieve massive scale and unparalleled influence.",
        reward: "Empire tier: prestige unlock (revenue multiplier)"
    },
    FINAL_GOAL: {
        name: "Healthcare Titan",
        policies: 10000000,
        money: 90000000000,
        description: "Achieve $90 billion in revenue and cement your legacy.",
        reward: "Victory!"
    }
};

// Add new milestones that unlock features
const PROGRESSION_MILESTONES = {
    // Early Game (0-1000 policies)
    STARTUP: {
        name: "Insurance Startup",
        policies: 25,
        reward: "Unlock basic employees"
    },
    
    // Growth Phase (1000-10000 policies)
    REGIONAL_EXPANSION: {
        name: "Regional Player",
        policies: 1000,
        reward: "Unlock managers and premium policies"
    },
    
    // Corporate Phase (10000-100000 policies)
    CORPORATE_PRESENCE: {
        name: "Corporate Entity",
        policies: 10000,
        reward: "Unlock executives and corporate plans"
    },
    
    // Market Domination (100000+ policies)
    MARKET_LEADER: {
        name: "Market Leader",
        policies: 100000,
        reward: "Unlock mergers and government contracts"
    },
    
    // End Game
    INSURANCE_TITAN: {
        name: "Insurance Titan",
        policies: 1000000,
        money: 90000000000,
        reward: "Victory!"
    }
};

// Track achievements
const ACHIEVEMENTS = {
    FIRST_DENIAL: {
        name: "First Denial",
        description: "Deny your first claim",
        icon: "❌"
    },
    PERFECT_INVESTIGATION: {
        name: "Perfect Investigation",
        description: "Find all red flags in a fraudulent claim",
        icon: "🔍"
    },
    PUBLIC_MANIPULATOR: {
        name: "Public Manipulator",
        description: "Maintain low public opinion while keeping high profits",
        icon: "🎭"
    }
};

const SPECIALIZATIONS = {
    HEALTH: {
        name: "Health Insurance",
        baseMultiplier: 1.0,
        upgrades: [
            { level: 1, cost: 100000, bonus: "Claims processing +10%" },
            { level: 2, cost: 250000, bonus: "Public opinion impact -20%" },
            { level: 3, cost: 1000000, bonus: "Revenue multiplier +20%" }
        ]
    },
    LIFE: {
        name: "Life Insurance",
        baseMultiplier: 1.2,
        upgrades: [
            { level: 1, cost: 150000, bonus: "Fraud detection +15%" },
            { level: 2, cost: 300000, bonus: "Investment returns +10%" },
            { level: 3, cost: 1200000, bonus: "Revenue multiplier +25%" }
        ]
    },
    PROPERTY: {
        name: "Property Insurance",
        baseMultiplier: 1.5,
        upgrades: [
            { level: 1, cost: 200000, bonus: "Processing speed +20%" },
            { level: 2, cost: 400000, bonus: "Market expansion -15% cost" },
            { level: 3, cost: 1500000, bonus: "Revenue multiplier +30%" }
        ]
    }
};

const RESEARCH_PROJECTS = {
    EFFICIENCY: {
        name: "Operational Efficiency",
        baseCost: 50000,
        baseTime: 300,  // seconds
        effects: ["Processing costs -10%", "Employee effectiveness +15%"]
    },
    RISK_MANAGEMENT: {
        name: "Risk Assessment",
        baseCost: 75000,
        baseTime: 600,
        effects: ["Fraud detection +20%", "Claim accuracy +15%"]
    },
    MARKET_EXPANSION: {
        name: "Market Analysis",
        baseCost: 100000,
        baseTime: 900,
        effects: ["Market expansion costs -20%", "New market revenue +10%"]
    }
};

const INVESTMENT_TYPES = {
    CONSERVATIVE: {
        name: "Government Bonds",
        risk: 0.05,
        returnRate: 0.04,
        minAmount: 10000
    },
    BALANCED: {
        name: "Corporate Bonds",
        risk: 0.15,
        returnRate: 0.08,
        minAmount: 50000
    },
    AGGRESSIVE: {
        name: "Stock Market",
        risk: 0.25,
        returnRate: 0.15,
        minAmount: 100000
    },
    VENTURE: {
        name: "Startup Investments",
        risk: 0.40,
        returnRate: 0.25,
        minAmount: 500000
    }
};

// Add to MILESTONES
const ENHANCED_MILESTONES = {
    SPECIALIZATION_UNLOCKED: {
        name: "Insurance Specialist",
        policies: 1000,
        reward: "Unlocks specialization system"
    },
    INVESTMENT_UNLOCKED: {
        name: "Capital Manager",
        money: 1000000,
        reward: "Unlocks investment system"
    },
    RESEARCH_UNLOCKED: {
        name: "Industry Innovator",
        policies: 5000,
        money: 5000000,
        reward: "Unlocks research system"
    }
};

Object.assign(MILESTONES, ENHANCED_MILESTONES);

// Export for use in other files
window.CLAIM_CHOICES = CLAIM_CHOICES;
window.INITIAL_STATES = INITIAL_STATES;
window.MILESTONES = MILESTONES;
window.ACHIEVEMENTS = ACHIEVEMENTS; 