// Purpose: To manage the sales module of the Blueberry Management System
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
  // Update the row content
  row.innerHTML = `
    <td>${category}</td>
    <td>${alertLevel}</td>
    <td>${currentQuantity}</td>
    <td>${alertStatus}</td>
  `;
}

// Function to calculate revenue
function calcRevenue(pricePerKg, avgPriceOfBerry, pQuantity, cKG) {
  return ((pricePerKg - avgPriceOfBerry) * (pQuantity * cKG)).toFixed(2);
}

// Function to calculate revenue summary
function calculateRevenueSummary(filteredOrders) {
  const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};
  const avgPriceOfBerry =
    parseFloat(localStorage.getItem("avgPriceOfBlueberries")) || 0;

  // Initialize total sales and revenue
  let totalSales = 0;
  let totalRevenue = 0;
  const packageSales = {};
  const packageRevenue = {};
  // Calculate total sales and revenue
  filteredOrders.forEach((order) => {
    const pricePerUnit = prices[order.productCategory] || 0;
    const categoryWeights = {
      small: 0.1,
      medium: 0.25,
      large: 0.5,
      xlarge: 1,
      family: 2,
      bulk: 5,
      premium: 1, // Assuming premium is already in kg
    };

    // Get the weight in kg for the category
    const weightInKg = categoryWeights[order.productCategory] || 1;
    const pricePerKg = pricePerUnit / weightInKg;
    const revenue = parseFloat(
      calcRevenue(
        pricePerKg,
        avgPriceOfBerry,
        order.quantityOrdered,
        weightInKg
      )
    );

    // Add revenue to the order object
    order.revenue = revenue;

    // Update total sales and revenue
    totalSales += 1;
    totalRevenue += revenue;
    // Update package sales and revenue
    if (!packageSales[order.productCategory]) {
      packageSales[order.productCategory] = 0;
      packageRevenue[order.productCategory] = 0;
    }

    packageSales[order.productCategory] += order.quantityOrdered;
    packageRevenue[order.productCategory] += revenue;
  });

  return { totalSales, totalRevenue, packageSales, packageRevenue };
}

let salesBarChart; // Declare a variable to hold the chart instance

function renderBarChart(data, labels, chartId) {
  const ctx = document.getElementById(chartId).getContext("2d");

  // Destroy the previous chart instance if it exists
  if (salesBarChart) {
    salesBarChart.destroy();
  }

  salesBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales",
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      responsive: true, // Enable responsiveness
      maintainAspectRatio: false, // Boyutlandırma oranını serbest bırakır
    },
  });
}

let revenuePieChart; // Declare a variable to hold the pie chart instance

function renderPieChart(data, labels, chartId) {
  const ctx = document.getElementById(chartId).getContext("2d");

  // Destroy the previous chart instance if it exists
  if (revenuePieChart) {
    revenuePieChart.destroy();
  }

  revenuePieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Revenue",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });
}
// Function to generate charts
function generateCharts(filteredOrders) {
  const categorySales = {};
  const categoryRevenue = {};

  // Calculate sales and revenue for each product category
  filteredOrders.forEach((order) => {
    if (!categorySales[order.productCategory]) {
      categorySales[order.productCategory] = 0;
      categoryRevenue[order.productCategory] = 0;
    }
    categorySales[order.productCategory] += order.quantityOrdered;
    categoryRevenue[order.productCategory] += order.totalPrice;
  });

  // Get the category names, sales data, and revenue data
  const categories = Object.keys(categorySales);
  const salesData = Object.values(categorySales);
  const revenueData = Object.values(categoryRevenue);
  // Render the bar chart and pie chart
  renderBarChart(salesData, categories, "salesBarChart");
  renderPieChart(revenueData, categories, "revenuePieChart");
}

//  Function to calculate revenue with tax
function calculateRevenueWithTax(revenue) {
  const taxRate = 0.13;
  return revenue - revenue * taxRate;
}

