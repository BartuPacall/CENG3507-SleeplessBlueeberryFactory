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
  updateFinancialSummary();
  updateInventoryTable();
});

function updateInventoryTable() {
  const startDate = new Date(document.querySelector("#startDate").value);
  const endDate = new Date(document.querySelector("#endDate").value);

  const inventoryTableBody = document.querySelector("#inventoryTable tbody");
  inventoryTableBody.innerHTML = "";

  const categoryQuantities =
    JSON.parse(localStorage.getItem("categoryQuantities")) || {};
  const alerts = JSON.parse(localStorage.getItem("categoryAlerts")) || {};
  const restockDates = JSON.parse(localStorage.getItem("restockDates")) || {};
  const premiumWeights =
    JSON.parse(localStorage.getItem("premiumWeights")) || {};
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];

  const categoryWeights = {
    small: 100,
    medium: 250,
    large: 500,
    xlarge: 1000,
    family: 2000,
    bulk: 5000,
    premium: 0,
  };

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculate the number of sales for each category
  const categorySales = filteredOrders.reduce((acc, order) => {
    acc[order.productCategory] =
      (acc[order.productCategory] || 0) + order.quantityOrdered;
    return acc;
  }, {});

  let id = 1;
  for (const category in categoryQuantities) {
    const currentQuantity = categoryQuantities[category];
    const alertLevel = alerts[category] || 0;
    const restockDate = restockDates[category] || "N/A";
    const numberOfSales = categorySales[category] || 0;

    let alertStatus = "Normal";
    if (currentQuantity < alertLevel) {
      alertStatus = "Low";
    } else if (currentQuantity > alertLevel) {
      alertStatus = "High";
    }

    let totalKilos;
    if (category === "premium") {
      totalKilos = (
        (premiumWeights[category] * currentQuantity) /
        1000
      ).toFixed(2);
    } else {
      totalKilos =
        categoryWeights[category] === 0
          ? "N/A"
          : ((currentQuantity * categoryWeights[category]) / 1000).toFixed(2);
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${id}</td>
      <td>${category}</td>
      <td>${currentQuantity}</td>
      <td>${totalKilos}</td>
      <td>${alertLevel}</td>
      <td>${restockDate}</td>
      <td>Warehouse</td>
      <td>${numberOfSales}</td>
      <td>${alertStatus}</td>
    `;
    inventoryTableBody.appendChild(row);
    id++;
  }

  // Update total blueberries display
  updateTotalBlueberries();

  // Update restock date display
  updateRestockDate();
}

function updateTotalBlueberries() {
  const totalBlueberries = JSON.parse(
    localStorage.getItem("totalBlueberriesAmount")
  ) || { amount: 0 };
  document.querySelector("#totalBlueberries").textContent =
    totalBlueberries.amount.toFixed(2);
}

function updateRestockDate() {
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  if (purchases.length > 0) {
    const latestPurchase = purchases.reduce((latest, purchase) => {
      const purchaseDate = new Date(purchase.purchaseDate);
      return purchaseDate > new Date(latest.purchaseDate) ? purchase : latest;
    });
    document.querySelector("#restockDate").textContent =
      latestPurchase.purchaseDate;
  } else {
    document.querySelector("#restockDate").textContent = "N/A";
  }
}

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
  const profitWithoutTax = totalRevenue;
  const netProfit = totalRevenue - tax;

  return {
    totalSales,
    totalSpent,
    totalRevenue,
    tax,
    profitWithoutTax,
    netProfit,
  };
}

function updateFinancialTable(summary) {
  const financialTableBody = document.querySelector("#financialTable tbody");
  financialTableBody.innerHTML = `
    <tr>
      <td>$${summary.totalSales.toFixed(2)}</td>
      <td>$${summary.totalSpent.toFixed(2)}</td>
      <td>$${summary.tax.toFixed(2)}</td>
      <td>$${summary.profitWithoutTax.toFixed(2)}</td>
      <td>$${summary.netProfit.toFixed(2)}</td>
    </tr>
  `;
}

document.querySelector("#startDate").addEventListener("change", () => {
  updateFinancialSummary();
  updateInventoryTable();
});
document.querySelector("#endDate").addEventListener("change", () => {
  updateFinancialSummary();
  updateInventoryTable();
});

function filterDataByDate(startDate, endDate) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];

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
document.querySelector("#exportCSVButton").addEventListener("click", () => {
  const startDate = new Date(document.querySelector("#startDate").value);
  const endDate = new Date(document.querySelector("#endDate").value);

  if (startDate && endDate) {
    const financialData = getTableData("#financialTable");
    const inventoryData = getTableData("#inventoryTable");

    const csvContent = convertToCSV([
      ["Financial Report"],
      [
        "Total income from sales",
        "Total expenses from purchases",
        "Tax (13%) of Revenue",
        "Profit without tax",
        "Net Profit",
      ],
      ...financialData,
      [],
      ["Inventory Report"],
      [
        "Item ID",
        "Category",
        "Stock Level",
        "Total Kilos",
        "Reorder Level",
        "Restock Date",
        "Storage Location",
        "Number of Sales",
        "Alert Quantity",
      ],
      ...inventoryData,
      [],
      ["Summary"],
      [
        `Total Blueberries,${
          document.querySelector("#totalBlueberries").textContent
        } kg`,
      ],
      [`Restock Date,${document.querySelector("#restockDate").textContent}`],
      [],
      ["Report Date Range"],
      [`Start Date,${startDate.toLocaleDateString()}`],
      [`End Date,${endDate.toLocaleDateString()}`],
    ]);

    downloadCSV("report.csv", csvContent);
  }
});

function getTableData(tableSelector) {
  const table = document.querySelector(tableSelector);
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  return rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    return cells.map((cell) => cell.textContent);
  });
}

function convertToCSV(data) {
  return data.map((row) => row.join(",")).join("\n");
}

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
