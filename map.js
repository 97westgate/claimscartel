const HOSPITALS = {
    INITIAL: {
        name: "Hennepin County Medical Center",
        coords: [44.9725, -93.2619],
        city: "Minneapolis",
        unlocksAt: 0
    },
    SECOND: {
        name: "St. Paul-Ramsey Medical Center",
        coords: [44.9537, -93.0900],
        city: "St. Paul",
        unlocksAt: 50
    }
};

const MINNESOTA_MAP = {
    name: "Minnesota",
    population: 5700000,
    color: "#2a9d8f",
    marketShare: 0.01,
    policies: 5700,
    profitMargin: 0.15,
    yearFounded: 1977,
    startingHospital: HOSPITALS.INITIAL
};

const MAP_CONFIG = {
    tileLayer: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    geoJsonUrl: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/MN.geo.json',
    initialZoom: 13,
    expandedZoom: 11,
    expandedCenter: [44.9537, -93.1760]  // Center point between Minneapolis and St. Paul
};

class InsuranceMap {
    constructor(game) {
        this.game = game;
        this.marketShare = MINNESOTA_MAP.marketShare;
        this.policies = MINNESOTA_MAP.policies;
        this.coverageArea = null;
        this.lastPolicies = 0;
        this.colorIntensity = 0.1;
        this.maxRadiuses = new Map(); // Store radiuses for each hospital
        this.targetRadiuses = new Map(); // Store target radiuses for each hospital
        
        // Initialize radiuses for first hospital
        this.maxRadiuses.set(HOSPITALS.INITIAL.name, new Array(360).fill(20));
        this.targetRadiuses.set(HOSPITALS.INITIAL.name, new Array(360).fill(20));
        
        this.hospitals = new Map();
        
        this.setupDisplay();
    }

    generatePath() {
        let pathData = '';
        
        // Generate path for each hospital's coverage
        this.hospitals.forEach((marker, hospitalName) => {
            const coords = marker.getLatLng();
            const center = this.map.latLngToLayerPoint(coords);
            const radiusArray = this.maxRadiuses.get(hospitalName);
            const points = [];

            for (let i = 0; i < 360; i += 5) {
                const angle = (i * Math.PI) / 180;
                const radius = radiusArray[i];
                points.push([
                    center.x + Math.cos(angle) * radius,
                    center.y + Math.sin(angle) * radius
                ]);
            }

            // Create path for this hospital
            let hospitalPath = `M ${points[0][0]},${points[0][1]}`;
            for (let i = 1; i <= points.length; i++) {
                const current = points[i - 1];
                const next = points[i % points.length];
                hospitalPath += ` L ${next[0]},${next[1]}`;
            }
            hospitalPath += 'Z';
            
            // Add to total path
            pathData += hospitalPath;
        });
        
        return pathData;
    }

    updateCoverage() {
        if (!this.map || !this.coverageArea) return;
        
        const newPolicies = Math.floor(this.game.policies);
        const oldPolicies = Math.floor(this.lastPolicies);
        
        if (newPolicies > oldPolicies) {
            this.updateTargetRadiuses();
            this.animateCoverage();
            this.updateColorIntensity();
            this.checkHospitalUnlocks();
        }
        
        this.lastPolicies = this.game.policies;
    }

    updateTargetRadiuses() {
        // Only update the clicked hospital's coverage
        if (!this.lastClickedHospital) return;
        
        const growthPoints = 3;
        const angleSpread = 30;
        
        const targetRadius = this.targetRadiuses.get(this.lastClickedHospital);
        const maxRadius = this.maxRadiuses.get(this.lastClickedHospital);
        
        for (let i = 0; i < growthPoints; i++) {
            const angle = Math.floor(Math.random() * 360);
            const growth = Math.random() * 10 + 5;
            
            for (let offset = -angleSpread; offset <= angleSpread; offset++) {
                const idx = (angle + offset + 360) % 360;
                const falloff = Math.cos((offset / angleSpread) * (Math.PI / 2));
                targetRadius[idx] = maxRadius[idx] + growth * falloff;
            }
        }
    }

