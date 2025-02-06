// רישום הפלאגין של DataLabels
Chart.register(ChartDataLabels);

let orders = [];

// 1) נטען הזמנות ששמורות ב-Local Storage
loadOrdersFromStorage();

// 2) טווח שעות מ-06:00 עד 17:00 בכל חצי שעה
const timeOptions = generateTimeSlots("06:00", "17:00", 30);

function generateTimeSlots(start, end, stepMinutes) {
  const slots = [];
  let [startHour, startMin] = start.split(":").map(Number);
  let [endHour, endMin] = end.split(":").map(Number);

  while (startHour < endHour || (startHour === endHour && startMin <= endMin)) {
    const hh = String(startHour).padStart(2, "0");
    const mm = String(startMin).padStart(2, "0");
    slots.push(`${hh}:${mm}`);

    startMin += stepMinutes;
    if (startMin >= 60) {
      startHour++;
      startMin -= 60;
    }
  }
  return slots;
}

// ממלא את select בשעות האספקה
const deliveryTimeSelect = document.getElementById("deliveryTime");
timeOptions.forEach(t => {
  const opt = document.createElement("option");
  opt.value = t;
  opt.textContent = t;
  deliveryTimeSelect.appendChild(opt);
});

// הגדרת הגרפים
const totalOrdersChart = new Chart(document.getElementById("totalOrdersChart"), {
  type: "doughnut",
  data: {
    labels: ["הזמנות"],
    datasets: [{
      label: "מספר כמות הזמנות",
      data: [0],
      backgroundColor: ["#007bff"]
    }]
  },
  options: {
    plugins: {
      legend: { display: true },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" },
        display: true,
        formatter: value => value
      }
    }
  }
});

const readyOrdersChart = new Chart(document.getElementById("readyOrdersChart"), {
  type: "doughnut",
  data: {
    labels: ["מוכנות", "לא מוכנות"],
    datasets: [{
      data: [0, 0],
      backgroundColor: ["#28a745", "#ff0000"]
    }]
  },
  options: {
    plugins: {
      legend: { display: true },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" },
        display: true,
        formatter: value => value
      }
    }
  }
});

const driverOrdersChart = new Chart(document.getElementById("driverOrdersChart"), {
  type: "bar",
  data: {
    labels: ["חכמת", "שאול", "עלי"],
    datasets: [{
      label: "מספר הזמנות",
      data: [0, 0, 0],
      backgroundColor: ["#007bff", "#28a745", "#ff0000"]
    }]
  },
  options: {
    scales: { y: { beginAtZero: true } },
    plugins: {
      datalabels: {
        color: "#000",
        font: { weight: "bold" },
        anchor: "end",
        align: "top",
        display: true,
        formatter: value => value
      }
    }
  }
});

const warehouseChart = new Chart(document.getElementById("warehouseChart"), {
  type: "bar",
  data: {
    labels: ["מחסן החרש", "מחסן התלמיד"],
    datasets: [{
      label: "מספר הזמנות",
      data: [0, 0],
      backgroundColor: ["#ffa500", "#ff69b4"]
    }]
  },
  options: {
    scales: { y: { beginAtZero: true } },
    plugins: {
      legend: { display: true },
      datalabels: {
        color: "#000",
        font: { weight: "bold" },
        anchor: "end",
        align: "top",
        display: true,
        formatter: value => value
      }
    }
  }
});

// גרף הזמנות שסופקה לפי נהג
const providedOrdersChart = new Chart(document.getElementById("providedOrdersChart"), {
  type: "bar",
  data: {
    labels: ["חכמת", "שאול", "עלי"],
    datasets: [{
      label: "סופקה לכל נהג",
      data: [0, 0, 0],
      backgroundColor: ["#FFD700", "#8B00FF", "#00CED1"]
    }]
  },
  options: {
    scales: { y: { beginAtZero: true } },
    plugins: {
      legend: { display: true },
      datalabels: {
        color: "#000",
        font: { weight: "bold" },
        anchor: "end",
        align: "top",
        display: true,
        formatter: value => value
      }
    }
  }
});

/* סטטוסים אפשריים */
const statuses = ["מוכנה", "בטיפול", "מתעכבת", "סופקה"];

/* מחלקות צבע לטבלה ולרשימה האמצעית */
function getStatusClass(status) {
  if (status === "מוכנה")     return "status-ready";
  if (status === "בטיפול")    return "status-in-progress";
  if (status === "מתעכבת")    return "status-delayed";
  if (status === "סופקה")     return "status-supka";
  return "";
}
function getWaitingClass(status) {
  if (status === "מוכנה")     return "waiting-ready";
  if (status === "בטיפול")    return "waiting-in-progress";
  if (status === "מתעכבת")    return "waiting-delayed";
  if (status === "סופקה")     return "waiting-supka";
  return "";
}

// המרה של 'HH:MM' למספר דקות
function timeToMinutes(timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  return hh * 60 + mm;
}

// מיון הרשימה
function sortOrders() {
  orders.sort((a, b) => timeToMinutes(a.deliveryTime) - timeToMinutes(b.deliveryTime));
}

