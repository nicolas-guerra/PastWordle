document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('wordle-table');
    const tbody = table.querySelector('tbody');

    // Fetch and parse CSV data
    fetch('wordle_answers.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            let rows = csvText.split('\n').slice(1); // Skip header row

            // Parse and sort rows in descending order by the first column (Wordle number)
            rows = rows
                .map(row => row.split(','))
                .filter(cols => cols.length === 4) // Ensure valid row structure
                .sort((a, b) => Number(b[0].trim()) - Number(a[0].trim())); // Sort numerically in descending order

            // Append sorted rows to the table
            rows.forEach(cols => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cols[0].trim()}</td>
                    <td>${cols[2].trim()}</td>
                    <td>${cols[3].trim()}</td>
                `;
                tbody.appendChild(tr);
            });

            // Set initial sorting state for the first column (Wordle number)
            const firstHeader = table.querySelector('th');
            firstHeader.setAttribute('data-order', 'desc');
            firstHeader.textContent += ' ▼'; // Indicate initial descending order
        })
        .catch(error => {
            console.error('Error loading CSV:', error);
        });

    // Add sorting functionality
    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const columnIndex = Array.from(headers).indexOf(header);
            const order = header.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
            header.setAttribute('data-order', order);

            const rows = Array.from(tbody.rows);

            rows.sort((a, b) => {
                const cellA = a.cells[columnIndex].textContent.trim();
                const cellB = b.cells[columnIndex].textContent.trim();

                if (!isNaN(cellA) && !isNaN(cellB)) { // Numeric sort
                    return order === 'asc' ? cellA - cellB : cellB - cellA;
                } else { // String sort
                    return order === 'asc'
                        ? cellA.localeCompare(cellB)
                        : cellB.localeCompare(cellA);
                }
            });

            // Update arrow direction in headers
            headers.forEach(h => h.textContent = h.textContent.replace(/ ▲| ▼/g, ''));
            header.textContent += order === 'asc' ? ' ▲' : ' ▼';

            // Rebuild tbody with sorted rows
            tbody.innerHTML = '';
            rows.forEach(row => tbody.appendChild(row));
        });
    });
});
