// רישום הפלאגין של DataLabels
Chart.register(ChartDataLabels);

let orders = [];

// טווח שעות מ-06:00 עד 17:00 בכל חצי שעה
const timeOptions = generateTimeSlots("06:00", "17:00", 30);

// פונקציה ליצירת רשימת זמני חצי שעה
function generateTimeSlots(start, end, stepMinutes) {
  const slots = [];
  let startParts = start.split(":");
  let endParts = end.split(":");

  let startHour = parseInt(startParts[0]);
  let startMinute = parseInt(startParts[1]);
  let endHour = parseInt(endParts[0]);
  let endMinute = parseInt(endParts[1]);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    const hh = String(currentHour).padStart(2, "0");
    const mm = String(currentMinute).padStart(2, "0");
    slots.push(`${hh}:${mm}`);

    // הוספת דקות
    currentMinute += stepMinutes;
    if (currentMinute >= 60) {
      currentHour++;
      currentMinute -= 60;
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

// תרשים: כמות הזמנות
const totalOrdersChart = new Chart(document.getElementById("totalOrdersChart"), {
  type: "doughnut",
  data: {
    labels: ["הזמנות"],
    datasets: [
      {
        label: "מספר כמות הזמנות", // תווית לגרף
        data: [0],
        backgroundColor: ["#007bff"],
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
        },
        display: true,
        formatter: (value, ctx) => {
          return value;
        },
      },
    },
  },
});

// תרשים: הזמנות מוכנות לעומת לא מוכנות
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
      legend: {
        display: true,
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
        },
        display: true,
        formatter: (value, ctx) => {
          return value;
        },
      },
    },
  },
});

// תרשים: הזמנות לפי נהג
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
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      datalabels: {
        color: "#000",
        font: {
          weight: "bold",
        },
        anchor: "end",
        align: "top",
        display: true,
        formatter: (value, ctx) => {
          return value;
        },
      },
    },
  },
});

// הוספנו 'סופקה' כסטטוס נוסף
const statuses = ["מוכנה", "בטיפול", "מתעכבת", "סופקה"];

// פונקציה שמחזירה את מחלקת ה-CSS הנכונה לפי הסטטוס
function getStatusClass(status) {
  if (status === "מוכנה") return "status-ready";
  if (status === "בטיפול") return "status-in-progress";
  if (status === "מתעכבת") return "status-delayed";
  if (status === "סופקה") return "status-supka";
  return "";
}

// ממיר 'HH:MM' לדקות
function timeToMinutes(timeStr) {
  const [hh, mm] = timeStr.split(":");
  return parseInt(hh) * 60 + parseInt(mm);
}

// ממיין את orders לפי שעת אספקה
function sortOrders() {
  orders.sort((a, b) => timeToMinutes(a.deliveryTime) - timeToMinutes(b.deliveryTime));
}

// עדכון הבאנר של ההזמנה הקרובה
function updateNextOrderBanner() {
  const nextOrderDiv = document.getElementById("nextOrderInfo");
  if (!nextOrderDiv) return;

  if (orders.length === 0) {
    nextOrderDiv.innerHTML = "אין הזמנות כרגע";
    return;
  }

  // לאחר המיון, ההזמנה הקרובה ביותר תהיה orders[0]
  const earliest = orders[0];
  nextOrderDiv.innerHTML = `לקוח: ${earliest.customerName}, נהג: ${earliest.driverName}`;
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
}

// הוספת הזמנה חדשה
function addOrder() {
  const order = {
    customerName: document.getElementById("customerName").value,
    deliveryAddress: document.getElementById("deliveryAddress").value,
    warehouse: document.getElementById("warehouse").value,
    transportType: document.getElementById("transportType").value,
    driverName: document.getElementById("driverName").value,
    deliveryTime: document.getElementById("deliveryTime").value,
    status: "בטיפול", // ברירת מחדל להזמנה חדשה
  };

  orders.push(order);
  sortOrders();
  renderOrders();
  updateNextOrderBanner();
  updateCharts();
}

// הצגת ההזמנות בטבלה
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

// שינוי סטטוס ההזמנה
function updateStatus(index) {
  const currentStatus = orders[index].status;
  const currentIndex = statuses.indexOf(currentStatus);
  orders[index].status = statuses[(currentIndex + 1) % statuses.length];

  sortOrders();
  renderOrders();
  updateNextOrderBanner();
  updateCharts();
}

// מחיקת הזמנה
function deleteOrder(index) {
  orders.splice(index, 1);
  sortOrders();
  renderOrders();
  updateNextOrderBanner();
  updateCharts();
}

// שינוי זמן אספקה דינמי
function updateOrderTime(index, newTime) {
  orders[index].deliveryTime = newTime;
  sortOrders();
  renderOrders();
  updateNextOrderBanner();
  updateCharts();
}

// עדכון השעון
function updateClock() {
  document.getElementById("currentTime").innerText = new Date().toLocaleString("he-IL");
}
setInterval(updateClock, 1000);
