// sound-manager.js
class SoundManager {
    constructor() {
        this.sounds = {
            milestone: new Audio('popup.mp3'),
            click: new Audio('click.mp3'),
            upgrade: new Audio('hi.mp3')
        };

        // Set default volumes
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.2;
        });
    }

    playEventSound(type) {
        if (this.sounds[type]) {
            this.sounds[type].currentTime = 0;
            this.sounds[type].play().catch(e => console.log('Sound play prevented:', e));
        }
    }
}

window.SoundManager = SoundManager;