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

// Export for use in other files
window.CLAIM_CHOICES = CLAIM_CHOICES;
window.INITIAL_STATES = INITIAL_STATES; 