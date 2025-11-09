/**
 * SUPER MOVING CALCULATOR
 * Premium Moving Cost Estimator
 * Full-Stack Application Logic
 */

// ==========================================
// GLOBAL STATE & CONFIGURATION
// ==========================================

let CONFIG = null;
let state = {
    moveDate: null,
    pickupAddress: '',
    deliveryAddress: '',
    distance: 0,
    homeSize: '',
    hasStairs: false,
    inventory: {},
    itemValue: 0,
    selectedTier: 'standard',
    addOns: {
        packing: false,
        insurance: false,
        assembly: false,
        assemblyItems: 0,
        cleaning: false,
        junk: false,
        junkItems: 0,
        storage: false,
        storageMonths: 1
    },
    uploadedFiles: [],
    tip: 0,
    customTip: 0,
    referralCode: generateReferralCode()
};

let calculationResults = {
    totalWeight: 0,
    crewSize: 0,
    estimatedHours: 0,
    basePrice: 0,
    tierPrice: 0,
    addOnsTotal: 0,
    appliedConditions: [],
    conditionsMultiplier: 1,
    finalPrice: 0,
    priceRange: { min: 0, max: 0 },
    riskScore: 'low'
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initializeApp();
    attachEventListeners();
    setDefaultDate();
    generateCalendar();
    updateReferralCode();
});

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        CONFIG = await response.json();
    } catch (error) {
        console.error('Failed to load config:', error);
        // Fallback config
        CONFIG = getDefaultConfig();
    }
}

function getDefaultConfig() {
    return {
        company: {
            name: "Premium Movers Co.",
            phone: "+1-800-MOVE-NOW",
            email: "booking@premiummovers.com",
            bookingUrl: "https://calendly.com/booking",
            logo: "🚚"
        },
        pricing: {
            baseHourlyRate: 120,
            perMoverRate: 60,
            mileageRate: 2.5,
            tiers: {
                saver: { multiplier: 0.85, name: "Saver" },
                standard: { multiplier: 1.0, name: "Standard" },
                whiteGlove: { multiplier: 1.35, name: "White Glove" }
            }
        },
        addOns: {
            packingPerRoom: 85,
            insuranceBasicPerLb: 0.60,
            insuranceFullPercent: 2,
            assemblyPerItem: 25,
            cleaning: { studio: 100, oneBed: 125, twoBed: 175, threeBed: 225, fourBed: 250 },
            junkRemovalPerItem: 35,
            storagePerMonth: 150
        }
    };
}

function initializeApp() {
    updateTierFeatures();
    calculateQuote();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function attachEventListeners() {
    // Form inputs
    document.getElementById('moveDate')?.addEventListener('change', handleDateChange);
    document.getElementById('distance')?.addEventListener('input', handleInputChange);
    document.getElementById('homeSize')?.addEventListener('change', handleHomeSizeChange);
    document.getElementById('hasStairs')?.addEventListener('change', handleInputChange);
    document.getElementById('itemValue')?.addEventListener('input', handleInputChange);
    document.getElementById('pickupAddress')?.addEventListener('input', handleInputChange);
    document.getElementById('deliveryAddress')?.addEventListener('input', handleInputChange);

    // Tier selector
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tier = e.currentTarget.dataset.tier;
            selectTier(tier);
        });
    });

    // Add-ons
    document.getElementById('addonPacking')?.addEventListener('change', handleAddonChange);
    document.getElementById('addonInsurance')?.addEventListener('change', handleAddonChange);
    document.getElementById('addonAssembly')?.addEventListener('change', handleAddonChange);
    document.getElementById('assemblyItems')?.addEventListener('input', handleAddonChange);
    document.getElementById('addonCleaning')?.addEventListener('change', handleAddonChange);
    document.getElementById('addonJunk')?.addEventListener('change', handleAddonChange);
    document.getElementById('junkItems')?.addEventListener('input', handleAddonChange);
    document.getElementById('addonStorage')?.addEventListener('change', handleAddonChange);
    document.getElementById('storageMonths')?.addEventListener('input', handleAddonChange);

    // File upload
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileUpload');

    uploadZone?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', handleFileUpload);

    uploadZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone?.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        handleFileDrop(e);
    });

    // Tip calculator
    document.querySelectorAll('.tip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tipPercent = parseInt(e.currentTarget.dataset.tip);
            setTip(tipPercent);
        });
    });

    document.getElementById('customTip')?.addEventListener('input', (e) => {
        setCustomTip(parseFloat(e.target.value) || 0);
    });

    // CTAs
    document.getElementById('bookNowBtn')?.addEventListener('click', handleBookNow);
    document.getElementById('callOfficeBtn')?.addEventListener('click', handleCallOffice);
    document.getElementById('textQuoteBtn')?.addEventListener('click', openSMSModal);
    document.getElementById('downloadChecklistBtn')?.addEventListener('click', downloadChecklist);

    // SMS Form
    document.getElementById('smsForm')?.addEventListener('submit', handleSMSSubmit);

    // Referral
    document.getElementById('copyCodeBtn')?.addEventListener('click', copyReferralCode);
    document.getElementById('shareTextBtn')?.addEventListener('click', () => shareReferral('text'));
    document.getElementById('shareEmailBtn')?.addEventListener('click', () => shareReferral('email'));
    document.getElementById('shareSocialBtn')?.addEventListener('click', () => shareReferral('social'));

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal;
            closeModal(modalId);
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ==========================================
// INPUT HANDLERS
// ==========================================