    animateCoverage() {
        const animate = () => {
            let stillAnimating = false;
            
            this.hospitals.forEach((marker, hospitalName) => {
                const maxRadius = this.maxRadiuses.get(hospitalName);
                const targetRadius = this.targetRadiuses.get(hospitalName);
                
                for (let i = 0; i < 360; i++) {
                    const diff = targetRadius[i] - maxRadius[i];
                    if (Math.abs(diff) > 0.1) {
                        maxRadius[i] += diff * 0.1;
                        stillAnimating = true;
                    }
                }
            });

            this.coverageArea.setAttribute('d', this.generatePath());

            if (stillAnimating) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateColorIntensity() {
        this.colorIntensity = Math.min(0.3, this.colorIntensity + 0.1);
        this.coverageArea.style.fillOpacity = this.colorIntensity;
        
        setTimeout(() => {
            this.colorIntensity = Math.max(0.1, this.colorIntensity - 0.05);
            this.coverageArea.style.fillOpacity = this.colorIntensity;
        }, 300);
    }

    setupDisplay() {
        this.createMapContainer();
        this.initializeMap();
        this.loadStateData();
    }

    createMapContainer() {
        const mapPanel = document.getElementById('map-container');
        mapPanel.innerHTML = `
            <h2>🗺️ Starting at ${MINNESOTA_MAP.startingHospital.name}</h2>
            <div class="map-visualization">
                <div id="minnesota-map"></div>
            </div>
        `;
    }

    initializeMap() {
        this.map = L.map('minnesota-map', {
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: false,
            zoomControl: false
        }).setView(MINNESOTA_MAP.startingHospital.coords, MAP_CONFIG.initialZoom);
        
        L.tileLayer(MAP_CONFIG.tileLayer, {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        // Initialize SVG layer
        const svg = L.svg().addTo(this.map);
        const coverageGroup = L.SVG.create('g');
        this.coverageArea = L.SVG.create('path');
        this.coverageArea.setAttribute('class', 'coverage-area');
        coverageGroup.appendChild(this.coverageArea);
        svg._rootGroup.appendChild(coverageGroup);
    }

    loadStateData() {
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

                this.addHospital(HOSPITALS.INITIAL);
            });
    }

    addHospital(hospital) {
        if (this.hospitals.has(hospital.name)) return;

        const marker = L.marker(hospital.coords, {
            icon: L.divIcon({
                html: `<div class="hospital-marker" data-hospital="${hospital.name}">🏥</div>`,
                className: 'hospital-icon'
            })
        }).addTo(this.map);

        // Initialize coverage arrays for new hospital
        this.maxRadiuses.set(hospital.name, new Array(360).fill(20));
        this.targetRadiuses.set(hospital.name, new Array(360).fill(20));

        marker.on('click', (e) => {
            if (!this.game.isPaused) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                
                // Find clicked hospital marker and animate it
                const markerElement = e.target._icon.querySelector('.hospital-marker');
                markerElement.classList.add('clicked');
                setTimeout(() => markerElement.classList.remove('clicked'), 150);
                
                // Store which hospital was clicked for coverage update
                this.lastClickedHospital = hospital.name;
                
                this.game.handleClick();
            }
        });

        this.hospitals.set(hospital.name, marker);
        
        if (hospital.unlocksAt > 0) {
            // Animate the map view change when adding second hospital
            this.map.flyTo(MAP_CONFIG.expandedCenter, MAP_CONFIG.expandedZoom, {
                duration: 2
            });
            this.game.showEventMessage(`🏥 New Hospital Available: ${hospital.name} in ${hospital.city}!`);
        }
    }

    checkHospitalUnlocks() {
        Object.values(HOSPITALS).forEach(hospital => {
            if (this.game.policies >= hospital.unlocksAt && !this.hospitals.has(hospital.name)) {
                this.addHospital(hospital);
            }
        });
    }
}

window.InsuranceMap = InsuranceMap;