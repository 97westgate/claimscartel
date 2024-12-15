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

        // Add milestone tracking
        this.completedMilestones = new Set();
        this.milestonesElement = document.getElementById('milestones-list');
        
        // Initialize milestones display immediately
        this.updateMilestonesDisplay();
        
        // Update milestones display every second
        setInterval(() => {
            this.checkMilestones();
            this.updateMilestonesDisplay();
        }, 1000);

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
                unlocksAt: 25,
                description: "Hire staff to sell policies automatically"
            },
            manager: {
                cost: 100000,
                multiplier: 2.5,
                count: 0,
                baseCost: 100000,
                name: "Regional Manager",
                emoji: "👔",
                policiesPerSecond: 1.0,
                unlocksAt: 1000,
                description: "Oversees policy growth in a region"
            },
            executive: {
                cost: 1000000,
                multiplier: 5,
                count: 0,
                baseCost: 1000000,
                name: "Executive",
                emoji: "💼",
                policiesPerSecond: 10,
                unlocksAt: 10000,
                description: "Implements aggressive growth strategies"
            },
            network: {
                cost: 10000000,
                multiplier: 10,
                count: 0,
                baseCost: 10000000,
                name: "Provider Network",
                emoji: "🏥",
                policiesPerSecond: 50,
                unlocksAt: 50000,
                description: "Establish exclusive provider networks"
            },
            merger: {
                cost: 100000000,
                multiplier: 25,
                count: 0,
                baseCost: 100000000,
                name: "Corporate Merger",
                emoji: "🤝",
                policiesPerSecond: 250,
                unlocksAt: 100000,
                description: "Acquire smaller insurance companies"
            }
        };

        // Policy Types (unlocked through milestones)
        this.policyTypes = {
            basic: {
                name: "Basic Coverage",
                premiumRate: 10,
                unlocksAt: 0
            },
            premium: {
                name: "Premium Plan",
                premiumRate: 25,
                unlocksAt: 1000,
                description: "Higher premiums, better coverage"
            },
            corporate: {
                name: "Corporate Plan",
                premiumRate: 100,
                unlocksAt: 10000,
                description: "Bulk employee coverage contracts"
            },
            government: {
                name: "Government Contract",
                premiumRate: 500,
                unlocksAt: 100000,
                description: "Lucrative government partnerships"
            }
        };

        // Market Expansion System
        this.markets = {
            local: {
                name: "Local Market",
                multiplier: 1,
                unlocksAt: 0
            },
            state: {
                name: "State-wide",
                multiplier: 2,
                unlocksAt: 5000,
                cost: 1000000
            },
            regional: {
                name: "Multi-state Region",
                multiplier: 5,
                unlocksAt: 20000,
                cost: 10000000
            },
            national: {
                name: "National Coverage",
                multiplier: 10,
                unlocksAt: 100000,
                cost: 100000000
            },
            international: {
                name: "Global Operations",
                multiplier: 25,
                unlocksAt: 500000,
                cost: 1000000000
            }
        };

        // Revenue Multipliers
        this.revenueMultipliers = {
            baseRate: 1,
            marketExpansion: 1,
            policyType: 1,
            publicOpinion: 1,
            efficiency: 1
        };

        // Initialize systems
        this.currentMarket = 'local';
        this.currentPolicyType = 'basic';
        this.efficiencyLevel = 1;

        // Get DOM elements with null checks
        this.policiesDisplay = document.getElementById('policies');
        this.moneyDisplay = document.getElementById('money');
        this.revenueDisplay = document.getElementById('revenue');
        this.policiesPerSecDisplay = document.getElementById('policies-per-sec');
        this.publicOpinionDisplay = document.getElementById('public-opinion');
        this.opinionValueDisplay = document.getElementById('opinion-value');
        this.opinionTrendDisplay = document.getElementById('opinion-trend');

        // Verify all required elements exist
        if (!this.policiesDisplay || !this.moneyDisplay || !this.revenueDisplay) {
            console.error('Required game display elements not found!');
        }

        // Add verification for opinion-related elements
        if (!this.publicOpinionDisplay || !this.opinionValueDisplay || !this.opinionTrendDisplay) {
            console.warn('Public opinion display elements not found');
        }

        // Remove both audio elements reference since we'll create them dynamically
        this.clickSoundTemplate = document.getElementById('clickSound');
        this.upgradeSoundTemplate = document.getElementById('upgradeSound');
        this.clickSoundTemplate.remove();
        this.upgradeSoundTemplate.remove();

        // Get static elements
        this.employeeButton = document.getElementById('employee-button');
        this.employeeCost = document.getElementById('employee-cost');
        this.employeeCount = document.getElementById('employee-count');

        // Initialize map first
        this.map = new InsuranceMap(this);

        // Hide upgrades initially (moved after map initialization)
        document.querySelectorAll('.upgrade-item').forEach(item => item.style.display = 'none');

        // Add click handlers
        this.employeeButton.addEventListener('click', () => {
            if (!this.isPaused) {
                this.purchaseUpgrade('employee');
            }
        });

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

        // Add title reference
        this.titleElement = document.querySelector('h1');
        this.currentTitle = "Small Insurance Business"; // Default title

        // Initialize UI for new systems
        this.initializeUpgradeUI();
        this.initializeMarketUI();
        this.initializePolicyUI();
        
        // Update all displays every second
        setInterval(() => {
            if (!this.isPaused) {
                this.updateAllDisplays();
            }
        }, 1000);
    }

    generateAutomaticPolicies() {
        const employees = this.upgrades.employee;
        const policiesGenerated = (employees.count * employees.policiesPerSecond) / 10;
        this.policies += policiesGenerated;
        this.updateDisplay();
        this.map.updateCoverage();
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
        
        this.updateDisplay();
        this.map.updateCoverage();
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
        // Update basic stats with null checks
        if (this.policiesDisplay) {
            this.policiesDisplay.textContent = Math.floor(this.policies);
        }
        if (this.moneyDisplay) {
            this.moneyDisplay.textContent = Math.floor(this.money).toLocaleString();
        }
        if (this.revenueDisplay) {
            this.revenueDisplay.textContent = `Revenue: $${Math.floor(this.policies * this.premiumRate)}/sec`;
        }

        // Update public opinion display if visible and elements exist
        if (this.publicOpinionVisible && this.opinionValueDisplay && this.opinionTrendDisplay) {
            this.opinionValueDisplay.textContent = Math.round(this.publicOpinion);
            
            // Update trend emoji based on score
            let trendEmoji = '😐';
            if (this.publicOpinion >= 80) trendEmoji = '😄';
            else if (this.publicOpinion >= 60) trendEmoji = '🙂';
            else if (this.publicOpinion <= 20) trendEmoji = '😡';
            else if (this.publicOpinion <= 40) trendEmoji = '😟';
            
            this.opinionTrendDisplay.textContent = trendEmoji;
        }

        // Update map
        if (this.map) {
            this.map.updateCoverage();
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
            if (this.publicOpinionDisplay) {
                this.publicOpinionDisplay.style.display = 'block';
            } else {
                console.warn('Public opinion display element not found');
            }
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
        
        // Update company title with animation
        this.currentTitle = milestone.name;
        this.titleElement.textContent = this.currentTitle;
        this.titleElement.classList.add('milestone-reached');
        setTimeout(() => this.titleElement.classList.remove('milestone-reached'), 500);
        
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

    // Calculate total revenue per second
    calculateRevenue() {
        const baseRevenue = this.policies * this.policyTypes[this.currentPolicyType].premiumRate;
        const marketMultiplier = this.markets[this.currentMarket].multiplier;
        const efficiencyMultiplier = this.efficiencyLevel;
        const opinionMultiplier = this.publicOpinionVisible ? (this.publicOpinion / 50) : 1;

        return baseRevenue * marketMultiplier * efficiencyMultiplier * opinionMultiplier;
    }

    // Upgrade market presence
    upgradeMarket(marketKey) {
        const market = this.markets[marketKey];
        if (this.money >= market.cost && this.policies >= market.unlocksAt) {
            this.money -= market.cost;
            this.currentMarket = marketKey;
            this.revenueMultipliers.marketExpansion = market.multiplier;
            this.showEventMessage(`🌎 Expanded to ${market.name}!`);
            this.updateDisplay();
        }
    }

    // Upgrade policy type
    upgradePolicyType(policyKey) {
        const policy = this.policyTypes[policyKey];
        if (this.policies >= policy.unlocksAt) {
            this.currentPolicyType = policyKey;
            this.revenueMultipliers.policyType = policy.premiumRate / 10;
            this.showEventMessage(`📋 Upgraded to ${policy.name}!`);
            this.updateDisplay();
        }
    }

    initializeUpgradeUI() {
        const upgradesContainer = document.getElementById('upgrades');
        upgradesContainer.innerHTML = ''; // Clear existing content
        
        Object.entries(this.upgrades).forEach(([key, upgrade]) => {
            const div = document.createElement('div');
            div.className = 'upgrade-item';
            div.innerHTML = `
                <span class="upgrade-label">${upgrade.name} ($<span id="${key}-cost">${upgrade.cost.toLocaleString()}</span>)</span>
                <button id="${key}-button" class="emoji-button">${upgrade.emoji}</button>
                <span id="${key}-count" class="upgrade-count"></span>
                <div class="upgrade-description">${upgrade.description || ''}</div>
            `;
            upgradesContainer.appendChild(div);

            // Add click handler
            document.getElementById(`${key}-button`).addEventListener('click', () => {
                this.purchaseUpgrade(key);
            });
        });
    }

    initializeMarketUI() {
        const marketContainer = document.getElementById('market-options');
        Object.entries(this.markets).forEach(([key, market]) => {
            const div = document.createElement('div');
            div.className = 'upgrade-option';
            div.innerHTML = `
                <div>
                    <strong>${market.name}</strong>
                    <div>×${market.multiplier} revenue multiplier</div>
                    ${market.cost ? `<div>Cost: $${market.cost.toLocaleString()}</div>` : ''}
                </div>
                <button class="market-button" data-market="${key}">Expand</button>
            `;
            marketContainer.appendChild(div);

            const button = div.querySelector('button');
            button.addEventListener('click', () => this.upgradeMarket(key));
        });
    }

    initializePolicyUI() {
        const policyContainer = document.getElementById('policy-options');
        Object.entries(this.policyTypes).forEach(([key, policy]) => {
            const div = document.createElement('div');
            div.className = 'upgrade-option';
            div.innerHTML = `
                <div>
                    <strong>${policy.name}</strong>
                    <div>$${policy.premiumRate}/policy/sec</div>
                    ${policy.description ? `<div>${policy.description}</div>` : ''}
                </div>
                <button class="policy-button" data-policy="${key}">Switch</button>
            `;
            policyContainer.appendChild(div);

            const button = div.querySelector('button');
            button.addEventListener('click', () => this.upgradePolicyType(key));
        });
    }

    updateAllDisplays() {
        this.updateDisplay(); // Existing display updates
        this.updateUpgradeDisplay();
        this.updateMarketDisplay();
        this.updatePolicyDisplay();
        this.updateRevenue();
    }

    updateUpgradeDisplay() {
        Object.entries(this.upgrades).forEach(([key, upgrade]) => {
            const countElement = document.getElementById(`${key}-count`);
            const buttonElement = document.getElementById(`${key}-button`);
            const costElement = document.getElementById(`${key}-cost`);
            const container = buttonElement.closest('.upgrade-item');

            // Show/hide based on unlock requirements
            const isUnlocked = this.policies >= (upgrade.unlocksAt || 0);
            
            if (isUnlocked) {
                container.style.display = 'grid';
                
                // Update count and production
                if (upgrade.count > 0) {
                    countElement.textContent = `${upgrade.emoji.repeat(Math.min(upgrade.count, 5))} (${(upgrade.count * upgrade.policiesPerSecond).toFixed(1)}/sec)`;
                } else {
                    countElement.textContent = '';
                }

                // Update cost and availability
                costElement.textContent = upgrade.cost.toLocaleString();
                buttonElement.disabled = this.money < upgrade.cost;
            } else {
                container.style.display = 'none';
            }
        });
    }

    updateMarketDisplay() {
        const marketButtons = document.querySelectorAll('.market-button');
        marketButtons.forEach(button => {
            const marketKey = button.dataset.market;
            const market = this.markets[marketKey];
            const container = button.closest('.upgrade-option');

            // Show/hide based on unlock requirements
            if (this.policies >= market.unlocksAt) {
                container.classList.remove('locked');
                button.disabled = this.money < (market.cost || 0);
                
                // Highlight current market
                if (this.currentMarket === marketKey) {
                    container.classList.add('active');
                    button.textContent = 'Active';
                } else {
                    container.classList.remove('active');
                    button.textContent = 'Expand';
                }
            } else {
                container.classList.add('locked');
                button.disabled = true;
            }
        });
    }

    updatePolicyDisplay() {
        const policyButtons = document.querySelectorAll('.policy-button');
        policyButtons.forEach(button => {
            const policyKey = button.dataset.policy;
            const policy = this.policyTypes[policyKey];
            const container = button.closest('.upgrade-option');

            // Show/hide based on unlock requirements
            if (this.policies >= policy.unlocksAt) {
                container.classList.remove('locked');
                
                // Highlight current policy
                if (this.currentPolicyType === policyKey) {
                    container.classList.add('active');
                    button.textContent = 'Active';
                } else {
                    container.classList.remove('active');
                    button.textContent = 'Switch';
                }
            } else {
                container.classList.add('locked');
                button.disabled = true;
            }
        });
    }

    updateRevenue() {
        const revenue = this.calculateRevenue();
        this.revenueDisplay.textContent = `Revenue: $${Math.floor(revenue).toLocaleString()}/sec`;
        
        // Add revenue breakdown tooltip
        const breakdown = `
            Base: $${Math.floor(this.policies * this.policyTypes[this.currentPolicyType].premiumRate).toLocaleString()}
            Market: ×${this.markets[this.currentMarket].multiplier}
            Efficiency: ×${this.efficiencyLevel}
            Opinion: ×${(this.publicOpinionVisible ? this.publicOpinion / 50 : 1).toFixed(2)}
        `;
        this.revenueDisplay.title = breakdown;
    }
}

// Start the game when the page loads
window.onload = () => {
    // You can now start with different initial states
    const game = new Game('NATIONAL');  // or 'LATE_GAME', 'RICH', etc.
};