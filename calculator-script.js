/* ============================================
   MOVING COST CALCULATOR - JAVASCRIPT
   Full calculation engine with lead capture
   ============================================ */

// Global State
let inventory = {};
let config = {};
let selectedItems = {}; // { item_key: quantity }
let calculationResults = null;
let leadData = null;
let isAdminMode = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check for admin mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        const password = prompt('Enter admin password:');
        if (password === config.admin_mode?.password || password === 'admin123') {
            isAdminMode = true;
            console.log('🔓 Admin mode activated');
        }
    }

    // Load data files
    await loadInventory();
    await loadConfig();

    // Initialize UI
    initializeUI();
    setupEventListeners();
    loadDarkModePreference();

    console.log('✅ Moving Cost Calculator initialized');
});

// ============================================
// LOAD DATA FILES
// ============================================

async function loadInventory() {
    try {
        const response = await fetch('inventory.json');
        inventory = await response.json();
        console.log('✅ Inventory loaded:', Object.keys(inventory.categories).length, 'categories');
    } catch (error) {
        console.error('❌ Error loading inventory:', error);
        alert('Error loading inventory data. Please refresh the page.');
    }
}

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        console.log('✅ Config loaded');

        // Apply config to UI
        applyConfigToUI();
    } catch (error) {
        console.error('❌ Error loading config:', error);
        alert('Error loading configuration. Please refresh the page.');
    }
}

function applyConfigToUI() {
    // Set hourly rate
    if (config.pricing?.labor?.hourly_rate_per_mover) {
        document.getElementById('hourlyRate').value = config.pricing.labor.hourly_rate_per_mover;

        // Lock hourly rate if not allowed to edit
        if (config.pricing.labor.allow_customer_to_edit_rate === false) {
            const hourlyRateInput = document.getElementById('hourlyRate');
            hourlyRateInput.disabled = true;
            hourlyRateInput.style.backgroundColor = 'var(--bg-tertiary)';
            hourlyRateInput.style.cursor = 'not-allowed';

            // Update label to show it's locked
            const label = document.querySelector('label[for="hourlyRate"]');
            if (label) {
                label.innerHTML = 'Hourly Rate per Mover ($) <span style="color: var(--text-tertiary); font-size: 0.85rem;">• Set by company</span>';
            }
        }
    }

    // Set branding
    if (config.ui_settings?.branding) {
        const branding = config.ui_settings.branding;
        if (branding.show_powered_by && branding.powered_by_text) {
            document.getElementById('brandingText').innerHTML =
                `${branding.powered_by_text} ${branding.powered_by_url ? `<a href="${branding.powered_by_url}" target="_blank">RoutineMoves</a>` : ''}`;
        }
    }

    // Apply primary color
    if (config.ui_settings?.theme?.primary_color) {
        document.documentElement.style.setProperty('--primary-color', config.ui_settings.theme.primary_color);
    }
}

// ============================================
// UI INITIALIZATION
// ============================================

function initializeUI() {
    renderInventoryCategories();
    updateInventorySummary();
}

function renderInventoryCategories() {
    const container = document.getElementById('inventoryCategories');
    container.innerHTML = '';

    Object.entries(inventory.categories).forEach(([categoryKey, category]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'inventory-category';
        categoryDiv.innerHTML = `
            <div class="category-header" data-category="${categoryKey}">
                <span class="category-title">${category.name}</span>
                <span class="category-toggle">▼</span>
            </div>
            <div class="category-items" id="category-${categoryKey}">
                ${renderCategoryItems(category.items, categoryKey)}
            </div>
        `;
        container.appendChild(categoryDiv);
    });

    // Add category toggle listeners
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', toggleCategory);
    });
}

