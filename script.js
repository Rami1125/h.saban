// מערך לשמירת ההזמנות
let orders = [];

// אובייקט לשמירת ספירת סוגי הובלות
let transportData = {
    "הובלת מנוף": 0,
    "הובלת משאית": 0,
    "עבודת מנוף": 0,
    "הובלת מנוף 15 מטר": 0
};

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
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

// פונקציה להוספת הזמנה
function submitForm() {
    let date = document.getElementById('date').value;
    let time = document.getElementById('time').value;
    let driver = document.getElementById('driver').value;
    let client = document.getElementById('client').value;
    let address = document.getElementById('address').value;
    let transportType = document.getElementById('transportType').value;

    if (!date || !time || !client || !address) {
        alert("אנא מלא את כל השדות!");
        return;
    }

    // הוספת הנתונים למערך
    let newOrder = {
        date,
        time,
        driver,
        client,
        address,
        transportType
    };
    orders.push(newOrder);

    // עדכון ספירת סוגי הובלות
    transportData[transportType]++;

    // עדכון הטבלה
    updateTable();

    // עדכון הגרף
    chart.data.datasets[0].data = Object.values(transportData);
    chart.update();
}

// פונקציה לעדכון הטבלה עם הנתונים החדשים
function updateTable() {
    let tableBody = document.querySelector("#ordersTable tbody");
    tableBody.innerHTML = ""; // ניקוי הטבלה לפני מילוי מחדש

    orders.forEach(order => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.date}</td>
            <td>${order.time}</td>
            <td>${order.driver}</td>
            <td>${order.client}</td>
            <td>${order.address}</td>
            <td>${order.transportType}</td>
        `;
        tableBody.appendChild(row);
    });
}