// Function to display revenue summary
function displayRevenueSummary(filteredOrders) {
  const { totalSales, totalRevenue, packageSales, packageRevenue } =
    calculateRevenueSummary(filteredOrders);

  // Display the revenue summary in the revenueDisplay element
  const revenueDisplay = document.querySelector("#revenueDisplay");
  revenueDisplay.innerHTML = `
    <div class="revenue-summary">
      <div class="revenue-summary__section">
        <h3 class="revenue-summary__title">Total Sales: ${totalSales}</h3>
      </div>
      <div class="revenue-summary__section">
        <h3 class="revenue-summary__title">Total Revenue: ${totalRevenue.toFixed(
          2
        )}</h3>
      </div>
      <div class="revenue-summary__section">
        <h3 class="revenue-summary__title">Package Sales:</h3>
        <ul class="revenue-summary__list">
          ${Object.keys(packageSales)
            .map((pkg) => {
              const revenue = packageRevenue[pkg];
              const revenueWithTax = calculateRevenueWithTax(revenue);
              return `<li class="revenue-summary__item">${pkg}: ${
                packageSales[pkg]
              } sold, Revenue: ${revenue.toFixed(
                2
              )}, Revenue with Tax: ${revenueWithTax.toFixed(2)}</li>`;
            })
            .join("")}
        </ul>
      </div>
    </div>
  `;
}

// Call displayRevenueSummary when the page loads
document.addEventListener("DOMContentLoaded", () => {
  displayRevenueSummary();
});

// Function to check if there are enough products in stock
function hasSufficientProduct(category, quantity) {
  const categoryQuantities =
    JSON.parse(localStorage.getItem("categoryQuantities")) || {};
  console.log("Checking Quantities:", categoryQuantities); // Debug log
  console.log("Category:", category, "Required Quantity:", quantity); // Debug log
  return categoryQuantities[category] >= quantity;
}

// Function to update the balance display
function updateBalanceDisplay() {
  const balance = parseFloat(localStorage.getItem("balance")) || 0;
  document.querySelector("#currentBalance").textContent = balance.toFixed(2);

  const myBalance = parseFloat(localStorage.getItem("myBalance")) || 0;
  document.querySelector("#myBalance").textContent = myBalance.toFixed(2);
}
// Function to add to my balance
document
  .querySelector("#addMyBalanceForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const addMyBalanceAmount = parseFloat(
      document.querySelector("#addMyBalanceAmount").value
    );
    let myBalance = parseFloat(localStorage.getItem("myBalance")) || 0;
    myBalance += addMyBalanceAmount;
    localStorage.setItem("myBalance", myBalance.toFixed(2));
    updateBalanceDisplay();
    event.target.reset();
  });

// Call updateBalanceDisplay when the page loads
document.addEventListener("DOMContentLoaded", () => {
  updateBalanceDisplay();
});
// Function to add balance
document
  .querySelector("#addBalanceForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const addBalanceAmount = parseFloat(
      document.querySelector("#addBalanceAmount").value
    );
    let balance = parseFloat(localStorage.getItem("balance")) || 0;
    balance += addBalanceAmount;
    localStorage.setItem("balance", balance.toFixed(2));
    updateBalanceDisplay();
    event.target.reset();
  });

