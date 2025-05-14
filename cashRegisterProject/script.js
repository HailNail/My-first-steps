const purchaseInput = document.getElementById("purchase-amount");
const cashInput = document.getElementById("cash");
const randomPurchaseBtn = document.getElementById("random-purchase-btn");
const defaultPurchaseBtn = document.getElementById("default-purchase-btn");
const randomCashBtn = document.getElementById("random-cash-btn");
const defaultCashBtn = document.getElementById("default-cash-btn");
const purchaseBtn = document.getElementById("purchase-btn");
const changeDueDiv = document.getElementById("change-due");
const cidInputs = document.querySelectorAll("input[data-denom]");
const dialog = document.querySelector("dialog");
const openDialogBtn = document.getElementById("add-amount");
const closeDialogBtn = document.getElementById("close-dialog");
const cidList = document.getElementById("cid-list");
const defaultCidBtn = document.getElementById("default-cid");
const randomCidBtn = document.getElementById("random-cid");
const applyCidBtn = document.getElementById("apply-cid");
const clearHistoryTransactions = document.getElementById("clear-history-btn");

let cashDrawer = {};
let defaultCID = {
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

function displayChangeResult(result) {
  changeDueDiv.innerHTML = "";
  const statusP = document.createElement("p");
  statusP.textContent = `Status: ${result.status}`;
  changeDueDiv.appendChild(statusP);

  if (result.change.length > 0) {
    const ul = document.createElement("ul");
    result.change.forEach(([unit, amount]) => {
      const li = document.createElement("li");
      li.textContent = `${unit}: $${parseFloat(amount.toFixed(2).toString())}`;
      ul.appendChild(li);
    });
    changeDueDiv.appendChild(ul);
  } else {
    const noChangeP = document.createElement("p");
    noChangeP.textContent = "No change returned.";
    changeDueDiv.appendChild(noChangeP);
  }
}

function updateCashListUI() {
  cidList.innerHTML = "";
  for (const [denom, amount] of Object.entries(cashDrawer)) {
    const li = document.createElement("li");
    li.textContent = `${denom}: $${parseFloat(amount.toFixed(2).toString())}`;
    cidList.appendChild(li);
  }

  const totalInDrawer = Object.values(cashDrawer)
    .reduce((sum, val) => sum + val, 0)
    .toFixed(2);
  const totalLi = document.createElement("li");
  totalLi.textContent = `TOTAL IN DRAWER: $${totalInDrawer}`;
  totalLi.id = "total-in-drawer";
  totalLi.classList.add("total");
  cidList.appendChild(totalLi);
}

function deductChangeFromDrawer(change) {
  change.forEach(([unit, amount]) => {
    if (cashDrawer[unit] !== undefined) {
      cashDrawer[unit] = Math.round((cashDrawer[unit] - amount) * 100) / 100;
    }
  });
}

function calculateChange(price, cash, cid) {
  let changeDue = cash - price;
  let change = [];
  let totalCid = parseFloat(
    cid.reduce((sum, curr) => sum + curr[1], 0).toFixed(2)
  );

  if (changeDue > totalCid) {
    return { status: "INSUFFICIENT_FUNDS", change: [] };
  }

  if (changeDue === totalCid) {
    return { status: "CLOSED", change: cid };
  }

  const reversedCid = cid.slice().reverse();

  for (let [unit, amountInDrawer] of reversedCid) {
    let unitValue = units[unit];
    let amountToReturn = 0;

    while (changeDue >= unitValue && amountInDrawer > 0) {
      changeDue = parseFloat((changeDue - unitValue).toFixed(2));
      amountInDrawer = parseFloat((amountInDrawer - unitValue).toFixed(2));
      amountToReturn += unitValue;
    }

    if (amountToReturn > 0) {
      change.push([unit, amountToReturn]);
    }
  }

  if (changeDue > 0) {
    return { status: "INSUFFICIENT_FUNDS", change: [] };
  }

  return { status: "OPEN", change };
}

function addTransactionToHistory(price, cash, changeAmount, _status) {
  const p = document.getElementById("p-default");
  if (p) p.textContent = "";
  const li = document.createElement("li");
  li.textContent = `🧾 Price: $${parseFloat(
    price.toFixed(2).toString()
  )} | Paid: $${parseFloat(cash.toFixed(2).toString())} | Change: $${parseFloat(
    changeAmount.toFixed(2).toString()
  )}`;
  const historyList = document.getElementById("history-list");
  historyList.prepend(li);
  clearHistoryTransactions.style.display = "inline-block";
}

function resetAppState() {
  document.getElementById("history-list").innerHTML = "";
  const pDefault = document.getElementById("p-default");
  if (pDefault) {
    pDefault.textContent =
      "Each transaction will show how much cash was given and the total change returned.";
  }
  purchaseInput.value = "";
  cashInput.value = "";
  changeDueDiv.innerHTML = "";
  cashDrawer = {};
  clearHistoryTransactions.style.display = "none";
  cidInputs.forEach((input) => (input.value = ""));
  updateCashListUI();
}

clearHistoryTransactions.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to clear the transaction history and reset the drawer?"
    )
  ) {
    resetAppState();
  }
});

