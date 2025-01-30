// שמירת הנתונים
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

// פונקציה לשליחת הטופס ועדכון הגרף
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

    // עדכון הנתונים
    transportData[transportType]++;
    chart.data.datasets[0].data = Object.values(transportData);
    chart.update();

    // הצגת הנתונים על המסך
    document.getElementById('summary').innerHTML = `
        <h3>📋 פרטי ההזמנה:</h3>
        <p><strong>📅 תאריך:</strong> ${date}</p>
        <p><strong>⏰ שעת יציאה:</strong> ${time}</p>
        <p><strong>🚛 שם נהג:</strong> ${driver}</p>
        <p><strong>👤 שם לקוח:</strong> ${client}</p>
        <p><strong>📍 כתובת אספקה:</strong> ${address}</p>
        <p><strong>🚚 סוג הובלה:</strong> ${transportType}</p>
    `;
}