// Call updateBalanceDisplay when the page loads
document.querySelector("#orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  // Function to add an order
  const orderId = document.querySelector("#orderId").value;
  const customerName = document.querySelector("#customerName").value;
  const contactInfo = document.querySelector("#contactInfo").value;
  const shippingAddress = document.querySelector("#shippingAddress").value;
  let productCategory = document.querySelector("#productCategory").value;
  const quantityOrdered = parseFloat(
    document.querySelector("#quantityOrdered").value
  );
  const orderStatus = document.querySelector("#orderStatus").value;
  const orderDate = document.querySelector("#orderDate").value; // Get the date value

  // Normalize productCategory to match categoryQuantities keys
  const categoryMap = {
    smallPack: "small",
    mediumPack: "medium",
    largePack: "large",
    xlargePack: "xlarge",
    extraLarge: "xlarge", // Added normalization for extraLarge
    familyPack: "family",
    bulkPack: "bulk",
    premiumPack: "premium",
  };
  productCategory = categoryMap[productCategory] || productCategory;

  // Validate the form inputs
  console.log("Order Details:", {
    orderId,
    customerName,
    contactInfo,
    shippingAddress,
    productCategory,
    quantityOrdered,
    orderStatus,
    orderDate,
  }); // Debug log

  // Check if there are enough products in stock
  if (!hasSufficientProduct(productCategory, quantityOrdered)) {
    alert("Insufficient quantity in stock for this order.");
    return;
  }

  // Get the price of the selected product category from localStorage
  const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};
  const pricePerUnit = prices[productCategory] || 0;
  const totalPrice = pricePerUnit * quantityOrdered;

  // Check if there is enough balance
  let balance = parseFloat(localStorage.getItem("balance")) || 0;
  if (balance < totalPrice) {
    alert("Insufficient balance for this order.");
    return;
  }

  // Get existing orders from localStorage
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  // Check if the orderId already exists
  const orderExists = orders.some(
    (existingOrder) => existingOrder.orderId === orderId
  );
  if (orderExists) {
    alert("Order ID already exists.");
    return;
  }

  // Deduct the total price from the balance
  balance -= totalPrice;
  localStorage.setItem("balance", balance.toFixed(2));
  updateBalanceDisplay();

  // Update my balance
  let myBalance = parseFloat(localStorage.getItem("myBalance")) || 0;
  myBalance += totalPrice;
  localStorage.setItem("myBalance", myBalance.toFixed(2));
  updateBalanceDisplay();

  // Create an order object
  const order = {
    orderId,
    customerName,
    contactInfo,
    shippingAddress,
    productCategory,
    quantityOrdered,
    totalPrice,
    orderStatus,
    orderDate,
  };

  // Store the order in localStorage
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Display the order details in the orders table
  displayOrder(order);

  // Update the product quantities in the product management module
  if (!updateProductQuantities(productCategory, quantityOrdered)) {
    alert("Failed to update product quantities.");
    return;
  }

  // Reset the form
  event.target.reset();
});

// Call updateBalanceDisplay when the page loads
document.addEventListener("DOMContentLoaded", () => {
  updateBalanceDisplay();
  updateSalesTablePrices();
});

// Function to display an order in the orders table
function displayOrder(order) {
  const tableBody = document.querySelector("#ordersTable tbody");
  const row = document.createElement("tr");
  row.setAttribute("data-order-id", order.orderId);

  // Get the price per unit from localStorage
  const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};
  const pricePerUnit = prices[order.productCategory] || 0;

  // Convert price to per kg if necessary
  const categoryWeights = {
    small: 0.1,
    medium: 0.25,
    large: 0.5,
    xlarge: 1,
    family: 2,
    bulk: 5,
    premium: 1,
  };

  // Get the weight in kg for the category
  const weightInKg = categoryWeights[order.productCategory] || 1;
  const pricePerKg = pricePerUnit / weightInKg;

  // Get the average price of blueberries from localStorage
  const avgPriceOfBerry =
    parseFloat(localStorage.getItem("avgPriceOfBlueberries")) || 0;

  // Calculate the revenue
  const revenue = calcRevenue(
    pricePerKg,
    avgPriceOfBerry,
    order.quantityOrdered,
    weightInKg
  );

  // Display the order details in the orders table
  row.innerHTML = `
    <td>${order.orderId}</td>
    <td>${order.customerName}</td>
    <td>${order.contactInfo}</td>
    <td>${order.shippingAddress}</td>
    <td>${order.productCategory}</td>
    <td>${order.quantityOrdered}</td>
    <td>${pricePerKg.toFixed(2)}</td> <!-- Display price per kg -->
    <td>${order.totalPrice.toFixed(2)}</td>
    <td>${revenue}</td> <!-- Display revenue -->
    <td>${order.orderStatus}</td>
    <td>${order.orderDate}</td>
    <td><button class="update-btn">Update</button></td>
  `;
  tableBody.appendChild(row);

  // Add event listeners for update button
  row
    .querySelector(".update-btn")
    .addEventListener("click", () => openUpdateModal(order.orderId));

  // Update filter dropdowns
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  populateFilterDropdowns(orders);
}

