// Enhanced game systems with new mechanics
class EnhancedGame extends Game {
    constructor(initialState = 'NEW_GAME') {
        super(initialState);
        
        // Initialize new systems
        this.specializations = {
            health: { level: 1, multiplier: 1.0, research: 0 },
            life: { level: 0, multiplier: 1.0, research: 0 },
            property: { level: 0, multiplier: 1.0, research: 0 }
        };
        
        this.investments = {
            cash: { amount: 0, risk: 0, return: 0.02 },
            bonds: { amount: 0, risk: 0.1, return: 0.05 },
            stocks: { amount: 0, risk: 0.3, return: 0.12 },
            ventures: { amount: 0, risk: 0.5, return: 0.25 }
        };
        
        this.research = {
            points: 0,
            generating: 0,
            projects: new Map()
        };
        
        this.competition = {
            rivals: new Map(),
            marketShare: 0.1,
            contracts: new Map()
        };
        
        // Market conditions that affect gameplay
        this.marketConditions = {
            economicState: 1.0,  // Multiplier for all revenue
            competitorActivity: 1.0,  // Affects market share
            regulations: 1.0,    // Affects operating costs
            consumerConfidence: 1.0  // Affects policy growth
        };
        
        // Initialize competition
        this.initializeCompetition();
        
        // Start market condition updates
        setInterval(() => this.updateMarketConditions(), 60000);
        
        // Start investment returns calculation
        setInterval(() => this.calculateInvestmentReturns(), 5000);
        
        // Add sound manager
        this.soundManager = {
            playClickSound: () => {
                const sound = this.clickSounds[this.currentClickNote];
                sound.sound.currentTime = 0;
                sound.sound.play();
                this.currentClickNote = (this.currentClickNote + 1) % this.clickSounds.length;
            },
            playUpgradeSound: () => {
                const sound = this.upgradeSounds[Math.floor(Math.random() * this.upgradeSounds.length)];
                sound.sound.currentTime = 0;
                sound.sound.play();
            },
            playEventSound: (type) => {
                // Different sounds for different event types
                switch(type) {
                    case 'claim':
                        this.playClaimSound();
                        break;
                    case 'milestone':
                        this.playMilestoneSound();
                        break;
                    default:
                        this.playPopupSound();
                }
            }
        };
    }
    
    initializeCompetition() {
        const competitors = [
            { name: "HealthGuard Inc.", strength: 0.8, aggressive: true },
            { name: "SafeLife Corp.", strength: 1.2, aggressive: false },
            { name: "SecureHealth Partners", strength: 1.0, aggressive: true }
        ];
        
        competitors.forEach(comp => {
            this.competition.rivals.set(comp.name, {
                marketShare: 0.1,
                strength: comp.strength,
                aggressive: comp.aggressive,
                lastAction: Date.now()
            });
        });
    }
    
    updateMarketConditions() {
        // Randomly adjust market conditions
        const volatility = 0.1;
        
        Object.keys(this.marketConditions).forEach(condition => {
            const change = (Math.random() - 0.5) * volatility;
            this.marketConditions[condition] = Math.max(0.5, 
                Math.min(1.5, this.marketConditions[condition] + change));
        });
        
        // Create market events based on conditions
        if (this.marketConditions.economicState < 0.7) {
            this.showEventMessage("📉 Economic downturn affecting policy sales!");
        } else if (this.marketConditions.economicState > 1.3) {
            this.showEventMessage("📈 Economic boom increasing demand!");
        }
    }
    
    calculateInvestmentReturns() {
        Object.entries(this.investments).forEach(([type, info]) => {
            if (info.amount <= 0) return;
            
            const baseReturn = info.return * this.marketConditions.economicState;
            const risk = Math.random() < info.risk;
            
            if (risk) {
                const loss = info.amount * info.risk * Math.random();
                info.amount -= loss;
                this.showEventMessage(`📉 Lost $${Math.floor(loss).toLocaleString()} in ${type} investments!`);
            } else {
                const gain = info.amount * baseReturn * (1/12); // Monthly return
                info.amount += gain;
                this.money += gain;
            }
        });
    }
    
    handleSpecialization(type) {
        const spec = this.specializations[type];
        const cost = Math.pow(2, spec.level) * 100000;
        
        if (this.money >= cost) {
            this.money -= cost;
            spec.level++;
            spec.multiplier += 0.1;
            
            // Specialization affects claim handling
            if (type === 'health') {
                this.claimsManager.investigationEfficiency += 0.1;
            } else if (type === 'life') {
                this.claimsManager.fraudDetection += 0.1;
            } else if (type === 'property') {
                this.claimsManager.processingSpeed += 0.1;
            }
            
            this.showEventMessage(`🎓 Specialized in ${type} insurance! New multiplier: ${spec.multiplier.toFixed(1)}x`);
        }
    }
    