function handleInputChange() {
    collectFormData();
    calculateQuote();
}

function handleDateChange(e) {
    state.moveDate = e.target.value;
    updateUrgencyText();
    calculateQuote();
}

function handleHomeSizeChange(e) {
    state.homeSize = e.target.value;
    autoFillInventory(state.homeSize);
    calculateQuote();
}

function handleAddonChange() {
    state.addOns = {
        packing: document.getElementById('addonPacking')?.checked || false,
        insurance: document.getElementById('addonInsurance')?.checked || false,
        assembly: document.getElementById('addonAssembly')?.checked || false,
        assemblyItems: parseInt(document.getElementById('assemblyItems')?.value) || 0,
        cleaning: document.getElementById('addonCleaning')?.checked || false,
        junk: document.getElementById('addonJunk')?.checked || false,
        junkItems: parseInt(document.getElementById('junkItems')?.value) || 0,
        storage: document.getElementById('addonStorage')?.checked || false,
        storageMonths: parseInt(document.getElementById('storageMonths')?.value) || 1
    };
    calculateQuote();
}

function collectFormData() {
    state.pickupAddress = document.getElementById('pickupAddress')?.value || '';
    state.deliveryAddress = document.getElementById('deliveryAddress')?.value || '';
    state.distance = parseFloat(document.getElementById('distance')?.value) || 0;
    state.hasStairs = document.getElementById('hasStairs')?.checked || false;
    state.itemValue = parseFloat(document.getElementById('itemValue')?.value) || 0;
}

// ==========================================
// AUTO-INVENTORY SYSTEM
// ==========================================

function autoFillInventory(homeSize) {
    if (!homeSize || homeSize === 'custom' || !CONFIG.inventory[homeSize]) {
        renderInventoryGrid();
        return;
    }

    const template = CONFIG.inventory[homeSize];
    state.inventory = { ...template };
    renderInventoryGrid();
    updateInventoryBadge();
}

function renderInventoryGrid() {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;

    const items = ['beds', 'dressers', 'nightstands', 'sofas', 'chairs', 'diningTable',
                   'tvStand', 'coffeeTable', 'bookshelf', 'boxes'];

    grid.innerHTML = items.map(item => `
        <div class="inventory-item">
            <label>${formatItemName(item)}</label>
            <input type="number"
                   id="inv-${item}"
                   value="${state.inventory[item] || 0}"
                   min="0"
                   data-item="${item}">
        </div>
    `).join('');

    // Attach listeners to inventory inputs
    grid.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const item = e.target.dataset.item;
            state.inventory[item] = parseInt(e.target.value) || 0;
            updateInventoryBadge();
            calculateQuote();
        });
    });
}

function formatItemName(item) {
    return item.replace(/([A-Z])/g, ' $1')
               .replace(/^./, str => str.toUpperCase());
}

function updateInventoryBadge() {
    const total = Object.values(state.inventory).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    const badge = document.getElementById('totalItemsBadge');
    if (badge) {
        badge.textContent = `${total} items`;
    }
}

// ==========================================
// PRICING CALCULATION ENGINE
// ==========================================

function calculateQuote() {
    // Calculate total weight
    calculationResults.totalWeight = calculateTotalWeight();

    // Determine crew size based on weight
    calculationResults.crewSize = calculateCrewSize(calculationResults.totalWeight);

    // Estimate hours based on distance and weight
    calculationResults.estimatedHours = calculateEstimatedHours(
        calculationResults.totalWeight,
        state.distance
    );

    // Calculate base price
    calculationResults.basePrice = calculateBasePrice(
        calculationResults.crewSize,
        calculationResults.estimatedHours,
        state.distance
    );

    // Apply dynamic pricing conditions
    const conditionsData = applyPricingConditions();
    calculationResults.appliedConditions = conditionsData.conditions;
    calculationResults.conditionsMultiplier = conditionsData.multiplier;

    // Apply tier multiplier
    const tierMultiplier = CONFIG.pricing.tiers[state.selectedTier].multiplier;
    calculationResults.tierPrice = calculationResults.basePrice *
                                    calculationResults.conditionsMultiplier *
                                    tierMultiplier;

    // Calculate add-ons
    calculationResults.addOnsTotal = calculateAddOns();

    // Calculate final price
    calculationResults.finalPrice = calculationResults.tierPrice + calculationResults.addOnsTotal;

    // Calculate price range (±10%)
    calculationResults.priceRange = {
        min: Math.round(calculationResults.finalPrice * 0.9),
        max: Math.round(calculationResults.finalPrice * 1.1)
    };

    // Calculate risk score
    calculationResults.riskScore = calculateRiskScore();

    // Update UI
    updateQuoteDisplay();
    updateMoveSummary();
    updateRiskScore();
    updatePricingConditions();
    updateCompetitorComparison();
    updateAddOnPrices();
    generateAISummary();
    generateSmartUpsells();
}