function renderCategoryItems(items, categoryKey) {
    return Object.entries(items).map(([itemKey, item]) => {
        const fullKey = `${categoryKey}_${itemKey}`;
        const quantity = selectedItems[fullKey] || 0;

        return `
            <div class="inventory-item" data-item="${fullKey}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-weight">${item.weight} lbs</span>
                </div>
                <div class="item-controls">
                    <button class="item-btn item-minus" data-item="${fullKey}" ${quantity === 0 ? 'disabled' : ''}>−</button>
                    <span class="item-count">${quantity}</span>
                    <button class="item-btn item-plus" data-item="${fullKey}">+</button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleCategory(e) {
    const header = e.currentTarget;
    const categoryKey = header.dataset.category;
    const itemsContainer = document.getElementById(`category-${categoryKey}`);

    header.classList.toggle('active');
    itemsContainer.classList.toggle('active');
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Mode switcher
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', switchMode);
    });

    // Inventory item controls
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-plus')) {
            updateItemQuantity(e.target.dataset.item, 1);
        } else if (e.target.classList.contains('item-minus')) {
            updateItemQuantity(e.target.dataset.item, -1);
        }
    });

    // AI Estimate button
    document.getElementById('aiEstimateBtn').addEventListener('click', generateAIEstimate);

    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateEstimate);

    // Lead capture form
    document.getElementById('leadCaptureForm').addEventListener('submit', handleLeadCapture);

    // Action buttons
    document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPDF);
    document.getElementById('emailQuoteBtn')?.addEventListener('click', emailQuote);
    document.getElementById('textQuoteBtn')?.addEventListener('click', textQuote);
    document.getElementById('startOverBtn')?.addEventListener('click', startOver);

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
}

// ============================================
// MODE SWITCHING
// ============================================

function switchMode(e) {
    const mode = e.target.dataset.mode;

    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Update content
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${mode}Mode`).classList.add('active');

    // Reset progress
    updateProgress(1);
}

// ============================================
// INVENTORY MANAGEMENT
// ============================================

function updateItemQuantity(itemKey, change) {
    if (!selectedItems[itemKey]) {
        selectedItems[itemKey] = 0;
    }

    selectedItems[itemKey] += change;

    if (selectedItems[itemKey] < 0) {
        selectedItems[itemKey] = 0;
    }

    // Re-render the specific item
    const itemElement = document.querySelector(`[data-item="${itemKey}"]`);
    if (itemElement) {
        const count = itemElement.querySelector('.item-count');
        const minusBtn = itemElement.querySelector('.item-minus');

        count.textContent = selectedItems[itemKey];
        minusBtn.disabled = selectedItems[itemKey] === 0;
    }

    updateInventorySummary();

    // Show move details section if items selected
    if (getTotalItems() > 0) {
        document.getElementById('moveDetailsSection').style.display = 'block';
        updateProgress(2);
    } else {
        document.getElementById('moveDetailsSection').style.display = 'none';
        updateProgress(1);
    }
}

function updateInventorySummary() {
    const totalItems = getTotalItems();
    const totalWeight = getTotalWeight();
    const totalCubicFeet = weightToCubicFeet(totalWeight);

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalWeight').textContent = `${totalWeight.toLocaleString()} lbs`;
    document.getElementById('totalCubicFeet').textContent = `${Math.round(totalCubicFeet)} cu ft`;
}

function getTotalItems() {
    return Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
}

function getTotalWeight() {
    let total = 0;

    Object.entries(selectedItems).forEach(([itemKey, quantity]) => {
        const [categoryKey, itemName] = itemKey.split('_');
        const item = inventory.categories[categoryKey]?.items[itemName];
        if (item) {
            total += item.weight * quantity;
        }
    });

    return total;
}

function weightToCubicFeet(weight) {
    const divisor = config.pricing?.calculation_settings?.pounds_to_cubic_feet_divisor || 7;
    return weight / divisor;
}

// ============================================
// AI ESTIMATION
// ============================================

function generateAIEstimate() {
    const input = document.getElementById('aiInput').value.trim();

    if (!input) {
        alert('Please describe your move first');
        return;
    }

    showLoading();

    // Simulate AI processing
    setTimeout(() => {
        const parsed = parseAIInput(input);
        displayAIParsedResults(parsed);

        // Pre-fill form values
        if (parsed.distance) {
            document.getElementById('distance').value = parsed.distance;
        }
        if (parsed.stairs) {
            document.getElementById('stairs').value = parsed.stairs;
        }

        // Show move details section
        document.getElementById('moveDetailsSection').style.display = 'block';
        document.getElementById('aiParsedResults').style.display = 'block';

        hideLoading();
        updateProgress(2);
    }, 1500);
}

function parseAIInput(input) {
    const lower = input.toLowerCase();
    const parsed = {
        homeSize: null,
        weight: 0,
        cubicFeet: 0,
        distance: null,
        stairs: 0,
        packing: false,
        detected: []
    };

    // Detect home size
    if (lower.includes('studio')) {
        parsed.homeSize = 'studio';
        const defaults = inventory.ai_estimation_defaults.studio;
        parsed.weight = defaults.weight;
        parsed.cubicFeet = defaults.cubic_feet;
        parsed.detected.push(`Studio apartment (${defaults.weight} lbs estimated)`);
    } else if (lower.match(/1[\s-]?bed|one[\s-]?bed/)) {
        parsed.homeSize = 'one_bedroom';
        const defaults = inventory.ai_estimation_defaults.one_bedroom;
        parsed.weight = defaults.weight;
        parsed.cubicFeet = defaults.cubic_feet;
        parsed.detected.push(`1-bedroom apartment (${defaults.weight} lbs estimated)`);
    } else if (lower.match(/2[\s-]?bed|two[\s-]?bed/)) {
        parsed.homeSize = 'two_bedroom';
        const defaults = inventory.ai_estimation_defaults.two_bedroom;
        parsed.weight = defaults.weight;
        parsed.cubicFeet = defaults.cubic_feet;
        parsed.detected.push(`2-bedroom apartment (${defaults.weight} lbs estimated)`);
    } else if (lower.match(/3[\s-]?bed|three[\s-]?bed/)) {
        parsed.homeSize = 'three_bedroom';
        const defaults = inventory.ai_estimation_defaults.three_bedroom;
        parsed.weight = defaults.weight;
        parsed.cubicFeet = defaults.cubic_feet;
        parsed.detected.push(`3-bedroom house (${defaults.weight} lbs estimated)`);
    } else if (lower.match(/4[\s-]?bed|four[\s-]?bed/)) {
        parsed.homeSize = 'four_bedroom';
        const defaults = inventory.ai_estimation_defaults.four_bedroom;
        parsed.weight = defaults.weight;
        parsed.cubicFeet = defaults.cubic_feet;
        parsed.detected.push(`4-bedroom house (${defaults.weight} lbs estimated)`);
    } else if (lower.match(/5[\s-]?bed|five[\s-]?bed/)) {
        parsed.homeSize = 'five_bedroom_plus';
        const defaults = inventory.ai_estimation_defaults.five_bedroom_plus;
        parsed.weight = defaults.weight;
        parsed.cubicFeet = defaults.cubic_feet;
        parsed.detected.push(`5+ bedroom house (${defaults.weight} lbs estimated)`);
    }

    // Detect distance
    const distanceMatch = lower.match(/(\d+)\s*(mile|mi)/);
    if (distanceMatch) {
        parsed.distance = parseInt(distanceMatch[1]);
        parsed.detected.push(`Distance: ${parsed.distance} miles`);
    }

    // Detect stairs
    if (lower.match(/no\s*elevator|stairs/)) {
        const floorMatch = lower.match(/(\d+)(st|nd|rd|th)\s*floor/);
        if (floorMatch) {
            parsed.stairs = Math.min(3, parseInt(floorMatch[1]) - 1);
            parsed.detected.push(`${floorMatch[1]}${floorMatch[2]} floor (stairs)`);
        } else {
            parsed.stairs = 1;
            parsed.detected.push('Stairs detected');
        }
    }

    // Detect packing
    if (lower.match(/packing|pack\s*for\s*me|need\s*boxes/)) {
        parsed.packing = true;
        parsed.detected.push('Packing service requested');
    }

    return parsed;
}

function displayAIParsedResults(parsed) {
    const list = document.getElementById('aiDetectedList');
    list.innerHTML = parsed.detected.map(item => `<li>✓ ${item}</li>`).join('');

    // Store AI estimation in a temporary state
    window.aiEstimation = {
        weight: parsed.weight,
        cubicFeet: parsed.cubicFeet
    };
}

// ============================================
// COST CALCULATION
// ============================================

function calculateEstimate() {
    showLoading();

    setTimeout(() => {
        // Get inputs
        const distance = parseFloat(document.getElementById('distance').value) || 10;
        const numMoversInput = document.getElementById('numMovers').value;
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 45;
        const stairs = parseInt(document.getElementById('stairs').value) || 0;
        const packingService = document.getElementById('packingService').checked;
        const longCarry = document.getElementById('longCarry').checked;

        // Get weight (from inventory or AI)
        let totalWeight = getTotalWeight();
        let totalCubicFeet = weightToCubicFeet(totalWeight);

        // If using AI mode and no inventory selected, use AI estimation
        if (totalWeight === 0 && window.aiEstimation) {
            totalWeight = window.aiEstimation.weight;
            totalCubicFeet = window.aiEstimation.cubicFeet;
        }

        if (totalWeight === 0) {
            alert('Please select items or use AI estimation first');
            hideLoading();
            return;
        }

        // Calculate crew size
        const numMovers = numMoversInput === 'auto'
            ? calculateCrewSize(totalWeight)
            : parseInt(numMoversInput);

        // Calculate truck size
        const truckSizeInput = document.getElementById('truckSize').value;
        const truckInfo = truckSizeInput === 'auto'
            ? calculateTruckSize(totalCubicFeet)
            : getManualTruckInfo(truckSizeInput);

        // Calculate labor time
        const loadingRate = config.pricing?.calculation_settings?.loading_rate_lbs_per_mover_per_hour || 1000;
        const unloadingRate = config.pricing?.calculation_settings?.unloading_rate_lbs_per_mover_per_hour || 1200;
        const truckSpeed = config.pricing?.calculation_settings?.average_truck_speed_mph || 45;

        let loadTime = totalWeight / (loadingRate * numMovers);
        let unloadTime = totalWeight / (unloadingRate * numMovers);
        let driveTime = distance / truckSpeed;

        // Apply multipliers
        if (stairs > 0) {
            const stairsMultiplier = config.pricing?.calculation_settings?.stairs_time_multiplier || 1.15;
            loadTime *= Math.pow(stairsMultiplier, stairs);
            unloadTime *= Math.pow(stairsMultiplier, stairs);
        }

        if (packingService) {
            const packingMultiplier = config.pricing?.calculation_settings?.packing_time_multiplier || 1.3;
            loadTime *= packingMultiplier;
        }

        const totalHours = loadTime + unloadTime + driveTime;

        // Calculate costs
        const laborCost = totalHours * numMovers * hourlyRate;
        const truckFee = truckInfo.daily_rate;
        const truckEquipmentFee = config.pricing?.fees?.truck_equipment_fee || 150;

        // Fuel surcharge
        const fuelSurcharge = distance * (config.pricing?.fees?.fuel_surcharge_per_mile || 2.00);

        // Start cost per mile
        const startCostMiles = config.pricing?.fees?.start_cost_applies_to_first_miles || 10;
        const startCostPerMile = config.pricing?.fees?.start_cost_per_mile || 5.00;
        const regularCostPerMile = config.pricing?.fees?.regular_cost_per_mile_after_start || 2.50;

        let distanceCost = 0;
        if (distance <= startCostMiles) {
            distanceCost = distance * startCostPerMile;
        } else {
            distanceCost = (startCostMiles * startCostPerMile) +
                          ((distance - startCostMiles) * regularCostPerMile);
        }

        // Optional fees
        let optionalFees = 0;
        if (stairs > 0) {
            optionalFees += stairs * (config.pricing?.fees?.optional_fees?.stairs_per_flight || 50);
        }
        if (longCarry) {
            optionalFees += config.pricing?.fees?.optional_fees?.long_carry_per_50ft || 35;
        }
        if (packingService) {
            optionalFees += totalHours * (config.pricing?.fees?.optional_fees?.packing_service_per_hour || 60);
        }

        // Apply dynamic pricing
        const dynamicPricing = calculateDynamicPricingMultiplier();

        // Calculate add-ons
        const addOnsTotal = calculateAddOns();

        // Total cost (with dynamic pricing and add-ons)
        let baseCost = laborCost + truckFee + truckEquipmentFee + fuelSurcharge + distanceCost + optionalFees;
        baseCost = baseCost * dynamicPricing.multiplier; // Apply dynamic pricing
        baseCost += addOnsTotal; // Add selected add-ons

        const lowMultiplier = config.pricing?.calculation_settings?.cost_range_low_multiplier || 0.90;
        const highMultiplier = config.pricing?.calculation_settings?.cost_range_high_multiplier || 1.15;

        const costLow = baseCost * lowMultiplier;
        const costHigh = baseCost * highMultiplier;

        // Store results
        calculationResults = {
            totalWeight,
            totalCubicFeet,
            distance,
            numMovers,
            hourlyRate,
            totalHours,
            truckSize: truckInfo.displayName || truckInfo.name,
            truckCount: truckInfo.count,
            truckFee,
            truckEquipmentFee,
            laborCost,
            fuelSurcharge,
            distanceCost,
            optionalFees,
            addOnsTotal,
            dynamicPricingMultiplier: dynamicPricing.multiplier,
            dynamicPricingReasons: dynamicPricing.reasons,
            baseCost,
            costLow,
            costHigh,
            breakdown: {
                'Labor Cost': { detail: `${totalHours.toFixed(1)} hrs × ${numMovers} movers × $${hourlyRate}/hr`, amount: laborCost },
                'Truck Rental': { detail: truckInfo.count > 1 ? `${truckInfo.count} × ${truckInfo.name}` : truckInfo.displayName || truckInfo.name, amount: truckFee },
                'Truck & Equipment Fee': { detail: 'Standard equipment fee', amount: truckEquipmentFee },
                'Fuel Surcharge': { detail: `${distance} miles × $${(config.pricing?.fees?.fuel_surcharge_per_mile || 2).toFixed(2)}/mile`, amount: fuelSurcharge },
                'Distance Fee': { detail: `Mileage charges`, amount: distanceCost }
            }
        };

        if (stairs > 0) {
            calculationResults.breakdown['Stairs Fee'] = {
                detail: `${stairs} flight(s)`,
                amount: stairs * (config.pricing?.fees?.optional_fees?.stairs_per_flight || 50)
            };
        }
        if (longCarry) {
            calculationResults.breakdown['Long Carry Fee'] = {
                detail: '50+ ft from truck',
                amount: config.pricing?.fees?.optional_fees?.long_carry_per_50ft || 35
            };
        }
        if (packingService) {
            calculationResults.breakdown['Packing Service'] = {
                detail: `${totalHours.toFixed(1)} hrs × $${config.pricing?.fees?.optional_fees?.packing_service_per_hour || 60}/hr`,
                amount: totalHours * (config.pricing?.fees?.optional_fees?.packing_service_per_hour || 60)
            };
        }

        // Display results
        displayPartialResults();
        hideLoading();
        updateProgress(3);

    }, 1000);
}

function calculateCrewSize(weight) {
    const sizing = config.pricing?.crew?.crew_sizing;
    if (!sizing) return 2;

    if (weight <= 500) return sizing['0_500_lbs'] || 1;
    if (weight <= 2000) return sizing['501_2000_lbs'] || 2;
    if (weight <= 5000) return sizing['2001_5000_lbs'] || 3;
    if (weight <= 8000) return sizing['5001_8000_lbs'] || 4;
    return sizing['8001_plus_lbs'] || 5;
}

function calculateTruckSize(cubicFeet) {
    const trucks = config.pricing?.trucks;
    if (!trucks) return { name: '16ft Truck', daily_rate: 129, count: 1 };

    // Single truck sizing
    if (cubicFeet <= 400) {
        return {
            name: trucks['10ft'].name,
            daily_rate: trucks['10ft'].daily_rate,
            count: 1,
            displayName: trucks['10ft'].name
        };
    }
    if (cubicFeet <= 800) {
        return {
            name: trucks['16ft'].name,
            daily_rate: trucks['16ft'].daily_rate,
            count: 1,
            displayName: trucks['16ft'].name
        };
    }
    if (cubicFeet <= 1000) {
        return {
            name: trucks['20ft'].name,
            daily_rate: trucks['20ft'].daily_rate,
            count: 1,
            displayName: trucks['20ft'].name
        };
    }
    if (cubicFeet <= 1500) {
        return {
            name: trucks['26ft'].name,
            daily_rate: trucks['26ft'].daily_rate,
            count: 1,
            displayName: trucks['26ft'].name
        };
    }

    // Multiple trucks needed for large moves
    const maxTruckSize = 1500; // 26ft truck capacity
    const trucksNeeded = Math.ceil(cubicFeet / maxTruckSize);
    const totalRate = trucks['26ft'].daily_rate * trucksNeeded;

    return {
        name: trucks['26ft'].name,
        daily_rate: totalRate,
        count: trucksNeeded,
        displayName: `${trucksNeeded} × ${trucks['26ft'].name.split(' ')[0]} Trucks`
    };
}

function getManualTruckInfo(truckSize) {
    const trucks = config.pricing?.trucks;
    if (!trucks) return { name: '16ft Truck', daily_rate: 129, count: 1, displayName: '16ft Truck' };

    const truck = trucks[truckSize];
    if (!truck) return { name: '16ft Truck', daily_rate: 129, count: 1, displayName: '16ft Truck' };

    return {
        name: truck.name,
        daily_rate: truck.daily_rate,
        count: 1,
        displayName: truck.name
    };
}

// ============================================
// DISPLAY RESULTS
// ============================================

function displayPartialResults() {
    document.getElementById('costLow').textContent = `$${Math.round(calculationResults.costLow).toLocaleString()}`;
    document.getElementById('costHigh').textContent = `$${Math.round(calculationResults.costHigh).toLocaleString()}`;
    document.getElementById('truckSize').textContent = calculationResults.truckSize;
    document.getElementById('crewSize').textContent = `${calculationResults.numMovers} Movers`;
    document.getElementById('estTime').textContent = `${calculationResults.totalHours.toFixed(1)} Hours`;

    // Show competitor comparison
    const avgCost = (calculationResults.costLow + calculationResults.costHigh) / 2;
    showCompetitorComparison(avgCost);

    // Show dynamic pricing notice if applicable
    if (calculationResults.dynamicPricingReasons) {
        showDynamicPricingNotice(calculationResults.dynamicPricingReasons);
    }

    // Show partial results, hide move details
    document.getElementById('moveDetailsSection').style.display = 'none';
    document.getElementById('partialResults').style.display = 'block';

    // Scroll to results
    document.getElementById('partialResults').scrollIntoView({ behavior: 'smooth' });
}

function displayFullResults() {
    const results = calculationResults;

    document.getElementById('customerName').textContent = leadData.name;
    document.getElementById('finalCostLow').textContent = `$${Math.round(results.costLow).toLocaleString()}`;
    document.getElementById('finalCostHigh').textContent = `$${Math.round(results.costHigh).toLocaleString()}`;

    // Breakdown table
    const tbody = document.getElementById('breakdownTableBody');
    tbody.innerHTML = Object.entries(results.breakdown).map(([item, data]) => `
        <tr>
            <td><strong>${item}</strong></td>
            <td>${data.detail}</td>
            <td><strong>$${Math.round(data.amount).toLocaleString()}</strong></td>
        </tr>
    `).join('') + `
        <tr style="border-top: 2px solid var(--border-color); font-weight: bold;">
            <td colspan="2">Estimated Total</td>
            <td>$${Math.round(results.costLow).toLocaleString()} — $${Math.round(results.costHigh).toLocaleString()}</td>
        </tr>
    `;

    // Move summary
    document.getElementById('moveSummaryContent').innerHTML = `
        <p><strong>Total Weight:</strong> ${Math.round(results.totalWeight).toLocaleString()} lbs</p>
        <p><strong>Total Volume:</strong> ${Math.round(results.totalCubicFeet)} cubic feet</p>
        <p><strong>Distance:</strong> ${results.distance} miles</p>
        <p><strong>Crew Size:</strong> ${results.numMovers} movers</p>
        <p><strong>Estimated Time:</strong> ${results.totalHours.toFixed(1)} hours</p>
        <p><strong>Truck Size:</strong> ${results.truckSize}</p>
    `;

    // Show full results, hide partial
    document.getElementById('partialResults').style.display = 'none';
    document.getElementById('fullResults').style.display = 'block';

    // Scroll to results
    document.getElementById('fullResults').scrollIntoView({ behavior: 'smooth' });

    // Show tip calculator
    showTipCalculator(results.laborCost);

    // Generate referral code
    generateReferralCode();

    // Send to webhook if not admin mode
    if (!isAdminMode) {
        sendToWebhook();
    }
}

// ============================================
// LEAD CAPTURE
// ============================================

function handleLeadCapture(e) {
    e.preventDefault();

    leadData = {
        name: document.getElementById('leadName').value,
        email: document.getElementById('leadEmail').value,
        phone: document.getElementById('leadPhone').value || '',
        timestamp: new Date().toISOString()
    };

    console.log('✅ Lead captured:', leadData);

    // Show full results
    displayFullResults();
}

// ============================================
// WEBHOOK INTEGRATION
// ============================================

async function sendToWebhook() {
    const webhookConfig = config.integrations?.webhook;

    if (!webhookConfig?.enabled || !webhookConfig?.url) {
        console.log('⚠️ Webhook not configured');
        return;
    }

    const payload = {
        timestamp: leadData.timestamp,
        customer: {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone
        },
        move_details: {
            distance_miles: calculationResults.distance,
            cubic_feet: Math.round(calculationResults.totalCubicFeet),
            total_weight: Math.round(calculationResults.totalWeight),
            truck_size: calculationResults.truckSize,
            crew_size: calculationResults.numMovers,
            labor_hours: calculationResults.totalHours.toFixed(1)
        },
        cost_breakdown: {
            labor: Math.round(calculationResults.laborCost),
            truck: calculationResults.truckFee,
            truck_equipment: calculationResults.truckEquipmentFee,
            fuel_surcharge: Math.round(calculationResults.fuelSurcharge),
            distance_fee: Math.round(calculationResults.distanceCost),
            optional_fees: Math.round(calculationResults.optionalFees),
            total_low: Math.round(calculationResults.costLow),
            total_high: Math.round(calculationResults.costHigh)
        },
        inventory: webhookConfig.include_inventory_list ? getInventoryList() : null
    };

    try {
        const response = await fetch(webhookConfig.url, {
            method: webhookConfig.method || 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ Lead sent to webhook successfully');
        } else {
            console.error('❌ Webhook error:', response.status);
        }
    } catch (error) {
        console.error('❌ Error sending to webhook:', error);
    }
}

function getInventoryList() {
    const items = [];
    Object.entries(selectedItems).forEach(([itemKey, quantity]) => {
        if (quantity > 0) {
            const [categoryKey, itemName] = itemKey.split('_');
            const item = inventory.categories[categoryKey]?.items[itemName];
            if (item) {
                items.push({
                    name: item.name,
                    quantity: quantity,
                    weight: item.weight
                });
            }
        }
    });
    return items;
}

// ============================================
// PDF EXPORT
// ============================================

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Moving Cost Quote', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Prepared for: ${leadData.name}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);

    // Cost Summary
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Estimated Cost', 20, 50);

    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`$${Math.round(calculationResults.costLow).toLocaleString()} - $${Math.round(calculationResults.costHigh).toLocaleString()}`, 20, 58);

    // Breakdown
    let y = 75;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Cost Breakdown:', 20, y);

    y += 10;
    doc.setFontSize(10);
    Object.entries(calculationResults.breakdown).forEach(([item, data]) => {
        doc.text(`${item}:`, 25, y);
        doc.text(`$${Math.round(data.amount).toLocaleString()}`, 150, y);
        doc.setTextColor(100);
        doc.text(data.detail, 25, y + 5);
        doc.setTextColor(0);
        y += 12;
    });

    // Move Details
    y += 10;
    doc.setFontSize(12);
    doc.text('Move Details:', 20, y);

    y += 10;
    doc.setFontSize(10);
    doc.text(`Weight: ${Math.round(calculationResults.totalWeight).toLocaleString()} lbs`, 25, y);
    y += 7;
    doc.text(`Volume: ${Math.round(calculationResults.totalCubicFeet)} cu ft`, 25, y);
    y += 7;
    doc.text(`Distance: ${calculationResults.distance} miles`, 25, y);
    y += 7;
    doc.text(`Crew: ${calculationResults.numMovers} movers`, 25, y);
    y += 7;
    doc.text(`Time: ${calculationResults.totalHours.toFixed(1)} hours`, 25, y);
    y += 7;
    doc.text(`Truck: ${calculationResults.truckSize}`, 25, y);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is an estimate. Final cost may vary based on actual conditions.', 20, 280);

    // Save
    doc.save(`moving-quote-${leadData.name.replace(/\s/g, '-')}.pdf`);

    console.log('✅ PDF downloaded');
}

