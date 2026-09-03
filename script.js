const years = [
  '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029',
  '2030', '2031', '2032', '2033', '2034', '2035', '2036', '2037', '2038', '2039', '2040'
];

// جلب البيانات المخزنة مسبقاً أو استخدام البيانات الافتراضية
const savedData = localStorage.getItem('industrialDashboardData');
const datasetValues = savedData ? JSON.parse(savedData) : {
  labor: {
    label: 'مؤشر عدد العمالة',
    target: [250, 260, 270, 280, 295, 310, 320, 330, 340, 350, 360, 370, 380, 390, 398, 405, 414, 423, 432, 441, 450],
    achieved: [240, 255, 265, 275, 290, 305, 315, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    borderColor: '#0284c7',
    achievedColor: '#0369a1'
  },
  fdi: {
    label: 'الاستثمار الأجنبي المباشر',
    target: [4.2, 4.7, 5.2, 5.8, 6.4, 7.0, 7.4, 7.8, 8.2, 8.7, 9.2, 9.6, 10.0, 10.5, 10.8, 11.0, 11.3, 11.6, 11.9, 12.2, 12.5],
    achieved: [4.0, 4.5, 5.0, 5.5, 6.2, 6.8, 7.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    borderColor: '#16a34a',
    achievedColor: '#15803d'
  },
  exports: {
    label: 'الصادرات السلعية غير النفطية',
    target: [6.0, 6.7, 7.4, 8.1, 8.8, 9.5, 9.9, 10.3, 10.8, 11.3, 11.8, 12.2, 12.6, 13.0, 13.3, 13.5, 13.8, 14.1, 14.4, 14.7, 15.0],
    achieved: [5.8, 6.5, 7.2, 7.9, 8.5, 9.2, 9.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    borderColor: '#d97706',
    achievedColor: '#b45309'
  },
  gdp: {
    label: 'مساهمة الصناعة التحويلية',
    target: [9.5, 9.9, 10.4, 10.8, 11.4, 12.0, 12.3, 12.6, 12.9, 13.2, 13.5, 13.8, 14.1, 14.4, 14.6, 14.8, 15.0, 15.3, 15.5, 15.8, 16.0],
    achieved: [9.2, 9.7, 10.1, 10.6, 11.2, 11.8, 12.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    borderColor: '#e11d48',
    achievedColor: '#be123c'
  },
  smes: {
    label: 'عدد المؤسسات الصناعية الصغيرة والمتوسطة',
    target: [3200, 3500, 3800, 4100, 4450, 4800, 5140, 5480, 5820, 6160, 6500, 6840, 7180, 7520, 7860, 8200, 8560, 8920, 9280, 9640, 10000],
    achieved: [3100, 3400, 3700, 4000, 4300, 4700, 5000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
};

// إنشاء الرسم البياني الرئيسي
const ctxMain = document.getElementById('mainChart').getContext('2d');
let mainChart = new Chart(ctxMain, {
  type: 'line',
  data: {
    labels: years,
    datasets: getFilteredDatasets()
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

function getFilteredDatasets() {
  const viewType = document.getElementById('viewTypeSelect').value;
  const indicatorKey = document.getElementById('indicatorFilterSelect').value;
  let datasets = [];

  const keysToProcess = indicatorKey === 'all' ? ['labor', 'fdi', 'exports', 'gdp'] : [indicatorKey];

  keysToProcess.forEach(key => {
    let item = datasetValues[key];
    if (!item) return;
    
    if (viewType === 'both' || viewType === 'target_only') {
      datasets.push({
        label: item.label + ' (مستهدف)',
        data: item.target,
        borderColor: item.borderColor,
        tension: 0.3,
        fill: false
      });
    }

    if (viewType === 'both' || viewType === 'achieved_only') {
      datasets.push({
        label: item.label + ' (محقق)',
        data: item.achieved,
        borderColor: item.achievedColor || item.borderColor,
        borderDash: [5, 5],
        tension: 0.3,
        fill: false
      });
    }
  });

  return datasets;
}

// إنشاء رسم المؤسسات الصغيرة والمتوسطة
const ctxSmes = document.getElementById('smesChart').getContext('2d');
let smesChart = new Chart(ctxSmes, {
  type: 'bar',
  data: {
    labels: years,
    datasets: [
      {
        label: 'المؤسسات (مستهدف)',
        data: datasetValues.smes.target,
        backgroundColor: 'rgba(147, 51, 234, 0.6)',
        borderRadius: 4
      },
      {
        label: 'المؤسسات (محقق)',
        data: datasetValues.smes.achieved,
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderRadius: 4
      }
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

// ربط أحداث التغيير للقوائم
document.getElementById('viewTypeSelect').addEventListener('change', updateMainChart);
document.getElementById('indicatorFilterSelect').addEventListener('change', updateMainChart);

function updateMainChart() {
  mainChart.data.datasets = getFilteredDatasets();
  mainChart.update();
}

// التعامل مع نموذج تعديل وحفظ البيانات مع التخزين الدائم
document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const indicator = document.getElementById('editIndicator').value;
  const valueType = document.getElementById('editValueType').value;
  const yearIndex = parseInt(document.getElementById('editYear').value);

  let rawValue = document.getElementById('editValue').value;
  const cleanValue = parseFloat(rawValue.replace(/,/g, ''));

  if (!isNaN(cleanValue)) {
    datasetValues[indicator][valueType][yearIndex] = cleanValue;

    // حفظ التعديلات في ذاكرة المتصفح الدائمة
    localStorage.setItem('industrialDashboardData', JSON.stringify(datasetValues));

    // تحديث الرسوم البيانية
    updateMainChart();
    smesChart.data.datasets[0].data = datasetValues.smes.target;
    smesChart.data.datasets[1].data = datasetValues.smes.achieved;
    smesChart.update();

    alert('تم تحديث وحفظ بيانات المؤشر بنجاح ولن تختفي عند إغلاق الموقع!');
    populateInputValue();
  } else {
    alert('الرجاء إدخال قيمة رقمية صحيحة.');
  }
});

document.getElementById('editIndicator').addEventListener('change', populateInputValue);
document.getElementById('editValueType').addEventListener('change', populateInputValue);
document.getElementById('editYear').addEventListener('change', populateInputValue);

function populateInputValue() {
  const indicator = document.getElementById('editIndicator').value;
  const valueType = document.getElementById('editValueType').value;
  const yearIndex = parseInt(document.getElementById('editYear').value);
  document.getElementById('editValue').value = datasetValues[indicator][valueType][yearIndex];
}

populateInputValue();
