// === Constants ===
const units = {
  PENNY: 0.01,
  NICKEL: 0.05,
  DIME: 0.1,
  QUARTER: 0.25,
  ONE: 1,
  FIVE: 5,
  TEN: 10,
  TWENTY: 20,
  "ONE HUNDRED": 100,
};

const denominationMax = {
  PENNY: 1.5,
  NICKEL: 2.5,
  DIME: 10,
  QUARTER: 10,
  ONE: 100,
  FIVE: 100,
  TEN: 100,
  TWENTY: 100,
  "ONE HUNDRED": 200,
};

const defaultCID = {
  PENNY: 1.01,
  NICKEL: 2.05,
  DIME: 3.1,
  QUARTER: 4.25,
  ONE: 90,
  FIVE: 55,
  TEN: 20,
  TWENTY: 60,
  "ONE HUNDRED": 100,
};

// === State ===
let cashDrawer = {};

// === DOM Elements ===
const $ = (id) => document.getElementById(id);
const purchaseInput = $("purchase-amount");
const cashInput = $("cash");
const changeDueDiv = $("change-due");
const dialog = document.querySelector("dialog");
const cidInputs = document.querySelectorAll("input[data-denom]");
const cidList = $("cid-list");

// === Utility Functions ===
const formatAmount = (num) => parseFloat(num.toFixed(2).toString());

const createListItem = (text, className = "") => {
  const li = document.createElement("li");
  li.textContent = text;
  if (className) li.classList.add(className);
  return li;
};

const updateCashListUI = () => {
  cidList.innerHTML = "";
  for (const [denom, amount] of Object.entries(cashDrawer)) {
    cidList.appendChild(createListItem(`${denom}: $${formatAmount(amount)}`));
  }

  const total = formatAmount(
    Object.values(cashDrawer).reduce((sum, val) => sum + val, 0)
  );
  cidList.appendChild(createListItem(`TOTAL IN DRAWER: $${total}`, "total"));
};

// === Core Logic ===
const calculateChange = (price, cash, cid) => {
  let changeDue = cash - price;
  const change = [];
  const totalCid = formatAmount(cid.reduce((sum, [, amt]) => sum + amt, 0));

  if (changeDue > totalCid) return { status: "INSUFFICIENT_FUNDS", change: [] };
  if (changeDue === totalCid) return { status: "CLOSED", change: cid };

  for (let [unit, amount] of cid.slice().reverse()) {
    const unitValue = units[unit];
    let amountToReturn = 0;

    while (changeDue >= unitValue && amount >= unitValue) {
      changeDue = formatAmount(changeDue - unitValue);
      amount = formatAmount(amount - unitValue);
      amountToReturn += unitValue;
    }

    if (amountToReturn > 0) {
      change.push([unit, amountToReturn]);
    }
  }

  return changeDue > 0
    ? { status: "INSUFFICIENT_FUNDS", change: [] }
    : { status: "OPEN", change };
};

const deductChangeFromDrawer = (change) => {
  change.forEach(([unit, amt]) => {
    if (cashDrawer[unit]) {
      cashDrawer[unit] = formatAmount(cashDrawer[unit] - amt);
    }
  });
};

// === UI Handlers ===
const displayChangeResult = (result) => {
  changeDueDiv.innerHTML = "";
  changeDueDiv.appendChild(
    createListItem(`Status: ${result.status}`, "status")
  );

  if (result.change.length === 0) {
    changeDueDiv.appendChild(createListItem("No change returned."));
    return;
  }

  const ul = document.createElement("ul");
  result.change.forEach(([unit, amt]) => {
    ul.appendChild(createListItem(`${unit}: $${formatAmount(amt)}`));
  });
  changeDueDiv.appendChild(ul);
};

const addTransactionToHistory = (price, cash, change, status) => {
  const history = $("history-list");
  const defaultP = $("p-default");
  if (defaultP) defaultP.textContent = "";
  const li = createListItem(
    `🧾 Price: $${formatAmount(price)} | Paid: $${formatAmount(
      cash
    )} | Change: $${formatAmount(change)}`
  );
  history.prepend(li);
  $("clear-history-btn").style.display = "inline-block";
};