// ============================================
// EMAIL & SMS
// ============================================

function emailQuote() {
    const subject = encodeURIComponent('Your Moving Cost Quote');
    const body = encodeURIComponent(`
Hi ${leadData.name},

Here's your moving cost estimate:

Estimated Cost: $${Math.round(calculationResults.costLow).toLocaleString()} - $${Math.round(calculationResults.costHigh).toLocaleString()}

Move Details:
- Weight: ${Math.round(calculationResults.totalWeight).toLocaleString()} lbs
- Distance: ${calculationResults.distance} miles
- Crew: ${calculationResults.numMovers} movers
- Truck: ${calculationResults.truckSize}
- Time: ${calculationResults.totalHours.toFixed(1)} hours

Thank you for your interest!
    `);

    window.location.href = `mailto:${leadData.email}?subject=${subject}&body=${body}`;
}

function textQuote() {
    alert('SMS integration requires Twilio credentials in config.json');
    // In production, this would send via Twilio API
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function startOver() {
    if (confirm('Start a new quote? This will clear all current data.')) {
        selectedItems = {};
        calculationResults = null;
        leadData = null;
        window.aiEstimation = null;

        document.getElementById('aiInput').value = '';
        document.getElementById('leadCaptureForm').reset();

        renderInventoryCategories();
        updateInventorySummary();

        document.getElementById('moveDetailsSection').style.display = 'none';
        document.getElementById('partialResults').style.display = 'none';
        document.getElementById('fullResults').style.display = 'none';
        document.getElementById('aiParsedResults').style.display = 'none';

        updateProgress(1);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateProgress(step) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const steps = {
        1: { width: 33, text: 'Step 1 of 3: Select Items' },
        2: { width: 66, text: 'Step 2 of 3: Move Details' },
        3: { width: 100, text: 'Step 3 of 3: Get Quote' }
    };

    if (steps[step]) {
        progressFill.style.width = `${steps[step].width}%`;
        progressText.textContent = steps[step].text;
    }
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ============================================
// DARK MODE
// ============================================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    const defaultDark = config.ui_settings?.theme?.default_dark_mode;

    if (darkMode === 'enabled' || (darkMode === null && defaultDark)) {
        document.body.classList.add('dark-mode');
    }
}

// ============================================
// NEW FEATURES - DYNAMIC PRICING & ADD-ONS
// ============================================

// State for add-ons
let selectedAddOns = {};
let addOnsTotalCost = 0;

// Initialize social proof
function initializeSocialProof() {
    const socialProof = config.social_proof;
    if (!socialProof?.enabled) return;

    const banner = document.getElementById('socialProofBanner');
    if (!banner) return;

    // Set stats
    document.getElementById('avgRating').textContent = socialProof.average_rating;
    document.getElementById('totalReviews').textContent = socialProof.total_reviews.toLocaleString();
    document.getElementById('totalCustomers').textContent = socialProof.total_customers_this_month.toLocaleString();

    // Add trust badges
    const badgesContainer = document.getElementById('trustBadges');
    badgesContainer.innerHTML = socialProof.trust_badges.map(badge =>
        `<span class="trust-badge">${badge}</span>`
    ).join('');

    // Show recent booking animation
    if (socialProof.recent_bookings?.length > 0) {
        let currentIndex = 0;
        const showBooking = () => {
            const booking = socialProof.recent_bookings[currentIndex];
            const bookingEl = document.getElementById('recentBooking');
            bookingEl.textContent = `${booking.name} from ${booking.location} just got a quote ${booking.minutes_ago} minutes ago`;
            currentIndex = (currentIndex + 1) % socialProof.recent_bookings.length;
        };
        showBooking();
        setInterval(showBooking, 8000);
    }

    banner.style.display = 'block';
}

// Calculate dynamic pricing multiplier
function calculateDynamicPricingMultiplier(moveDate = new Date()) {
    const dynamicPricing = config.pricing?.dynamic_pricing;
    if (!dynamicPricing?.enabled) return { multiplier: 1, reasons: [] };

    let multiplier = 1;
    const reasons = [];

    // Peak season
    if (dynamicPricing.peak_season?.enabled) {
        const month = moveDate.getMonth() + 1; // 0-indexed
        if (dynamicPricing.peak_season.months.includes(month)) {
            multiplier *= dynamicPricing.peak_season.multiplier;
            reasons.push(dynamicPricing.peak_season.description);
        }
    }

    // Weekend pricing
    if (dynamicPricing.weekend_pricing?.enabled) {
        const day = moveDate.getDay();
        if (dynamicPricing.weekend_pricing.days.includes(day)) {
            multiplier *= dynamicPricing.weekend_pricing.multiplier;
            reasons.push(dynamicPricing.weekend_pricing.description);
        }
    }

    // Month end
    if (dynamicPricing.month_end?.enabled) {
        const date = moveDate.getDate();
        if (dynamicPricing.month_end.days.includes(date)) {
            multiplier *= dynamicPricing.month_end.multiplier;
            reasons.push(dynamicPricing.month_end.description);
        }
    }

    return { multiplier, reasons };
}

// Calculate add-ons
function calculateAddOns() {
    const addOnsConfig = config.pricing?.add_on_services;
    if (!addOnsConfig) return 0;

    let total = 0;

    // Packing materials (auto-calculate based on weight)
    if (selectedAddOns.packing_materials && addOnsConfig.packing_materials?.enabled) {
        const weight = getTotalWeight() || window.aiEstimation?.weight || 0;
        const bedrooms = Math.max(1, Math.floor(weight / 2000)); // Rough estimate
        const packingItems = addOnsConfig.packing_materials.items;

        Object.values(packingItems).forEach(item => {
            if (item.per_bedroom) {
                total += item.price * item.per_bedroom * bedrooms;
            } else if (item.per_move) {
                total += item.price * item.per_move;
            }
        });

        document.getElementById('packingPrice').textContent = `$${Math.round(total)}`;
    }

    // Insurance
    if (selectedAddOns.insurance && addOnsConfig.insurance?.enabled) {
        const weight = getTotalWeight() || window.aiEstimation?.weight || 0;
        const level = document.getElementById('insuranceLevel').value;
        const option = addOnsConfig.insurance.options.find(o => o.level === level);

        if (option) {
            if (option.rate_per_pound) {
                const insuranceCost = weight * option.rate_per_pound;
                total += insuranceCost;
                document.getElementById('insurancePrice').textContent = `$${Math.round(insuranceCost)}`;
            } else if (option.base_price) {
                total += option.base_price;
                document.getElementById('insurancePrice').textContent = `$${option.base_price}`;
            }
        }
    }

    // Assembly
    if (selectedAddOns.assembly && addOnsConfig.assembly?.enabled) {
        const items = parseInt(document.getElementById('assemblyItems').value) || 0;
        total += items * addOnsConfig.assembly.price_per_item;
    }

    // Storage (first month free)
    if (selectedAddOns.storage && addOnsConfig.storage?.enabled) {
        total += addOnsConfig.storage.first_month_price;
    }

    // Junk removal
    if (selectedAddOns.junk && addOnsConfig.junk_removal?.enabled) {
        const items = parseInt(document.getElementById('junkItems').value) || 0;
        total += items * addOnsConfig.junk_removal.price_per_item;
    }

    // Cleaning
    if (selectedAddOns.cleaning && addOnsConfig.cleaning?.enabled) {
        const weight = getTotalWeight() || window.aiEstimation?.weight || 0;
        const bedrooms = Math.floor(weight / 2000);

        if (bedrooms <= 1) total += addOnsConfig.cleaning.studio_1br;
        else if (bedrooms === 2) total += addOnsConfig.cleaning['2br'];
        else if (bedrooms === 3) total += addOnsConfig.cleaning['3br'];
        else total += addOnsConfig.cleaning['4br_plus'];

        document.getElementById('cleaningPrice').textContent = `$${total}`;
    }

    addOnsTotalCost = total;

    // Update total display
    if (total > 0) {
        document.getElementById('addOnsTotal').style.display = 'block';
        document.getElementById('addOnsTotalAmount').textContent = `$${Math.round(total)}`;
    } else {
        document.getElementById('addOnsTotal').style.display = 'none';
    }

    return total;
}

// Setup add-on event listeners
function setupAddOnListeners() {
    // Show add-ons section when move details are filled
    document.getElementById('moveDetailsSection').addEventListener('input', () => {
        const addOnsSection = document.getElementById('addOnsSection');
        if (config.ui_settings?.features?.enable_add_on_services !== false) {
            addOnsSection.style.display = 'block';
        }
    });

    // Add-on checkboxes
    ['packing', 'insurance', 'assembly', 'storage', 'junk', 'cleaning'].forEach(addon => {
        const checkbox = document.getElementById(`addon_${addon}`);
        if (!checkbox) return;

        checkbox.addEventListener('change', (e) => {
            selectedAddOns[addon === 'packing' ? 'packing_materials' : addon] = e.target.checked;

            // Show/hide additional inputs
            if (addon === 'insurance') {
                document.getElementById('insuranceLevel').style.display = e.target.checked ? 'block' : 'none';
            } else if (addon === 'assembly') {
                document.getElementById('assemblyItems').style.display = e.target.checked ? 'block' : 'none';
            } else if (addon === 'junk') {
                document.getElementById('junkItems').style.display = e.target.checked ? 'block' : 'none';
            }

            calculateAddOns();
        });
    });

    // Input changes for quantity-based add-ons
    ['assemblyItems', 'junkItems', 'insuranceLevel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', calculateAddOns);
    });
}