function calculateTotalWeight() {
    let weight = 0;
    for (const [item, quantity] of Object.entries(state.inventory)) {
        const itemWeight = CONFIG.weights[item] || 0;
        weight += itemWeight * (parseInt(quantity) || 0);
    }
    return weight;
}

function calculateCrewSize(weight) {
    if (weight < 1500) return 2;
    if (weight < 3000) return 3;
    if (weight < 5000) return 4;
    return 5;
}

function calculateEstimatedHours(weight, distance) {
    // Base time: 1 hour per 500 lbs
    let hours = weight / 500;

    // Add travel time: 30 min per 10 miles
    hours += (distance / 10) * 0.5;

    // Minimum 3 hours
    hours = Math.max(hours, 3);

    // Add time for stairs
    if (state.hasStairs) {
        hours += 1;
    }

    return Math.ceil(hours);
}

function calculateBasePrice(crewSize, hours, distance) {
    const laborCost = CONFIG.pricing.baseHourlyRate * hours;
    const crewCost = CONFIG.pricing.perMoverRate * crewSize * hours;
    const mileageCost = CONFIG.pricing.mileageRate * distance;

    return laborCost + crewCost + mileageCost;
}

// ==========================================
// DYNAMIC PRICING CONDITIONS
// ==========================================

function applyPricingConditions() {
    const conditions = [];
    let totalMultiplier = 1;

    if (!state.moveDate) {
        return { conditions, multiplier: totalMultiplier };
    }

    const moveDate = new Date(state.moveDate);
    const month = moveDate.getMonth() + 1;
    const dayOfWeek = moveDate.getDay();
    const dayOfMonth = moveDate.getDate();
    const today = new Date();
    const daysUntilMove = Math.ceil((moveDate - today) / (1000 * 60 * 60 * 24));

    // Peak Season (May-Sept)
    if (CONFIG.pricing.seasonalMultipliers.peak.months.includes(month)) {
        conditions.push(CONFIG.pricing.seasonalMultipliers.peak.label);
        totalMultiplier *= CONFIG.pricing.seasonalMultipliers.peak.multiplier;
    }

    // Weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        conditions.push(CONFIG.pricing.seasonalMultipliers.weekend.label);
        totalMultiplier *= CONFIG.pricing.seasonalMultipliers.weekend.multiplier;
    }

    // Month End (last 3 days and first day)
    const lastDayOfMonth = new Date(moveDate.getFullYear(), moveDate.getMonth() + 1, 0).getDate();
    if (dayOfMonth >= lastDayOfMonth - 2 || dayOfMonth === 1) {
        conditions.push(CONFIG.pricing.seasonalMultipliers.monthEnd.label);
        totalMultiplier *= CONFIG.pricing.seasonalMultipliers.monthEnd.multiplier;
    }

    // Rush Service
    if (daysUntilMove <= CONFIG.pricing.seasonalMultipliers.rush.daysThreshold) {
        conditions.push(CONFIG.pricing.seasonalMultipliers.rush.label);
        totalMultiplier *= CONFIG.pricing.seasonalMultipliers.rush.multiplier;
    }

    // Long Distance
    if (state.distance > CONFIG.pricing.seasonalMultipliers.longDistance.milesThreshold) {
        conditions.push(CONFIG.pricing.seasonalMultipliers.longDistance.label);
        totalMultiplier *= CONFIG.pricing.seasonalMultipliers.longDistance.multiplier;
    }

    // Walk-up / No Elevator
    if (state.hasStairs) {
        conditions.push(CONFIG.pricing.seasonalMultipliers.walkUp.label);
        totalMultiplier *= CONFIG.pricing.seasonalMultipliers.walkUp.multiplier;
    }

    // Check for holidays (simplified - can be expanded)
    const holidays = [
        new Date(moveDate.getFullYear(), 0, 1),  // New Year
        new Date(moveDate.getFullYear(), 6, 4),  // July 4th
        new Date(moveDate.getFullYear(), 11, 25) // Christmas
    ];

    if (holidays.some(holiday =>
        holiday.getMonth() === moveDate.getMonth() &&
        holiday.getDate() === moveDate.getDate()
    )) {
        conditions.push(CONFIG.pricing.seasonalMultipliers.holiday.label);
        totalMultiplier *= CONFIG.pricing.seasonalMultipliers.holiday.multiplier;
    }

    return { conditions, multiplier: totalMultiplier };
}