    processResearch() {
        this.research.points += this.research.generating;
        
        this.research.projects.forEach((project, id) => {
            if (project.points >= project.required) {
                this.completeResearch(id);
            }
        });
    }
    
    completeResearch(projectId) {
        const project = this.research.projects.get(projectId);
        
        // Apply research benefits
        switch(project.type) {
            case 'efficiency':
                this.efficiencyLevel *= 1.2;
                break;
            case 'claims':
                this.claimsManager.investigationEfficiency *= 1.15;
                break;
            case 'expansion':
                Object.values(this.markets).forEach(m => m.multiplier *= 1.1);
                break;
        }
        
        this.showEventMessage(`🔬 Research complete: ${project.name}!`);
        this.research.projects.delete(projectId);
    }
    
    handleContract(contract) {
        const bidders = Array.from(this.competition.rivals.values())
            .filter(rival => rival.marketShare > 0.05)
            .map(rival => {
                const bid = contract.value * (1 - (Math.random() * rival.strength * 0.3));
                return { rival, bid };
            });
        
        // Player's potential profit margin
        const minMargin = 0.05;  // 5% minimum profit margin
        const maxMargin = 0.30;  // 30% maximum profit margin
        
        return {
            lowestBid: Math.min(...bidders.map(b => b.bid)),
            suggestedBid: contract.value * 0.85,
            minBid: contract.value * (1 - maxMargin),
            maxBid: contract.value * (1 - minMargin)
        };
    }
    
    submitBid(contract, bidAmount) {
        const competitors = Array.from(this.competition.rivals.values());
        const competitorBids = competitors.map(rival => {
            return rival.strength * contract.value * (0.7 + Math.random() * 0.3);
        });
        
        const lowestBid = Math.min(...competitorBids);
        
        if (bidAmount < lowestBid) {
            // Won the contract
            this.contracts.set(contract.id, {
                value: contract.value,
                duration: contract.duration,
                bidAmount: bidAmount,
                startTime: Date.now()
            });
            
            this.showEventMessage(`🤝 Won contract worth $${contract.value.toLocaleString()}!`);
            this.updatePublicOpinion(5);
        } else {
            this.showEventMessage(`❌ Lost contract to lower bid of $${Math.floor(lowestBid).toLocaleString()}`);
        }
    }
    
    calculateRevenue() {
        const baseRevenue = super.calculateRevenue();
        
        // Apply market conditions
        const marketEffect = Object.values(this.marketConditions).reduce((mult, condition) => mult * condition, 1);
        
        // Apply specializations
        const specializationEffect = Object.values(this.specializations)
            .reduce((mult, spec) => mult * spec.multiplier, 1);
        
        // Apply competition effects
        const competitionEffect = Math.max(0.5, 1 - (this.competition.marketShare * 0.5));
        
        // Apply research bonuses
        const researchEffect = 1 + (this.research.points * 0.001);
        
        return baseRevenue * marketEffect * specializationEffect * competitionEffect * researchEffect;
    }
    
    generateAutomaticPolicies() {
        const baseGeneration = super.generateAutomaticPolicies();
        
        // Modify based on market conditions
        const marketModifier = this.marketConditions.consumerConfidence;
        
        // Modify based on competition
        const competitionModifier = 1 - (this.competition.marketShare * 0.5);
        
        return baseGeneration * marketModifier * competitionModifier;
    }
    
    // Update handleClick to use sound manager
    handleClick() {
        if (this.isPaused) return;
        
        this.policies++;
        this.soundManager.playClickSound();
        this.updateDisplay();
        this.map.updateCoverage();
    }
    
    // Better integrate claims with game mechanics
    updateSalaryAndProfit() {
        super.updateSalaryAndProfit();
        
        // Adjust profit based on claims
        if (this.claimsManager && this.claimsManager.isClaimsSystemActive) {
            const activeClaims = this.claimsManager.activeClaims.size;
            const claimsPenalty = activeClaims * 0.05; // 5% penalty per active claim
            this.profitThisSecond *= (1 - claimsPenalty);
            
            // Update display with claims info
            if (this.profitDisplay) {
                this.profitDisplay.title = `Active Claims: ${activeClaims}\nClaims Penalty: -${(claimsPenalty * 100).toFixed(1)}%`;
            }
        }
    }
    
    updateDisplay() {
        super.updateDisplay();
        
        // Only show advanced systems after certain milestones
        if (this.policies >= 100) {
            document.getElementById('advanced-systems').style.display = 'block';
            
            // Update market indicators
            this.updateMarketDisplay();
            
            // Update specializations
            this.updateSpecializationsDisplay();
            
            // Update investments
            this.updateInvestmentsDisplay();
        }
    }
    
    updateMarketDisplay() {
        Object.entries(this.marketConditions).forEach(([condition, value]) => {
            const indicator = document.getElementById(`${condition}-indicator`);
            if (indicator) {
                indicator.style.width = `${value * 100}%`;
                indicator.title = `${(value * 100).toFixed(1)}%`;
            }
        });
    }
}
