const numberInput = document.getElementById("number");
const convertBtn = document.getElementById("convert-btn");
const result = document.getElementById("result");
const animationContainer = document.getElementById("animation-container");
const animationText = document.getElementById("animation-text");

const romanNumerals = [
  {
    value: 1000,
    numeral: "M",
  },
  {
    value: 900,
    numeral: "CM",
  },
  {
    value: 500,
    numeral: "D",
  },
  {
    value: 400,
    numeral: "CD",
  },
  {
    value: 100,
    numeral: "C",
  },
  {
    value: 90,
    numeral: "XC",
  },
  {
    value: 50,
    numeral: "L",
  },
  {
    value: 40,
    numeral: "XL",
  },
  {
    value: 10,
    numeral: "X",
  },
  {
    value: 9,
    numeral: "IX",
  },
  {
    value: 5,
    numeral: "V",
  },
  {
    value: 4,
    numeral: "IV",
  },
  {
    value: 1,
    numeral: "I",
  },
];

let timeouts = []; // Store all timeout IDs

function clearAllTimeouts() {
  timeouts.forEach(clearTimeout); // Cancel each timeout
  timeouts = []; // Reset the array
}

function timeOut(msg) {
  clearAllTimeouts(); // Cancel any ongoing animation

  const responses = [
    "Error@#!",
    "Oops!",
    "Try again",
    "Almost, at least you know that doesn't work",
    "You're close",
    "Argh@$%!",
    "Oh no#@!",
  ];

  const glitch =
    responses[Math.floor(Math.random() * responses.length)].split("");
  const msgWords = msg.split(" ");
  const msgBuffer = [];
  const resultBuffer = [];

  result.textContent = "";
  animationText.textContent = "";

  // Animate glitchy result text
  glitch.forEach((letter, i) => {
    const t1 = setTimeout(() => {
      resultBuffer.push(letter);
      result.textContent = resultBuffer.join("");
    }, i * 100);

    const t2 = setTimeout(() => {
      resultBuffer.shift();
      result.textContent = resultBuffer.join("");
    }, 4300 + i * 100);
    timeouts.push(t1, t2);
  });

  // Animate words in animationText
  msgWords.forEach((word, i) => {
    const t3 = setTimeout(() => {
      msgBuffer.push(word);
      animationText.textContent = msgBuffer.join(" ");
    }, i * 200);

    const t4 = setTimeout(() => {
      msgBuffer.shift();
      animationText.textContent = msgBuffer.join(" ");
    }, 5000 + i * 100);
    timeouts.push(t3, t4);
  });
}

//fade in/out text effect

function fadeTextEffect(text, textTwo, duration) {
  clearAllTimeouts();
  result.innerHTML = ""; // Clear old content
  animationText.innerHTML = "";

  const element = document.createElement("p");
  element.className = "fade-effect"; // class for styling
  element.textContent = text;
  element.style.opacity = 0;
  element.style.transition = "opacity 1s ease";

  const elementTwo = document.createElement("p");
  elementTwo.className = "fade-effect"; // class for styling
  elementTwo.textContent = textTwo;
  elementTwo.style.opacity = 0;
  elementTwo.style.transition = "opacity 1s ease";

  result.appendChild(element);
  animationText.appendChild(elementTwo);

  // Fade in
  const fadeInTimeout = setTimeout(() => {
    element.style.opacity = 1;
    elementTwo.style.opacity = 1;
  }, 100);

  // Fade out
  const fadeOutTimeout = setTimeout(() => {
    element.style.opacity = 0;
    elementTwo.style.opacity = 0;
  }, duration);

  const removeTimeout = setTimeout(() => {
    elementTwo.remove();
  }, duration + 1000); // wait until fade-out is complete

  timeouts.push(fadeInTimeout, fadeOutTimeout, removeTimeout);
}

const showAnimationOne = () => {
  const msg = "Please enter a valid number";
  timeOut(msg);
};

const showAnimationTwo = () => {
  const msg = "Please enter a number greater than or equal to 1";
  timeOut(msg);
};

const showAnimationThree = () => {
  const msg = "Please enter a number less than or equal to 3999";
  timeOut(msg);
};

const output = (inputInt) => {
  let convertResult = "";
  let num = inputInt;

  for (const { value, numeral } of romanNumerals) {
    while (num >= value) {
      convertResult += numeral; // Add the Roman numeral to result
      num -= value; // Subtract from the number
    }
  }
  fadeTextEffect(
    convertResult,
    "Roman numerals are the symbols used in a system of numerical notation based on the ancient Roman system. The symbols are I, V, X, L, C, D, and M, standing respectively for 1, 5, 10, 50, 100, 500, and 1,000.",
    10000
  );
};

const checkUserInput = () => {
  const inputInt = parseInt(numberInput.value);

  if (!numberInput.value || isNaN(inputInt)) {
    return showAnimationOne();
  } else if (inputInt <= 0) {
    return showAnimationTwo();
  } else if (inputInt >= 4000) {
    return showAnimationThree();
  } else {
    output(inputInt);
  }
};

convertBtn.addEventListener("click", checkUserInput);

numberInput.addEventListener("keydown", (e) => {
  // besides click mouse we can click enter
  if (e.key === "Enter") {
    checkUserInput();
  }
});