function openUpdateModal(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find((order) => order.orderId === orderId);

  if (order) {
    // Populate the modal with the order details for editing
    document.querySelector("#updateOrderId").value = order.orderId;
    document.querySelector("#updateCustomerName").value = order.customerName;
    document.querySelector("#updateContactInfo").value = order.contactInfo;
    document.querySelector("#updateShippingAddress").value =
      order.shippingAddress;
    document.querySelector("#updateProductCategory").value =
      order.productCategory;
    document.querySelector("#updateQuantityOrdered").value =
      order.quantityOrdered;
    document.querySelector("#updateOrderStatus").value = order.orderStatus;
    document.querySelector("#updateOrderDate").value = order.orderDate;

    // Show the modal
    const modal = document.querySelector("#updateOrderModal");
    modal.style.display = "block";
  }
}
// Function to close the update modal
function closeUpdateModal() {
  const modal = document.querySelector("#updateOrderModal");
  modal.style.display = "none";
}
// Add event listener for the update order form
document
  .querySelector("#updateOrderForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const orderId = document.querySelector("#updateOrderId").value;
    const customerName = document.querySelector("#updateCustomerName").value;
    const contactInfo = document.querySelector("#updateContactInfo").value;
    const shippingAddress = document.querySelector(
      "#updateShippingAddress"
    ).value;
    const productCategory = document.querySelector(
      "#updateProductCategory"
    ).value;
    const quantityOrdered = parseFloat(
      document.querySelector("#updateQuantityOrdered").value
    );
    // Get the order status and date
    const orderStatus = document.querySelector("#updateOrderStatus").value;
    const orderDate = document.querySelector("#updateOrderDate").value; // Get the date value

    // Get the price of the selected product category from localStorage
    const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};
    const pricePerUnit = prices[productCategory] || 0;

    // Convert price to per kg if necessary
    const categoryWeights = {
      small: 0.1,
      medium: 0.25,
      large: 0.5,
      xlarge: 1,
      family: 2,
      bulk: 5,
      premium: 1, // Assuming premium is already in kg
    };

    const weight = categoryWeights[productCategory] || 1;
    const totalPrice = pricePerUnit * weight * quantityOrdered;

    // Update the order object
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const orderIndex = orders.findIndex((order) => order.orderId === orderId);
    // Update the order object
    if (orderIndex !== -1) {
      orders[orderIndex] = {
        orderId,
        customerName,
        contactInfo,
        shippingAddress,
        productCategory,
        quantityOrdered,
        orderStatus,
        orderDate,
        totalPrice,
      };

      localStorage.setItem("orders", JSON.stringify(orders));

      // Update the table row
      const table = document.querySelector("#ordersTable tbody");
      const rows = table.querySelectorAll("tr");
      rows.forEach((row) => {
        if (row.cells[0].innerText === orderId) {
          row.cells[1].innerText = customerName;
          row.cells[2].innerText = contactInfo;
          row.cells[3].innerText = shippingAddress;
          row.cells[5].innerText = quantityOrdered;
          row.cells[9].innerText = orderStatus;
          row.cells[10].innerText = orderDate;
        }
      });

      closeUpdateModal();
    }
  });

// Function to update the product quantities in localStorage
function updateProductQuantities(category, quantity) {
  const categoryQuantities =
    JSON.parse(localStorage.getItem("categoryQuantities")) || {};
  console.log("Current Quantities:", categoryQuantities); // Debug log
  console.log("Category:", category, "Quantity:", quantity); // Debug log

  // Check if there are enough products in stock
  if (categoryQuantities[category] >= quantity) {
    categoryQuantities[category] -= quantity;
    localStorage.setItem(
      "categoryQuantities",
      JSON.stringify(categoryQuantities)
    );
    updateAlertStatus(category);
    console.log("Updated Quantities:", categoryQuantities); // Debug log
    return true; // Indicate that the update was successful
  } else {
    alert("Insufficient quantity in stock for this order.");
    return false; // Indicate that the update failed
  }
}

// Function to add an order
function addOrder(order) {
  if (updateProductQuantities(order.productCategory, order.quantityOrdered)) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    displayOrder(order);
  }
}

// Add event listeners for search and filter inputs
document.querySelector("#searchInput").addEventListener("input", filterOrders);
document
  .querySelector("#filterStatus")
  .addEventListener("change", filterOrders);
document
  .querySelector("#filterCustomer")
  .addEventListener("change", filterOrders);
document
  .querySelector("#filterCategory")
  .addEventListener("change", filterOrders);

