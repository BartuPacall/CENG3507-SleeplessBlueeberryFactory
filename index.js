const tabButtons = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll("article section");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove the active class from all buttons
    sections.forEach((section) => {
      section.classList.remove("active");
    });

    // Add the active class to the clicked button
    const targetTab = button.getAttribute("data-tab");
    const targetSection = document.querySelector(`#${targetTab}`);
    if (targetSection) {
      targetSection.classList.add("active");
    }
  });
});

if (sections.length > 0) {
  sections[0].classList.add("active");
}

// Load farmers from local storage
const loadFarmers = () => {
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
  const tableBody = document.querySelector("#farmersTable tbody");
  tableBody.innerHTML = "";
  const farmerFilter = document.querySelector("#farmerFilter");
  const locationFilter = document.querySelector("#locationFilter");
  const purchaseFarmerFilter = document.querySelector("#purchaseFarmerFilter");
  const purchaseGoodsFilter = document.querySelector("#purchaseGoodsFilter");
  farmerFilter.innerHTML = '<option value="">All Farmers</option>';
  locationFilter.innerHTML = '<option value="">All Locations</option>';
  purchaseFarmerFilter.innerHTML = '<option value="">Select Farmer ID</option>';
  purchaseGoodsFilter.innerHTML = '<option value="">Select Goods</option>';

  const farmerNames = new Set();
  const locations = new Set();
  const goodsSet = new Set();

  // Add farmers to the table
  farmers.forEach((farmer, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${farmer.farmer_id}</td>
        <td>${farmer.first_name}</td>
        <td>${farmer.last_name}</td>
        <td>${farmer.phone}</td>
        <td>${farmer.email}</td>
        <td>${farmer.address}</td>
        <td>${farmer.region}</td>
        <td>${farmer.latitude}</td>
        <td>${farmer.longitude}</td>
        <td>${farmer.goods}</td>
        <td><button class="update-btn" data-index="${index}">Update</button></td>
        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
      `;
    tableBody.appendChild(row);
    farmerNames.add(farmer.first_name);
    locations.add(farmer.region);
    goodsSet.add(farmer.goods);

    // Add farmer ID to the purchase farmer filter
    const option = document.createElement("option");
    option.value = farmer.farmer_id;
    option.textContent = farmer.farmer_id;
    purchaseFarmerFilter.appendChild(option);
  });

  // Add farmer names, locations, and goods to the filters
  farmerNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    farmerFilter.appendChild(option);
  });

  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    locationFilter.appendChild(option);
  });

  goodsSet.forEach((goods) => {
    const option = document.createElement("option");
    option.value = goods;
    option.textContent = goods;
    purchaseGoodsFilter.appendChild(option);
  });

  addEventListeners();
};

// Filter farmers based on the selected filters
const filterFarmers = () => {
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
  const tableBody = document.querySelector("#farmersTable tbody");
  const farmerFilterValue = document.querySelector("#farmerFilter").value;
  const locationFilterValue = document.querySelector("#locationFilter").value;
  const searchValue = document.querySelector("#nameSearch").value.toLowerCase();

  tableBody.innerHTML = "";

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      `${farmer.first_name} ${farmer.last_name}`
        .toLowerCase()
        .includes(searchValue) ||
      `${farmer.address} ${farmer.region} ${farmer.latitude} ${farmer.longitude}`
        .toLowerCase()
        .includes(searchValue);
    return (
      matchesSearch &&
      (farmerFilterValue === "" || farmer.first_name === farmerFilterValue) &&
      (locationFilterValue === "" || farmer.region === locationFilterValue)
    );
  });

  // Add filtered farmers to the table
  filteredFarmers.forEach((farmer, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${farmer.farmer_id}</td>
        <td>${farmer.first_name}</td>
        <td>${farmer.last_name}</td>
        <td>${farmer.phone}</td>
        <td>${farmer.email}</td>
        <td>${farmer.address}</td>
        <td>${farmer.region}</td>
        <td>${farmer.latitude}</td>
        <td>${farmer.longitude}</td>
        <td>${farmer.goods}</td>
        <td><button class="update-btn" data-index="${index}">Update</button></td>
        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
      `;
    tableBody.appendChild(row);
  });

  addEventListeners(filteredFarmers);
};

// Delete farmer by index
const deleteFarmer = (index) => {
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
  farmers.splice(index, 1);
  localStorage.setItem("farmers", JSON.stringify(farmers));
  loadFarmers(); // Reload farmers to reflect changes
  loadPurchases(); // Reload purchases to reflect changes in farmer IDs
};

