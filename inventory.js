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

document.addEventListener("DOMContentLoaded", () => {
  const inventoryTableBody = document.querySelector("#inventoryTable tbody");

  const categoryQuantities =
    JSON.parse(localStorage.getItem("categoryQuantities")) || {};
  const alerts = JSON.parse(localStorage.getItem("categoryAlerts")) || {};
  const restockDates = JSON.parse(localStorage.getItem("restockDates")) || {};

  // Define category weights if not already defined
  const categoryWeights = {
    small: 100,
    medium: 250,
    large: 500,
    xlarge: 1000,
    family: 2000,
    bulk: 5000,
    premium: 0,
  };

  let id = 1;
  for (const category in categoryQuantities) {
    const currentQuantity = categoryQuantities[category];
    const alertLevel = alerts[category] || 0;
    const restockDate = restockDates[category] || "N/A";

    let alertStatus = "Normal";
    if (currentQuantity < alertLevel) {
      alertStatus = "Low";
    } else if (currentQuantity > alertLevel) {
      alertStatus = "High";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${id}</td>
      <td>${category}</td>
      <td>${currentQuantity}</td>
      <td>${((currentQuantity * categoryWeights[category]) / 1000).toFixed(
        2
      )}</td>
      <td>${alertLevel}</td>
      <td>${restockDate}</td>
      <td>Warehouse</td>
      <td>${alertStatus}</td>
    `;
    inventoryTableBody.appendChild(row);
    id++;
  }

  // Add event listener to export button
  document
    .querySelector("#exportCsvBtn")
    .addEventListener("click", exportTableToCSV);
});

function exportTableToCSV() {
  const table = document.querySelector("#inventoryTable");
  const rows = Array.from(table.querySelectorAll("tr"));
  const csvContent = rows
    .map((row) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      return cells.map((cell) => cell.textContent).join(",");
    })
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
