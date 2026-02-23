// base arrays
const items  = ["Chair", "Recliner", "Table", "Umbrella"];
const prices = [25.50,   37.75,      49.95,   24.89];

// tax rate
const TAX_RATE = 0.15;

// US state abbreviations for shipping
const stateAbbreviations = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
    "DC"
];

// shipping mapping for zones
// hawaii + alaska - zone 6
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

// order storage
let purchasedItems      = [];
let purchasedQuantities = [];


// start purchase 
function startPurchase() {
    purchasedItems      = [];
    purchasedQuantities = [];

    // item selections
    shopForItems();
}


// ask for item
function shopForItems() {
    let itemInput = prompt("What item would you like to buy today: Chair, Recliner, Table, or Umbrella?");

    // if user cancels
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

    // case sensitive name finder
    let itemIndex = findItemIndex(itemInput);
    // if name incorrect
    if (itemIndex === -1) {
        alert("\"" + itemInput + "\" is not a valid item. Please choose from: Chair, Recliner, Table, or Umbrella.");
        shopForItems();
        return;
    }

    // quantity of item
    askQuantity(itemIndex);
}


// asking for quantity
function askQuantity(itemIndex) {
    let quantityInput = prompt("How many " + items[itemIndex] + "(s) would you like to buy?");

    // if user cancel
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

    // store item + quant
    storeItem(itemIndex, quantity);

    // ask to cont
    askContinue();
}


// storing items
function storeItem(itemIndex, quantity) {
    // checking if already has item
    let existingIndex = purchasedItems.indexOf(items[itemIndex]);

    if (existingIndex !== -1) {
        purchasedQuantities[existingIndex] += quantity;
    } else {
        purchasedItems.push(items[itemIndex]);
        purchasedQuantities.push(quantity);
    }
}


// asking if user wants to shop still
function askContinue() {
    let continueInput = prompt("Continue shopping? y/n");

    // if cancel
    if (continueInput === null) {
        alert("Your transaction has been cancelled. We hope to see you again soon!");
        return;
    }

    continueInput = continueInput.trim().toLowerCase();

    if (continueInput === "y" || continueInput === "yes") {
        // returns to ask item
        shopForItems();
    } else if (continueInput === "n" || continueInput === "no") {
        // moves on to as for state
        askState();
    } else {
        alert("Please enter 'y' for yes or 'n' for no.");
        askContinue();
    }
}

// asking for state
function askState() {
    let stateInput = prompt("Please enter the two-letter state abbreviation: ");

    // if user cancels
    if (stateInput === null) {
        alert("Your transaction has been cancelled. We hope to see you again soon!");
        return;
    }

    stateInput = stateInput.trim().toUpperCase();

    // validate state
    if (!isValidState(stateInput)) {
        alert("\"" + stateInput + "\" is not a valid U.S. state abbreviation. Please try again.");
        askState();
        return;
    }

    // calculations and invoice 
    let orderData = calculateOrder(stateInput);
    displayInvoice(orderData);
}

function isValidState(stateCode) {
    return stateAbbreviations.indexOf(stateCode) !== -1;
}


// finding item (case sensitive)
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


// calculations
function calculateOrder(stateCode) {
    // calc subtotal 
    let subtotal = 0;
    for (let i = 0; i < purchasedItems.length; i++) {
        let itemIdx   = findItemIndex(purchasedItems[i]);
        let lineTotal = prices[itemIdx] * purchasedQuantities[i];
        subtotal     += lineTotal;
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    // figures out shipping zone
    let zone         = stateZones[stateCode] || 5;
    let shippingCost = getShippingCost(zone);

    // for orders over $100 free shipping
    let shippingCharge = (subtotal > 100) ? 0 : shippingCost;
    let isFreeShipping = (subtotal > 100);

    // tax + total
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


// shipping by zone cost
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


// display invoice
function displayInvoice(orderData) {
    // state and zone 
    document.getElementById("inv-state").textContent = orderData.stateCode;
    document.getElementById("inv-zone").textContent  = orderData.zone;

    // showing items being purchased
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

    // showing all totals
    document.getElementById("inv-subtotal").textContent = "$" + orderData.subtotal.toFixed(2);
    document.getElementById("inv-tax").textContent      = "$" + orderData.tax.toFixed(2);
    document.getElementById("inv-total").textContent    = "$" + orderData.total.toFixed(2);

    // shipping label
    document.getElementById("inv-shipping-label").textContent = "Shipping (Zone " + orderData.zone + "):";

    let shippingCell = document.getElementById("inv-shipping");
    if (orderData.isFreeShipping) {
        shippingCell.textContent  = "FREE (order over $100)";
        shippingCell.className    = "free-shipping";
    } else {
        shippingCell.textContent = "$" + orderData.shippingCharge.toFixed(2);
        shippingCell.className   = "";
    }

    // full invoice
    document.getElementById("store-page").style.display  = "none";
    document.getElementById("invoice-page").style.display = "block";
    window.scrollTo(0, 0);
}


// if user wants to shop again
function resetPage() {
    purchasedItems      = [];
    purchasedQuantities = [];
    document.getElementById("invoice-page").style.display = "none";
    document.getElementById("store-page").style.display   = "block";
    window.scrollTo(0, 0);
}