// ==========================================
// ADD-ONS CALCULATION
// ==========================================

function calculateAddOns() {
    let total = 0;

    // Packing - based on number of rooms
    if (state.addOns.packing) {
        const rooms = getRoomCount(state.homeSize);
        total += CONFIG.addOns.packingPerRoom * rooms;
    }

    // Full Insurance - based on item value
    if (state.addOns.insurance && state.itemValue > 0) {
        total += state.itemValue * (CONFIG.addOns.insuranceFullPercent / 100);
    }

    // Assembly
    if (state.addOns.assembly && state.addOns.assemblyItems > 0) {
        total += CONFIG.addOns.assemblyPerItem * state.addOns.assemblyItems;
    }

    // Cleaning
    if (state.addOns.cleaning) {
        const cleaningCost = getCleaningCost(state.homeSize);
        total += cleaningCost;
    }

    // Junk Removal
    if (state.addOns.junk && state.addOns.junkItems > 0) {
        total += CONFIG.addOns.junkRemovalPerItem * state.addOns.junkItems;
    }

    // Storage (first month free)
    if (state.addOns.storage && state.addOns.storageMonths > 1) {
        total += CONFIG.addOns.storagePerMonth * (state.addOns.storageMonths - 1);
    }

    return total;
}

function getRoomCount(homeSize) {
    const roomMap = {
        'studio': 1,
        '1bedroom': 2,
        '2bedroom': 3,
        '3bedroom': 4,
        '4bedroom': 5
    };
    return roomMap[homeSize] || 3;
}

function getCleaningCost(homeSize) {
    const costMap = {
        'studio': CONFIG.addOns.cleaning.studio,
        '1bedroom': CONFIG.addOns.cleaning.oneBed,
        '2bedroom': CONFIG.addOns.cleaning.twoBed,
        '3bedroom': CONFIG.addOns.cleaning.threeBed,
        '4bedroom': CONFIG.addOns.cleaning.fourBed
    };
    return costMap[homeSize] || CONFIG.addOns.cleaning.twoBed;
}

function updateAddOnPrices() {
    // Packing
    if (state.addOns.packing) {
        const rooms = getRoomCount(state.homeSize);
        const cost = CONFIG.addOns.packingPerRoom * rooms;
        document.getElementById('packingPrice').textContent = `+$${cost}`;
    } else {
        document.getElementById('packingPrice').textContent = '+$0';
    }

    // Insurance
    if (state.addOns.insurance && state.itemValue > 0) {
        const cost = Math.round(state.itemValue * (CONFIG.addOns.insuranceFullPercent / 100));
        document.getElementById('insurancePrice').textContent = `+$${cost}`;
    } else {
        document.getElementById('insurancePrice').textContent = '+$0';
    }

    // Assembly
    if (state.addOns.assembly && state.addOns.assemblyItems > 0) {
        const cost = CONFIG.addOns.assemblyPerItem * state.addOns.assemblyItems;
        document.getElementById('assemblyPrice').textContent = `+$${cost}`;
    } else {
        document.getElementById('assemblyPrice').textContent = '+$0';
    }

    // Cleaning
    if (state.addOns.cleaning) {
        const cost = getCleaningCost(state.homeSize);
        document.getElementById('cleaningPrice').textContent = `+$${cost}`;
    } else {
        document.getElementById('cleaningPrice').textContent = '+$0';
    }

    // Junk
    if (state.addOns.junk && state.addOns.junkItems > 0) {
        const cost = CONFIG.addOns.junkRemovalPerItem * state.addOns.junkItems;
        document.getElementById('junkPrice').textContent = `+$${cost}`;
    } else {
        document.getElementById('junkPrice').textContent = '+$0';
    }

    // Storage
    if (state.addOns.storage && state.addOns.storageMonths > 1) {
        const cost = CONFIG.addOns.storagePerMonth * (state.addOns.storageMonths - 1);
        document.getElementById('storagePrice').textContent = `+$${cost}`;
    } else if (state.addOns.storage) {
        document.getElementById('storagePrice').textContent = 'FREE (1st month)';
    } else {
        document.getElementById('storagePrice').textContent = '+$0';
    }
}

// ==========================================
// RISK SCORE CALCULATOR
// ==========================================