defaultPurchaseBtn.addEventListener("click", () => {
  purchaseInput.value = "3.26";
});

defaultCashBtn.addEventListener("click", () => {
  cashInput.value = "100";
});

randomPurchaseBtn.addEventListener("click", () => {
  purchaseInput.value = (Math.random() * 299 + 1).toFixed(2);
});

randomCashBtn.addEventListener("click", () => {
  cashInput.value = (Math.random() * 299 + 1).toFixed(2);
});

purchaseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const price = parseFloat(purchaseInput.value);
  const cash = parseFloat(cashInput.value);
  const cidArray = Object.entries(cashDrawer);

  if (
    isNaN(price) ||
    isNaN(cash) ||
    price >= 300 ||
    cash >= 300 ||
    price < 0 ||
    cash < 0
  ) {
    alert(
      "Please enter valid numbers for both price and cash, each less than 300."
    );
    return;
  }

  if (cash < price) {
    changeDueDiv.innerHTML = `<p style="color: red;">
        🚫 Cash provided ($${cash.toFixed(2)}) is less than the purchase price
        ($${price.toFixed(2)}). No transaction processed.
      </p>`;
    return;
  }

  const result = calculateChange(price, cash, cidArray);
  if (result.status === "INSUFFICIENT_FUNDS") {
    changeDueDiv.innerHTML = `<p style="color: red;"> 🚫 Transaction denied: cannot return exact change.</p>`;
    return;
  }

  if (result.status === "OPEN" || result.status === "CLOSED") {
    deductChangeFromDrawer(result.change);
  }

  const totalChange = result.change.reduce((sum, [, amt]) => sum + amt, 0);
  const isDrawerEmpty = Object.values(cashDrawer).every(
    (amount) => amount === 0
  );

  if (isDrawerEmpty) {
    result.status = "CLOSED";
  }

  addTransactionToHistory(price, cash, totalChange, result.status);
  displayChangeResult(result);
  updateCashListUI();
});

openDialogBtn.addEventListener("click", () => {
  dialog.showModal();
  document.querySelector("body").style.filter = "blur(4px)";
});

closeDialogBtn.addEventListener("click", () => {
  resetAppState();
  document.querySelector("body").style.filter = "none";
  dialog.close();
});

defaultCidBtn.addEventListener("click", () => {
  cidInputs.forEach((input) => {
    const denom = input.dataset.denom;
    input.value = defaultCID[denom] ?? 0;
  });
});

randomCidBtn.addEventListener("click", () => {
  cidInputs.forEach((input) => {
    const denom = input.dataset.denom;
    const step = units[denom];
    const max = denominationMax[denom];
    const steps = Math.floor(max / step);
    const randomSteps = Math.floor(Math.random() * (steps + 1));
    const value = (randomSteps * step).toFixed(2);
    input.value = value;
  });
});

applyCidBtn.addEventListener("click", () => {
  let hasValidInput = false;
  let allValid = true;
  cidList.innerHTML = "";
  cashDrawer = {};

  cidInputs.forEach((input) => {
    const denom = input.dataset.denom;
    const raw = input.value.trim();
    const amount = parseFloat(raw);
    const step = units[denom];

    input.setCustomValidity(""); // Clear old errors

    if (!isNaN(amount) && amount > 0) {
      const division = amount / step;
      const isValid = Math.abs(division - Math.round(division)) < 0.00001;

      if (!isValid) {
        input.setCustomValidity(`Must be a multiple of ${step}`);
        input.reportValidity();
        allValid = false;
      } else {
        hasValidInput = true;
        const li = document.createElement("li");
        li.textContent = `${denom}: $${parseFloat(
          amount.toFixed(2)
        ).toString()}`;
        cidList.appendChild(li);
        cashDrawer[denom] = amount;
      }
    }
  });

  if (!hasValidInput) {
    alert("Please enter at least one valid cash amount before applying.");
    return;
  }

  if (!allValid) return;
  document.querySelector("body").style.filter = "none";
  updateCashListUI();
  dialog.close();
});

resetAppState();
