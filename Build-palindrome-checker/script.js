const textInput = document.getElementById("text-input");
const checkBtn = document.getElementById("check-btn");
const result = document.getElementById("result");

function isItPalindrome(str) {
  const cleanedStr = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleanedStr === cleanedStr.split("").reverse().join("");
}

checkBtn.addEventListener("click", function () {
  const userInput = textInput.value;
  if (userInput === "") {
    alert("Please input a value");
    return;
  }
  const isPalindrome = isItPalindrome(userInput);
  const styledInput = `<span class="palindrome-result-word">${userInput}</span>`;
  result.innerHTML = isPalindrome
    ? `${styledInput} is a palindrome!`
    : `${styledInput} is NOT a palindrome.`;
});
