// 1. إعداد الاتصال بـ Supabase
const SUPABASE_URL = 'https://ftnqjxjxdoyevbxwaipp.supabase.co/rest/v1/'; // استبدله برابط مشروعك
const SUPABASE_ANON_KEY = 'sb_publishable_lvW9rg7upoYir0azjHgMNg_XD_PVwu9'; // استبدله بمفتاح الـ Publishable/anon

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const years = [
    '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029',
    '2030', '2031', '2032', '2033', '2034', '2035', '2036', '2037', '2038', '2039', '2040'
  ];

  // 2. جلب البيانات من Supabase وتوزيعها على الهيكل المطلوب للرسوم البيانية
  let datasetValues = {
    labor: {
      label: 'مؤشر عدد العمالة',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0),
      borderColor: '#0284c7',
      achievedColor: '#0369a1'
    },
    fdi: {
      label: 'الاستثمار الأجنبي المباشر',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0),
      borderColor: '#16a34a',
      achievedColor: '#15803d'
    },
    exports: {
      label: 'الصادرات السلعية غير النفطية',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0),
      borderColor: '#d97706',
      achievedColor: '#b45309'
    },
    gdp: {
      label: 'مساهمة الصناعة التحويلية',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0),
      borderColor: '#e11d48',
      achievedColor: '#be123c'
    },
    smes: {
      label: 'عدد المؤسسات الصناعية الصغيرة والمتوسطة',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0)
    }
  };

  // ربط الأسماء المخزنة في قاعدة البيانات بمفاتيح الكود
  const titleToKeyMap = {
    'مؤشر عدد العمالة (ألف عامل)': 'labor',
    'الاستثمار الأجنبي المباشر (مليار ر.ع)': 'fdi',
    'الصادرات السلعية غير النفطية (مليار ر.ع)': 'exports',
    'مساهمة الصناعة التحويلية في الناتج المحلي (%)': 'gdp',
    'عدد المؤسسات الصناعية الصغيرة والمتوسطة': 'smes'
  };

  try {
    const { data: remoteData, error } = await _supabase.from('KPIs').select('*');
    if (!error && remoteData && remoteData.length > 0) {
      remoteData.forEach(row => {
        // البحث عن المفتاح المناسب بناءً على عنوان المؤشر في قاعدة البيانات
        const key = Object.keys(titleToKeyMap).find(k => row.title.includes(k) || k.includes(row.title));
        if (key) {
          const internalKey = titleToKeyMap[key];
          const yearIndex = years.indexOf(row.year.toString());
          if (yearIndex !== -1) {
            datasetValues[internalKey].target[yearIndex] = row.target_value;
            datasetValues[internalKey].achieved[yearIndex] = row.actual_value;
          }
        }
      });
      console.log('تم سحب البيانات بنجاح من سوبابيس وتحديث الرسوم البيانية!');
    } else {
      console.warn('لم يتم العثور على بيانات في سوبابيس، سيتم استخدام التخزين المحلي.');
      const savedData = localStorage.getItem('industrialDashboardData');
      if (savedData) datasetValues = JSON.parse(savedData);
    }
  } catch (err) {
    console.error('خطأ أثناء جلب البيانات من سوبابيس:', err);
  }

  // 3. تهيئة الرسم البياني الرئيسي
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

  // 4. تهيئة رسم المؤسسات الصغيرة والمتوسطة
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

  // ربط أحداث القوائم العلوية
  document.getElementById('viewTypeSelect').addEventListener('change', updateMainChart);
  document.getElementById('indicatorFilterSelect').addEventListener('change', updateMainChart);

  function updateMainChart() {
    mainChart.data.datasets = getFilteredDatasets();
    mainChart.update();
  }

  // معالجة نموذج التعديل والحفظ محلياً
  const editForm = document.getElementById('editForm');
  editForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const indicator = document.getElementById('editIndicator').value;
    const valueType = document.getElementById('editValueType').value;
    const yearIndex = parseInt(document.getElementById('editYear').value);
    let rawValue = document.getElementById('editValue').value;
    const cleanValue = parseFloat(rawValue.replace(/,/g, ''));

    if (!isNaN(cleanValue) && datasetValues[indicator]) {
      if (!datasetValues[indicator][valueType]) {
        datasetValues[indicator][valueType] = new Array(21).fill(0);
      }
      
      datasetValues[indicator][valueType][yearIndex] = cleanValue;

      localStorage.setItem('industrialDashboardData', JSON.stringify(datasetValues));

      updateMainChart();
      smesChart.data.datasets[0].data = datasetValues.smes.target;
      smesChart.data.datasets[1].data = datasetValues.smes.achieved;
      smesChart.update();

      alert('تم تحديث وحفظ بيانات المؤشر بنجاح!');
    } else {
      alert('الرجاء التأكد من إدخال قيمة رقمية صحيحة في الحقل.');
    }
  });

  const editIndicatorSelect = document.getElementById('editIndicator');
  const editValueTypeSelect = document.getElementById('editValueType');
  const editYearSelect = document.getElementById('editYear');

  function populateInputValue() {
    const indicator = editIndicatorSelect.value;
    const valueType = editValueTypeSelect.value;
    const yearIndex = parseInt(editYearSelect.value);

    if (datasetValues[indicator] && datasetValues[indicator][valueType]) {
      const val = datasetValues[indicator][valueType][yearIndex];
      document.getElementById('editValue').value = (val !== undefined && val !== null) ? val : '';
    }
  }

  editIndicatorSelect.addEventListener('change', populateInputValue);
  editValueTypeSelect.addEventListener('change', populateInputValue);
  editYearSelect.addEventListener('change', populateInputValue);

  populateInputValue();
});
