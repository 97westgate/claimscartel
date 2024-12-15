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
        policies: 1000,
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
    STARTUP_FUNDING: {
        name: "HMO Act Funding",
        policies: 10,
        money: 1000,
        description: "Secure federal funding under the HMO Act of 1973.",
        reward: "Employees available"
    },
    FIRST_NETWORK: {
        name: "Provider Network",
        policies: 25,
        description: "Build your first network of healthcare providers.",
        reward: "Claims system unlocked"
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

// Export for use in other files
window.CLAIM_CHOICES = CLAIM_CHOICES;
window.INITIAL_STATES = INITIAL_STATES;
window.MILESTONES = MILESTONES;
window.ACHIEVEMENTS = ACHIEVEMENTS; 