// Add event listeners for delete and update buttons
const addEventListeners = (
  farmers = JSON.parse(localStorage.getItem("farmers")) || []
) => {
  // Delete butonlarına olay dinleyici ekle
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      deleteFarmer(index);
    });
  });

  // Add event listeners for update buttons
  const updateButtons = document.querySelectorAll(".update-btn");
  updateButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      openEditModal(index, farmers);
    });
  });
};

// Add event listeners for delete and update buttons
document
  .querySelector("#farmerFilter")
  .addEventListener("change", filterFarmers);
document
  .querySelector("#locationFilter")
  .addEventListener("change", filterFarmers);
document.querySelector("#nameSearch").addEventListener("input", filterFarmers);

loadFarmers();

// Add farmer to the local storage
const farmerForm = document.querySelector("#farmerForm");
farmerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newFarmer = {
    farmer_id: document.querySelector("#farmer_id").value,
    first_name: document.querySelector("#first_name").value,
    last_name: document.querySelector("#last_name").value,
    phone: document.querySelector("#phone").value,
    email: document.querySelector("#email").value,
    address: document.querySelector("#address").value,
    region: document.querySelector("#region").value,
    latitude: document.querySelector("#latitude").value,
    longitude: document.querySelector("#longitude").value,
    goods: document.querySelector("#goods").value,
  };

  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];

  // Check for duplicate farmer ID
  const existingFarmer = farmers.find(
    (farmer) => farmer.farmer_id === newFarmer.farmer_id
  );
  if (existingFarmer) {
    alert("A farmer with the same ID already exists.");
    return;
  }

  farmers.push(newFarmer);
  localStorage.setItem("farmers", JSON.stringify(farmers));

  loadFarmers();
  farmerForm.reset();
});

// Open edit modal window
const openEditModal = (index, farmers) => {
  const farmer = farmers[index];

  document.querySelector("#edit_farmer_id").value = farmer.farmer_id;
  document.querySelector("#edit_first_name").value = farmer.first_name;
  document.querySelector("#edit_last_name").value = farmer.last_name;
  document.querySelector("#edit_phone").value = farmer.phone;
  document.querySelector("#edit_email").value = farmer.email;
  document.querySelector("#edit_address").value = farmer.address;
  document.querySelector("#edit_region").value = farmer.region;
  document.querySelector("#edit_latitude").value = farmer.latitude;
  document.querySelector("#edit_longitude").value = farmer.longitude;
  document.querySelector("#edit_goods").value = farmer.goods;

  const modal = document.querySelector("#editModal");
  modal.style.display = "block";

  // Close modal function
  const closeModal = () => {
    modal.style.display = "none";
  };

  document.querySelector(".close").addEventListener("click", closeModal);
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Update goods options when farmer is changed in the edit modal
  const editFarmerForm = document.querySelector("#editFarmerForm");
  editFarmerForm.onsubmit = (event) => {
    event.preventDefault();

    const updatedFarmer = {
      farmer_id: document.querySelector("#edit_farmer_id").value,
      first_name: document.querySelector("#edit_first_name").value,
      last_name: document.querySelector("#edit_last_name").value,
      phone: document.querySelector("#edit_phone").value,
      email: document.querySelector("#edit_email").value,
      address: document.querySelector("#edit_address").value,
      region: document.querySelector("#edit_region").value,
      latitude: document.querySelector("#edit_latitude").value,
      longitude: document.querySelector("#edit_longitude").value,
      goods: document.querySelector("#edit_goods").value,
    };

    const existingFarmer = farmers.find(
      (farmer, idx) =>
        farmer.farmer_id === updatedFarmer.farmer_id && idx !== index
    );
    if (existingFarmer && existingFarmer.farmer_id !== farmer.farmer_id) {
      alert("A farmer with the same ID already exists.");
      return;
    }

    // Update the farmer in the original farmers array
    const originalFarmers = JSON.parse(localStorage.getItem("farmers")) || [];
    const originalIndex = originalFarmers.findIndex(
      (f) => f.farmer_id === farmer.farmer_id
    );
    if (originalIndex !== -1) {
      originalFarmers[originalIndex] = updatedFarmer;
      localStorage.setItem("farmers", JSON.stringify(originalFarmers));
    }

    // Update the farmer ID and goods in the purchases array
    const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    purchases.forEach((purchase) => {
      if (purchase.farmerId === farmer.farmer_id) {
        purchase.farmerId = updatedFarmer.farmer_id;
        purchase.goods = updatedFarmer.goods;
      }
    });
    localStorage.setItem("purchases", JSON.stringify(purchases));

    loadFarmers();
    loadPurchases(); // Reload purchases to reflect changes in farmer IDs and goods
    closeModal();
  };
};

