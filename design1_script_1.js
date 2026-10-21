
    /* ==========================================================================
       AGE VERIFICATION LOGIC
       ========================================================================== */
    function checkAgeGate() {
      const ok = localStorage.getItem('gd_age_ok');
      const gate = document.getElementById('age-gate');
      if (ok === '1') {
        gate.classList.add('hidden');
        document.body.style.overflow = '';
      } else {
        gate.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    }

    function handleAgeVerify(is21) {
      const gate = document.getElementById('age-gate');
      const denied = document.getElementById('age-denied-msg');
      if (is21) {
        try { localStorage.setItem('gd_age_ok', '1'); } catch(e) {}
        gate.classList.add('hidden');
        document.body.style.overflow = '';
      } else {
        denied.style.display = 'block';
      }
    }

    // Run age check on load
    checkAgeGate();

    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
      });
    }

    function closeMobileMenu() {
      if (mobileMenu) mobileMenu.classList.remove('open');
    }

    /* Header scroll elevation */
    window.addEventListener('scroll', () => {
      const header = document.getElementById('site-header');
      if (header) {
        if (window.scrollY > 40) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }
    }, { passive: true });

    /* ==========================================================================
       STORE DATA & LOCATOR SYSTEM
       ========================================================================== */
    const STORES = [
      { id: 0, name: "L Street Package Store", addr: "612 E Broadway", town: "South Boston", lat: 42.3355, lng: -71.0365, kind: "Package Store", flavors: ["Watermelon", "Pineapple", "Lemon Lime", "Peach Mango"] },
      { id: 1, name: "Castle Island Provisions", addr: "801 E 1st St", town: "South Boston", lat: 42.3378, lng: -71.0255, kind: "Market & Deli", flavors: ["Watermelon", "Lemon Lime"] },
      { id: 2, name: "Seaport Spirits Co.", addr: "300 Summer St", town: "Boston", lat: 42.3500, lng: -71.0480, kind: "Liquor Store", flavors: ["Watermelon", "Pineapple", "Lemon Lime", "Peach Mango"] },
      { id: 3, name: "Savin Hill Wine & Spirits", addr: "1 Savin Hill Ave", town: "Dorchester", lat: 42.3110, lng: -71.0490, kind: "Package Store", flavors: ["Pineapple", "Peach Mango"] },
      { id: 4, name: "Marina Bay Market", addr: "333 Victory Rd", town: "Quincy", lat: 42.2950, lng: -71.0300, kind: "Market & Provisions", flavors: ["Watermelon", "Pineapple"] },
      { id: 5, name: "Wollaston Beach Liquors", addr: "470 Quincy Shore Dr", town: "Quincy", lat: 42.2690, lng: -71.0170, kind: "Liquor Store", flavors: ["Watermelon", "Pineapple", "Lemon Lime", "Peach Mango"] },
      { id: 6, name: "Weymouth Landing Spirits", addr: "70 Washington St", town: "Weymouth", lat: 42.2210, lng: -70.9690, kind: "Package Store", flavors: ["Peach Mango", "Lemon Lime"] },
      { id: 7, name: "Hingham Harbor Wine", addr: "10 North St", town: "Hingham", lat: 42.2440, lng: -70.8890, kind: "Wine & Spirits", flavors: ["Watermelon", "Pineapple", "Lemon Lime", "Peach Mango"] },
      { id: 8, name: "Nantasket Package", addr: "150 Nantasket Ave", town: "Hull", lat: 42.2730, lng: -70.8500, kind: "Package Store", flavors: ["Watermelon", "Lemon Lime"] },
      { id: 9, name: "Cohasset Village Spirits", addr: "25 Elm St", town: "Cohasset", lat: 42.2410, lng: -70.8030, kind: "Liquor Store", flavors: ["Pineapple", "Peach Mango"] },
      { id: 10, name: "Scituate Harbor Liquors", addr: "100 Front St", town: "Scituate", lat: 42.1980, lng: -70.7230, kind: "Package Store", flavors: ["Watermelon", "Pineapple", "Lemon Lime", "Peach Mango"] },
      { id: 11, name: "Green Harbor Market", addr: "200 Dyke Rd", town: "Marshfield", lat: 42.0880, lng: -70.6540, kind: "Beach Market", flavors: ["Watermelon", "Peach Mango"] },
      { id: 12, name: "Duxbury Beach Provisions", addr: "400 Gurnet Rd", town: "Duxbury", lat: 42.0450, lng: -70.6670, kind: "Market", flavors: ["Lemon Lime", "Peach Mango"] },
      { id: 13, name: "Plymouth Waterfront Spirits", addr: "50 Water St", town: "Plymouth", lat: 41.9570, lng: -70.6620, kind: "Liquor Store", flavors: ["Watermelon", "Pineapple", "Lemon Lime", "Peach Mango"] }
    ];

    const ZIPS = {
      '02127': [42.335, -71.04],  // South Boston
      '02210': [42.348, -71.04],  // Seaport
      '02125': [42.316, -71.058], // Dorchester
      '02169': [42.25, -71.0],    // Quincy
      '02170': [42.267, -71.02],  // Wollaston
      '02188': [42.21, -70.96],   // Weymouth
      '02043': [42.22, -70.89],   // Hingham
      '02045': [42.29, -70.87],   // Hull / Nantasket
      '02025': [42.24, -70.81],   // Cohasset
      '02066': [42.19, -70.75],   // Scituate
      '02050': [42.1, -70.7],     // Marshfield
      '02332': [42.04, -70.7],    // Duxbury
      '02360': [41.9, -70.6]      // Plymouth
    };

    let currentFlavorFilter = 'all';
    let userOrigin = [42.3355, -71.0365]; // Default South Boston
    let mapInstance = null;
    let mapMarkers = [];
    let activeStoreId = 0;

    // Haversine distance in miles
    function calcDistance(coordA, coordB) {
      const R = 3958.8; // miles
      const toRad = x => x * Math.PI / 180;
      const dLat = toRad(coordB[0] - coordA[0]);
      const dLng = toRad(coordB[1] - coordA[1]);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(coordA[0])) * Math.cos(toRad(coordB[0])) *
                Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(a));
    }

    // Filter and sort stores
    function getFilteredStores() {
      return STORES.filter(store => {
        if (currentFlavorFilter === 'all') return true;
        return store.flavors.includes(currentFlavorFilter);
      }).map(store => {
        const dist = calcDistance(userOrigin, [store.lat, store.lng]);
        return { ...store, distance: dist };
      }).sort((a, b) => a.distance - b.distance);
    }

    // Render Store List Cards
    function renderStoreList() {
      const filtered = getFilteredStores();
      const listContainer = document.getElementById('store-cards-list');
      const badge = document.getElementById('store-count-badge');
      const summary = document.getElementById('store-list-summary');

      badge.textContent = `${filtered.length} Locations`;
      
      const flavorLabel = currentFlavorFilter === 'all' ? 'All Flavors' : currentFlavorFilter;
      summary.textContent = `Showing ${filtered.length} stores carrying ${flavorLabel}`;

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: var(--color-muted);">
            No stores found matching this criteria. Try selecting "All Flavors" or a nearby ZIP.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filtered.map((store, index) => {
        const isAllFlavors = store.flavors.length === 4;
        const flavorBadges = isAllFlavors 
          ? '<span class="store-flavor-tag" style="background:#FFF1CC; color:#784500;">All 4 Flavors</span>'
          : store.flavors.map(f => `<span class="store-flavor-tag">${f}</span>`).join(' ');

        const distText = `${store.distance.toFixed(1)} mi away`;
        const isActive = store.id === activeStoreId ? 'active' : '';

        return `
          <div class="store-card ${isActive}" onclick="selectStore(${store.id})" id="store-card-${store.id}">
            <div class="store-number-badge">${index + 1}</div>
            <div class="store-card-info">
              <div class="store-card-name">${store.name}</div>
              <div class="store-card-address">${store.addr}, ${store.town}, MA</div>
              <div class="store-card-meta">
                ${flavorBadges}
                <span class="store-distance-tag">${distText}</span>
                <a href="https://maps.google.com/?q=${encodeURIComponent(store.name + ' ' + store.addr + ' ' + store.town + ' MA')}" 
                   target="_blank" rel="noopener noreferrer" 
                   class="store-directions-link" onclick="event.stopPropagation()">
                   Directions
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');

      updateMapMarkers(filtered);
    }

    // Select store card & focus marker
    function selectStore(id) {
      activeStoreId = id;
      document.querySelectorAll('.store-card').forEach(el => el.classList.remove('active'));
      const activeEl = document.getElementById(`store-card-${id}`);
      if (activeEl) {
        activeEl.classList.add('active');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const store = STORES.find(s => s.id === id);
      if (store && mapInstance) {
        mapInstance.flyTo([store.lat, store.lng], 13, { duration: 0.8 });
        const marker = mapMarkers.find(m => m.storeId === id);
        if (marker) marker.openPopup();
      }
    }

    // Flavor filter button clicks
    function selectFlavorFilter(flavor) {
      currentFlavorFilter = flavor;
      document.querySelectorAll('#flavor-filter-row .filter-pill').forEach(btn => {
        if (btn.getAttribute('data-flavor') === flavor) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      renderStoreList();
    }

    // When clicking "Find This Flavor" from Flavor Cards
    function filterStoreByFlavor(flavorName) {
      selectFlavorFilter(flavorName);
      const target = document.getElementById('find');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Handle ZIP Search
    function handleZipSubmit(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('zip-input');
      const zip = input ? input.value.trim() : '';
      if (ZIPS[zip]) {
        userOrigin = ZIPS[zip];
        renderStoreList();
        if (mapInstance) mapInstance.flyTo(userOrigin, 12, { duration: 1.0 });
      } else if (zip.length === 5) {
        alert(`${zip} is currently outside our direct delivery zone. Showing nearest South Boston & South Shore stores!`);
        userOrigin = [42.3355, -71.0365];
        renderStoreList();
      }
    }

    function quickZip(zip) {
      const input = document.getElementById('zip-input');
      if (input) input.value = zip;
      handleZipSubmit(null);
    }

    // Initialize Map with Leaflet
    function initMap() {
      const mapEl = document.getElementById('store-map');
      if (!mapEl || typeof L === 'undefined') return;

      mapInstance = L.map('store-map', {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true
      }).setView([42.18, -70.86], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      renderStoreList();
    }

    // Update Markers on map
    function updateMapMarkers(filteredStores) {
      if (!mapInstance || typeof L === 'undefined') return;

      mapMarkers.forEach(m => m.remove());
      mapMarkers = [];

      filteredStores.forEach((store, idx) => {
        const icon = L.divIcon({
          className: '',
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -36],
          html: `
            <div class="custom-marker-pin">
              <span>${idx + 1}</span>
            </div>
          `
        });

        const marker = L.marker([store.lat, store.lng], { icon }).addTo(mapInstance);
        marker.storeId = store.id;

        marker.bindPopup(`
          <div style="font-family:'Bricolage Grotesque',sans-serif; font-size:15px; font-weight:800; color:#4C3427; margin-bottom:4px;">
            ${store.name}
          </div>
          <div style="font-family:'Figtree',sans-serif; font-size:13px; color:#6B5546; margin-bottom:6px;">
            ${store.addr}, ${store.town}, MA
          </div>
          <div style="font-size:12px; font-weight:700; color:#CC8D27;">
            ${store.flavors.join(' · ')}
          </div>
        `);

        marker.on('click', () => {
          selectStore(store.id);
        });

        mapMarkers.push(marker);
      });

      if (filteredStores.length > 0) {
        const bounds = L.latLngBounds(filteredStores.map(s => [s.lat, s.lng]));
        mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }

    // Run map init after DOM loaded
    document.addEventListener('DOMContentLoaded', () => {
      initMap();
    });
  