// Function to filter orders based on search and filter inputs
function filterOrders() {
  const searchValue = document
    .querySelector("#searchInput")
    .value.toLowerCase();
  const filterStatus = document.querySelector("#filterStatus").value;
  const filterCustomer = document.querySelector("#filterCustomer").value;
  const filterCategory = document.querySelector("#filterCategory").value;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchValue) ||
      order.customerName.toLowerCase().includes(searchValue) ||
      order.contactInfo.toLowerCase().includes(searchValue) ||
      order.shippingAddress.toLowerCase().includes(searchValue) ||
      order.productCategory.toLowerCase().includes(searchValue) ||
      order.quantityOrdered.toString().toLowerCase().includes(searchValue) ||
      order.totalPrice.toString().toLowerCase().includes(searchValue) ||
      order.orderStatus.toLowerCase().includes(searchValue);
    const matchesStatus =
      filterStatus === "" || order.orderStatus === filterStatus;
    const matchesCustomer =
      filterCustomer === "" || order.customerName === filterCustomer;
    const matchesCategory =
      filterCategory === "" || order.productCategory === filterCategory;

    return matchesSearch && matchesStatus && matchesCustomer && matchesCategory;
  });

  displayFilteredOrders(filteredOrders);
}

// Function to filter orders by date
function filterOrdersByDate(startDate, endDate) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  return orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= startDate && orderDate <= endDate;
  });
}

// Function to update the sales table prices
function updateSalesTablePrices() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};

  orders.forEach((order) => {
    const pricePerUnit = prices[order.productCategory] || 0;
    order.totalPrice = pricePerUnit * order.quantityOrdered;
  });

  // Store the updated orders in localStorage
  localStorage.setItem("orders", JSON.stringify(orders));

  // Update the sales table
  displayFilteredOrders(orders);
}

