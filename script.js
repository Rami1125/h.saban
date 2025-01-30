// טעינת נתונים מקומיים אם קיימים
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// פונקציה להוספת הזמנה ושמירה ל-LocalStorage
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

    let newOrder = { date, time, driver, client, address, transportType };
    orders.push(newOrder);

    // שמירת הנתונים ב-LocalStorage
    localStorage.setItem('orders', JSON.stringify(orders));

    // עדכון הטבלה
    updateTable();
}

// פונקציה לטעינת הנתונים ולתצוגה בטבלה
function updateTable() {
    let tableBody = document.querySelector("#ordersTable tbody");
    tableBody.innerHTML = "";

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

// טעינת הטבלה עם הנתונים השמורים
updateTable();
