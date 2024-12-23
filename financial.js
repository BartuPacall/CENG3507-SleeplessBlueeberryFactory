const tabs = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll("article section");
// Event listener for tabs
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

// Function to filter data by date
function filterDataByDate(startDate, endDate) {
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= startDate && orderDate <= endDate;
  });

  const filteredPurchases = purchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.purchaseDate);
    return purchaseDate >= startDate && purchaseDate <= endDate;
  });

  return { filteredOrders, filteredPurchases };
}

// Function to calculate financial summary
function calculateFinancialSummary(filteredOrders, filteredPurchases) {
  const totalSales = filteredOrders.reduce(
    (sum, order) => sum + order.totalPrice,
    0
  );
  const totalSpent = filteredPurchases.reduce(
    (sum, purchase) => sum + purchase.totalCost,
    0
  );
  const totalRevenue = totalSales - totalSpent;
  const tax = totalRevenue * 0.13;
  const netProfit = totalRevenue - tax;

  return { totalSales, totalSpent, totalRevenue, tax, netProfit };
}

// Initial update of financial summary
function updateFinancialTable(summary) {
  const financialTableBody = document.querySelector("#financialTable tbody");
  financialTableBody.innerHTML = `
    <tr>
      <td>$${summary.totalSales.toFixed(2)}</td>
      <td>$${summary.totalSpent.toFixed(2)}</td>
      <td>$${summary.totalRevenue.toFixed(2)}</td>
      <td>$${summary.tax.toFixed(2)}</td>
      <td>$${summary.netProfit.toFixed(2)}</td>
    </tr>
  `;
}

// Event listeners for date inputs
document
  .querySelector("#startDate")
  .addEventListener("change", updateFinancialSummary);
document
  .querySelector("#endDate")
  .addEventListener("change", updateFinancialSummary);

function updateFinancialSummary() {
  const startDate = new Date(document.querySelector("#startDate").value);
  const endDate = new Date(document.querySelector("#endDate").value);

  if (startDate && endDate) {
    const { filteredOrders, filteredPurchases } = filterDataByDate(
      startDate,
      endDate
    );
    const summary = calculateFinancialSummary(
      filteredOrders,
      filteredPurchases
    );
    updateFinancialTable(summary);
  }
}

// Initial update of financial summary
document.querySelector("#exportCSVButton").addEventListener("click", () => {
  const startDate = new Date(document.querySelector("#startDate").value);
  const endDate = new Date(document.querySelector("#endDate").value);

  if (startDate && endDate) {
    const { filteredOrders, filteredPurchases } = filterDataByDate(
      startDate,
      endDate
    );
    const summary = calculateFinancialSummary(
      filteredOrders,
      filteredPurchases
    );

    const csvContent = convertToCSV([
      [
        "Money earned from Sales",
        "Money Spent on Raw Blueberries",
        "Revenue",
        "Tax of Revenue(13%)",
        "Net Profit",
      ],
      [
        summary.totalSales.toFixed(2),
        summary.totalSpent.toFixed(2),
        summary.totalRevenue.toFixed(2),
        summary.tax.toFixed(2),
        summary.netProfit.toFixed(2),
      ],
    ]);
    downloadCSV("financial_summary.csv", csvContent);
  }
});

// Function to convert data to CSV format
function convertToCSV(data) {
  return data.map((row) => row.join(",")).join("\n");
}

// Function to download CSV file
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