function displayFilteredOrders(orders) {
  const tableBody = document.querySelector("#ordersTable tbody");
  tableBody.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.setAttribute("data-order-id", order.orderId);

    // Get the price per unit from localStorage
    const prices = JSON.parse(localStorage.getItem("categoryPrices")) || {};
    const pricePerUnit = prices[order.productCategory] || 0;

    // Convert price to per kg if necessary
    const categoryWeights = {
      small: 0.1,
      medium: 0.25,
      large: 0.5,
      xlarge: 1,
      family: 2,
      bulk: 5,
      premium: 1, // Assuming premium is already in kg
    };
    const weightInKg = categoryWeights[order.productCategory] || 1;
    const pricePerKg = pricePerUnit / weightInKg;

    // Get the average price of blueberries from localStorage
    const avgPriceOfBerry =
      parseFloat(localStorage.getItem("avgPriceOfBlueberries")) || 0;

    // Calculate the revenue
    const revenue = calcRevenue(
      pricePerKg,
      avgPriceOfBerry,
      order.quantityOrdered,
      weightInKg
    );
    // Display the order details in the orders table
    row.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.customerName}</td>
      <td>${order.contactInfo}</td>
      <td>${order.shippingAddress}</td>
      <td>${order.productCategory}</td>
      <td>${order.quantityOrdered}</td>
      <td>${pricePerKg.toFixed(2)}</td> <!-- Display price per kg -->
      <td>${order.totalPrice.toFixed(2)}</td>
      <td>${revenue}</td> <!-- Display revenue -->
      <td>${order.orderStatus}</td>
      <td>${order.orderDate}</td>
      <td><button class="update-btn">Update</button></td>
    `;
    tableBody.appendChild(row);

    // Add event listeners for update and delete buttons
    row
      .querySelector(".update-btn")
      .addEventListener("click", () => openUpdateModal(order.orderId));
  });
}
// Function to load orders from localStorage
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  populateFilterDropdowns(orders);
  displayFilteredOrders(orders);
}
// Function to populate filter dropdowns
function populateFilterDropdowns(orders) {
  const customerSet = new Set();
  const categorySet = new Set();

  orders.forEach((order) => {
    customerSet.add(order.customerName);
    categorySet.add(order.productCategory);
  });

  // Update the filter dropdowns
  const filterCustomer = document.querySelector("#filterCustomer");
  const filterCategory = document.querySelector("#filterCategory");

  filterCustomer.innerHTML = '<option value="">All Customers</option>';
  filterCategory.innerHTML = '<option value="">All Categories</option>';
  // Populate the filter dropdowns
  customerSet.forEach((customer) => {
    const option = document.createElement("option");
    option.value = customer;
    option.textContent = customer;
    filterCustomer.appendChild(option);
  });

  // Populate the category dropdown
  categorySet.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filterCategory.appendChild(option);
  });
}
// Function to convert data to CSV format
function convertToCSV(data) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ("" + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

// Function to download CSV file
function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to export Order Management data to CSV
function exportOrdersToCSV() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  // Prepare Order Management data
  const orderData = orders.map((order) => ({
    "Order ID": order.orderId,
    "Customer Name": order.customerName,
    "Contact Info": order.contactInfo,
    "Shipping Address": order.shippingAddress,
    "Product Category": order.productCategory,
    "Quantity Ordered": order.quantityOrdered,
    "Price per kg": (order.totalPrice / order.quantityOrdered).toFixed(2),
    "Total Price": order.totalPrice.toFixed(2),
    Revenue: order.revenue ? order.revenue.toFixed(2) : "N/A", // Use order.revenue if available
    "Order Status": order.orderStatus,
    "Order Date": order.orderDate,
  }));

  // Convert data to CSV format
  const orderCSV = convertToCSV(orderData);

  // Download CSV file
  downloadCSV("order_management.csv", orderCSV);
}

// Add event listener to the export button
document
  .querySelector("#exportCSVButton")
  .addEventListener("click", exportOrdersToCSV);

// Function to update the price table
document.addEventListener("DOMContentLoaded", () => {
  const startDateInput = document.querySelector("#startDate");
  const endDateInput = document.querySelector("#endDate");

  function updateRevenueCalculation() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (startDate && endDate) {
      const filteredOrders = filterOrdersByDate(startDate, endDate);
      displayRevenueSummary(filteredOrders);
      generateCharts(filteredOrders);
    }
  }
  // Add event listeners to the date inputs
  startDateInput.addEventListener("change", updateRevenueCalculation);
  endDateInput.addEventListener("change", updateRevenueCalculation);

  updateRevenueCalculation(); // Initial call to display data
});

// Function to export Revenue Calculation data to PDF
function exportRevenueToPDF() {
  const startDate = new Date(document.querySelector("#startDate").value);
  const endDate = new Date(document.querySelector("#endDate").value);
  // Function to export Revenue Calculation data to PDF
  if (startDate && endDate) {
    const filteredOrders = filterOrdersByDate(startDate, endDate);
    const { totalSales, totalRevenue, packageSales, packageRevenue } =
      calculateRevenueSummary(filteredOrders);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Revenue Calculation", 14, 22);

    // Add date range
    doc.setFontSize(12);
    doc.text(`Start Date: ${startDate.toLocaleDateString()}`, 14, 32);
    doc.text(`End Date: ${endDate.toLocaleDateString()}`, 14, 42);

    // Add Total Sales and Total Revenue
    doc.text(`Total Sales: ${totalSales}`, 14, 52);
    doc.text(`Total Revenue: ${totalRevenue.toFixed(2)}`, 14, 62);

    // Add a line break
    doc.text(" ", 14, 72);

    // Add package sales and revenue
    let yPosition = 82;
    for (const [pkg, sales] of Object.entries(packageSales)) {
      const revenue = packageRevenue[pkg];
      const revenueWithTax = calculateRevenueWithTax(revenue);
      doc.text(`Package: ${pkg}`, 14, yPosition);
      doc.text(`Sales: ${sales}`, 80, yPosition);
      doc.text(`Revenue: ${revenue.toFixed(2)}`, 140, yPosition);
      yPosition += 10;
      doc.text(
        `Revenue with Tax: ${revenueWithTax.toFixed(2)}`,
        140,
        yPosition
      );
      yPosition += 10;
    }

    // Save the PDF
    doc.save("revenue_calculation.pdf");
  }
}

// Add event listener to the export button
document
  .querySelector("#exportPDFButton")
  .addEventListener("click", exportRevenueToPDF);

// Initially load orders
loadOrders();

document.addEventListener("DOMContentLoaded", () => {
  updateSalesTablePrices();
});

// Close the modal when the user clicks on <span> (x)
document.querySelector(".close").addEventListener("click", closeUpdateModal);

// Close the modal when the user clicks anywhere outside of the modal
window.addEventListener("click", (event) => {
  const modal = document.querySelector("#updateOrderModal");
  if (event.target === modal) {
    closeUpdateModal();
  }
});