// Show competitor comparison
function showCompetitorComparison(ourPrice) {
    const compConfig = config.competitor_comparison;
    if (!compConfig?.enabled) return;

    const industryAverage = ourPrice * compConfig.industry_average_multiplier;
    const savings = industryAverage - ourPrice;

    document.getElementById('ourQuote').textContent = `$${Math.round(ourPrice).toLocaleString()}`;
    document.getElementById('competitorQuote').textContent = `$${Math.round(industryAverage).toLocaleString()}`;
    document.getElementById('savingsAmount').textContent = `$${Math.round(savings).toLocaleString()}`;
    document.getElementById('competitorComparison').style.display = 'block';
}

// Show tip calculator
function showTipCalculator(laborCost) {
    const tipConfig = config.tip_calculator;
    if (!tipConfig?.enabled) return;

    const tip15 = laborCost * (tipConfig.suggested_percentage_low / 100);
    const tip18 = laborCost * 0.18;
    const tip20 = laborCost * (tipConfig.suggested_percentage_high / 100);

    document.getElementById('tip15').textContent = `$${Math.round(tip15)}`;
    document.getElementById('tip18').textContent = `$${Math.round(tip18)}`;
    document.getElementById('tip20').textContent = `$${Math.round(tip20)}`;
    document.getElementById('tipCalculator').style.display = 'block';
}

