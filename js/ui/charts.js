// グラフ描画（Chart.js を使用）
// Chart インスタンスをモジュールスコープで保持し、同一 canvas への再描画は update() で行う

Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif";
Chart.defaults.color = '#64748b';

let _pieChart = null;
let _barChart = null;

const _CHART_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

function renderExpensePieChart(canvasId, transactions) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const parent = canvas.parentElement;
  parent.querySelectorAll('.chart-empty-text').forEach(el => el.remove());

  const byCategory = calcSummaryByCategory(transactions, 'expense');
  const entries = Object.entries(byCategory).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    if (_pieChart) { _pieChart.destroy(); _pieChart = null; }
    canvas.style.display = 'none';
    const msg = document.createElement('p');
    msg.className = 'chart-empty-text empty-text';
    msg.textContent = '支出データがありません';
    parent.appendChild(msg);
    return;
  }

  canvas.style.display = '';

  const labels = entries.map(([id]) => {
    const cat = getCategoryById(id);
    return cat ? `${cat.icon} ${cat.name}` : id;
  });
  const data   = entries.map(([, v]) => v);
  const colors = entries.map((_, i) => _CHART_COLORS[i % _CHART_COLORS.length]);

  if (_pieChart && _pieChart.canvas === canvas) {
    _pieChart.data.labels                      = labels;
    _pieChart.data.datasets[0].data            = data;
    _pieChart.data.datasets[0].backgroundColor = colors;
    _pieChart.update();
    return;
  }

  if (_pieChart) { _pieChart.destroy(); _pieChart = null; }

  _pieChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 }, padding: 10, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = Math.round(ctx.parsed / total * 100);
              return ` ${ctx.label}: ¥${ctx.parsed.toLocaleString()} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function renderMonthlyBarChart(canvasId, allTransactions, currentYearMonth, count) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const months      = calcMonthlySummary(allTransactions, currentYearMonth, count || 12);
  const labels      = months.map(m => formatYearMonth(m.ym));
  const incomeData  = months.map(m => m.income);
  const expenseData = months.map(m => m.expense);

  if (_barChart && _barChart.canvas === canvas) {
    _barChart.data.labels           = labels;
    _barChart.data.datasets[0].data = incomeData;
    _barChart.data.datasets[1].data = expenseData;
    _barChart.update();
    return;
  }

  if (_barChart) { _barChart.destroy(); _barChart = null; }

  _barChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '収入',
          data: incomeData,
          backgroundColor: 'rgba(22, 163, 74, 0.75)',
          borderColor: '#16a34a',
          borderWidth: 1,
          borderRadius: 3,
        },
        {
          label: '支出',
          data: expenseData,
          backgroundColor: 'rgba(220, 38, 38, 0.75)',
          borderColor: '#dc2626',
          borderWidth: 1,
          borderRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: v => '¥' + v.toLocaleString(),
            font: { size: 11 },
            maxTicksLimit: 5,
          },
          grid: { color: '#e2e8f0' },
        },
        x: {
          ticks: { font: { size: 11 } },
          grid: { display: false },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 }, padding: 10, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              return ` ${ctx.dataset.label}: ¥${ctx.parsed.y.toLocaleString()}`;
            },
          },
        },
      },
    },
  });
}
