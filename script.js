/*
 * The Furniture Shop - script.js
 * Transaction system for purchasing furniture items.
 *
 * Step-by-step user interaction flow:
 * Step 0: Page loads with inventory table and "Make a Purchase" button.
 * Step 1: Prompt user for item they want to buy.
 * Step 2: Prompt user for quantity of that item.
 * Step 2b: Store item name and quantity.
 * Step 3: Ask if user wants to continue shopping. If yes, go to Step 1. If no, proceed to Step 4.
 * Step 4: Ask for the two-letter state abbreviation for shipping.
 * Step 4a: Validate the state abbreviation.
 * Step 5: Perform all business calculations (subtotal, shipping, tax, total).
 * Step 6: Display the formatted invoice on the page.
 * Step 7: "Shop Again" button resets the page to Step 0.
 */

/* =============================================
   GLOBAL VARIABLES
   ============================================= */

// Step 0 - Catalog arrays (parallel arrays)
const items  = ["Chair", "Recliner", "Table", "Umbrella"];
const prices = [25.50,   37.75,      49.95,   24.89];

// Step 5 - Tax rate constant
const TAX_RATE = 0.15;

// Step 4a - All valid US state abbreviations
const stateAbbreviations = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
    "DC"
];

// Shipping zone mapping: state abbreviation -> zone number
// Hawaii and Alaska = Zone 6
const stateZones = {
    "CT": 1, "DE": 1, "MA": 1, "MD": 1, "ME": 1, "NH": 1,
    "NJ": 1, "NY": 1, "PA": 1, "RI": 1, "VT": 1, "DC": 1,
    "AL": 2, "FL": 2, "GA": 2, "MS": 2, "NC": 2, "SC": 2,
    "TN": 2, "VA": 2, "WV": 2,
    "IL": 3, "IN": 3, "KY": 3, "MI": 3, "MN": 3, "OH": 3,
    "WI": 3,
    "AR": 4, "IA": 4, "KS": 4, "LA": 4, "MO": 4, "ND": 4,
    "NE": 4, "OK": 4, "SD": 4, "TX": 4,
    "AZ": 5, "CA": 5, "CO": 5, "ID": 5, "MT": 5, "NM": 5,
    "NV": 5, "OR": 5, "UT": 5, "WA": 5, "WY": 5,
    "AK": 6, "HI": 6
};

// Step 2b - Order storage arrays (parallel arrays)
let purchasedItems      = [];
let purchasedQuantities = [];


/* =============================================
   STEP 1 - START PURCHASE (called by button)
   ============================================= */
function startPurchase() {
    // Reset order arrays for a fresh transaction
    purchasedItems      = [];
    purchasedQuantities = [];

    // Begin item selection loop
    shopForItems();
}


/* =============================================
   STEP 1 - ASK FOR ITEM
   ============================================= */
function shopForItems() {
    let itemInput = prompt("What item would you like to buy today: Chair, Recliner, Table, or Umbrella?");

    // Handle cancel
    if (itemInput === null) {
        alert("Your transaction has been cancelled. We hope to see you again soon!");
        return;
    }

    itemInput = itemInput.trim();

    if (itemInput === "") {
        alert("No item was entered. Please enter a valid item name.");
        shopForItems();
        return;
    }

    // Find matching item (case insensitive)
    let itemIndex = findItemIndex(itemInput);

    if (itemIndex === -1) {
        alert("\"" + itemInput + "\" is not a valid item. Please choose from: Chair, Recliner, Table, or Umbrella.");
        shopForItems();
        return;
    }

    // Step 2 - Ask for quantity
    askQuantity(itemIndex);
}


/* =============================================
   STEP 2 - ASK FOR QUANTITY
   ============================================= */
function askQuantity(itemIndex) {
    let quantityInput = prompt("How many " + items[itemIndex] + "(s) would you like to buy?");

    // Handle cancel
    if (quantityInput === null) {
        alert("Your transaction has been cancelled. We hope to see you again soon!");
        return;
    }

    quantityInput = quantityInput.trim();
    let quantity  = parseInt(quantityInput);

    if (isNaN(quantity) || quantity <= 0 || quantityInput === "") {
        alert("Please enter a valid quantity (a whole number greater than zero).");
        askQuantity(itemIndex);
        return;
    }

    // Step 2b - Store item and quantity
    storeItem(itemIndex, quantity);

    // Step 3 - Ask to continue shopping
    askContinue();
}


/* =============================================
   STEP 2b - STORE ITEM IN ORDER ARRAYS
   ============================================= */
function storeItem(itemIndex, quantity) {
    // Check if the item was already added; if so, add to its quantity
    let existingIndex = purchasedItems.indexOf(items[itemIndex]);

    if (existingIndex !== -1) {
        purchasedQuantities[existingIndex] += quantity;
    } else {
        purchasedItems.push(items[itemIndex]);
        purchasedQuantities.push(quantity);
    }
}


/* =============================================
   STEP 3 - CONTINUE SHOPPING?
   ============================================= */
function askContinue() {
    let continueInput = prompt("Continue shopping? y/n");

    // Handle cancel
    if (continueInput === null) {
        alert("Your transaction has been cancelled. We hope to see you again soon!");
        return;
    }

    continueInput = continueInput.trim().toLowerCase();

    if (continueInput === "y" || continueInput === "yes") {
        // Return to Step 1
        shopForItems();
    } else if (continueInput === "n" || continueInput === "no") {
        // Step 4 - Ask for state
        askState();
    } else {
        alert("Please enter 'y' for yes or 'n' for no.");
        askContinue();
    }
}


/* =============================================
   STEP 4 - ASK FOR STATE ABBREVIATION
   ============================================= */
