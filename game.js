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

        // Use the global events array
        this.events = window.GAME_EVENTS;

        // Start random events after a delay
        setTimeout(() => {
            setInterval(() => this.triggerRandomEvent(), 30000);
        }, 15000);

        this.isPaused = false;

        // Preload sounds with different pitches and speeds
        this.upgradeSounds = [
            { sound: new Audio('hi.mp3'), rate: 0.5, volume: 0.4 },   // Super slow & deep
            { sound: new Audio('hi.mp3'), rate: 0.6, volume: 0.35 },
            { sound: new Audio('hi.mp3'), rate: 0.75, volume: 0.3 },
            { sound: new Audio('hi.mp3'), rate: 0.9, volume: 0.3 },
            { sound: new Audio('hi.mp3'), rate: 1.0, volume: 0.3 },   // Normal
            { sound: new Audio('hi.mp3'), rate: 1.2, volume: 0.25 },
            { sound: new Audio('hi.mp3'), rate: 1.4, volume: 0.25 },
            { sound: new Audio('hi.mp3'), rate: 1.6, volume: 0.2 },
            { sound: new Audio('hi.mp3'), rate: 1.8, volume: 0.15 },
            { sound: new Audio('hi.mp3'), rate: 2.0, volume: 0.15 }   // Super fast & high
        ];
        // Set both playback rate and volume for each sound
        this.upgradeSounds.forEach(s => {
            s.sound.playbackRate = s.rate;
            s.sound.volume = s.volume;
        });

        // Preload click sounds with slight variations
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
            
            // Play random pitched sound
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
        
        // Play popup sound
        const popupSound = new Audio('popup.mp3');
        popupSound.volume = 0.2;
        popupSound.play();
        
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
                // Play choice sound with different settings
                const choiceSound = new Audio('popup.mp3');
                choiceSound.volume = 0.1;  // Lower volume for choice
                choiceSound.playbackRate = 1.2;  // Slightly faster for snappier feedback
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
        const availableEvents = this.events.filter(event => 
            this.policies >= (event.minPolicies || 0)
        );
        
        if (availableEvents.length > 0) {
            const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            
            if (event.choices) {
                // Show modal for choice-based events
                this.showEventModal(event);
            } else {
                // Create notification sound using Web Audio API
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
                oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1); // C#6

                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                
                // Directly trigger effect for notification events
                event.effect(this);
            }
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    const game = new Game();
};
