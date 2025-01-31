const SHEETS_API_URL = "YOUR_SCRIPT_URL"; 

let orders = [];

async function submitForm() {
            let order = {
                            date: document.getElementById('date').value,
                            time: document.getElementById('time').value,
                            driver: document.getElementById('driver').value,
                            client: document.getElementById('client').value,
                            address: document.getElementById('address').value,
                            transportType: document.getElementById('transportType').value,
                            status: "ממתין"
            };

    orders.push(order);
            saveToGoogleSheets(order);
            updateTable();
            sendEmailNotification(order);
}

async function saveToGoogleSheets(order) {
            await fetch(SHEETS_API_URL, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(order)
            });
}

async function sendEmailNotification(order) {
            let emailBody = `📅 תאריך: ${order.date}%0A⏰ שעה: ${order.time}%0A🚛 נהג: ${order.driver}%0A👤 לקוח: ${order.client}`;
            let mailtoLink = `mailto:your_email@example.com?subject=הזמנה חדשה&body=${emailBody}`;
            window.location.href = mailtoLink;
}

function shareOnWhatsApp() {
            let message = `📢 סיכום הזמנות:%0A`;
            orders.forEach(order => {
        message += `📅 ${order.date} | ⏰ ${order.time} | 🚛 ${order.driver} | 📍 ${order.address}%0A`;
            });
            window.location.href = `https://api.whatsapp.com/send?phone=972508860896&text=${message}`;
}

function updateTable() {
            let tableBody = document.querySelector("#ordersTable tbody");
            tableBody.innerHTML = "";

    orders.forEach(order => {
                    let row = `<tr>
                                <td>${order.date}</td>
                                            <td>${order.time}</td>
                                                        <td>${order.driver}</td>
                                                                    <td>${order.client}</td>
                                                                                <td>${order.address}</td>
                                                                                            <td>${order.transportType}</td>
                                                                                                        <td>📝</td>
                                                                                                                    <td>📊 ${order.status}</td>
                                                                                                                                <td>✏️</td>
                                                                                                                                            <td>🗑️</td>
                                                                                                                                                    </tr>`;
                    tableBody.innerHTML += row;
    });
}
