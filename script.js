// 1. إعداد الاتصال بـ Supabase
const SUPABASE_URL = 'https://ftnqjxjxdoyevbxwaipp.supabase.co'; // تم إزالة /rest/v1/ للتوافق الصحيح
const SUPABASE_ANON_KEY = 'sb_publishable_lvW9rg7upoYir0azjHgMNg_XD_PVwu9'; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const years = [
    '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029',
    '2030', '2031', '2032', '2033', '2034', '2035', '2036', '2037', '2038', '2039', '2040'
  ];

  // 2. هيكل البيانات وتسميات الرسوم البيانية الجديدة
  let datasetValues = {
    gdp: {
      label: 'مساهمة القطاع الصناعي في الناتج المحلي الإجمالي',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0),
      borderColor: '#e11d48',
      achievedColor: '#be123c'
    },
    exports: {
      label: 'الصادرات السلعية',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0),
      borderColor: '#d97706',
      achievedColor: '#b45309'
    },
    labor: {
      label: 'عدد العاملين في القطاع الصناعي',
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
    smes: {
      label: 'عدد المؤسسات الصناعية الصغيرة والمتوسطة',
      target: new Array(21).fill(0),
      achieved: new Array(21).fill(0)
    }
  };

  // ربط العناوين الجديدة المخزنة في قاعدة البيانات بالمفاتيح الداخلية
  const titleToKeyMap = {
    'مساهمة القطاع الصناعي في الناتج المحلي الإجمالي': 'gdp',
    'الصادرات السلعية': 'exports',
    'عدد العاملين في القطاع الصناعي': 'labor',
    'الاستثمار الأجنبي المباشر': 'fdi',
    'عدد المؤسسات الصناعية الصغيرة والمتوسطة': 'smes'
  };

  // العكسي لعمليات التحديث في قاعدة البيانات
  const reverseKeyMap = {
    gdp: 'مساهمة القطاع الصناعي في الناتج المحلي الإجمالي',
    exports: 'الصادرات السلعية',
    labor: 'عدد العاملين في القطاع الصناعي',
    fdi: 'الاستثمار الأجنبي المباشر',
    smes: 'عدد المؤسسات الصناعية الصغيرة والمتوسطة'
  };

  try {
    const { data: remoteData, error } = await _supabase.from('KPIs').select('*');
    if (!error && remoteData && remoteData.length > 0) {
      remoteData.forEach(row => {
        const key = Object.keys(titleToKeyMap).find(k => row.title && (row.title.includes(k) || k.includes(row.title)));
        if (key) {
          const internalKey = titleToKeyMap[key];
          const yearIndex = years.indexOf(row.year.toString());
          if (yearIndex !== -1) {
            datasetValues[internalKey].target[yearIndex] = row.target_value;
            datasetValues[internalKey].achieved[yearIndex] = row.actual_value;
          }
        }
      });
      console.log('تم سحب البيانات بنجاح من سوبابيس!');
    } else {
      console.warn('لم يتم العثور على بيانات، جاري استخدام التخزين المحلي.');
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

    const keysToProcess = indicatorKey === 'all' ? ['gdp', 'exports', 'labor', 'fdi'] : [indicatorKey];

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

  document.getElementById('viewTypeSelect').addEventListener('change', updateMainChart);
  document.getElementById('indicatorFilterSelect').addEventListener('change', updateMainChart);

  function updateMainChart() {
    mainChart.data.datasets = getFilteredDatasets();
    mainChart.update();
  }

  // 5. نموذج التعديل والحفظ المتصل بـ سوبابيس
  const editForm = document.getElementById('editForm');
  editForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const indicator = document.getElementById('editIndicator').value;
    const valueType = document.getElementById('editValueType').value;
    const yearIndex = parseInt(document.getElementById('editYear').value);
    const targetYear = 2020 + yearIndex;
    
    let rawValue = document.getElementById('editValue').value;
    const cleanValue = parseFloat(rawValue.replace(/,/g, ''));

    if (!isNaN(cleanValue) && datasetValues[indicator]) {
      if (!datasetValues[indicator][valueType]) {
        datasetValues[indicator][valueType] = new Array(21).fill(0);
      }
      
      datasetValues[indicator][valueType][yearIndex] = cleanValue;
      const rowTitle = reverseKeyMap[indicator];

      try {
        const updateData = {};
        if (valueType === 'target') {
          updateData.target_value = cleanValue;
        } else {
          updateData.actual_value = cleanValue;
        }

        const { error } = await _supabase
          .from('KPIs')
          .update(updateData)
          .eq('year', targetYear)
          .ilike('title', `%${rowTitle}%`);

        if (error) throw error;
        alert('تم تحديث وحفظ البيانات في سوبابيس بنجاح! 🚀');
      } catch (err) {
        console.error('خطأ أثناء الحفظ في سوبابيس:', err);
        localStorage.setItem('industrialDashboardData', JSON.stringify(datasetValues));
        alert('تم التحديث محلياً (تعذر الاتصال بقاعدة البيانات لحظياً).');
      }

      updateMainChart();
      smesChart.data.datasets[0].data = datasetValues.smes.target;
      smesChart.data.datasets[1].data = datasetValues.smes.achieved;
      smesChart.update();

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
