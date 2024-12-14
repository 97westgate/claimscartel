class Game {
    constructor(initialState = 'NEW_GAME') {
        // Get initial state configuration
        const state = INITIAL_STATES[initialState];
        
        // Initialize with either provided state or defaults
        this.policies = state.policies;
        this.money = state.money;
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
                count: state.employees,  // Use initial employees count
                baseCost: 1000,
                name: "Hire Employee",
                emoji: "👨‍💼",
                policiesPerSecond: 0.1,
                visibleAtPolicies: 5
            }
        };

        // Get DOM elements
        this.clickable = document.getElementById('clickable');
        this.policiesDisplay = document.getElementById('policies');
        this.moneyDisplay = document.getElementById('money');
        this.revenueDisplay = document.getElementById('revenue');
        this.policiesPerSecDisplay = document.getElementById('policies-per-sec');
        this.publicOpinionDisplay = document.getElementById('public-opinion');
        this.opinionValueDisplay = document.getElementById('opinion-value');
        this.opinionTrendDisplay = document.getElementById('opinion-trend');

        // Remove both audio elements reference since we'll create them dynamically
        this.clickSoundTemplate = document.getElementById('clickSound');
        this.upgradeSoundTemplate = document.getElementById('upgradeSound');
        this.clickSoundTemplate.remove();
        this.upgradeSoundTemplate.remove();

        // Get static elements
        this.employeeButton = document.getElementById('employee-button');
        this.employeeCost = document.getElementById('employee-cost');
        this.employeeCount = document.getElementById('employee-count');

        // Hide upgrades initially
        document.querySelectorAll('.upgrade-item').forEach(item => item.style.display = 'none');

        // Add click handlers
        this.employeeButton.addEventListener('click', () => {
            if (!this.isPaused) {
                this.purchaseUpgrade('employee');
            }
        });

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

        // Update display
        this.updateDisplay();

        // Use the global events array
        this.events = window.GAME_EVENTS;

        // Start random events after a delay
        setTimeout(() => {
            setInterval(() => this.triggerRandomEvent(), 30000);
        }, 15000);

        this.isPaused = false;

        // Initialize claims manager
        this.claimsManager = new ClaimsManager(this);

        // Preload sounds
        this.upgradeSounds = [
            { sound: new Audio('hi.mp3'), rate: 0.5, volume: 0.4 },
            { sound: new Audio('hi.mp3'), rate: 0.6, volume: 0.35 },
            { sound: new Audio('hi.mp3'), rate: 0.75, volume: 0.3 },
            { sound: new Audio('hi.mp3'), rate: 0.9, volume: 0.3 },
            { sound: new Audio('hi.mp3'), rate: 1.0, volume: 0.3 },
            { sound: new Audio('hi.mp3'), rate: 1.2, volume: 0.25 },
            { sound: new Audio('hi.mp3'), rate: 1.4, volume: 0.25 },
            { sound: new Audio('hi.mp3'), rate: 1.6, volume: 0.2 },
            { sound: new Audio('hi.mp3'), rate: 1.8, volume: 0.15 },
            { sound: new Audio('hi.mp3'), rate: 2.0, volume: 0.15 }
        ];
        this.upgradeSounds.forEach(s => {
            s.sound.playbackRate = s.rate;
            s.sound.volume = s.volume;
        });

        this.clickSounds = [
            { sound: new Audio('click.mp3'), rate: 0.9, volume: 0.2 },
            { sound: new Audio('click.mp3'), rate: 1.0, volume: 0.2 },
            { sound: new Audio('click.mp3'), rate: 1.1, volume: 0.2 },
        ];
        this.currentClickNote = 0;
        this.clickSounds.forEach(s => {
            s.sound.playbackRate = s.rate;
            s.sound.volume = s.volume;
        });

        this.publicOpinion = 50;
        this.publicOpinionVisible = false;
        this.publicOpinionDisplay = document.getElementById('public-opinion');
        this.opinionValueDisplay = document.getElementById('opinion-value');
        this.opinionTrendDisplay = document.getElementById('opinion-trend');

        // Add milestone tracking
        this.completedMilestones = new Set();
        this.milestonesElement = document.getElementById('milestones-list');
        
        // Update milestones display every second
        setInterval(() => this.checkMilestones(), 1000);
    }

    generateAutomaticPolicies() {
        const employees = this.upgrades.employee;
        const policiesGenerated = (employees.count * employees.policiesPerSecond) / 10;
        this.policies += policiesGenerated;
        this.updateDisplay();
    }

    collectPremiums() {
        const opinionMultiplier = this.publicOpinionVisible ? (this.publicOpinion / 50) : 1;
        const premiumsCollected = this.policies * (this.premiumRate / 1) * opinionMultiplier;
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
            
            const sound = this.upgradeSounds[Math.floor(Math.random() * this.upgradeSounds.length)];
            sound.sound.volume = 0.3;
            sound.sound.currentTime = 0;
            sound.sound.play();

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

        // Update employee upgrade
        const employee = this.upgrades.employee;
        const employeeDiv = document.querySelector('.upgrade-item:nth-child(1)');
        employeeDiv.style.display = this.policies >= employee.visibleAtPolicies ? 'grid' : 'none';
            
        if (this.policies >= employee.visibleAtPolicies) {
            this.employeeButton.disabled = this.money < employee.cost;
            this.employeeCost.textContent = `$${employee.cost.toLocaleString()}`;
            this.employeeCount.textContent = employee.emoji.repeat(employee.count);
            if (employee.count > 0) {
                this.employeeCount.textContent += ` (${(employee.count * employee.policiesPerSecond).toFixed(1)} policies/sec)`;
            }
        }

        // Update public opinion display if visible
        if (this.publicOpinionVisible) {
            this.opinionValueDisplay.textContent = Math.round(this.publicOpinion);
            
            // Update trend emoji based on score
            let trendEmoji = '😐';
            if (this.publicOpinion >= 80) trendEmoji = '😄';
            else if (this.publicOpinion >= 60) trendEmoji = '🙂';
            else if (this.publicOpinion <= 20) trendEmoji = '😡';
            else if (this.publicOpinion <= 40) trendEmoji = '😟';
            
            this.opinionTrendDisplay.textContent = trendEmoji;
        }
    }

    showEventMessage(message) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-message';
        eventDiv.textContent = message;
        document.body.appendChild(eventDiv);

        setTimeout(() => {
            eventDiv.classList.add('fade-out');
            setTimeout(() => eventDiv.remove(), 500);
        }, 4000);
    }

    showEventModal(event) {
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        
        // Different sounds for different event types
        if (event.name.includes("Claim")) {
            // Create urgent/alarm-like sound for claims
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } else {
            const popupSound = new Audio('popup.mp3');
            popupSound.volume = 0.2;
            popupSound.play();
        }
        
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
            if (choice.attributes) {
                Object.entries(choice.attributes).forEach(([key, value]) => {
                    button.setAttribute(key, value);
                });
            }
            button.onclick = () => {
                const choiceSound = new Audio('popup.mp3');
                choiceSound.volume = 0.1;
                choiceSound.playbackRate = 1.2;
                choiceSound.play();

                choice.effect(this);
                document.body.removeChild(modal);
                this.isPaused = false;
            };
            buttonContainer.appendChild(button);
        });

        document.body.appendChild(modal);
    }

    triggerRandomEvent() {
        if (this.isPaused) return;

        const availableEvents = this.events.filter(event => 
            this.policies >= (event.minPolicies || 0)
        );
        
        if (availableEvents.length > 0) {
            const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            
            if (event.choices) {
                this.showEventModal(event);
            } else {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                
                event.effect(this);
            }
        }
    }

    updatePublicOpinion(change) {
        if (!this.publicOpinionVisible) {
            this.publicOpinionVisible = true;
            this.publicOpinionDisplay.style.display = 'block';
            this.showEventMessage("📰 Public Opinion now affects your business!");
        }

        this.publicOpinion = Math.max(0, Math.min(100, this.publicOpinion + change));
        this.updateDisplay();
    }

    checkMilestones() {
        Object.entries(MILESTONES).forEach(([id, milestone]) => {
            if (this.completedMilestones.has(id)) return;

            const meetsRequirements = 
                (!milestone.policies || this.policies >= milestone.policies) &&
                (!milestone.money || this.money >= milestone.money) &&
                (!milestone.employees || this.upgrades.employee.count >= milestone.employees) &&
                (!milestone.publicOpinion || this.publicOpinion <= milestone.publicOpinion);

            if (meetsRequirements) {
                this.completeMilestone(id, milestone);
            }
        });

        this.updateMilestonesDisplay();
    }

    completeMilestone(id, milestone) {
        this.completedMilestones.add(id);
        
        // Show achievement notification
        this.showEventMessage(`🎯 Milestone: ${milestone.name}! ${milestone.reward}`);

        // Play achievement sound
        const sound = new Audio('popup.mp3');
        sound.volume = 0.3;
        sound.playbackRate = 1.5;
        sound.play();
    }

    updateMilestonesDisplay() {
        if (!this.milestonesElement) return;

        // Get incomplete milestones and sort them by requirements
        const incompleteMilestones = Object.entries(MILESTONES)
            .filter(([id, _]) => !this.completedMilestones.has(id))
            .sort(([_, a], [__, b]) => {
                // Sort by policies first (if they have policy requirements)
                if (a.policies && b.policies) {
                    return a.policies - b.policies;
                }
                // Put milestones without policy requirements last
                if (!a.policies) return 1;
                if (!b.policies) return -1;
                return 0;
            });

        // Take only the next two milestones
        const nextMilestones = incompleteMilestones.slice(0, 2);
        
        // Always show completed milestones and next two
        const milestoneHtml = [
            // First show completed milestones
            ...Object.entries(MILESTONES)
                .filter(([id, _]) => this.completedMilestones.has(id))
                .map(([id, milestone]) => `
                    <div class="milestone-item completed">
                        <div class="milestone-name">✅ ${milestone.name}</div>
                        <div class="milestone-reward">Unlocked: ${milestone.reward}</div>
                    </div>
                `),
            // Then show next two available
            ...nextMilestones.map(([id, milestone]) => {
                const progress = this.getMilestoneProgress(milestone);
                return `
                    <div class="milestone-item">
                        <div class="milestone-name">${milestone.name}</div>
                        <div class="milestone-description">${milestone.description}</div>
                        <div class="milestone-progress">${progress}</div>
                        <div class="milestone-reward">🎁 ${milestone.reward}</div>
                    </div>
                `;
            })
        ].join('');

        this.milestonesElement.innerHTML = milestoneHtml;
    }

    getMilestoneProgress(milestone) {
        const parts = [];
        
        if (milestone.policies) {
            const current = Math.floor(this.policies);
            const percentage = Math.min(100, (current / milestone.policies) * 100);
            parts.push(`
                <div class="progress-item">
                    <div class="progress-label">
                        Policies: ${current.toLocaleString()}/${milestone.policies.toLocaleString()}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `);
        }
        
        if (milestone.money) {
            const current = Math.floor(this.money);
            const percentage = Math.min(100, (current / milestone.money) * 100);
            parts.push(`
                <div class="progress-item">
                    <div class="progress-label">
                        Money: $${current.toLocaleString()}/$${milestone.money.toLocaleString()}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `);
        }
        
        if (milestone.employees) {
            const current = this.upgrades.employee.count;
            const percentage = Math.min(100, (current / milestone.employees) * 100);
            parts.push(`
                <div class="progress-item">
                    <div class="progress-label">
                        Employees: ${current}/${milestone.employees}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `);
        }

        if (milestone.publicOpinion) {
            const current = Math.round(this.publicOpinion);
            const percentage = Math.min(100, (current / milestone.publicOpinion) * 100);
            parts.push(`
                <div class="progress-item">
                    <div class="progress-label">
                        Public Opinion: ${current}/${milestone.publicOpinion}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `);
        }

        return parts.join('');
    }
}

// Start the game when the page loads
window.onload = () => {
    // You can now start with different initial states
    const game = new Game('CLAIMS_START');  // or 'LATE_GAME', 'RICH', etc.
};
