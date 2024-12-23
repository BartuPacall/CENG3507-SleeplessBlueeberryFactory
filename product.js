const tabs = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll("article section");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    sections.forEach((section) => {
      if (section.id === target) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });
  });
});

// Initially show only the first tab content
sections.forEach((section, index) => {
  if (index === 0) {
    section.classList.add("active");
  } else {
    section.classList.remove("active");
  }
});

// Function to show or hide the weight input field based on the selected category
function toggleWeightInput() {
  const category = document.querySelector("#category").value;
  const weightInputContainer = document.querySelector("#weightInputContainer");

  if (category === "premium") {
    weightInputContainer.style.display = "block";
  } else {
    weightInputContainer.style.display = "none";
  }
}

const totalBlueberries = JSON.parse(
  localStorage.getItem("totalBlueberriesAmount")
);

// Update total blueberries display
document.querySelector("#totalBlueberry").innerHTML =
  totalBlueberries.amount.toFixed(2);

// Category weights in grams
const categoryWeights = {
  small: 100,
  medium: 250,
  large: 500,
  xlarge: 1000,
  family: 2000,
  bulk: 5000,
  premium: 0,
};

document.querySelector("#priceForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const category = document.querySelector("#priceCategory").value;
  const price = parseFloat(document.querySelector("#price").value);

  // Store the price in localStorage
  const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};
  prices[category] = price;
  localStorage.setItem("categoryPrices", JSON.stringify(prices));

  // Update the price table
  updatePriceTable();

  // Update the total prices in the sales table
  updateSalesTablePrices();

  // Reset the form
  event.target.reset();
});

// Function to update the price table
function updatePriceTable() {
  const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};
  const tableBody = document.querySelector("#priceTable tbody");
  tableBody.innerHTML = "";

  for (const category in prices) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category}</td>
      <td>${prices[category].toFixed(2)}</td>
    `;
    tableBody.appendChild(row);
  }
}

// Initially update the price table
updatePriceTable();
document
  .querySelector("#categorizationForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const category = document.querySelector("#category").value;
    let quantity = parseFloat(document.querySelector("#quantity").value);
    let weight = categoryWeights[category];
    const restockDate = document.querySelector("#restockDate").value;

    if (category === "premium") {
      weight = parseFloat(document.querySelector("#weight").value) * 1000; // Convert kg to grams
      const premiumWeights =
        JSON.parse(localStorage.getItem("premiumWeights")) || {};
      premiumWeights[category] = weight;
      localStorage.setItem("premiumWeights", JSON.stringify(premiumWeights));
    }
    const totalWeight = weight * quantity;

    if (totalBlueberries.amount >= totalWeight / 1000) {
      totalBlueberries.amount -= totalWeight / 1000;
      localStorage.setItem(
        "totalBlueberriesAmount",
        JSON.stringify(totalBlueberries)
      );
      document.querySelector("#totalBlueberry").innerHTML =
        totalBlueberries.amount.toFixed(2);

      // Update the category quantity
      const categoryQuantities =
        JSON.parse(localStorage.getItem("categoryQuantities")) || {};
      categoryQuantities[category] =
        (categoryQuantities[category] || 0) + quantity;
      localStorage.setItem(
        "categoryQuantities",
        JSON.stringify(categoryQuantities)
      );

      // Update the restock date
      const restockDates =
        JSON.parse(localStorage.getItem("restockDates")) || {};
      restockDates[category] = restockDate;
      localStorage.setItem("restockDates", JSON.stringify(restockDates));

      // Update the alert status
      updateAlertStatus(category);
    } else {
      alert("Insufficient blueberries for this categorization.");
    }

    // Reset the form
    event.target.reset();
    toggleWeightInput();
  });

document.querySelector("#alertForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const category = document.querySelector("#alertCategory").value;
  const alertLevel = parseFloat(document.querySelector("#alertQuantity").value);

  // Store the alert level in localStorage
  const alerts = JSON.parse(localStorage.getItem("categoryAlerts")) || {};
  alerts[category] = alertLevel;
  localStorage.setItem("categoryAlerts", JSON.stringify(alerts));

  // Update the alert table
  updateAlertTable();
});

// Function to update the alert status
function updateAlertStatus(category) {
  const alerts = JSON.parse(localStorage.getItem("categoryAlerts")) || {};
  const alertLevel = alerts[category] || 0;
  const categoryQuantities =
    JSON.parse(localStorage.getItem("categoryQuantities")) || {};
  const currentQuantity = categoryQuantities[category] || 0;

  let alertStatus = "Normal";
  if (currentQuantity < alertLevel) {
    alertStatus = "Low";
  } else if (currentQuantity > alertLevel) {
    alertStatus = "High";
  }

  // Update the alert table
  const tableBody = document.querySelector("#alertTable tbody");
  let row = tableBody.querySelector(`tr[data-category="${category}"]`);
  if (!row) {
    row = document.createElement("tr");
    row.setAttribute("data-category", category);
    tableBody.appendChild(row);
  }
  row.innerHTML = `
    <td>${category}</td>
    <td>${alertLevel}</td>
    <td>${currentQuantity}</td>
    <td>${alertStatus}</td>
  `;
}

// Function to update the alert table
function updateAlertTable() {
  const alerts = JSON.parse(localStorage.getItem("categoryAlerts")) || {};
  const categoryQuantities =
    JSON.parse(localStorage.getItem("categoryQuantities")) || {};
  const tableBody = document.querySelector("#alertTable tbody");
  tableBody.innerHTML = "";

  for (const category in alerts) {
    if (category === "rawBlueberry") {
      continue; // Skip rawBlueberry
    }

    const alertLevel = alerts[category];
    const currentQuantity = categoryQuantities[category] || 0;

    let alertStatus = "Normal";
    if (currentQuantity < alertLevel) {
      alertStatus = "Low";
    } else if (currentQuantity > alertLevel) {
      alertStatus = "High";
    }

    let row = tableBody.querySelector(`tr[data-category="${category}"]`);
    if (!row) {
      row = document.createElement("tr");
      row.setAttribute("data-category", category);
      tableBody.appendChild(row);
    }
    row.innerHTML = `
      <td>${category}</td>
      <td>${alertLevel}</td>
      <td>${currentQuantity}</td>
      <td>${alertStatus}</td>
    `;
  }
}

// Initially update the alert table
updateAlertTable();
