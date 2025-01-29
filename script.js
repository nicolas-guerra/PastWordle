// Load CSV data and populate the table
document.addEventListener("DOMContentLoaded", () => {
    fetch("wordle_answers.csv")
        .then(response => response.text())
        .then(data => {
            const rows = data.split("\n").slice(1); // Skip header row
            const tableBody = document.querySelector("#wordle-table tbody");

            rows.forEach(row => {
                const cols = row.split(",");
                if (cols.length === 4) { // Ensure valid row
                    const tr = document.createElement("tr");

                    // Add only "Number", "Answer", and "Date" columns
                    [0, 2, 3].forEach(index => {
                        const td = document.createElement("td");
                        td.textContent = cols[index].trim();
                        tr.appendChild(td);
                    });

                    tableBody.appendChild(tr);
                }
            });
        });

    // Add sorting functionality
    document.getElementById("sort-chronological").addEventListener("click", () => sortTable(0)); // Sort by "Number"
    
    document.getElementById("sort-alphabetical").addEventListener("click", () => sortTable(1)); // Sort by "Answer"
});

// Function to sort the table
function sortTable(columnIndex) {
    const table = document.getElementById("wordle-table");
    
    let rows = Array.from(table.rows).slice(1); // Skip header row
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.toLowerCase();
        const cellB = b.cells[columnIndex].textContent.toLowerCase();

        return cellA.localeCompare(cellB, undefined, { numeric: true });
    });

    // Append sorted rows back to the table body
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing rows
    rows.forEach(row => tbody.appendChild(row));
}
