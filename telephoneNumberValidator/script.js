// Get DOM elements
const form = document.getElementById("user-form");
const input = document.getElementById("user-input");
const resultDiv = document.getElementById("result-div");
const clearBtn = document.getElementById("clear-btn");

// Validator function
function isValidUSPhoneNumber(str) {
  const regex = /^(\s)*(1\s?)?(\(\d{3}\)|\d{3})([\s\-])?\d{3}([\s\-])?\d{4}$/;
  return regex.test(str);
}

// Show result
function showResult(isValid) {
  resultDiv.style.display = "flex";
  resultDiv.innerHTML = `
    <p>${validator(isValid)}</p>
    <button type="button" id="clear-btn">Clear</button>
  `;
  document.getElementById("clear-btn").addEventListener("click", clearResult);

  input.classList.remove("shake", "success"); // Always clear old states first

  if (isValid !== "empty" && isValid) {
    input.classList.add("success");
  } else {
    input.classList.add("shake");

    setTimeout(() => {
      input.classList.remove("shake");
    }, 500);
  }
}

// Clear result
function clearResult() {
  input.value = "";
  input.classList.remove("shake", "success");
  resultDiv.style.display = "none";
}

// Handle form submit
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const phoneNumber = input.value.trim();

  if (phoneNumber === "") {
    showResult("empty");
  } else {
    const isValid = isValidUSPhoneNumber(phoneNumber);
    showResult(isValid);
  }
});

function validator(status) {
  if (status === "empty") {
    return "Please provide a phone number";
  } else if (status) {
    return "Valid US number: " + input.value;
  } else {
    return "Invalid US number: " + input.value;
  }
}

const buttons = document.querySelectorAll(".accordion-button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const accordionItem = btn.parentElement;
    accordionItem.classList.toggle("active");
  });
});
