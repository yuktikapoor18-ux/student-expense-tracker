const form = document.getElementById("expenseForm");

const expenseInput = document.getElementById("expense");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");

const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");
const sortBy = document.getElementById("sortBy");

const clearButton = document.getElementById("clearButton");
const exportButton = document.getElementById("exportButton");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

const formTitle = document.getElementById("formTitle");
const emptyMessage = document.getElementById("emptyMessage");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

let editingIndex = null;


// Save expenses to Local Storage
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}


// Display expenses
function displayExpenses() {

    expenseList.innerHTML = "";

    let filteredExpenses = [...expenses];

    // Search
    const searchText = searchInput.value.toLowerCase().trim();

    if (searchText !== "") {
        filteredExpenses = filteredExpenses.filter(function(expense) {
            return expense.name.toLowerCase().includes(searchText);
        });
    }


    // Category filter
    const selectedCategory = filterCategory.value;

    if (selectedCategory !== "All") {
        filteredExpenses = filteredExpenses.filter(function(expense) {
            return expense.category === selectedCategory;
        });
    }


    // Sorting
    const selectedSort = sortBy.value;

    if (selectedSort === "newest") {

        filteredExpenses.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

    } else if (selectedSort === "oldest") {

        filteredExpenses.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });

    } else if (selectedSort === "high") {

        filteredExpenses.sort(function(a, b) {
            return Number(b.amount) - Number(a.amount);
        });

    } else if (selectedSort === "low") {

        filteredExpenses.sort(function(a, b) {
            return Number(a.amount) - Number(b.amount);
        });
    }


    // Create expense elements
    filteredExpenses.forEach(function(expense) {

        const originalIndex = expenses.indexOf(expense);

        const expenseItem = document.createElement("div");

        expenseItem.classList.add("expense-item");


        // Left side
        const expenseInfo = document.createElement("div");

        expenseInfo.classList.add("expense-info");

        const nameElement = document.createElement("strong");

        nameElement.textContent = expense.name;

        const detailsElement = document.createElement("small");

        detailsElement.textContent =
            expense.category + " • " + expense.date;

        expenseInfo.appendChild(nameElement);

        expenseInfo.appendChild(document.createElement("br"));

        expenseInfo.appendChild(detailsElement);


        // Right side
        const expenseRight = document.createElement("div");

        expenseRight.classList.add("expense-right");


        const amountElement = document.createElement("span");

        amountElement.classList.add("expense-amount");

        amountElement.textContent = "₹" + expense.amount;


        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.classList.add("edit-btn");

        editButton.textContent = "Edit";

        editButton.dataset.index = originalIndex;


        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.classList.add("delete-btn");

        deleteButton.textContent = "Delete";

        deleteButton.dataset.index = originalIndex;


        expenseRight.appendChild(amountElement);

        expenseRight.appendChild(editButton);

        expenseRight.appendChild(deleteButton);


        expenseItem.appendChild(expenseInfo);

        expenseItem.appendChild(expenseRight);

        expenseList.appendChild(expenseItem);


        // Edit button
        editButton.addEventListener("click", function() {
            startEditing(originalIndex);
        });


        // Delete button
        deleteButton.addEventListener("click", function() {
            deleteExpense(originalIndex);
        });

    });


    // Empty message
    if (filteredExpenses.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }


    // Dashboard
    let total = 0;

    expenses.forEach(function(expense) {
        total += Number(expense.amount);
    });

    totalAmount.textContent = total;

    expenseCount.textContent = expenses.length;
}


// Add or update expense
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const expenseName = expenseInput.value.trim();

    const amount = Number(amountInput.value);

    const category = categoryInput.value;

    const date = dateInput.value;


    if (expenseName === "") {
        alert("Please enter an expense name.");
        return;
    }


    if (amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }


    if (date === "") {
        alert("Please select a date.");
        return;
    }


    const expenseData = {
        name: expenseName,
        amount: amount,
        category: category,
        date: date
    };


    // Update existing expense
    if (editingIndex !== null) {

        expenses[editingIndex] = expenseData;

        editingIndex = null;

        formTitle.textContent = "Add Expense";

        submitButton.textContent = "Add Expense";

        cancelButton.classList.add("hidden");

    } else {

        // Add new expense
        expenses.push(expenseData);
    }


    saveExpenses();

    form.reset();

    displayExpenses();
});


// Start editing
function startEditing(index) {

    const expense = expenses[index];

    expenseInput.value = expense.name;

    amountInput.value = expense.amount;

    categoryInput.value = expense.category;

    dateInput.value = expense.date;

    editingIndex = index;

    formTitle.textContent = "Edit Expense";

    submitButton.textContent = "Update Expense";

    cancelButton.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Cancel editing
cancelButton.addEventListener("click", function() {

    editingIndex = null;

    form.reset();

    formTitle.textContent = "Add Expense";

    submitButton.textContent = "Add Expense";

    cancelButton.classList.add("hidden");
});


// Delete expense
function deleteExpense(index) {

    const confirmed = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
        return;
    }

    expenses.splice(index, 1);

    saveExpenses();

    displayExpenses();
}


// Search
searchInput.addEventListener("input", displayExpenses);


// Category filter
filterCategory.addEventListener("change", displayExpenses);


// Sort
sortBy.addEventListener("change", displayExpenses);


// Clear all
clearButton.addEventListener("click", function() {

    if (expenses.length === 0) {
        alert("There are no expenses to clear.");
        return;
    }

    const confirmed = confirm(
        "Delete all expenses? This cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    expenses = [];

    saveExpenses();

    displayExpenses();
});


// Export CSV
exportButton.addEventListener("click", function() {

    if (expenses.length === 0) {
        alert("Add some expenses before exporting.");
        return;
    }

    let csv = "Expense,Amount,Category,Date\n";

    expenses.forEach(function(expense) {

        csv +=
            '"' + expense.name + '",' +
            '"' + expense.amount + '",' +
            '"' + expense.category + '",' +
            '"' + expense.date + '"\n';
    });


    const blob = new Blob(
        [csv],
        { type: "text/csv" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "student-expenses.csv";

    link.click();

    URL.revokeObjectURL(url);
});


// Display saved expenses when page loads
displayExpenses();
