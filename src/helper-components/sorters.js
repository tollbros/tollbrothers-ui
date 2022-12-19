const sortAlpha = (theArray, key, reverse) => {
  theArray.sort((a, b) => {
    let stringA = a[key];
    let stringB = b[key];

    if (reverse) {
      return stringA.localeCompare(stringB);
    } else {
      return stringB.localeCompare(stringA);
    }
  });
};

const sortNumber = (theArray, key, reverse) => {
  theArray.sort((a, b) => {
    let reverseShift = 1;
    let calcA = 0;
    let calcB = 0;
    let numberA = a[key] || "";
    let numberB = b[key] || "";

    numberA = numberA + "";
    numberB = numberB + "";

    if (reverse) reverseShift = -1;

    if (numberA.search(/Mid/) !== -1) {
      calcA = 1;
    }
    if (numberA.search(/Upper/) !== -1) {
      calcA = 2;
    }
    if (numberA === "") {
      calcA = 999999999999;
    }

    if (numberB.search(/Mid/) !== -1) {
      calcB = 1;
    }
    if (numberB.search(/Upper/) !== -1) {
      calcB = 2;
    }
    if (numberB === "") {
      calcB = 999999999999;
    }

    if (key === "price") {
      numberA = calcA + Number(numberA.replace(/[^\d]/g, ""));
      numberB = calcB + Number(numberB.replace(/[^\d]/g, ""));
    } else {
      numberA = calcA + Number(numberA);
      numberB = calcB + Number(numberB);
    }

    if (numberA < numberB) {
      return -1 * reverseShift;
    } else if (numberA > numberB) {
      return 1 * reverseShift;
    } else {
      return 0;
    }
  });
};

const sortDecider = (array, sortBy) => {
  if (sortBy === "distance") {
    sortNumber(array, "distance", null);
  } else if (sortBy === "az") {
    sortAlpha(array, "name", true);
  } else if (sortBy === "za") {
    sortAlpha(array, "name", null);
  } else if (sortBy === "pricedown") {
    sortNumber(array, "price", null);
  } else if (sortBy === "priceup") {
    sortNumber(array, "price", true);
  }
};

export { sortAlpha };
export { sortNumber };
export { sortDecider };