const closeModal = () => {
  const modal = document.querySelector("#editModal");
  modal.style.display = "none";
};

// Close modal when the close button is clicked
document.querySelector(".close").addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
  const modal = document.querySelector("#editModal");
  if (event.target === modal) {
    closeModal();
  }
});

// Load purchase records from local storage
const loadPurchases = (sortField = null, sortOrder = "asc") => {
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
  const tableBody = document.querySelector("#purchasesTable tbody");
  tableBody.innerHTML = "";

  if (sortField) {
    purchases.sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }

  // Add purchase records to the table
  purchases.forEach((purchase, index) => {
    const farmer = farmers.find(
      (farmer) => farmer.farmer_id === purchase.farmerId
    );
    const farmerId = farmer ? farmer.farmer_id : purchase.farmerId;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${purchase.purchaseId}</td>
        <td>${farmerId}</td>
        <td>${purchase.goods}</td>
        <td>${purchase.purchaseDate}</td>
        <td>${purchase.quantity}</td>
        <td>${purchase.price}</td>
        <td>${purchase.totalCost}</td>
        <td><button class="update-purchase-btn" data-index="${index}">Update</button></td>
      `;
    tableBody.appendChild(row);
  });

  addPurchaseEventListeners();
};

// Add event listeners for purchase records
const addPurchaseEventListeners = () => {
  // Delete purchase buttons
  const deleteButtons = document.querySelectorAll(".delete-purchase-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      deletePurchase(index);
    });
  });

  // Update purchase buttons
  const updateButtons = document.querySelectorAll(".update-purchase-btn");
  updateButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.getAttribute("data-index");
      openEditPurchaseModal(index);
    });
  });
};

// Open edit purchase modal
const openEditPurchaseModal = (index) => {
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  const purchase = purchases[index];

  document.querySelector("#edit_purchase_id").value = purchase.purchaseId;
  document.querySelector("#edit_purchase_date").value = purchase.purchaseDate;
  document.querySelector("#edit_quantity").value = purchase.quantity;
  document.querySelector("#edit_price").value = purchase.price;

  // Populate the farmer ID select element
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
  const farmerSelect = document.querySelector("#edit_purchase_farmer_id");
  farmerSelect.innerHTML = '<option value="">Select Farmer ID</option>';
  farmers.forEach((farmer) => {
    const option = document.createElement("option");
    option.value = farmer.farmer_id;
    option.textContent = farmer.farmer_id;
    if (farmer.farmer_id === purchase.farmerId) {
      option.selected = true;
    }
    farmerSelect.appendChild(option);
  });

  // Populate the goods select element based on the selected farmer
  updateGoodsOptions(purchase.farmerId, "#edit_purchase_goods");

  const modal = document.querySelector("#editPurchaseModal");
  modal.style.display = "block";

  // Modal close function
  const closeModal = () => {
    modal.style.display = "none";
  };

  document
    .querySelector(".close-purchase")
    .addEventListener("click", closeModal);
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Update goods options when farmer is changed in the edit modal
  document
    .querySelector("#edit_purchase_farmer_id")
    .addEventListener("change", (event) => {
      updateGoodsOptions(event.target.value, "#edit_purchase_goods");
    });

  // Update purchase record
  const editPurchaseForm = document.querySelector("#editPurchaseForm");
  editPurchaseForm.onsubmit = (event) => {
    event.preventDefault();

    const updatedPurchaseId = document.querySelector("#edit_purchase_id").value;
    const updatedPurchase = {
      purchaseId: updatedPurchaseId,
      farmerId: document.querySelector("#edit_purchase_farmer_id").value,
      goods: document.querySelector("#edit_purchase_goods").value,
      purchaseDate: document.querySelector("#edit_purchase_date").value,
      quantity: document.querySelector("#edit_quantity").value,
      price: document.querySelector("#edit_price").value,
      totalCost:
        document.querySelector("#edit_quantity").value *
        document.querySelector("#edit_price").value,
    };

    // Check if purchaseId has been modified
    if (updatedPurchaseId !== purchase.purchaseId) {
      // Check for duplicate purchaseId
      const existingPurchase = purchases.find(
        (purchase, idx) =>
          purchase.purchaseId === updatedPurchaseId && idx !== index
      );
      if (existingPurchase) {
        alert("A purchase with the same ID already exists.");
        return;
      }
    }

    purchases[index] = updatedPurchase;
    localStorage.setItem("purchases", JSON.stringify(purchases));

    loadPurchases();
    calculateTotalBlueberries();
    closeModal();
  };
};

// Convert farmers data to CSV and export
const exportFarmersToCSV = () => {
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];

  if (farmers.length === 0) {
    alert("There are no farmers to export!");
    return;
  }

  // Determine the CSV headers
  const headers = [
    "Farmer ID",
    "First Name",
    "Last Name",
    "Phone",
    "Email",
    "Address",
    "Region",
    "Latitude",
    "Longitude",
    "Goods",
  ];

  // Create the CSV content
  const csvContent = [
    headers.join(","), // CSV header
    ...farmers.map((farmer) =>
      [
        farmer.farmer_id,
        farmer.first_name,
        farmer.last_name,
        farmer.phone,
        farmer.email,
        farmer.address,
        farmer.region,
        farmer.latitude,
        farmer.longitude,
        farmer.goods,
      ].join(",")
    ),
  ].join("\n");

  // Create a Blob object for the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // İndirme bağlantısını tetikle
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "farmers_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Add export button to the farmers list
const exportButton = document.createElement("button");
exportButton.textContent = "Export Farmers to CSV";
exportButton.style.marginTop = "10px";
document.querySelector("#farmerList").appendChild(exportButton);
exportButton.addEventListener("click", exportFarmersToCSV);

// Calculate the total amount of blueberries purchased
const totalBlueberriesAmount = JSON.parse(
  localStorage.getItem("totalBlueberriesAmount")
) ?? { amount: 0 };

// Add new purchase record
const purchaseForm = document.querySelector("#purchaseForm");
purchaseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Create a new purchase object
  const newPurchase = {
    purchaseId: document.querySelector("#purchaseId").value,
    farmerId: document.querySelector("#purchaseFarmerFilter").value,
    goods: document.querySelector("#purchaseGoodsFilter").value,
    purchaseDate: document.querySelector("#purchaseDate").value,
    quantity: document.querySelector("#quantity").value,
    price: document.querySelector("#price").value,
    totalCost:
      document.querySelector("#quantity").value *
      document.querySelector("#price").value,
  };

  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];

  // Check for duplicate purchaseId
  const existingPurchase = purchases.find(
    (purchase) => purchase.purchaseId === newPurchase.purchaseId
  );
  if (existingPurchase) {
    alert("A purchase with the same ID already exists.");
    return;
  }
  // Add the new purchase to the purchases array
  purchases.push(newPurchase);
  localStorage.setItem("purchases", JSON.stringify(purchases));

  totalBlueberriesAmount.amount += parseFloat(newPurchase.quantity);
  localStorage.setItem(
    "totalBlueberriesAmount",
    JSON.stringify(totalBlueberriesAmount)
  );

  // Update my balance
  let myBalance = parseFloat(localStorage.getItem("myBalance")) || 0;
  myBalance -= newPurchase.totalCost;
  localStorage.setItem("myBalance", myBalance.toFixed(2));

  loadPurchases();
  calculateTotalBlueberries();
  q;
  purchaseForm.reset();
});

// Add event listeners for purchase filters
document.querySelector("#sortPurchaseDate").addEventListener("click", () => {
  loadPurchases("purchaseDate");
});

document.querySelector("#sortPurchaseFarmer").addEventListener("click", () => {
  loadPurchases("farmerId");
});

document.querySelector("#sortPurchaseAmount").addEventListener("click", () => {
  loadPurchases("totalCost");
});

loadPurchases();

// Generate purchase summary
const generatePurchaseSummary = () => {
  const summaryType = document.querySelector("#summaryType").value;
  const summaryResult = document.querySelector("#summaryResult");
  summaryResult.innerHTML = "";

  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
  const summaryData = {};

  if (summaryType === "farmer") {
    purchases.forEach((purchase) => {
      if (!summaryData[purchase.farmerId]) {
        summaryData[purchase.farmerId] = {
          totalQuantity: 0,
          totalCost: 0,
        };
      }
      summaryData[purchase.farmerId].totalQuantity += parseFloat(
        purchase.quantity
      );
      summaryData[purchase.farmerId].totalCost += parseFloat(
        purchase.totalCost
      );
    });

    // create a summary for each farmer
    for (const farmerId in summaryData) {
      const farmer = farmers.find((f) => f.farmer_id === farmerId);
      const farmerName = farmer
        ? `${farmer.first_name} ${farmer.last_name}`
        : farmerId;
      summaryResult.innerHTML += `<p>${farmerName}: ${summaryData[
        farmerId
      ].totalQuantity.toFixed(2)} kg, $${summaryData[
        farmerId
      ].totalCost.toFixed(2)}</p>`;
    }
  } else if (summaryType === "time") {
    const startDate = new Date(
      document.querySelector("#summaryStartDate").value
    );
    const endDate = new Date(document.querySelector("#summaryEndDate").value);

    // create a summary for each date
    purchases.forEach((purchase) => {
      const purchaseDate = new Date(purchase.purchaseDate);
      if (purchaseDate >= startDate && purchaseDate <= endDate) {
        const dateKey = purchase.purchaseDate;
        if (!summaryData[dateKey]) {
          summaryData[dateKey] = {
            totalQuantity: 0,
            totalCost: 0,
          };
        }
        summaryData[dateKey].totalQuantity += parseFloat(purchase.quantity);
        summaryData[dateKey].totalCost += parseFloat(purchase.totalCost);
      }
    });

    for (const date in summaryData) {
      summaryResult.innerHTML += `<p>${date}: ${summaryData[
        date
      ].totalQuantity.toFixed(2)} kg, $${summaryData[date].totalCost.toFixed(
        2
      )}</p>`;
    }
  }
};

// Calculate the total amount of blueberries purchased
const calculateTotalBlueberries = () => {
  const totalBlueberries = JSON.parse(
    localStorage.getItem("totalBlueberriesAmount")
  ) || { amount: 0 };

  // Display the total amount of blueberries
  const blueberryDisplay = document.querySelector("#indexTotalBlueberries");
  if (blueberryDisplay) {
    blueberryDisplay.textContent = `Total Blueberries: ${totalBlueberries.amount.toFixed(
      2
    )} kg`;
  }
};

calculateTotalBlueberries();

document
  .querySelector("#generateSummary")
  .addEventListener("click", generatePurchaseSummary);

// Calculate the total expenses
const calculateTotalExpenses = () => {
  const startDate = new Date(document.querySelector("#startDate").value);
  const endDate = new Date(document.querySelector("#endDate").value);
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  let totalExpense = 0;

  purchases.forEach((purchase) => {
    const purchaseDate = new Date(purchase.purchaseDate);
    if (purchaseDate >= startDate && purchaseDate <= endDate) {
      totalExpense += parseFloat(purchase.totalCost);
    }
  });

  document.querySelector(
    "#expenseResult"
  ).textContent = `Total Expense: $${totalExpense.toFixed(2)}`;
};

document
  .querySelector("#calculateExpense")
  .addEventListener("click", calculateTotalExpenses);

// Populate goods based on selected farmer
const updateGoodsOptions = (farmerId, goodsSelectId) => {
  const farmers = JSON.parse(localStorage.getItem("farmers")) || [];
  const selectedFarmer = farmers.find(
    (farmer) => farmer.farmer_id === farmerId
  );
  const goodsSelect = document.querySelector(goodsSelectId);
  goodsSelect.innerHTML = '<option value="">Select Goods</option>';
  if (selectedFarmer) {
    const option = document.createElement("option");
    option.value = selectedFarmer.goods;
    option.textContent = selectedFarmer.goods;
    goodsSelect.appendChild(option);
  }
};

// Function to calculate the average price of blueberries
function calculateAvgPriceOfBlueberries() {
  const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
  let totalQuantity = 0;
  let totalPrice = 0;

  purchases.forEach((purchase) => {
    totalQuantity += parseFloat(purchase.quantity);
    totalPrice += parseFloat(purchase.price) * parseFloat(purchase.quantity);
  });

  return totalQuantity > 0 ? totalPrice / totalQuantity : 0;
}

// Calculate the average price of blueberries and store it in localStorage
const avgPriceOfBlueberries = calculateAvgPriceOfBlueberries();
localStorage.setItem("avgPriceOfBlueberries", avgPriceOfBlueberries.toFixed(2));

document
  .querySelector("#purchaseFarmerFilter")
  .addEventListener("change", (event) => {
    updateGoodsOptions(event.target.value, "#purchaseGoodsFilter");
  });