function askState() {
    let stateInput = prompt("Please enter the two-letter state abbreviation: ");

    // Handle cancel
    if (stateInput === null) {
        alert("Your transaction has been cancelled. We hope to see you again soon!");
        return;
    }

    stateInput = stateInput.trim().toUpperCase();

    // Step 4a - Validate state
    if (!isValidState(stateInput)) {
        alert("\"" + stateInput + "\" is not a valid U.S. state abbreviation. Please try again.");
        askState();
        return;
    }

    // Step 5 - Perform calculations and display invoice
    let orderData = calculateOrder(stateInput);
    displayInvoice(orderData);
}


/* =============================================
   STEP 4a - VALIDATE STATE ABBREVIATION
   ============================================= */
function isValidState(stateCode) {
    return stateAbbreviations.indexOf(stateCode) !== -1;
}


/* =============================================
   HELPER - FIND ITEM INDEX (case insensitive)
   ============================================= */
function findItemIndex(inputName) {
    let lowerInput = inputName.toLowerCase();
    let index = -1;
    for (let i = 0; i < items.length; i++) {
        if (items[i].toLowerCase() === lowerInput) {
            index = i;
        }
    }
    return index;
}


/* =============================================
   STEP 5 - PERFORM BUSINESS CALCULATIONS
   ============================================= */
function calculateOrder(stateCode) {
    // Calculate subtotal
    let subtotal = 0;
    for (let i = 0; i < purchasedItems.length; i++) {
        let itemIdx   = findItemIndex(purchasedItems[i]);
        let lineTotal = prices[itemIdx] * purchasedQuantities[i];
        subtotal     += lineTotal;
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    // Determine shipping zone
    let zone         = stateZones[stateCode] || 5;
    let shippingCost = getShippingCost(zone);

    // Use ternary operator: orders over $100 get free shipping
    let shippingCharge = (subtotal > 100) ? 0 : shippingCost;
    let isFreeShipping = (subtotal > 100);

    // Calculate tax and total
    let tax   = parseFloat((subtotal * TAX_RATE).toFixed(2));
    let total = parseFloat((subtotal + shippingCharge + tax).toFixed(2));

    return {
        stateCode:      stateCode,
        zone:           zone,
        subtotal:       subtotal,
        shippingCharge: shippingCharge,
        isFreeShipping: isFreeShipping,
        tax:            tax,
        total:          total
    };
}


/* =============================================
   STEP 5 - GET SHIPPING COST BY ZONE (switch)
   ============================================= */
function getShippingCost(zone) {
    let cost;
    switch (zone) {
        case 1:
            cost = 0.00;
            break;
        case 2:
            cost = 20.00;
            break;
        case 3:
            cost = 30.00;
            break;
        case 4:
            cost = 35.00;
            break;
        case 5:
            cost = 45.00;
            break;
        case 6:
            cost = 50.00;
            break;
        default:
            cost = 45.00;
    }
    return cost;
}


/* =============================================
   STEP 6 - DISPLAY INVOICE
   Populates pre-built HTML elements in index.html
   No HTML strings are built here - only DOM updates
   ============================================= */
function displayInvoice(orderData) {
    // Fill in state and zone
    document.getElementById("inv-state").textContent = orderData.stateCode;
    document.getElementById("inv-zone").textContent  = orderData.zone;

    // Build item rows using createElement (no HTML strings)
    let tbody = document.getElementById("inv-item-rows");
    tbody.innerHTML = "";

    for (let i = 0; i < purchasedItems.length; i++) {
        let itemIdx   = findItemIndex(purchasedItems[i]);
        let unitPrice = prices[itemIdx];
        let qty       = purchasedQuantities[i];
        let lineTotal = parseFloat((unitPrice * qty).toFixed(2));

        let tr = document.createElement("tr");

        let tdName  = document.createElement("td");
        let tdQty   = document.createElement("td");
        let tdUnit  = document.createElement("td");
        let tdLine  = document.createElement("td");

        tdName.textContent = purchasedItems[i];
        tdQty.textContent  = qty;
        tdUnit.textContent = "$" + unitPrice.toFixed(2);
        tdLine.textContent = "$" + lineTotal.toFixed(2);

        tdQty.className  = "right";
        tdUnit.className = "right";
        tdLine.className = "right";

        tr.appendChild(tdName);
        tr.appendChild(tdQty);
        tr.appendChild(tdUnit);
        tr.appendChild(tdLine);

        tbody.appendChild(tr);
    }

    // Fill in totals
    document.getElementById("inv-subtotal").textContent = "$" + orderData.subtotal.toFixed(2);
    document.getElementById("inv-tax").textContent      = "$" + orderData.tax.toFixed(2);
    document.getElementById("inv-total").textContent    = "$" + orderData.total.toFixed(2);

    // Shipping label and value
    document.getElementById("inv-shipping-label").textContent = "Shipping (Zone " + orderData.zone + "):";

    let shippingCell = document.getElementById("inv-shipping");
    if (orderData.isFreeShipping) {
        shippingCell.textContent  = "FREE (order over $100)";
        shippingCell.className    = "free-shipping";
    } else {
        shippingCell.textContent = "$" + orderData.shippingCharge.toFixed(2);
        shippingCell.className   = "";
    }

    // Show invoice page, hide store page
    document.getElementById("store-page").style.display  = "none";
    document.getElementById("invoice-page").style.display = "block";
    window.scrollTo(0, 0);
}


/* =============================================
   STEP 7 - RESET PAGE (Shop Again button)
   ============================================= */
function resetPage() {
    purchasedItems      = [];
    purchasedQuantities = [];
    document.getElementById("invoice-page").style.display = "none";
    document.getElementById("store-page").style.display   = "block";
    window.scrollTo(0, 0);
}