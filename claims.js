class Claim {
    constructor(amount, timeLimit = 30) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.amount = amount;
        this.timeLimit = timeLimit;
        this.status = "pending";
        this.createdAt = Date.now();
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
        console.log('Checking for new claims:', {
            policies: this.game.policies,
            randomCheck,
            probability: this.claimProbability,
            willGenerateClaim: randomCheck < this.claimProbability
        });
        
        if (randomCheck < this.claimProbability) {
            const baseAmount = Math.floor(Math.random() * 1000) + 500;
            const claim = new Claim(baseAmount);
            this.activeClaims.set(claim.id, claim);
            
            console.log('New claim generated:', claim);
            this.game.showEventMessage(`New claim received: $${claim.amount} 📋`);
        }
    }

    // Add new method to handle claim interaction
    handleClaim(claimId) {
        const claim = this.activeClaims.get(claimId);
        if (!claim) return;
        
        // Show claim event modal
        const claimEvent = {
            name: "Insurance Claim",
            emoji: "🏥",
            description: `Claim amount: $${claim.amount}`,
            choices: [
                {
                    text: "Pay Claim",
                    effect: () => this.resolveClaim(claimId, "approved")
                },
                {
                    text: "Deny Claim",
                    effect: () => this.resolveClaim(claimId, "denied")
                },
                {
                    text: "Delay Processing",
                    effect: () => this.delayClaim(claimId)
                }
            ]
        };
        
        this.game.showEventModal(claimEvent);
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
            
            // Make claim clickable
            claimElement.style.cursor = 'pointer';
            claimElement.onclick = () => this.handleClaim(id);
            
            claimElement.innerHTML = `
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