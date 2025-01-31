let orders = [];
let transportData = { "הובלת מנוף": 0, "הובלת משאית": 0, "עבודת מנוף": 0, "הובלת מנוף 15 מטר": 0 };

// יצירת גרף
let ctx = document.getElementById('chartCanvas').getContext('2d');
let chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: Object.keys(transportData),
        datasets: [{
            label: "כמות הזמנות לפי סוג הובלה",
            data: Object.values(transportData),
            backgroundColor: ['red', 'blue', 'green', 'orange'],
            borderWidth: 1
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

function submitForm() {
    let order = {
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        driver: document.getElementById('driver').value,
        client: document.getElementById('client').value,
        address: document.getElementById('address').value,
        transportType: document.getElementById('transportType').value,
        note: "" // הערה ריקה כברירת מחדל
    };

    orders.push(order);
    transportData[order.transportType]++;
    updateTable();
    chart.data.datasets[0].data = Object.values(transportData);
    chart.update();
}

function updateTable() {
    let tableBody = document.querySelector("#ordersTable tbody");
    tableBody.innerHTML = "";

    orders.forEach((order, index) => {
        let row = `<tr>
            <td>${order.date}</td>
            <td>${order.time}</td>
            <td>${order.driver}</td>
            <td>${order.client}</td>
            <td>${order.address}</td>
            <td>${order.transportType}</td>
            <td><input type="text" value="${order.note}" onchange="updateNote(${index}, this.value)"></td>
            <td><button class="edit-btn" onclick="editOrder(${index})">✏️</button></td>
            <td><button class="delete-btn" onclick="deleteOrder(${index})">🗑️</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function deleteOrder(index) {
    transportData[orders[index].transportType]--;
    orders.splice(index, 1);
    updateTable();
    chart.update();
}

function updateNote(index, value) {
    orders[index].note = value;
}

function editOrder(index) {
    alert("עריכת הזמנה תתווסף בקרוב!");
}

updateTable();
let transportData = { "הובלת מנוף": 0, "הובלת משאית": 0, "עבודת מנוף": 0, "הובלת מנוף 15 מטר": 0 };

// יצירת גרף
let ctx = document.getElementById('chartCanvas').getContext('2d');
let chart = new Chart(ctx, {
        type: 'bar',
        data: {
                    labels: Object.keys(transportData),
                    datasets: [{
                                    label: "כמות הזמנות לפי סוג הובלה",
                                    data: Object.values(transportData),
                                    backgroundColor: ['red', 'blue', 'green', 'orange'],
                                    borderWidth: 1
                    }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

function submitForm() {
        let order = {
                    date: document.getElementById('date').value,
                    time: document.getElementById('time').value,
                    driver: document.getElementById('driver').value,
                    client: document.getElementById('client').value,
                    address: document.getElementById('address').value,
                    transportType: document.getElementById('transportType').value,
                    note: "" // הערה ריקה כברירת מחדל
        };

    orders.push(order);
        transportData[order.transportType]++;
        updateTable();
        chart.data.datasets[0].data = Object.values(transportData);
        chart.update();
}

function updateTable() {
        let tableBody = document.querySelector("#ordersTable tbody");
        tableBody.innerHTML = "";

    orders.forEach((order, index) => {
                let row = `<tr>
                            <td>${order.date}</td>
                                        <td>${order.time}</td>
                                                    <td>${order.driver}</td>
                                                                <td>${order.client}</td>
                                                                            <td>${order.address}</td>
                                                                                        <td>${order.transportType}</td>
                                                                                                    <td><input type="text" value="${order.note}" onchange="updateNote(${index}, this.value)"></td>
                                                                                                                <td><button class="edit-btn" onclick="editOrder(${index})">✏️</button></td>
                                                                                                                            <td><button class="delete-btn" onclick="deleteOrder(${index})">🗑️</button></td>
                                                                                                                                    </tr>`;
                tableBody.innerHTML += row;
    });
}

function deleteOrder(index) {
        transportData[orders[index].transportType]--;
        orders.splice(index, 1);
        updateTable();
        chart.update();
}

function updateNote(index, value) {
        orders[index].note = value;
}

function editOrder(index) {
        alert("עריכת הזמנה תתווסף בקרוב!");
}

updateTable();
