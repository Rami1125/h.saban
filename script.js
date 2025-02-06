// רישום הפלאגין של DataLabels (לצורך גרף עם מספרים)
Chart.register(ChartDataLabels);

let orders = [];

/* טעינת הזמנות ששמורות ב-Local Storage (אם קיימות) */
loadOrdersFromStorage();

/* טווח שעות מ-06:00 עד 17:00 בכל חצי שעה */
const timeOptions = generateTimeSlots("06:00", "17:00", 30);

function generateTimeSlots(start, end, stepMinutes) {
  const slots = [];
  let [startHour, startMinute] = start.split(":").map(Number);
  let [endHour, endMinute] = end.split(":").map(Number);

  while (startHour < endHour || (startHour === endHour && startMinute <= endMinute)) {
    const hh = String(startHour).padStart(2, "0");
    const mm = String(startMinute).padStart(2, "0");
    slots.push(`${hh}:${mm}`);

    startMinute += stepMinutes;
    if (startMinute >= 60) {
      startHour++;
      startMinute -= 60;
    }
  }
  return slots;
}

// ממלא את ה-select בשעות האספקה
const deliveryTimeSelect = document.getElementById("deliveryTime");
timeOptions.forEach((t) => {
  const opt = document.createElement("option");
  opt.value = t;
  opt.textContent = t;
  deliveryTimeSelect.appendChild(opt);
});

// ------------------- הגדרת הגרפים (Chart.js) -------------------

const totalOrdersChart = new Chart(document.getElementById("totalOrdersChart"), {
  type: "doughnut",
  data: {
    labels: ["הזמנות"],
    datasets: [
      {
        label: "מספר כמות הזמנות",
        data: [0],
        backgroundColor: ["#007bff"],
      },
    ],
  },
  options: {
    plugins: {
      legend: { display: true },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" },
        display: true,
        formatter: (value) => value,
      },
    },
  },
});

const readyOrdersChart = new Chart(document.getElementById("readyOrdersChart"), {
  type: "doughnut",
  data: {
    labels: ["מוכנות", "לא מוכנות"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["#28a745", "#ff0000"],
      },
    ],
  },
  options: {
    plugins: {
      legend: { display: true },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" },
        display: true,
        formatter: (value) => value,
      },
    },
  },
});

const driverOrdersChart = new Chart(document.getElementById("driverOrdersChart"), {
  type: "bar",
  data: {
    labels: ["חכמת", "שאול", "עלי"],
    datasets: [
      {
        label: "מספר הזמנות",
        data: [0, 0, 0],
        backgroundColor: ["#007bff", "#28a745", "#ff0000"],
      },
    ],
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
        formatter: (value) => value,
      },
    },
  },
});

// גרף חדש: הזמנות לפי מחסן
const warehouseChart = new Chart(document.getElementById("warehouseChart"), {
  type: "bar",
  data: {
    labels: ["מחסן החרש", "מחסן התלמיד"],
    datasets: [
      {
        label: "מספר הזמנות",
        data: [0, 0], // נעדכן דינאמית
        backgroundColor: ["#ffa500", "#ff69b4"],
      },
    ],
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
        formatter: (value) => value,
      },
    },
  },
});

/* סטטוסים אפשריים (כולל 'סופקה') */
const statuses = ["מוכנה", "בטיפול", "מתעכבת", "סופקה"];

/* פונקציה שמחזירה class המתאימה לרשימה האמצעית */
function getWaitingClass(status) {
  if (status === "מוכנה")     return "waiting-ready";
  if (status === "בטיפול")    return "waiting-in-progress";
  if (status === "מתעכבת")    return "waiting-delayed";
  if (status === "סופקה")     return "waiting-supka";
  return "";
}

/* פונקציה שמחזירה את מחלקת ה-CSS הנכונה לפי הסטטוס (לטבלה) */
function getStatusClass(status) {
  if (status === "מוכנה")     return "status-ready";
  if (status === "בטיפול")    return "status-in-progress";
  if (status === "מתעכבת")    return "status-delayed";
  if (status === "סופקה")     return "status-supka";
  return "";
}

function timeToMinutes(timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  return hh * 60 + mm;
}

// ממיין את orders לפי שעת אספקה
function sortOrders() {
  orders.sort((a, b) => timeToMinutes(a.deliveryTime) - timeToMinutes(b.deliveryTime));
}

// פונקציות Local Storage
function loadOrdersFromStorage() {
  const stored = localStorage.getItem("orders");
  if (stored) {
    orders = JSON.parse(stored);
  } else {
    orders = [];
  }
}

