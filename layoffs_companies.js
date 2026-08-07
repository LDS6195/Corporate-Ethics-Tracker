var SERVER = 'https://layoffsfyi-production.up.railway.app';
var allCompanies = [];
var sortField = 'name';
var sortDir = 1;
var industryFilter = '';
var searchQuery = '';

var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) {
  if (!d) return '';
  var p = d.split('-');
  return MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
}

function getVisible() {
  var list = allCompanies;
  if (industryFilter) list = list.filter(function(c) { return c.industry === industryFilter; });
  if (searchQuery) {
    var q = searchQuery.toLowerCase();
    list = list.filter(function(c) { return c.name.toLowerCase().indexOf(q) !== -1; });
  }
  return list.slice().sort(function(a, b) {
    if (sortField === 'name')   return sortDir * a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    if (sortField === 'total')  return sortDir * ((a.total || 0) - (b.total || 0));
    if (sortField === 'latest') return sortDir * (a.latest || '').localeCompare(b.latest || '');
    return 0;
  });
}

function setSortBtn(field) {
  ['name', 'total', 'latest'].forEach(function(f) {
    var btn = document.getElementById('co-sort-' + f);
    if (!btn) return;
    var label = btn.getAttribute('data-label');
    if (f === field) {
      btn.textContent = label + (sortDir === 1 ? ' ▲' : ' ▼');
      btn.style.background = '#222';
      btn.style.color = '#fff';
    } else {
      btn.textContent = label;
      btn.style.background = '#fff';
      btn.style.color = '#444';
    }
  });
}

function updateIndTotal() {
  var el = document.getElementById('co-ind-total');
  if (!el) return;
  var visible = getVisible();
  if (!industryFilter && !searchQuery) { el.style.display = 'none'; return; }
  var tot = visible.reduce(function(s, c) { return s + (c.total || 0); }, 0);
  var label = visible.length.toLocaleString() + ' companies';
  if (tot) label += ' · ' + tot.toLocaleString() + ' employees laid off';
  if (industryFilter) label += ' in ' + industryFilter;
  if (searchQuery) label += (industryFilter ? '' : ' matching') + ' "' + searchQuery + '"';
  el.textContent = label;
  el.style.display = 'block';
}

function renderRows() {
  var companies = getVisible();
  var tbody = document.getElementById('co-tbody');
  if (!tbody) return;
  tbody.innerHTML = companies.map(function(c, i) {
    return '<tr style="border-bottom:1px solid #f0f0f0;background:' + (i % 2 === 0 ? '#fff' : '#fafafa') + '">' +
      '<td style="padding:7px 8px;"><a href="/company/' + c.slug + '/">' + c.name + '</a></td>' +
      '<td style="padding:7px 8px;color:#888;font-size:13px;">' + (c.industry || '') + '</td>' +
      '<td style="padding:7px 8px;text-align:right;">' + (c.total ? c.total.toLocaleString() : '&mdash;') + '</td>' +
      '<td style="padding:7px 8px;text-align:right;color:#666;">' + (c.latest ? fmtDate(c.latest) : '&mdash;') + '</td>' +
      '</tr>';
  }).join('');
  updateIndTotal();
}

function setSort(field) {
  sortDir = (sortField === field) ? -sortDir : (field === 'name' ? 1 : -1);
  sortField = field;
  setSortBtn(field);
  renderRows();
}

fetch(SERVER + '/api/companies-list')
  .then(function(r) { return r.ok ? r.json() : Promise.reject(r.status); })
  .then(function(companies) {
    allCompanies = companies;
    document.getElementById('co-status').style.display = 'none';

    var grandTotal = companies.reduce(function(s, c) { return s + (c.total || 0); }, 0);

    var industries = [];
    var seen = {};
    companies.forEach(function(c) {
      if (c.industry && !seen[c.industry]) { seen[c.industry] = true; industries.push(c.industry); }
    });
    industries.sort();

    var app = document.getElementById('co-app');
    app.innerHTML =
      '<p style="font-size:14px;color:#666;margin:0 0 16px;">' +
        companies.length.toLocaleString() + ' tech companies' +
        '<span style="margin:0 10px;color:#ddd;">|</span>' +
        grandTotal.toLocaleString() + ' employees laid off' +
        '<span style="margin:0 10px;color:#ddd;">|</span>' +
        'Since March 2020' +
      '</p>' +
      '<input type="text" id="co-search" placeholder="Search companies…" style="width:100%;padding:8px 12px;font-size:14px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;margin-bottom:12px;">' +
      '<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:8px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<label style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#999;white-space:nowrap;">Industry</label>' +
          '<select id="co-ind-filter" style="font-size:13px;padding:6px 10px;border:1px solid #ccc;border-radius:6px;background:#fff;color:#333;cursor:pointer;">' +
            '<option value="">All Industries</option>' +
            industries.map(function(ind) { return '<option value="' + ind + '">' + ind + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#999;">Sort</span>' +
          '<div style="display:inline-flex;border:1px solid #ccc;border-radius:6px;overflow:hidden;">' +
            '<button id="co-sort-name"   data-label="Name"        style="font-size:13px;padding:6px 14px;border:none;border-right:1px solid #ccc;cursor:pointer;background:#222;color:#fff;">Name ▲</button>' +
            '<button id="co-sort-total"  data-label="Employees"   style="font-size:13px;padding:6px 14px;border:none;border-right:1px solid #ccc;cursor:pointer;background:#fff;color:#444;">Employees</button>' +
            '<button id="co-sort-latest" data-label="Most Recent" style="font-size:13px;padding:6px 14px;border:none;cursor:pointer;background:#fff;color:#444;">Most Recent</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<p id="co-ind-total" style="display:none;font-size:13px;color:#555;margin:0 0 12px;font-style:italic;"></p>' +
      '<div style="overflow-x:auto;">' +
        '<table style="width:100%;border-collapse:collapse;font-size:14px;">' +
          '<thead><tr style="border-bottom:2px solid #e0e0e0;background:#fafafa;">' +
            '<th style="text-align:left;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Company</th>' +
            '<th style="text-align:left;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Industry</th>' +
            '<th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Employees Laid Off</th>' +
            '<th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Most Recent</th>' +
          '</tr></thead>' +
          '<tbody id="co-tbody"></tbody>' +
        '</table>' +
      '</div>';

    document.getElementById('co-search').addEventListener('input', function() {
      searchQuery = this.value.trim();
      renderRows();
    });
    document.getElementById('co-ind-filter').addEventListener('change', function() {
      industryFilter = this.value;
      renderRows();
    });
    document.getElementById('co-sort-name').addEventListener('click',   function() { setSort('name'); });
    document.getElementById('co-sort-total').addEventListener('click',  function() { setSort('total'); });
    document.getElementById('co-sort-latest').addEventListener('click', function() { setSort('latest'); });

    renderRows();

    var ldScript = document.createElement('script');
    ldScript.type = 'application/ld+json';
    ldScript.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home',      'item': 'https://layoffs.fyi/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Companies', 'item': 'https://layoffs.fyi/companies/' }
      ]
    });
    document.head.appendChild(ldScript);
  })
  .catch(function() {
    document.getElementById('co-status').textContent = 'Failed to load company list.';
  });
