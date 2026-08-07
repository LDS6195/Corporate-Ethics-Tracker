(async () => {
  const SERVER = 'https://layoffsfyi-production.up.railway.app';

  const s = document.createElement('style');
  s.textContent = 'h2.section-title { font-size: 22px !important; } .section { margin-bottom: 0 !important; }';
  document.head.appendChild(s);
  const fmt = n => n == null ? '—' : n.toLocaleString();
  const fmtDate = s => s || '—';

  let statsData = null;
  let sortState = { col: 'count', dir: 'desc' };

  const SORT_LABELS = { company: 'Company', count: 'Employees', percent: '%', date: 'Date' };

  function updateSortHeaders() {
    document.querySelectorAll('.event-table th[data-sort]').forEach(th => {
      const col = th.dataset.sort;
      const active = col === sortState.col;
      th.classList.toggle('sort-active', active);
      th.textContent = SORT_LABELS[col] + (active ? (sortState.dir === 'asc' ? ' ↑' : ' ↓') : '');
    });
  }

  function updateStatBar(year) {
    const yr = statsData.years.find(y => y.year === year);
    document.getElementById('stat-emp').textContent = yr ? fmt(yr.ai_emp) : '—';
    document.getElementById('stat-events').textContent = yr ? fmt(yr.ai_events) : '—';
  }

  function renderEventTable(year) {
    const tbody = document.getElementById('event-tbody');
    tbody.innerHTML = '';
    const raw = (statsData.eventsByYear || {})[year] || [];
    if (!raw.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="no-events">No AI-attributed events found for ${year}.</td></tr>`;
      return;
    }
    const { col, dir } = sortState;
    const events = [...raw].sort((a, b) => {
      const va = a[col], vb = b[col];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return dir === 'asc' ? va - vb : vb - va;
    });
    events.forEach((ev, i) => {
      const companyLink = `https://layoffs.fyi/company/${ev.slug}/`;
      const sourceLinkHtml = ev.source
        ? `<a href="${ev.source}" target="_blank" rel="noopener">Source →</a>`
        : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="ev-rank">${i + 1}</td>
        <td class="ev-company"><a href="${companyLink}">${ev.company}</a></td>
        <td class="ev-count">${ev.count ? fmt(ev.count) : '—'}</td>
        <td class="ev-pct">${ev.percent != null ? ev.percent + '%' : '—'}</td>
        <td class="ev-date">${fmtDate(ev.date)}</td>
        <td class="ev-source">${sourceLinkHtml}</td>
      `;
      tbody.appendChild(tr);
      if (ev.explanation) {
        const expl = document.createElement('tr');
        expl.className = 'ev-expl';
        expl.innerHTML = `<td colspan="6">${ev.explanation}</td>`;
        tbody.appendChild(expl);
      }
    });
  }

  try {
    const res = await fetch(`${SERVER}/api/ai-layoffs-stats`);
    if (!res.ok) throw new Error('Failed to load');
    statsData = await res.json();

    document.getElementById('stats-loading').style.display = 'none';
    document.getElementById('stats-content').style.display = 'block';

    function setYear(year) {
      updateStatBar(year);
      document.querySelectorAll('#event-tabs .year-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.year === year);
      });
      renderEventTable(year);
    }

    updateSortHeaders();
    setYear('2026');
    document.getElementById('stat-year').addEventListener('change', e => setYear(e.target.value));

    document.querySelector('.event-table thead').addEventListener('click', e => {
      const th = e.target.closest('th[data-sort]');
      if (!th) return;
      const col = th.dataset.sort;
      sortState = col === sortState.col
        ? { col, dir: sortState.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: col === 'company' ? 'asc' : 'desc' };
      updateSortHeaders();
      const activeTab = document.querySelector('#event-tabs .year-tab.active');
      if (activeTab) renderEventTable(activeTab.dataset.year);
    });

    document.getElementById('last-updated').textContent =
      'Last updated: ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const currentYear = new Date().getFullYear().toString();
    const currentQ = (() => {
      const m = new Date().getMonth() + 1;
      return `${currentYear}-Q${Math.ceil(m / 3)}`;
    })();

    function getChartPeriods(gran) {
      if (gran === 'annual') {
        return {
          labels: statsData.years.map(y => y.year === currentYear ? y.year + ' YTD' : y.year),
          periods: statsData.years,
        };
      }
      return {
        labels: statsData.quarters.map(q => {
          const [yr, qn] = q.quarter.split('-');
          return q.quarter === currentQ ? `${qn} ${yr} YTD` : `${qn} ${yr}`;
        }),
        periods: statsData.quarters,
      };
    }

    const empTooltip = {
      backgroundColor: '#fff', borderColor: '#e0e0e0', borderWidth: 1,
      titleColor: '#333', bodyColor: '#555', padding: 10,
      callbacks: {
        afterTitle: items => {
          const i = items[0].dataIndex;
          const ds = items[0].chart.data.datasets;
          return `Total: ${(ds[0].data[i] + ds[1].data[i]).toLocaleString()}`;
        },
        label: ctx => {
          const i = ctx.dataIndex;
          const ds = ctx.chart.data.datasets;
          const total = ds[0].data[i] + ds[1].data[i];
          const pct = total > 0 ? Math.round(ctx.parsed.y / total * 100) : 0;
          return ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} (${pct}%)`;
        },
      },
    };
    const evtTooltip = {
      ...empTooltip,
      callbacks: {
        afterTitle: items => {
          const i = items[0].dataIndex;
          const ds = items[0].chart.data.datasets;
          return `Total: ${(ds[0].data[i] + ds[1].data[i]).toLocaleString()} events`;
        },
        label: empTooltip.callbacks.label,
      },
    };

    const sharedScaleX = {
      stacked: true,
      grid: { display: false },
      ticks: { color: '#999', font: { size: 13 } },
      border: { color: '#e8e8e8' },
    };

    const { labels: initLabels, periods: initPeriods } = getChartPeriods('annual');

    const empChart = new Chart(document.getElementById('annual-chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: initLabels,
        datasets: [
          { label: 'Employees Laid Off Due to AI', data: initPeriods.map(p => p.ai_emp), backgroundColor: '#F4785A', stack: 'stack' },
          { label: 'Other Employees Laid Off', data: initPeriods.map(p => p.total_emp - p.ai_emp), backgroundColor: '#c8d6db', stack: 'stack' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 13, weight: 'bold' }, padding: 16, boxWidth: 24, boxHeight: 14 } },
          tooltip: empTooltip,
        },
        scales: {
          x: sharedScaleX,
          y: {
            stacked: true, grid: { color: '#d8d8d8' },
            ticks: { color: '#F4785A', font: { size: 11 }, callback: v => v.toLocaleString() },
            border: { color: '#e8e8e8' },
            title: { display: true, text: 'Employees', color: '#F4785A', font: { weight: 'bold', size: 13 } },
          },
        },
      },
    });

    const evtChart = new Chart(document.getElementById('events-chart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: initLabels,
        datasets: [
          { label: 'Layoff Events Attributed to AI', data: initPeriods.map(p => p.ai_events), backgroundColor: '#F4785A', stack: 'stack' },
          { label: 'Other Layoff Events', data: initPeriods.map(p => p.total_events - p.ai_events), backgroundColor: '#c8d6db', stack: 'stack' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 13, weight: 'bold' }, padding: 16, boxWidth: 24, boxHeight: 14 } },
          tooltip: evtTooltip,
        },
        scales: {
          x: sharedScaleX,
          y: {
            stacked: true, grid: { color: '#d8d8d8' },
            ticks: { color: '#F4785A', font: { size: 11 } },
            border: { color: '#e8e8e8' },
            title: { display: true, text: 'Layoff Events', color: '#F4785A', font: { weight: 'bold', size: 13 } },
          },
        },
      },
    });

    document.getElementById('chart-evt-wrap').style.display = 'none';

    function applyGranularity(gran) {
      const { labels, periods } = getChartPeriods(gran);
      empChart.data.labels = labels;
      empChart.data.datasets[0].data = periods.map(p => p.ai_emp);
      empChart.data.datasets[1].data = periods.map(p => p.total_emp - p.ai_emp);
      empChart.update();
      evtChart.data.labels = labels;
      evtChart.data.datasets[0].data = periods.map(p => p.ai_events);
      evtChart.data.datasets[1].data = periods.map(p => p.total_events - p.ai_events);
      evtChart.update();
    }

    document.getElementById('gran-toggle').addEventListener('click', e => {
      const btn = e.target.closest('.gran-btn');
      if (!btn) return;
      document.querySelectorAll('#gran-toggle .gran-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyGranularity(btn.dataset.gran);
    });

    document.getElementById('chart-tabs').addEventListener('click', e => {
      const btn = e.target.closest('.year-tab');
      if (!btn) return;
      document.querySelectorAll('#chart-tabs .year-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const isEmp = btn.dataset.chart === 'employees';
      document.getElementById('chart-emp-wrap').style.display = isEmp ? 'block' : 'none';
      document.getElementById('chart-evt-wrap').style.display = isEmp ? 'none' : 'block';
      if (!isEmp) evtChart.resize();
    });

    document.getElementById('event-tabs').addEventListener('click', e => {
      const btn = e.target.closest('.year-tab');
      if (!btn) return;
      const year = btn.dataset.year;
      document.querySelectorAll('#event-tabs .year-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('stat-year').value = year;
      updateStatBar(year);
      renderEventTable(year);
    });

  } catch (err) {
    document.getElementById('stats-loading').style.display = 'none';
    const el = document.getElementById('stats-error');
    el.style.display = 'block';
    el.textContent = 'Failed to load stats. Please try again.';
  }
})();