function saveOrdersToStorage() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// עדכון הבאנר של ההזמנה הקרובה (רק הראשונה)
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

// רשימה אמצעית: הזמנות ממתינות ליציאה
// (כל ההזמנות, ממוינות מהקרובה ביותר לרחוקה)
function renderWaitingList() {
  const container = document.getElementById("waitingList");
  if (!container) return;
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "אין הזמנות ממתינות";
    return;
  }

  // פשוט נריץ על כל ההזמנות (כבר ממוינות)
  orders.forEach((o) => {
    const div = document.createElement("div");
    div.classList.add("waiting-item");
    div.classList.add(getWaitingClass(o.status));
    div.innerHTML = `
      לקוח: <b>${o.customerName}</b> | נהג: <b>${o.driverName}</b> | שעת אספקה: <b>${o.deliveryTime}</b> | סטטוס: <b>${o.status}</b>
    `;
    container.appendChild(div);
  });
}

// עדכון כל הגרפים
function updateCharts() {
  // תרשים כמות הזמנות
  totalOrdersChart.data.datasets[0].data = [orders.length];
  totalOrdersChart.update();

  // תרשים הזמנות מוכנות (נחשבות רק 'מוכנה')
  const readyCount = orders.filter((order) => order.status === "מוכנה").length;
  readyOrdersChart.data.datasets[0].data = [readyCount, orders.length - readyCount];
  readyOrdersChart.update();

  // תרשים הזמנות לפי נהג
  const drivers = ["חכמת", "שאול", "עלי"];
  const driverCounts = drivers.map(
    (driver) => orders.filter((order) => order.driverName === driver).length
  );
  driverOrdersChart.data.datasets[0].data = driverCounts;
  driverOrdersChart.update();

  // תרשים הזמנות לפי מחסן
  let countHarash = orders.filter((o) => o.warehouse === "מחסן החרש").length;
  let countTalmid = orders.filter((o) => o.warehouse === "מחסן התלמיד").length;
  warehouseChart.data.datasets[0].data = [countHarash, countTalmid];
  warehouseChart.update();
}

/* הוספת הזמנה חדשה */
function addOrder() {
  const order = {
    customerName:  document.getElementById("customerName").value,
    deliveryAddress: document.getElementById("deliveryAddress").value,
    warehouse:     document.getElementById("warehouse").value,
    transportType: document.getElementById("transportType").value,
    driverName:    document.getElementById("driverName").value,
    deliveryTime:  document.getElementById("deliveryTime").value,
    status:        "בטיפול", // ברירת מחדל
  };

  orders.push(order);
  sortOrders();
  renderOrders();
  renderWaitingList();
  updateNextOrderBanner();
  updateCharts();
  saveOrdersToStorage();
}

/* רינדור הטבלה (סוף הדף) */
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
            ${timeOptions
              .map(
                (t) =>
                  `<option value='${t}' ${
                    t === order.deliveryTime ? "selected" : ""
                  }>${t}</option>`
              )
              .join("")}
          </select>
        </td>
        <td><button onclick="updateStatus(${index})">${order.status}</button></td>
        <td><button class="delete-btn" onclick="deleteOrder(${index})">🗑</button></td>
      </tr>
    `;
  });
}

/* שינוי סטטוס ההזמנה */
function updateStatus(index) {
  const currentStatus = orders[index].status;
  const currentIndex = statuses.indexOf(currentStatus);
  orders[index].status = statuses[(currentIndex + 1) % statuses.length];

  sortOrders();
  renderOrders();
  renderWaitingList();
  updateNextOrderBanner();
  updateCharts();
  saveOrdersToStorage();
}

/* מחיקת הזמנה */
function deleteOrder(index) {
  orders.splice(index, 1);
  sortOrders();
  renderOrders();
  renderWaitingList();
  updateNextOrderBanner();
  updateCharts();
  saveOrdersToStorage();
}

/* שינוי זמן אספקה */
function updateOrderTime(index, newTime) {
  orders[index].deliveryTime = newTime;
  sortOrders();
  renderOrders();
  renderWaitingList();
  updateNextOrderBanner();
  updateCharts();
  saveOrdersToStorage();
}

/* עדכון השעון */
function updateClock() {
  document.getElementById("currentTime").innerText = new Date().toLocaleString("he-IL");
}
setInterval(updateClock, 1000);

/* רענון ראשוני */
sortOrders();
renderOrders();
renderWaitingList();
updateNextOrderBanner();
updateCharts();
