const orders = [
    { id: 1, date: '2025-01-30', time: '10:00', driver: 'חכמת', client: 'לקוח A', address: 'רחוב שלום 1', warehouse: 'מחסן 1', transportType: 'הובלה עם מנוף', status: 'יוצא בזמן' },
    { id: 2, date: '2025-01-30', time: '14:00', driver: 'עלי', client: 'לקוח B', address: 'רחוב ברוך 2', warehouse: 'מחסן 2', transportType: 'הובלת משאית', status: 'בהכנה' }
];

// הצגת ההזמנות בעמוד ניהול הזמנות
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = ''; // ניקוי התצוגה הקודמת

    orders.forEach(order => {
        const statusClass = order.status === 'יוצא בזמן' ? 'green' : order.status === 'בהכנה' ? 'yellow' : 'red';
        const orderHTML = `
            <div class="order-item">
                <span><strong>תאריך:</strong> ${order.date}</span>
                <span><strong>שעת יציאה:</strong> ${order.time}</span>
                <span><strong>נהג:</strong> ${order.driver}</span>
                <span><strong>לקוח:</strong> ${order.client}</span>
                <span><strong>כתובת:</strong> ${order.address}</span>
                <span><strong>מחסן:</strong> ${order.warehouse}</span>
                <span><strong>סוג הובלה:</strong> ${order.transportType}</span>
                <span class="status ${statusClass}">${order.status}</span>
                <button class="button edit-button" onclick="editOrder(${order.id})">עדכן</button>
                <button class="button delete-button" onclick="deleteOrder(${order.id})">מחק</button>
            </div>
        `;
        ordersList.innerHTML += orderHTML;
    });
}

// פונקציה לעדכון הזמנה
function editOrder(id) {
    const order = orders.find(o => o.id === id);
    alert(`עדכון הזמנה: ${order.client}`);
    // כאן תוכל להוסיף טופס עריכה
}

// פונקציה למחיקת הזמנה
function deleteOrder(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders.splice(index, 1);
        displayOrders(); // עדכון התצוגה אחרי מחיקה
    }
}

// הצגת ההזמנות
displayOrders();
