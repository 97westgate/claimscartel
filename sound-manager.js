// sound-manager.js
class SoundManager {
    constructor() {
        this.clickSounds = [
            { sound: new Audio('click.mp3'), rate: 0.9, volume: 0.2 },
            { sound: new Audio('click.mp3'), rate: 1.0, volume: 0.2 },
            { sound: new Audio('click.mp3'), rate: 1.1, volume: 0.2 },
        ];
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
        this.currentClickNote = 0;
    }

    initializeSounds() {
        // Initialize click sounds
        this.clickSounds.forEach(s => {
            s.sound.playbackRate = s.rate;
            s.sound.volume = s.volume;
        });

        // Initialize upgrade sounds
        this.upgradeSounds.forEach(s => {
            s.sound.playbackRate = s.rate;
            s.sound.volume = s.volume;
        });
    }

    playClickSound() {
        const sound = this.clickSounds[this.currentClickNote];
        if (sound) {
            sound.sound.currentTime = 0;
            sound.sound.play();
            this.currentClickNote = (this.currentClickNote + 1) % this.clickSounds.length;
        }
    }

    playUpgradeSound() {
        const sound = this.upgradeSounds[Math.floor(Math.random() * this.upgradeSounds.length)];
        if (sound) {
            sound.sound.currentTime = 0;
            sound.sound.play();
        }
    }

    playEventSound(type) {
        let sound;
        switch (type) {
            case 'milestone':
                sound = new Audio('hi.mp3');
                sound.playbackRate = 1.5;
                sound.volume = 0.3;
                break;
            case 'claim':
                sound = new Audio('popup.mp3');
                sound.playbackRate = 0.8;
                sound.volume = 0.2;
                break;
            default:
                sound = new Audio('popup.mp3');
                sound.volume = 0.2;
        }
        sound.play();
    }
}

// Make it available globally
window.SoundManager = SoundManager;