// שמירה/טעינה מ-Local Storage
function loadOrdersFromStorage() {
  const stored = localStorage.getItem("orders");
  orders = stored ? JSON.parse(stored) : [];
}
function saveOrdersToStorage() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// הזמנה הקרובה ביותר
function updateNextOrderBanner() {
  const nextOrderDiv = document.getElementById("nextOrderInfo");
  if (!nextOrderDiv) return;
  
  if (orders.length === 0) {
    nextOrderDiv.innerHTML = "אין הזמנות כרגע";
    return;
  }
  const earliest = orders[0];
  nextOrderDiv.innerHTML = `לקוח: ${earliest.customerName}, נהג: ${earliest.driverName}`;
}

// רשימה אמצעית (ממתינות ליציאה)
function renderWaitingList() {
  const container = document.getElementById("waitingList");
  if (!container) return;
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "אין הזמנות ממתינות";
    return;
  }
  orders.forEach(o => {
    const div = document.createElement("div");
    div.className = `waiting-item ${getWaitingClass(o.status)}`;
    div.innerHTML = `
      לקוח: <b>${o.customerName}</b> | נהג: <b>${o.driverName}</b> | שעת אספקה: <b>${o.deliveryTime}</b> | סטטוס: <b>${o.status}</b>
    `;
    container.appendChild(div);
  });
}

// עדכון כל הגרפים
function updateCharts() {
  // כמות הזמנות
  totalOrdersChart.data.datasets[0].data = [orders.length];
  totalOrdersChart.update();

  // מוכנות
  const readyCount = orders.filter(o => o.status === "מוכנה").length;
  readyOrdersChart.data.datasets[0].data = [readyCount, orders.length - readyCount];
  readyOrdersChart.update();

  // לפי נהג
  const drivers = ["חכמת", "שאול", "עלי"];
  const driverCounts = drivers.map(d => orders.filter(o => o.driverName === d).length);
  driverOrdersChart.data.datasets[0].data = driverCounts;
  driverOrdersChart.update();

  // לפי מחסן
  const countHarash = orders.filter(o => o.warehouse === "מחסן החרש").length;
  const countTalmid = orders.filter(o => o.warehouse === "מחסן התלמיד").length;
  warehouseChart.data.datasets[0].data = [countHarash, countTalmid];
  warehouseChart.update();

  // גרף הזמנות שסופקה לפי נהג
  const supkaCounts = drivers.map(d => orders.filter(o => o.status === "סופקה" && o.driverName === d).length);
  providedOrdersChart.data.datasets[0].data = supkaCounts;
  providedOrdersChart.update();
}

// פונקציית רינדור טבלת ההזמנות המלאה
function renderOrders() {
  const tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML = "";

  orders.forEach((order, index) => {
    tbody.innerHTML += `
      <tr class="${getStatusClass(order.status)}">
        <td>${order.customerName}</td>
        <td>${order.deliveryAddress}</td>
        <td>${order.warehouse}</td>
        <td>${order.transportType}</td>
        <td>${order.driverName}</td>
        <td>
          <select onchange="updateOrderTime(${index}, this.value)">
            ${timeOptions.map(t => `<option value="${t}" ${t===order.deliveryTime?'selected':''}>${t}</option>`).join('')}
          </select>
        </td>
        <td><button onclick="updateStatus(${index})">${order.status}</button></td>
        <td><button class="delete-btn" onclick="deleteOrder(${index})">🗑</button></td>
      </tr>
    `;
  });
}

// טבלת ההזמנות שסופקה (בתחתית)
function renderProvidedOrders() {
  const tableBody = document.querySelector("#providedOrdersTable tbody");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  // מסנן רק הזמנות שסופקה
  const provided = orders.filter(o => o.status === "סופקה");

  provided.forEach(o => {
    tableBody.innerHTML += `
      <tr>
        <td>${o.customerName}</td>
        <td>${o.warehouse}</td>
        <td>${o.driverName}</td>
        <td>${o.deliveryTime}</td>
      </tr>
    `;
  });
}

/* הוספת הזמנה חדשה */
function addOrder() {
  const order = {
    customerName: document.getElementById("customerName").value,
    deliveryAddress: document.getElementById("deliveryAddress").value,
    warehouse: document.getElementById("warehouse").value,
    transportType: document.getElementById("transportType").value,
    driverName: document.getElementById("driverName").value,
    deliveryTime: document.getElementById("deliveryTime").value,
    status: "בטיפול"
  };

  orders.push(order);
  sortOrders();
  renderAll();
  saveOrdersToStorage();
}

/* שינוי סטטוס ההזמנה */
function updateStatus(index) {
  const currentStatus = orders[index].status;
  const currentIndex = statuses.indexOf(currentStatus);
  orders[index].status = statuses[(currentIndex+1) % statuses.length];

  sortOrders();
  renderAll();
  saveOrdersToStorage();
}

/* מחיקת הזמנה */
function deleteOrder(index) {
  orders.splice(index, 1);
  sortOrders();
  renderAll();
  saveOrdersToStorage();
}

/* שינוי זמן אספקה */
function updateOrderTime(index, newTime) {
  orders[index].deliveryTime = newTime;
  sortOrders();
  renderAll();
  saveOrdersToStorage();
}

/* פונקציית עזר שמעדכנת הכל */
function renderAll() {
  renderOrders();
  renderWaitingList();
  renderProvidedOrders();
  updateNextOrderBanner();
  updateCharts();
}

// שעון רץ
function updateClock() {
  document.getElementById("currentTime").innerText = new Date().toLocaleString("he-IL");
}
setInterval(updateClock, 1000);

// בהפעלה הראשונית
sortOrders();
renderAll();
