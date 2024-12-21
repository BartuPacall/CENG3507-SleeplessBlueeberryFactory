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

const orders = JSON.parse(localStorage.getItem("orders")) || [];
const purchases = JSON.parse(localStorage.getItem("purchases")) || [];

// Calculate total money earned from sales
const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

// Calculate total money spent on raw blueberries
const totalSpent = purchases.reduce(
  (sum, purchase) => sum + purchase.totalCost,
  0
);

// Calculate total revenue
const totalRevenue = totalSales - totalSpent;

// Calculate tax (13% of total revenue)
const tax = totalRevenue * 0.13;

// Calculate net profit
const netProfit = totalRevenue - tax;

// Update the financial table
const financialTableBody = document.querySelector("#financialTable tbody");
financialTableBody.innerHTML = `
    <tr>
      <td>$${totalSales.toFixed(2)}</td>
      <td>$${totalSpent.toFixed(2)}</td>
      <td>$${totalRevenue.toFixed(2)}</td>
      <td>$${tax.toFixed(2)}</td>
      <td>$${netProfit.toFixed(2)}</td>
    </tr>
  `;

// Add event listener to the export button
document.querySelector("#exportCSVButton").addEventListener("click", () => {
  const csvContent = convertToCSV([
    [
      "Money earned from Sales",
      "Money Spent on Raw Blueberries",
      "Revenue",
      "Tax of Revenue(13%)",
      "Net Profit",
    ],
    [
      totalSales.toFixed(2),
      totalSpent.toFixed(2),
      totalRevenue.toFixed(2),
      tax.toFixed(2),
      netProfit.toFixed(2),
    ],
  ]);
  downloadCSV("financial_summary.csv", csvContent);
});

function convertToCSV(data) {
  return data.map((row) => row.join(",")).join("\n");
}

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
