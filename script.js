// רישום הפלאגין של DataLabels (לצורך גרף עם מספרים)
Chart.register(ChartDataLabels);

let orders = [];

/* טוענים הזמנות ששמורות ב-Local Storage (אם קיימות) */
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

// סטטוסים אפשריים (כולל 'סופקה')
const statuses = ["מוכנה", "בטיפול", "מתעכבת", "סופקה"];

/* עבור הזמנות בראש הדף - אימוג'י בצבע סטטוס + הבהוב */
function getEmojiForStatus(status) {
  switch (status) {
    case "מוכנה":     return "<span class='blink-emoji'>🟢</span>";
    case "בטיפול":    return "<span class='blink-emoji'>🟡</span>";
    case "מתעכבת":    return "<span class='blink-emoji'>🔴</span>";
    case "סופקה":     return "<span class='blink-emoji'>🟣</span>";
    default:          return "";
  }
}

// פונקציה שמחזירה את מחלקת ה-CSS הנכונה לפי הסטטוס (בלי הבהוב)
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

// מציג עד 3 הזמנות בראש הדף עם אימוג׳י מהבהב לפי סטטוס
function updateUpcomingOrdersList() {
  const container = document.getElementById("upcomingOrdersList");
  if (!container) return;

  container.innerHTML = "";
  if (orders.length === 0) {
    container.innerHTML = "אין הזמנות";
    return;
  }

  // ניקח את ההזמנות הראשונות (3 במקרה זה) אחרי שמיין
  const maxShow = Math.min(orders.length, 3);
  for (let i = 0; i < maxShow; i++) {
    const o = orders[i];
    const circle = getEmojiForStatus(o.status);
    const div = document.createElement("div");
    div.className = "mini-order-line";
 
