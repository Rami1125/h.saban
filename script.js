let orders = [];
let transportData = {};

let driverChart = new Chart(document.getElementById('driverChart').getContext('2d'), {
        type: 'bar',
        data: {
                    labels: [],
                    datasets: [{
                                    label: "מספר הזמנות לפי נהג",
                                    data: [],
                                    backgroundColor: ['red', 'blue', 'green'],
                                    borderWidth: 1
                    }]
        }
});

function submitForm() {
        let order = {
                    date: document.getElementById('date').value,
                    time: document.getElementById('time').value,
                    driver: document.getElementById('driver').value,
                    client: document.getElementById('client').value,
                    address: document.getElementById('address').value,
                    transportType: document.getElementById('transportType').value,
                    status: "ממתין" // ברירת מחדל
        };

    orders.push(order);
        updateTable();
        updateChart();
}

function updateTable() {
        let tableBody = document.querySelector("#ordersTable tbody");
        tableBody.innerHTML = "";

    orders.forEach((order, index) => {
                let statusClass = getStatusClass(order.status);
                let row = `<tr>
                            <td>${order.date}</td>
                                        <td>${order.time}</td>
                                                    <td>${order.driver}</td>
                                                                <td>${order.client}</td>
                                                                            <td>${order.address}</td>
                                                                                        <td>${order.transportType}</td>
                                                                                                    <td><input type="text" value="${order.note || ''}" onchange="updateNote(${index}, this.value)"></td>
                                                                                                                <td>
                                                                                                                                <select onchange="updateStatus(${index}, this.value)">
                                                                                                                                                    <option value="מוכן">🟢 מוכן</option>
                                                                                                                                                                        <option value="ממתין">🟡 ממתין</option>
                                                                                                                                                                                            <option value="מתעכב">🔴 מתעכב</option>
                                                                                                                                                                                                                <option value="נדחה">🟠 נדחה</option>
                                                                                                                                                                                                                                </select>
                                                                                                                                                                                                                                                <span class="status ${statusClass}">${order.status}</span>
                                                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                                                                        <td><button class="edit-btn" onclick="editOrder(${index})">✏️</button></td>
                                                                                                                                                                                                                                                                                    <td><button class="delete-btn" onclick="deleteOrder(${index})">🗑️</button></td>
                                                                                                                                                                                                                                                                                            </tr>`;
                tableBody.innerHTML += row;
    });
}

function updateChart() {
        driverChart.data.labels = orders.map(order => order.driver);
        driverChart.data.datasets[0].data = orders.map(order => order.time);
        driverChart.update();
}

function getStatusClass(status) {
        return status === "מוכן" ? "green" : status === "ממתין" ? "yellow" : status === "מתעכב" ? "red" : "orange";
}

function deleteOrder(index) {
        orders.splice(index, 1);
        updateTable();
        updateChart();
}

updateTable();
