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

// Define initial states for testing
const INITIAL_STATES = {
    NEW_GAME: {
        policies: 0,
        money: 0,
        employees: 0
    },
    CLAIMS_START: {
        policies: 10,
        money: 5000,
        employees: 5
    },
    LATE_GAME: {
        policies: 100,
        money: 50000,
        employees: 20
    },
    RICH: {
        policies: 50,
        money: 1000000,
        employees: 10
    }
};

const MILESTONES = {
    SMALL_BUSINESS: {
        name: "Small Insurance Business",
        policies: 10,
        description: "Handle your first claims",
        reward: "Claims system unlocked"
    },
    REGIONAL_PLAYER: {
        name: "Regional Player",
        policies: 50,
        description: "Start influencing public opinion",
        reward: "Public opinion system unlocked"
    },
    CORPORATE_POWER: {
        name: "Corporate Power",
        policies: 100,
        employees: 10,
        description: "Your size attracts government attention",
        reward: "Lobbying system unlocked"
    },
    CARTEL_STATUS: {
        name: "Insurance Cartel",
        policies: 200,
        money: 100000,
        publicOpinion: 30,
        description: "Maximum profit, minimum payout",
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