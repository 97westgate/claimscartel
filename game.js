class Game {
    constructor() {
        this.policies = 0;
        this.money = 0;
        this.policyValue = 100;
        this.premiumRate = 10; // $ per policy per second
        this.manualPoliciesLastSecond = 0;
        this.lastPolicyCount = 0;
        this.policiesPerSecond = 0;

        // Upgrade definitions
        this.upgrades = {
            employee: { 
                cost: 1000, 
                multiplier: 2, 
                count: 0,
                baseCost: 1000,
                name: "Hire Employee",
                emoji: "👨‍💼",
                policiesPerSecond: 0.1,
                visibleAtPolicies: 5  // Show after 5 policies
            }
        };

        // Get DOM elements
        this.clickable = document.getElementById('clickable');
        this.policiesDisplay = document.getElementById('policies');
        this.moneyDisplay = document.getElementById('money');
        this.revenueDisplay = document.createElement('div');
        this.revenueDisplay.id = 'revenue';
        this.policiesPerSecDisplay = document.createElement('div');
        this.policiesPerSecDisplay.id = 'policies-per-sec';
        document.querySelector('.stats').appendChild(this.revenueDisplay);
        document.querySelector('.stats').appendChild(this.policiesPerSecDisplay);
        this.upgradesContainer = document.createElement('div');
        this.upgradesContainer.id = 'upgrades';
        document.body.appendChild(this.upgradesContainer);

        // Remove both audio elements reference since we'll create them dynamically
        this.clickSoundTemplate = document.getElementById('clickSound');
        this.upgradeSoundTemplate = document.getElementById('upgradeSound');
        this.clickSoundTemplate.remove();
        this.upgradeSoundTemplate.remove();

        // Bind click handler
        this.clickable.addEventListener('click', () => this.handleClick());

        // Start automatic policy generation
        setInterval(() => {
            if (!this.isPaused) this.generateAutomaticPolicies();
        }, 100);
        
        // Start premium collection
        setInterval(() => {
            if (!this.isPaused) this.collectPremiums();
        }, 1000);

        // Update policies per second counter every second
        setInterval(() => {
            if (!this.isPaused) this.updatePoliciesPerSecond();
        }, 1000);

        // Get static elements
        this.employeeButton = document.getElementById('employee-button');
        this.employeeCost = document.getElementById('employee-cost');
        this.employeeCount = document.getElementById('employee-count');
        
        // Hide employee upgrade initially
        document.querySelector('.upgrade-item').style.display = 'none';

        // Add click handler to employee button
        this.employeeButton.addEventListener('click', () => {
            if (!this.isPaused) {
                this.purchaseUpgrade('employee');
            }
        });

        // Update display
        this.updateDisplay();

        // Replace events array with imported events
        this.events = [
            {
                name: "Federal Grant Opportunity",
                emoji: "💰",
                description: "The government offers a grant for new HMOs. Do you apply?",
                minPolicies: 10,
                choices: [
                    { 
                        text: "Accept Grant", 
                        effect: () => {
                            this.money += 5000;
                            this.showEventMessage("Accepted $5,000 grant! 💰");
                        }
                    },
                    { 
                        text: "Decline", 
                        effect: () => {
                            this.showEventMessage("Declined grant. Reputation intact! ✨");
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
                        effect: () => {
                            this.money -= 1000;
                            this.showEventMessage("Paid providers $1,000 to prevent strike 🤝");
                        }
                    },
                    { 
                        text: "Negotiate", 
                        effect: () => {
                            if (Math.random() < 0.5) {
                                this.premiumRate *= 0.9;
                                this.showEventMessage("Negotiation failed! Premium rate reduced 10% 📉");
                            } else {
                                this.showEventMessage("Successfully negotiated! Crisis averted 🎉");
                            }
                        }
                    }
                ]
            }
        ];

        // Start random events after a delay
        setTimeout(() => {
            setInterval(() => this.triggerRandomEvent(), 30000);
        }, 15000);

        this.isPaused = false;
    }

    generateAutomaticPolicies() {
        const employees = this.upgrades.employee;
        const policiesGenerated = (employees.count * employees.policiesPerSecond) / 10;
        this.policies += policiesGenerated;
        this.updateDisplay();
    }

    collectPremiums() {
        // Collect premiums from all policies once per second
        const premiumsCollected = this.policies * (this.premiumRate / 1);
        this.money += premiumsCollected;
        this.updateDisplay();
    }

    handleClick() {
        if (this.isPaused) return;
        
        this.policies++;
        
        const clickSound = new Audio('click.mp3');
        clickSound.volume = 0.2;
        clickSound.play();
        
        this.clickable.classList.add('clicked');
        setTimeout(() => this.clickable.classList.remove('clicked'), 150);
        
        this.updateDisplay();
    }

    purchaseUpgrade(upgradeKey) {
        if (this.isPaused) return;
        
        const upgrade = this.upgrades[upgradeKey];
        if (this.money >= upgrade.cost) {
            this.money -= upgrade.cost;
            this.policyValue *= upgrade.multiplier;
            upgrade.count++;
            
            const upgradeSound = new Audio('hi.mp3');
            upgradeSound.volume = 0.3;
            upgradeSound.play();

            // Get button by ID, just like clipboard
            const button = document.getElementById('employee-button');
            button.classList.add('clicked');
            setTimeout(() => button.classList.remove('clicked'), 150);
            
            upgrade.cost = Math.round(upgrade.baseCost * Math.pow(1.15, upgrade.count));
            this.updateDisplay();
        }
    }

    updatePoliciesPerSecond() {
        this.policiesPerSecond = this.policies - this.lastPolicyCount;
        this.lastPolicyCount = this.policies;
        this.updateDisplay();
    }

    updateDisplay() {
        // Update basic stats
        this.policiesDisplay.textContent = Math.floor(this.policies);
        this.moneyDisplay.textContent = Math.floor(this.money).toLocaleString();
        this.revenueDisplay.textContent = `Revenue: $${Math.floor(this.policies * this.premiumRate)}/sec`;
        this.policiesPerSecDisplay.textContent = `Policies: ${this.policiesPerSecond.toFixed(1)}/sec`;

        // Update employee upgrade
        const employee = this.upgrades.employee;
        document.querySelector('.upgrade-item').style.display = 
            this.policies >= employee.visibleAtPolicies ? 'grid' : 'none';
            
        if (this.policies >= employee.visibleAtPolicies) {
            this.employeeButton.disabled = this.money < employee.cost;
            this.employeeCost.textContent = `$${employee.cost.toLocaleString()}`;
            this.employeeCount.textContent = employee.emoji.repeat(employee.count);
            if (employee.count > 0) {
                this.employeeCount.textContent += ` (${(employee.count * employee.policiesPerSecond).toFixed(1)} policies/sec)`;
            }
        }
    }

    showEventMessage(message) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-message';
        eventDiv.textContent = message;
        document.body.appendChild(eventDiv);

        // Remove after animation
        setTimeout(() => {
            eventDiv.classList.add('fade-out');
            setTimeout(() => eventDiv.remove(), 500);
        }, 4000);
    }

    showEventModal(event) {
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        
        // Pause the game when showing modal
        this.isPaused = true;
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${event.emoji} ${event.name}</h2>
                <p>${event.description}</p>
                <div class="modal-buttons"></div>
            </div>
        `;

        const buttonContainer = modal.querySelector('.modal-buttons');
        
        event.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.onclick = () => {
                choice.effect(this);
                document.body.removeChild(modal);
                this.isPaused = false;
            };
            buttonContainer.appendChild(button);
        });

        document.body.appendChild(modal);
    }

    triggerRandomEvent() {
        const availableEvents = this.events.filter(event => 
            this.policies >= (event.minPolicies || 0)
        );
        
        if (availableEvents.length > 0) {
            const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            this.showEventModal(event);
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    const game = new Game();
};