function calculateRiskScore() {
    let riskPoints = 0;

    // Weight-based risk
    if (calculationResults.totalWeight > 7000) riskPoints += 2;
    else if (calculationResults.totalWeight > 4000) riskPoints += 1;

    // Distance-based risk
    if (state.distance > 200) riskPoints += 2;
    else if (state.distance > 100) riskPoints += 1;

    // Stairs add risk
    if (state.hasStairs) riskPoints += 1;

    // High value items
    if (state.itemValue > 20000) riskPoints += 2;
    else if (state.itemValue > 10000) riskPoints += 1;

    // Crew size (small crew for large move = risk)
    if (calculationResults.totalWeight > 5000 && calculationResults.crewSize < 4) {
        riskPoints += 1;
    }

    // Categorize risk
    if (riskPoints >= 5) return 'high';
    if (riskPoints >= 3) return 'medium';
    return 'low';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateQuoteDisplay() {
    const priceValue = document.getElementById('priceValue');
    const priceRange = document.getElementById('priceRange');

    if (priceValue) {
        const totalWithTip = calculationResults.finalPrice + (state.customTip || state.tip);
        priceValue.textContent = `$${Math.round(totalWithTip).toLocaleString()}`;
    }

    if (priceRange) {
        priceRange.textContent = `Range: $${calculationResults.priceRange.min.toLocaleString()} - $${calculationResults.priceRange.max.toLocaleString()}`;
    }
}

function updateMoveSummary() {
    document.getElementById('summaryWeight').textContent =
        `${calculationResults.totalWeight.toLocaleString()} lbs`;

    document.getElementById('summaryDistance').textContent =
        `${state.distance} miles`;

    document.getElementById('summaryCrew').textContent =
        `${calculationResults.crewSize} movers`;

    document.getElementById('summaryHours').textContent =
        `${calculationResults.estimatedHours} hours`;
}

function updateRiskScore() {
    const riskScoreEl = document.getElementById('riskScore');
    const riskIcon = document.getElementById('riskIcon');
    const riskLabel = document.getElementById('riskLabel');
    const riskDescription = document.getElementById('riskDescription');

    if (!riskScoreEl) return;

    // Remove all risk classes
    riskScoreEl.classList.remove('low', 'medium', 'high');
    riskScoreEl.classList.add(calculationResults.riskScore);

    const riskData = {
        low: {
            icon: '✅',
            label: 'Low Risk Move',
            description: 'This is a straightforward move. Standard service tier is perfect for your needs.'
        },
        medium: {
            icon: '⚠️',
            label: 'Medium Risk Move',
            description: 'Consider adding extra insurance or an additional mover for safety and efficiency.'
        },
        high: {
            icon: '🔴',
            label: 'Complex Move',
            description: 'We recommend White Glove tier with full insurance for this challenging move.'
        }
    };

    const data = riskData[calculationResults.riskScore];
    if (riskIcon) riskIcon.textContent = data.icon;
    if (riskLabel) riskLabel.textContent = data.label;
    if (riskDescription) riskDescription.textContent = data.description;
}

function updatePricingConditions() {
    const conditionsEl = document.getElementById('pricingConditions');
    const conditionsList = document.getElementById('conditionsList');

    if (!conditionsEl || !conditionsList) return;

    if (calculationResults.appliedConditions.length > 0) {
        conditionsEl.style.display = 'block';
        conditionsList.innerHTML = calculationResults.appliedConditions
            .map(condition => `<li>+ ${condition}</li>`)
            .join('');
    } else {
        conditionsEl.style.display = 'none';
    }
}

function updateCompetitorComparison() {
    const yourQuote = calculationResults.finalPrice;
    const industryAvg = yourQuote * CONFIG.competitorAvgMultiplier;
    const savings = industryAvg - yourQuote;

    document.getElementById('yourQuote').textContent = `$${Math.round(yourQuote).toLocaleString()}`;
    document.getElementById('industryAvg').textContent = `$${Math.round(industryAvg).toLocaleString()}`;
    document.getElementById('savingsAmount').textContent = `$${Math.round(savings).toLocaleString()}`;
}

// ==========================================
// AI SUMMARY GENERATOR
// ==========================================

function generateAISummary() {
    const summaryEl = document.getElementById('aiSummaryText');
    if (!summaryEl) return;

    const homeType = state.homeSize ? formatHomeSize(state.homeSize) : 'your home';
    const weight = calculationResults.totalWeight;
    const distance = state.distance;
    const crew = calculationResults.crewSize;
    const hours = calculationResults.estimatedHours;
    const tierName = CONFIG.pricing.tiers[state.selectedTier].name;
    const priceMin = calculationResults.priceRange.min;
    const priceMax = calculationResults.priceRange.max;

    let summary = `Your ${homeType} move (~${weight.toLocaleString()} lbs, ${distance} miles) requires ${crew} movers and approximately ${hours} hours. `;
    summary += `Estimated total: $${priceMin.toLocaleString()}–$${priceMax.toLocaleString()} (${tierName} Tier). `;

    if (calculationResults.appliedConditions.length > 0) {
        summary += `${calculationResults.appliedConditions.slice(0, 2).join(' + ')} pricing applied.`;
    }

    summaryEl.textContent = summary;
}

function formatHomeSize(homeSize) {
    const map = {
        'studio': 'studio apartment',
        '1bedroom': '1-bedroom apartment',
        '2bedroom': '2-bedroom apartment',
        '3bedroom': '3-bedroom home',
        '4bedroom': '4+ bedroom home'
    };
    return map[homeSize] || 'home';
}

// ==========================================
// SMART UPSELL RECOMMENDATIONS
// ==========================================

function generateSmartUpsells() {
    const upsellCard = document.getElementById('upsellCard');
    const upsellList = document.getElementById('upsellList');

    if (!upsellCard || !upsellList) return;

    const upsells = [];

    // Recommend extra mover if heavy
    if (calculationResults.totalWeight > 2200 && calculationResults.crewSize < 4) {
        upsells.push({
            icon: '👷',
            title: 'Add Extra Mover',
            description: 'Your move is on the heavier side. An extra mover will speed things up and reduce risk.',
            action: 'Contact Us'
        });
    }

    // Recommend packing if many items
    const totalItems = Object.values(state.inventory).reduce((sum, val) => sum + val, 0);
    if (totalItems > 50 && !state.addOns.packing) {
        upsells.push({
            icon: '📦',
            title: 'Professional Packing',
            description: 'You have a lot of items! Let our team pack everything safely and efficiently.',
            action: 'Enable Packing',
            callback: () => {
                document.getElementById('addonPacking').checked = true;
                handleAddonChange();
            }
        });
    }

    // Recommend insurance if high value
    if (state.itemValue > 10000 && !state.addOns.insurance) {
        upsells.push({
            icon: '🛡️',
            title: 'Full Value Insurance',
            description: `Protect your $${state.itemValue.toLocaleString()} worth of belongings with comprehensive coverage.`,
            action: 'Add Insurance',
            callback: () => {
                document.getElementById('addonInsurance').checked = true;
                handleAddonChange();
            }
        });
    }

    // Recommend storage if long distance
    if (state.distance > 150 && !state.addOns.storage) {
        upsells.push({
            icon: '🏢',
            title: 'Temporary Storage',
            description: 'Long-distance move? Get 1 month free storage in case you need flexibility.',
            action: 'Add Storage',
            callback: () => {
                document.getElementById('addonStorage').checked = true;
                handleAddonChange();
            }
        });
    }

    // Recommend White Glove if high risk
    if (calculationResults.riskScore === 'high' && state.selectedTier !== 'whiteGlove') {
        upsells.push({
            icon: '⭐',
            title: 'Upgrade to White Glove',
            description: 'This is a complex move. White Glove service ensures everything goes smoothly.',
            action: 'Upgrade Tier',
            callback: () => selectTier('whiteGlove')
        });
    }

    if (upsells.length > 0) {
        upsellCard.style.display = 'block';
        upsellList.innerHTML = upsells.map(upsell => `
            <div class="upsell-item">
                <h4>${upsell.icon} ${upsell.title}</h4>
                <p>${upsell.description}</p>
                <button onclick="handleUpsellClick('${upsell.title}')">${upsell.action}</button>
            </div>
        `).join('');

        // Store callbacks for upsells
        window.upsellCallbacks = {};
        upsells.forEach(upsell => {
            if (upsell.callback) {
                window.upsellCallbacks[upsell.title] = upsell.callback;
            }
        });
    } else {
        upsellCard.style.display = 'none';
    }
}

function handleUpsellClick(title) {
    if (window.upsellCallbacks && window.upsellCallbacks[title]) {
        window.upsellCallbacks[title]();
    }
}

// ==========================================
// TIER MANAGEMENT
// ==========================================

function selectTier(tier) {
    state.selectedTier = tier;

    // Update UI
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tier="${tier}"]`)?.classList.add('active');

    updateTierFeatures();
    calculateQuote();
}

function updateTierFeatures() {
    const featuresEl = document.getElementById('tierFeatures');
    if (!featuresEl) return;

    const tier = CONFIG.pricing.tiers[state.selectedTier];
    if (!tier || !tier.features) return;

    featuresEl.innerHTML = `
        <ul>
            ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
    `;
}

// ==========================================
// FILE UPLOAD & AI ESTIMATION
// ==========================================

function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function handleFileDrop(e) {
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function processFiles(files) {
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Max 10MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            state.uploadedFiles.push({
                name: file.name,
                type: file.type,
                data: e.target.result
            });
            displayUploadedFiles();
            // Simulate AI estimation
            simulateAIEstimation(file);
        };
        reader.readAsDataURL(file);
    });
}

function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    container.innerHTML = state.uploadedFiles.map((file, index) => `
        <div class="uploaded-file">
            ${file.type.startsWith('image/') ?
                `<img src="${file.data}" alt="${file.name}">` :
                `<video src="${file.data}" muted></video>`
            }
            <button class="file-remove" onclick="removeFile(${index})">×</button>
        </div>
    `).join('');
}

function removeFile(index) {
    state.uploadedFiles.splice(index, 1);
    displayUploadedFiles();
}

function simulateAIEstimation(file) {
    // Simulate AI analyzing the image/video
    // In production, this would call a real AI service
    setTimeout(() => {
        // Add 5-15% to estimated weight based on photos
        const boost = 1.05 + (Math.random() * 0.1);

        // Slightly adjust inventory (simulate AI detection)
        if (state.inventory.boxes) {
            state.inventory.boxes = Math.round(state.inventory.boxes * boost);
        }

        renderInventoryGrid();
        calculateQuote();
    }, 1000);
}

// ==========================================
// TIP CALCULATOR
// ==========================================

function setTip(percentage) {
    state.tip = Math.round(calculationResults.finalPrice * (percentage / 100));
    state.customTip = 0;
    document.getElementById('customTip').value = '';

    // Update tip button states
    document.querySelectorAll('.tip-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.tip) === percentage) {
            btn.classList.add('active');
        }
    });

    updateTipDisplay();
    updateQuoteDisplay();
}

function setCustomTip(amount) {
    state.customTip = amount;
    state.tip = 0;

    // Clear tip button selection
    document.querySelectorAll('.tip-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    updateTipDisplay();
    updateQuoteDisplay();
}

function updateTipDisplay() {
    const tipAmountEl = document.getElementById('tipAmount');
    if (!tipAmountEl) return;

    const totalTip = state.customTip || state.tip;
    if (totalTip > 0) {
        tipAmountEl.textContent = `Tip: $${totalTip.toLocaleString()}`;
    } else {
        tipAmountEl.textContent = '';
    }
}

// ==========================================
// CALENDAR & AVAILABILITY
// ==========================================

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const today = new Date();
    const days = [];

    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Simulate availability (random for demo)
        const availability = getAvailability(date);

        days.push({
            date,
            availability,
            dayNum: date.getDate(),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
    }

    calendarGrid.innerHTML = days.map(day => `
        <div class="calendar-day ${day.availability}"
             data-date="${day.date.toISOString()}"
             onclick="selectCalendarDate('${day.date.toISOString()}')">
            <div class="day-num">${day.dayNum}</div>
            <div class="day-name">${day.dayName}</div>
        </div>
    `).join('');
}

function getAvailability(date) {
    // Simulate availability based on day
    const dayOfWeek = date.getDay();
    const random = Math.random();

    // Weekends more likely to be limited/full
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return random > 0.5 ? 'limited' : 'full';
    }

    // Weekdays more available
    if (random > 0.7) return 'limited';
    if (random > 0.9) return 'full';
    return 'available';
}

function selectCalendarDate(dateString) {
    const date = new Date(dateString);
    const dateInput = document.getElementById('moveDate');

    if (dateInput) {
        dateInput.value = date.toISOString().split('T')[0];
        handleDateChange({ target: dateInput });
    }
}

function setDefaultDate() {
    const dateInput = document.getElementById('moveDate');
    if (!dateInput) return;

    // Default to 2 weeks from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);

    dateInput.value = defaultDate.toISOString().split('T')[0];
    state.moveDate = dateInput.value;
    updateUrgencyText();
}

function updateUrgencyText() {
    const urgencyTextEl = document.getElementById('urgencyText');
    const bookBtnText = document.getElementById('bookBtnText');

    if (!state.moveDate) return;

    const moveDate = new Date(state.moveDate);
    const today = new Date();
    const daysUntilMove = Math.ceil((moveDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilMove < 10 && urgencyTextEl) {
        urgencyTextEl.textContent = `⚡ Moving soon! Limited availability for your date.`;
        urgencyTextEl.style.color = 'var(--danger)';
    } else if (urgencyTextEl) {
        urgencyTextEl.textContent = '';
    }

    if (daysUntilMove < 10 && bookBtnText) {
        bookBtnText.textContent = '⚡ Book Now - Limited Availability!';
    } else if (bookBtnText) {
        bookBtnText.textContent = '📅 Book Now';
    }
}

// ==========================================
// CTA HANDLERS
// ==========================================

function handleBookNow() {
    if (CONFIG.company.bookingUrl) {
        window.open(CONFIG.company.bookingUrl, '_blank');
    } else {
        alert('Booking calendar coming soon! Please call our office to schedule.');
    }
}

function handleCallOffice() {
    if (CONFIG.company.phone) {
        window.location.href = `tel:${CONFIG.company.phone}`;
    }
}

// ==========================================
// SMS QUOTE DELIVERY
// ==========================================

function openSMSModal() {
    const modal = document.getElementById('smsModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleSMSSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('smsName').value;
    const phone = document.getElementById('smsPhone').value;

    // Simulate SMS sending
    // In production, this would call Twilio API
    console.log('Sending SMS quote to:', phone);
    console.log('Customer name:', name);
    console.log('Quote details:', calculationResults);

    // Show success message
    document.getElementById('smsSuccess').style.display = 'block';

    setTimeout(() => {
        closeModal('smsModal');
        document.getElementById('smsSuccess').style.display = 'none';
        document.getElementById('smsForm').reset();
    }, 2000);
}

// ==========================================
// REFERRAL PROGRAM
// ==========================================

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'REF-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function updateReferralCode() {
    const input = document.getElementById('referralCode');
    if (input) {
        input.value = state.referralCode;
    }
}

function copyReferralCode() {
    const input = document.getElementById('referralCode');
    if (input) {
        input.select();
        document.execCommand('copy');

        const btn = document.getElementById('copyCodeBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';

        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
}

function shareReferral(method) {
    const message = `Get $100 off your move with ${CONFIG.company.name}! Use my referral code: ${state.referralCode}`;
    const url = window.location.href;

    switch (method) {
        case 'text':
            window.location.href = `sms:?body=${encodeURIComponent(message + ' ' + url)}`;
            break;
        case 'email':
            window.location.href = `mailto:?subject=Get $100 off your move&body=${encodeURIComponent(message + '\n\n' + url)}`;
            break;
        case 'social':
            if (navigator.share) {
                navigator.share({
                    title: 'Moving Discount',
                    text: message,
                    url: url
                });
            } else {
                copyReferralCode();
                alert('Link copied! Share it on your favorite platform.');
            }
            break;
    }
}

// ==========================================
// PDF CHECKLIST GENERATOR
// ==========================================

function downloadChecklist() {
    // Using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Your Moving Checklist', 20, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Prepared for: ${state.pickupAddress || 'Your Move'}`, 20, 30);
    doc.text(`Move Date: ${state.moveDate || 'TBD'}`, 20, 35);
    doc.text(`${CONFIG.company.name} | ${CONFIG.company.phone}`, 20, 40);

    // 4 Weeks Before
    let y = 55;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('4 Weeks Before Moving Day', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const fourWeeks = [
        '☐ Create moving budget',
        '☐ Research and book moving company',
        '☐ Start decluttering - donate/sell unwanted items',
        '☐ Notify landlord if renting',
        '☐ Start collecting packing supplies',
        '☐ Create inventory of belongings'
    ];

    fourWeeks.forEach(item => {
        doc.text(item, 25, y);
        y += 7;
    });

    // 2 Weeks Before
    y += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('2 Weeks Before Moving Day', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const twoWeeks = [
        '☐ Confirm moving company booking',
        '☐ Notify utilities (electric, gas, water, internet)',
        '☐ Update address with post office, bank, insurance',
        '☐ Start packing non-essential items',
        '☐ Label all boxes with contents and destination room',
        '☐ Arrange for pet/child care on moving day'
    ];

    twoWeeks.forEach(item => {
        doc.text(item, 25, y);
        y += 7;
    });

    // 1 Week Before
    y += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('1 Week Before Moving Day', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const oneWeek = [
        '☐ Pack most belongings, leave essentials',
        '☐ Confirm moving truck/crew arrival time',
        '☐ Defrost freezer',
        '☐ Return library books, borrowed items',
        '☐ Get cash for tips',
        '☐ Pack essentials box (toiletries, clothes, documents)'
    ];

    oneWeek.forEach(item => {
        doc.text(item, 25, y);
        y += 7;
    });

    // Moving Day
    y += 5;
    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Moving Day', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const movingDay = [
        '☐ Do final walkthrough of old home',
        '☐ Check all cabinets, closets, storage',
        '☐ Take photos of empty rooms',
        '☐ Meet movers and review inventory',
        '☐ Keep important documents with you',
        '☐ Turn off lights, lock doors',
        '☐ Tip movers (15-20% recommended)'
    ];

    movingDay.forEach(item => {
        doc.text(item, 25, y);
        y += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Generated by Super Moving Calculator | ${new Date().toLocaleDateString()}`, 20, 285);

    // Download
    doc.save('moving-checklist.pdf');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Make handleUpsellClick globally available
window.handleUpsellClick = handleUpsellClick;
window.removeFile = removeFile;
window.selectCalendarDate = selectCalendarDate;

// Export for debugging
window.debugState = () => {
    console.log('Current State:', state);
    console.log('Calculation Results:', calculationResults);
    console.log('Config:', CONFIG);
};

console.log('🚚 Super Moving Calculator initialized successfully!');
console.log('💡 Type window.debugState() in console to see current state');
