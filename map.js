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
        this.basePoints = this.generateBasePoints(8); // Generate 8 points for the initial shape
        this.lastRadius = 0;  // Add this to track previous radius
        
        this.setupDisplay();
        setInterval(() => this.updateCoverage(), 100); // Update more frequently for smoother animation
    }

    generateBasePoints(count) {
        const points = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            points.push({
                angle: angle,
                variance: Math.random() * 0.3 + 0.7 // Random variance between 0.7 and 1
            });
        }
        return points;
    }

    generatePath(baseRadius) {
        const center = this.map.latLngToLayerPoint(L.latLng(MINNESOTA_MAP.startingHospital.coords));
        const points = this.basePoints.map(point => {
            // Remove the time-based variance, only use the static variance
            const radius = baseRadius * point.variance;
            return [
                center.x + Math.cos(point.angle) * radius,
                center.y + Math.sin(point.angle) * radius
            ];
        });

        // Create a closed path
        return points.map((point, i) => 
            (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1]
        ).join(' ') + 'Z';
    }

    updateCoverage() {
        if (!this.map || !this.coverageArea) return;

        const baseRadius = 10 + (this.game.policies * 0.5);
        
        // Only add the growing class if radius has increased
        if (baseRadius > this.lastRadius) {
            this.coverageArea.classList.add('coverage-growing');
            setTimeout(() => {
                this.coverageArea.classList.remove('coverage-growing');
            }, 300);  // Match this to animation duration
        }
        
        this.lastRadius = baseRadius;
        const path = this.generatePath(baseRadius);
        this.coverageArea.setAttribute('d', path);
    }

    setupDisplay() {
        const mapPanel = document.getElementById('map-container');
        mapPanel.innerHTML = `
            <h2>🗺️ Starting at ${MINNESOTA_MAP.startingHospital.name}</h2>
            <div class="map-visualization">
                <div id="minnesota-map"></div>
            </div>
        `;

        // Initialize map centered on HCMC with zoom controls disabled
        this.map = L.map('minnesota-map', {
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: false,
            zoomControl: false
        }).setView(MINNESOTA_MAP.startingHospital.coords, 13);
        
        // Option 2 - Mapbox's light style
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

                // Add clickable HCMC marker
                const hospitalMarker = L.marker(MINNESOTA_MAP.startingHospital.coords, {
                    icon: L.divIcon({
                        html: `<div class="hospital-marker">🏥</div>`,
                        className: 'hospital-icon'
                    })
                }).addTo(this.map);

                // Add click handler to hospital marker
                hospitalMarker.on('click', (e) => {
                    if (!this.game.isPaused) {
                        // Prevent both zoom and event bubbling
                        L.DomEvent.stopPropagation(e);
                        L.DomEvent.preventDefault(e);
                        
                        // Get the hospital marker element and add animation
                        const markerElement = document.querySelector('.hospital-marker');
                        markerElement.classList.add('clicked');
                        setTimeout(() => markerElement.classList.remove('clicked'), 150);
                        
                        this.game.handleClick();
                    }
                });
            });

        // After map initialization, add SVG overlay
        const svg = L.svg().addTo(this.map);
        const coverageGroup = L.SVG.create('g');
        this.coverageArea = L.SVG.create('path');
        this.coverageArea.setAttribute('class', 'coverage-area');
        coverageGroup.appendChild(this.coverageArea);
        svg._rootGroup.appendChild(coverageGroup);
    }
}

window.InsuranceMap = InsuranceMap;