const resetAppState = () => {
  $("history-list").innerHTML = "";
  $("p-default").textContent =
    "Each transaction will show how much cash was given and the total change returned.";
  purchaseInput.value = "";
  cashInput.value = "";
  changeDueDiv.innerHTML = "";
  cashDrawer = {};
  $("clear-history-btn").style.display = "none";
  cidInputs.forEach((i) => (i.value = ""));
  updateCashListUI();
};

// === Event Listeners ===
// History reset
$("clear-history-btn").addEventListener("click", () => {
  if (confirm("Clear transaction history and reset drawer?")) {
    resetAppState();
  }
});

// Purchase & Cash Buttons
$("default-purchase-btn").addEventListener(
  "click",
  () => (purchaseInput.value = "3.26")
);
$("default-cash-btn").addEventListener(
  "click",
  () => (cashInput.value = "100")
);
$("random-purchase-btn").addEventListener(
  "click",
  () => (purchaseInput.value = (Math.random() * 299 + 1).toFixed(2))
);
$("random-cash-btn").addEventListener(
  "click",
  () => (cashInput.value = (Math.random() * 299 + 1).toFixed(2))
);

// Purchase Submit
$("purchase-btn").addEventListener("click", (e) => {
  e.preventDefault();
  const price = parseFloat(purchaseInput.value);
  const cash = parseFloat(cashInput.value);

  if (isNaN(price) || isNaN(cash) || price >= 300 || cash >= 300) {
    return alert("Enter valid numbers under 300.");
  }

  if (cash < price) {
    return (changeDueDiv.innerHTML = `<p style="color: red;">🚫 Cash ($${cash}) is less than price ($${price}).</p>`);
  }

  const cid = Object.entries(cashDrawer);
  let result = calculateChange(price, cash, cid);

  if (result.status === "INSUFFICIENT_FUNDS") {
    return (changeDueDiv.innerHTML = `<p style="color: red;">🚫 Cannot return exact change.</p>`);
  }

  if (result.status !== "INSUFFICIENT_FUNDS") {
    deductChangeFromDrawer(result.change);
  }

  const totalChange = result.change.reduce((sum, [, amt]) => sum + amt, 0);
  if (Object.values(cashDrawer).every((amt) => amt === 0)) {
    result.status = "CLOSED";
  }

  addTransactionToHistory(price, cash, totalChange, result.status);
  displayChangeResult(result);
  updateCashListUI();
});

// Dialog Controls
$("add-amount").addEventListener("click", () => {
  dialog.showModal();
  document.body.style.filter = "blur(4px)";
});

$("close-dialog").addEventListener("click", () => {
  resetAppState();
  document.body.style.filter = "none";
  dialog.close();
});

// CID Controls
$("default-cid").addEventListener("click", () => {
  cidInputs.forEach((input) => {
    const denom = input.dataset.denom;
    input.value = defaultCID[denom] ?? 0;
  });
});

$("random-cid").addEventListener("click", () => {
  cidInputs.forEach((input) => {
    const denom = input.dataset.denom;
    const step = units[denom];
    const max = denominationMax[denom];
    const steps = Math.floor(max / step);
    input.value = (Math.floor(Math.random() * (steps + 1)) * step).toFixed(2);
  });
});

$("apply-cid").addEventListener("click", () => {
  let valid = false,
    allValid = true;
  cidList.innerHTML = "";
  cashDrawer = {};

  cidInputs.forEach((input) => {
    const denom = input.dataset.denom;
    const val = parseFloat(input.value.trim());
    const step = units[denom];

    input.setCustomValidity("");

    if (!isNaN(val) && val > 0) {
      const validStep = Math.abs(val / step - Math.round(val / step)) < 0.00001;
      if (!validStep) {
        input.setCustomValidity(`Must be a multiple of ${step}`);
        input.reportValidity();
        allValid = false;
      } else {
        valid = true;
        cashDrawer[denom] = val;
      }
    }
  });

  if (!valid) return alert("Enter at least one valid denomination.");
  if (!allValid) return;

  document.body.style.filter = "none";
  updateCashListUI();
  dialog.close();
});

// === Init ===
resetAppState();
