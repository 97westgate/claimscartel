const MINNESOTA_MAP = {
    name: "Minnesota",
    population: 5700000,
    color: "#2a9d8f",
    marketShare: 0.01,
    policies: 5700,
    profitMargin: 0.15,
    yearFounded: 1977,
    startingHospital: {
        name: "Hennepin County Medical Center",
        // Converting 44°58′21″N 93°15′43″W to decimal coordinates
        coords: [44.9725, -93.2619],
        city: "Minneapolis"
    }
};

class InsuranceMap {
    constructor(game) {
        this.game = game;
        this.marketShare = MINNESOTA_MAP.marketShare;
        this.policies = MINNESOTA_MAP.policies;
        this.coverageArea = null;
        this.lastPolicies = 0;
        this.colorIntensity = 0.1;
        this.maxRadius = new Array(360).fill(20);
        this.targetRadius = new Array(360).fill(20);
        
        this.setupDisplay();
    }

    generatePath(radiusArray) {
        const center = this.map.latLngToLayerPoint(L.latLng(MINNESOTA_MAP.startingHospital.coords));
        const points = [];

        for (let i = 0; i < 360; i += 5) {
            const angle = (i * Math.PI) / 180;
            const radius = radiusArray[i];
            points.push([
                center.x + Math.cos(angle) * radius,
                center.y + Math.sin(angle) * radius
            ]);
        }

        let path = `M ${points[0][0]},${points[0][1]}`;
        for (let i = 1; i <= points.length; i++) {
            const current = points[i - 1];
            const next = points[i % points.length];
            path += ` L ${next[0]},${next[1]}`;
        }
        
        return path + 'Z';
    }

    updateCoverage() {
        if (!this.map || !this.coverageArea) return;
        
        if (Math.floor(this.game.policies) > Math.floor(this.lastPolicies)) {
            // Set new target radiuses
            for (let i = 0; i < 5; i++) {
                const angle = Math.floor(Math.random() * 360);
                const growth = Math.random() * 30 + 15;
                
                for (let offset = -30; offset <= 30; offset++) {
                    const idx = (angle + offset + 360) % 360;
                    const falloff = Math.cos((offset / 30) * (Math.PI / 2));
                    this.targetRadius[idx] = this.maxRadius[idx] + growth * falloff;
                }
            }

            // Animate to new targets
            let progress = 0;
            const animate = () => {
                progress += 0.1;
                
                // Interpolate between old and new radiuses
                for (let i = 0; i < 360; i++) {
                    const diff = this.targetRadius[i] - this.maxRadius[i];
                    this.maxRadius[i] += diff * 0.1;
                }

                const path = this.generatePath(this.maxRadius);
                this.coverageArea.setAttribute('d', path);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
            
            this.colorIntensity = Math.min(0.3, this.colorIntensity + 0.1);
            this.coverageArea.style.fillOpacity = this.colorIntensity;
            
            setTimeout(() => {
                this.colorIntensity = Math.max(0.1, this.colorIntensity - 0.05);
                this.coverageArea.style.fillOpacity = this.colorIntensity;
            }, 300);
        }
        
        this.lastPolicies = this.game.policies;
    }

    setupDisplay() {
        const mapPanel = document.getElementById('map-container');
        mapPanel.innerHTML = `
            <h2>🗺️ Starting at ${MINNESOTA_MAP.startingHospital.name}</h2>
            <div class="map-visualization">
                <div id="minnesota-map"></div>
            </div>
        `;

        this.map = L.map('minnesota-map', {
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: false,
            zoomControl: false
        }).setView(MINNESOTA_MAP.startingHospital.coords, 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/MN.geo.json')
            .then(response => response.json())
            .then(data => {
                this.stateLayer = L.geoJSON(data, {
                    style: () => ({
                        fillColor: '#f8f9fa',
                        fillOpacity: 0.1,
                        color: '#dee2e6',
                        weight: 1
                    })
                }).addTo(this.map);

                const hospitalMarker = L.marker(MINNESOTA_MAP.startingHospital.coords, {
                    icon: L.divIcon({
                        html: `<div class="hospital-marker">🏥</div>`,
                        className: 'hospital-icon'
                    })
                }).addTo(this.map);

                hospitalMarker.on('click', (e) => {
                    if (!this.game.isPaused) {
                        L.DomEvent.stopPropagation(e);
                        L.DomEvent.preventDefault(e);
                        
                        const markerElement = document.querySelector('.hospital-marker');
                        markerElement.classList.add('clicked');
                        setTimeout(() => markerElement.classList.remove('clicked'), 150);
                        
                        this.game.handleClick();
                    }
                });
            });

        const svg = L.svg().addTo(this.map);
        const coverageGroup = L.SVG.create('g');
        this.coverageArea = L.SVG.create('path');
        this.coverageArea.setAttribute('class', 'coverage-area');
        coverageGroup.appendChild(this.coverageArea);
        svg._rootGroup.appendChild(coverageGroup);
    }
}

window.InsuranceMap = InsuranceMap;