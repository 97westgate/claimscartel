class Claim {
    constructor(amount, timeLimit = 30) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.amount = amount;
        this.timeLimit = timeLimit;
        this.status = "pending";
        this.createdAt = Date.now();
        
        this.type = this.generateClaimType();
        
        // Legitimacy now influenced by claim type
        const baseChance = Math.random();
        const typeModifier = {
            "Routine Checkup": 0.2,  // Usually legitimate
            "Emergency": -0.3,       // Often has inconsistencies due to rush
            "Prescription": 0.1,     // Generally legitimate
            "Surgery": -0.2         // Complex, harder to verify
        }[this.type.name];
        
        this.legitimacy = Math.min(1, Math.max(0, baseChance + typeModifier));
        
        // Generate specific details about the claim
        this.details = this.generateDetails();
        
        // Track which investigations have been performed
        this.investigations = new Set();
    }

    generateClaimType() {
        const types = [
            { name: "Routine Checkup", multiplier: 0.8, icon: "🏥" },
            { name: "Emergency", multiplier: 2.0, icon: "🚑" },
            { name: "Prescription", multiplier: 0.5, icon: "💊" },
            { name: "Surgery", multiplier: 3.0, icon: "🔪" }
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    generateDetails() {
        const isLegit = this.legitimacy > 0.5;
        
        return {
            documentation: {
                dates: isLegit ? "All dates consistent" : "Multiple date discrepancies found",
                signatures: isLegit ? "All signatures verified" : "Missing key signatures",
                codes: isLegit ? "Correct billing codes" : "Unusual billing code pattern"
            },
            medical: {
                history: isLegit ? "Consistent with patient record" : "Conflicts with previous records",
                symptoms: isLegit ? "Well documented symptoms" : "Vague symptom description",
                treatment: isLegit ? "Standard treatment protocol" : "Unusual treatment choice"
            },
            provider: {
                history: isLegit ? "Clean claim history" : "Previous fraudulent claims",
                license: isLegit ? "Current medical license" : "License renewal pending",
                specialization: isLegit ? "Specialist in treatment area" : "Outside normal practice area"
            }
        };
    }

    // Returns details based on completed investigations
    getVisibleDetails() {
        const visible = {};
        this.investigations.forEach(type => {
            INVESTIGATION_TYPES[type].reveals.forEach(category => {
                visible[category] = this.details[category];
            });
        });
        return visible;
    }

    // Can this type of investigation still be performed?
    canInvestigate(type) {
        return !this.investigations.has(type);
    }

    // Get cost for an investigation type
    getInvestigationCost(type) {
        return Math.round(INVESTIGATION_TYPES[type].cost(this.amount));
    }

    // Calculate confidence score based on visible details
    getConfidenceScore() {
        const details = this.getVisibleDetails();
        let legitimateCount = 0;
        let totalChecks = 0;
        
        Object.values(details).forEach(category => {
            Object.values(category).forEach(detail => {
                totalChecks++;
                if (!detail.includes("Missing") && 
                    !detail.includes("Unusual") && 
                    !detail.includes("Conflicts")) {
                    legitimateCount++;
                }
            });
        });
        
        return totalChecks ? (legitimateCount / totalChecks) : 0;
    }
}

class ClaimsManager {
    constructor(game) {
        this.game = game;
        this.activeClaims = new Map();
        this.claimProbability = 0.3; // 30% chance per check
        this.isClaimsSystemActive = false; // Start inactive
        
        // Check for claims system activation every second
        setInterval(() => this.checkClaimsSystemActivation(), 1000);
        
        // Process existing claims every second
        setInterval(() => this.processClaims(), 1000);
        
        // Add reference to claims container
        this.claimsContainer = document.getElementById('active-claims');
        this.claimsQueue = document.getElementById('claims-queue');
        
        // Hide claims queue initially
        this.claimsQueue.style.display = 'none';
        
        // Update display every second
        setInterval(() => this.updateClaimTimers(), 1000);
        
        this.claimHistory = [];
        this.maxHistoryLength = 10;
    }

    checkClaimsSystemActivation() {
        const hasEnoughPolicies = this.game.policies >= 10;
        const hasEmployee = this.game.upgrades.employee.count >= 5;
        
        if (hasEnoughPolicies && hasEmployee && !this.isClaimsSystemActive) {
            this.isClaimsSystemActive = true;
            this.claimsQueue.style.display = 'block';
            this.game.showEventMessage("🏥 Your company is growing, and clients are starting to file claims for covered services.");
            
            // Start checking for new claims
            this.claimsCheckInterval = setInterval(() => this.checkForNewClaims(), 10000);
        }
    }

    checkForNewClaims() {
        if (this.game.isPaused || !this.isClaimsSystemActive) return;
        
        const randomCheck = Math.random();
        
        if (randomCheck < this.claimProbability) {
            const baseAmount = Math.floor(Math.random() * 1000) + 500;
            const claim = new Claim(baseAmount);
            // Adjust amount based on claim type multiplier
            claim.amount = Math.round(claim.amount * claim.type.multiplier);
            this.activeClaims.set(claim.id, claim);
            
            this.game.showEventMessage(`New ${claim.type.name} claim: $${claim.amount} ${claim.type.icon}`);
        }
    }

    // Add new method to handle claim interaction
    handleClaim(claimId) {
        const claim = this.activeClaims.get(claimId);
        if (!claim) return;
        
        // Format visible details into HTML
        const details = claim.getVisibleDetails();
        let detailsHtml = '';
        
        for (const [category, items] of Object.entries(details)) {
            detailsHtml += `<div class="claim-category">
                <strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong><br>`;
            for (const [key, value] of Object.entries(items)) {
                detailsHtml += `- ${value}<br>`;
            }
            detailsHtml += '</div>';
        }
        
        const confidenceScore = claim.getConfidenceScore();
        const confidenceEmoji = confidenceScore > 0.7 ? "✅" : 
                               confidenceScore > 0.3 ? "⚠️" : "❌";
        
        // Generate investigation choices
        const investigationChoices = Object.entries(INVESTIGATION_TYPES)
            .filter(([type, _]) => claim.canInvestigate(type))
            .map(([type, info]) => ({
                text: `${info.emoji} ${info.name} ($${claim.getInvestigationCost(type)})`,
                effect: () => this.investigateClaim(claimId, type)
            }));
        
        const claimEvent = {
            name: claim.type.name,
            emoji: claim.type.icon,
            description: `<div class="claim-details">
                <div>Amount: $${claim.amount.toLocaleString()}</div>
                <div>Type: ${claim.type.name}</div>
                ${detailsHtml}
                ${claim.investigations.size > 0 ? 
                    `<div class="confidence-score">
                        Confidence: ${confidenceEmoji} ${Math.round(confidenceScore * 100)}%
                    </div>` : 
                    ''}
            </div>`,
            choices: [
                ...investigationChoices.map(choice => ({
                    ...choice,
                    attributes: { 'data-action': 'investigate' }
                })),
                {
                    text: CLAIM_CHOICES.PAY,
                    effect: () => this.resolveClaim(claimId, "approved"),
                    attributes: { 'data-action': 'pay' }
                },
                {
                    text: CLAIM_CHOICES.DENY,
                    effect: () => this.resolveClaim(claimId, "denied"),
                    attributes: { 'data-action': 'deny' }
                }
            ]
        };
        
        this.game.showEventModal(claimEvent);
    }

    investigateClaim(claimId, type) {
        const claim = this.activeClaims.get(claimId);
        if (!claim || !claim.canInvestigate(type)) return;
        
        const cost = claim.getInvestigationCost(type);
        if (this.game.money < cost) {
            this.game.showEventMessage("Not enough money for investigation! 💸");
            return;
        }
        
        this.game.money -= cost;
        claim.investigations.add(type);
        this.handleClaim(claimId); // Show modal again with new info
    }

    updateClaimTimers() {
        if (this.game.isPaused) return;
        
        this.claimsContainer.innerHTML = '';
        
        for (const [id, claim] of this.activeClaims) {
            const timeElapsed = (Date.now() - claim.createdAt) / 1000;
            const timeRemaining = Math.max(0, claim.timeLimit - timeElapsed);
            const percentageRemaining = (timeRemaining / claim.timeLimit) * 100;
            
            const claimElement = document.createElement('div');
            claimElement.className = `claim-item ${timeRemaining < 10 ? 'urgent' : ''}`;
            
            claimElement.style.cursor = 'pointer';
            claimElement.onclick = () => this.handleClaim(id);
            
            claimElement.innerHTML = `
                <div class="claim-type">${claim.type.icon} ${claim.type.name}</div>
                <div class="claim-amount">$${claim.amount.toLocaleString()}</div>
                <div class="claim-time">${Math.ceil(timeRemaining)}s</div>
                <div class="claim-timer" style="width: ${percentageRemaining}%"></div>
            `;
            
            this.claimsContainer.appendChild(claimElement);
        }
    }

    resolveClaim(claimId, status) {
        const claim = this.activeClaims.get(claimId);
        if (!claim) return;

        if (status === "denied") {
            if (claim.legitimacy > 0.7) {
                // Denying a legitimate claim
                const penalty = claim.amount * 2;
                this.game.money -= penalty;
                this.game.updatePublicOpinion(-20);
                this.game.showEventMessage(`Lawsuit lost! Paid ${penalty} in damages! ⚖️`);
            } else if (claim.legitimacy > 0.3) {
                // Grey area claim
                this.game.updatePublicOpinion(-5);
                this.game.showEventMessage("Claim denied, but public trust affected 📉");
            } else {
                // Fraudulent claim caught
                this.game.updatePublicOpinion(5);
                this.game.showEventMessage("Fraudulent claim caught! Public trust increased 📈");
            }
        }

        // Add to history
        this.claimHistory.unshift({
            type: claim.type.name,
            amount: claim.amount,
            status: status,
            timestamp: new Date()
        });

        // Keep history at max length
        if (this.claimHistory.length > this.maxHistoryLength) {
            this.claimHistory.pop();
        }

        claim.status = status;
        
        if (status === "approved") {
            this.game.money -= claim.amount;
            this.game.showEventMessage(`Claim paid: -$${claim.amount} 💰`);
        } else if (status === "denied") {
            this.game.showEventMessage(`Claim denied! Saved $${claim.amount} ❌`);
            // Reduce public opinion on first denial
            this.game.updatePublicOpinion(-10);
        }
        
        this.activeClaims.delete(claimId);
        this.updateClaimTimers();
    }

    delayClaim(claimId) {
        const claim = this.activeClaims.get(claimId);
        if (!claim) return;
        
        claim.timeLimit += 30;
        this.game.showEventMessage("Claim processing delayed... ⏳");
        this.updateClaimTimers(); // Update display immediately
    }

    processClaims() {
        if (this.game.isPaused) return;
        
        let claimsChanged = false;
        
        for (const [id, claim] of this.activeClaims) {
            if (Date.now() - claim.createdAt > claim.timeLimit * 1000) {
                this.game.money -= claim.amount * 1.5;
                this.game.showEventMessage(`Claim auto-approved with penalty: -$${claim.amount * 1.5} ⚠️`);
                this.activeClaims.delete(id);
                claimsChanged = true;
            }
        }
        
        if (claimsChanged) {
            this.updateClaimTimers();
        }
    }
}

// Export for use in game.js
window.ClaimsManager = ClaimsManager;

// Add specific investigation types with different costs/benefits
const INVESTIGATION_TYPES = {
    BASIC: {
        name: "Basic Review",
        cost: (amount) => amount * 0.05,  // 5% of claim
        emoji: "📝",
        reveals: ["documentation"]
    },
    MEDICAL: {
        name: "Medical Review",
        cost: (amount) => amount * 0.15,  // 15% of claim
        emoji: "🔬",
        reveals: ["medical"]
    },
    BACKGROUND: {
        name: "Provider Check",
        cost: (amount) => amount * 0.10,  // 10% of claim
        emoji: "🔍",
        reveals: ["provider"]
    }
};