// Generate referral code
function generateReferralCode() {
    const refConfig = config.referral_program;
    if (!refConfig?.enabled) return;

    const code = `${refConfig.code_prefix}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    document.getElementById('referralCode').textContent = code;
    document.getElementById('referralSection').style.display = 'block';

    // Copy button
    document.getElementById('copyReferralBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(code);
        alert('Referral code copied to clipboard!');
    });
}

// Show dynamic pricing notice
function showDynamicPricingNotice(reasons) {
    if (reasons.length === 0) return;

    const notice = reasons.join(' + ');
    document.getElementById('pricingAlertText').textContent = `⚡ ${notice} - Limited availability!`;
    document.getElementById('dynamicPricingNotice').style.display = 'block';
}

// Download moving checklist
function downloadMovingChecklist() {
    const checklistConfig = config.moving_checklist;
    if (!checklistConfig?.enabled) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Your Moving Checklist', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Prepared for: ${leadData?.name || 'Valued Customer'}`, 20, 30);

    let y = 45;
    doc.setFontSize(12);
    doc.setTextColor(0);

    checklistConfig.items.forEach((item, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        let timeframe;
        if (item.weeks_before) timeframe = `${item.weeks_before} weeks before`;
        else if (item.days_before) timeframe = `${item.days_before} days before`;
        else timeframe = 'Moving Day';

        doc.setFont(undefined, 'bold');
        doc.text(`□ ${timeframe}:`, 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(item.task, 30, y + 5);

        y += 15;
    });

    doc.save('moving-checklist.pdf');
}

// Setup feature event listeners
function setupFeatureListeners() {
    document.getElementById('downloadChecklistBtn')?.addEventListener('click', downloadMovingChecklist);

    // Show checklist after full results
    if (config.moving_checklist?.enabled) {
        document.getElementById('checklistSection').style.display = 'block';
    }
}

// Initialize all new features
document.addEventListener('DOMContentLoaded', () => {
    initializeSocialProof();
    setupAddOnListeners();
    setupFeatureListeners();
});

// ============================================
// CONSOLE BANNER
// ============================================

console.log('%c🚚 Moving Cost Calculator', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cPowered by RoutineMoves', 'color: #10b981; font-size: 12px;');
console.log('%cAdd ?admin=true to URL for admin mode', 'color: #666; font-size: 10px;');
