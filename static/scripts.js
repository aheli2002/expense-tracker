// Function to add a new expense
async function addExpense() {
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (amount && category && date) {
        try {
            const response = await fetch('/add_expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, category, date })
            });

            if (response.ok) {
                getExpenses(); // Refresh the list of expenses
                clearForm();
            } else {
                alert('Failed to add expense.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the expense.');
        }
    } else {
        alert('Please fill in all fields.');
    }
}

// Function to get and display expenses
async function getExpenses() {
    try {
        const response = await fetch('/get_expenses');
        if (response.ok) {
            const expenses = await response.json();
            displayExpenses(expenses);
        }
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

// Function to display expenses in the list
function displayExpenses(expenses) {
    const expenseListDiv = document.getElementById('expense-list');
    const summaryDiv = document.getElementById('monthly-summary');
    expenseListDiv.innerHTML = '';

    let total = 0;
    expenses.forEach(expense => {
        total += expense.amount;
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <p>Amount: ₹${expense.amount.toFixed(2)}</p>
            <p>Category: ${expense.category}</p>
            <p>Date: ${expense.date}</p>
        `;
        expenseListDiv.appendChild(expenseItem);
    });

    summaryDiv.innerHTML = `<p>Total: ₹${total.toFixed(2)}</p>`;

    if (expenses.length === 0) {
        expenseListDiv.innerHTML = '<p>No expenses added yet.</p>';
    }
}

// Clear form fields after adding expense
function clearForm() {
    document.getElementById('amount').value = '';
    document.getElementById('category').value = 'Food';
    document.getElementById('date').value = '';
}

// Filter expenses by category and/or month
async function filterExpenses() {
    const category = document.getElementById('filter-category').value;
    const month = document.getElementById('filter-month').value;

    try {
        const response = await fetch('/filter_expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category, month })
        });

        if (response.ok) {
            const filteredExpenses = await response.json();
            displayExpenses(filteredExpenses);
        } else {
            alert('Failed to filter expenses.');
        }
    } catch (error) {
        console.error('Error filtering expenses:', error);
    }
}

// Load expenses on page load
window.onload = getExpenses;
