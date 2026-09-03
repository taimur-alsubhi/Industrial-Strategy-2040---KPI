const years = [
  '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029',
  '2030', '2031', '2032', '2033', '2034', '2035', '2036', '2037', '2038', '2039', '2040'
];

// جلب البيانات المخزنة مسبقاً أو استخدام البيانات الافتراضية
const savedData = localStorage.getItem('industrialDashboardData');
const datasetValues = savedData ? JSON.parse(savedData) : {
  labor: {
    label: 'مؤشر عدد العمالة (ألف عامل)',
    data: [250, 260, 270, 280, 295, 310, 320, 330, 340, 350, 360, 370, 380, 390, 398, 405, 414, 423, 432, 441, 450],
    borderColor: '#0284c7',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    tension: 0.3,
    fill: true
  },
  fdi: {
    label: 'الاستثمار الأجنبي المباشر (مليار)',
    data: [4.2, 4.7, 5.2, 5.8, 6.4, 7.0, 7.4, 7.8, 8.2, 8.7, 9.2, 9.6, 10.0, 10.5, 10.8, 11.0, 11.3, 11.6, 11.9, 12.2, 12.5],
    borderColor: '#16a34a',
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    tension: 0.3,
    fill: true
  },
  exports: {
    label: 'الصادرات السلعية غير النفطية (مليار)',
    data: [6.0, 6.7, 7.4, 8.1, 8.8, 9.5, 9.9, 10.3, 10.8, 11.3, 11.8, 12.2, 12.6, 13.0, 13.3, 13.5, 13.8, 14.1, 14.4, 14.7, 15.0],
    borderColor: '#d97706',
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    tension: 0.3,
    fill: true
  },
  gdp: {
    label: 'مساهمة الصناعة التحويلية في الناتج المحلي',
    data: [9.5, 9.9, 10.4, 10.8, 11.4, 12.0, 12.3, 12.6, 12.9, 13.2, 13.5, 13.8, 14.1, 14.4, 14.6, 14.8, 15.0, 15.3, 15.5, 15.8, 16.0],
    borderColor: '#e11d48',
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    tension: 0.3,
    fill: true
  },
  smes: {
    label: 'عدد المؤسسات الصناعية الصغيرة والمتوسطة',
    data: [3200, 3500, 3800, 4100, 4450, 4800, 5140, 5480, 5820, 6160, 6500, 6840, 7180, 7520, 7860, 8200, 8560, 8920, 9280, 9640, 10000],
    borderColor: '#9333ea',
    backgroundColor: 'rgba(147, 51, 234, 0.12)',
    borderRadius: 6
  }
};

// إنشاء الرسم البياني الرئيسي
const ctxMain = document.getElementById('mainChart').getContext('2d');
let mainChart = new Chart(ctxMain, {
  type: 'line',
  data: {
    labels: years,
    datasets: [
      datasetValues.labor,
      datasetValues.fdi,
      datasetValues.exports,
      datasetValues.gdp
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          font: { family: 'Cairo', size: 12, weight: '600' },
          boxWidth: 14,
          padding: 20
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.03)' },
        ticks: { color: '#64748b', font: { family: 'Cairo', size: 11 }, maxTicksLimit: 11 }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.03)' },
        ticks: { color: '#64748b', font: { family: 'Cairo', size: 11 } }
      }
    }
  }
});

// إنشاء رسم المؤسسات الصغيرة والمتوسطة
const ctxSmes = document.getElementById('smesChart').getContext('2d');
let smesChart = new Chart(ctxSmes, {
  type: 'bar',
  data: {
    labels: years,
    datasets: [datasetValues.smes]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          font: { family: 'Cairo', size: 12, weight: '600' },
          boxWidth: 14,
          padding: 20
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Cairo', size: 11 }, maxTicksLimit: 11 }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.03)' },
        ticks: { color: '#64748b', font: { family: 'Cairo', size: 11 } }
      }
    }
  }
});

// دالة لتحديث البطاقات العلوية بقيم سنة 2040 مع الفواصل
function updateMetricCards() {
  const lastIndex = years.length - 1;
  document.getElementById('val-labor').textContent = Number(datasetValues.labor.data[lastIndex]).toLocaleString() + ' ألف';
  document.getElementById('val-fdi').textContent = Number(datasetValues.fdi.data[lastIndex]).toLocaleString() + ' مليار';
  document.getElementById('val-exports').textContent = Number(datasetValues.exports.data[lastIndex]).toLocaleString() + ' مليار';
  document.getElementById('val-gdp').textContent = Number(datasetValues.gdp.data[lastIndex]).toLocaleString() + '%';
}

// تحديث البطاقات عند بدء التشغيل
updateMetricCards();

// التصفية في الرسم البياني الرئيسي
document.getElementById('indicatorSelect').addEventListener('change', function(e) {
  const value = e.target.value;
  let newDatasets = [];

  if (value === 'all') {
    newDatasets = [
      datasetValues.labor,
      datasetValues.fdi,
      datasetValues.exports,
      datasetValues.gdp
    ];
  } else if (datasetValues[value] && value !== 'smes') {
    newDatasets = [datasetValues[value]];
  }

  mainChart.data.datasets = newDatasets;
  mainChart.update();
});

// التعامل مع نموذج تعديل وحفظ البيانات مع التخزين الدائم
document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const indicator = document.getElementById('editIndicator').value;
  const yearIndex = parseInt(document.getElementById('editYear').value);
  
  let rawValue = document.getElementById('editValue').value;
  const cleanValue = parseFloat(rawValue.replace(/,/g, ''));

  if (!isNaN(cleanValue)) {
    datasetValues[indicator].data[yearIndex] = cleanValue;

    // حفظ التعديلات في ذاكرة المتصفح الدائمة
    localStorage.setItem('industrialDashboardData', JSON.stringify(datasetValues));

    mainChart.update();
    smesChart.update();
    updateMetricCards();

    alert('تم تحديث وحفظ بيانات المؤشر بنجاح ولن تختفي عند إغلاق الموقع!');
    populateInputValue();
  } else {
    alert('الرجاء إدخال قيمة رقمية صحيحة.');
  }
});

document.getElementById('editIndicator').addEventListener('change', populateInputValue);
document.getElementById('editYear').addEventListener('change', populateInputValue);

function populateInputValue() {
  const indicator = document.getElementById('editIndicator').value;
  const yearIndex = parseInt(document.getElementById('editYear').value);
  document.getElementById('editValue').value = datasetValues[indicator].data[yearIndex];
}

populateInputValue();
