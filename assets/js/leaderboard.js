(function () {
  var API = "https://162-35-14-143.sslip.io/api/leaderboard";
  var RANKS = {"0":{"n":"Veteran","i":"img/ranks/veteran.png"},"1":{"n":"Corporal","i":"img/ranks/corporal.png"},"2":{"n":"Sergeant","i":"img/ranks/sergeant.png"},"3":{"n":"Staff Sgt","i":"img/ranks/staff-sgt.png"},"4":{"n":"Master Sgt","i":"img/ranks/master-sgt.png"},"5":{"n":"Second Lt.","i":"img/ranks/second-lt.png"},"6":{"n":"Lieutenant","i":"img/ranks/lieutenant.png"},"7":{"n":"Captain","i":"img/ranks/captain.png"},"8":{"n":"Major","i":"img/ranks/major.png"},"9":{"n":"Lt Colonel","i":"img/ranks/lt-colonel.png"},"10":{"n":"Colonel","i":"img/ranks/colonel.png"},"11":{"n":"Major General","i":"img/ranks/major-general.png"},"12":{"n":"Lt. General","i":"img/ranks/lt-general.png"},"13":{"n":"General","i":"img/ranks/general.png"},"14":{"n":"Marshal","i":"img/ranks/marshal.png"},"15":{"n":"Grand Marshal","i":"img/ranks/grand-marshal.png"},"16":{"n":"The Supreme Marshal","i":"img/ranks/the-supreme-marshal.png"}};
  var root = document.getElementById('lb');
  if (!root) return;
  var mode = root.getAttribute('data-mode');
  var params = new URLSearchParams(location.search);
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var num = function (n) { return Number(n).toLocaleString('en-US'); };
  var who = function (p) { return '<a href="player-lookup.html?uid=' + encodeURIComponent(p.uuid) + '">' + esc(p.name) + '</a>'; };
  var setParam = function (k, v) { var q = new URLSearchParams(location.search); if (v) q.set(k, v); else q.delete(k); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '')); };
  var status = root.querySelector('.lb-status');
  var boardSel = root.querySelector('.lb-board');
  boardSel.value = params.get('board') === 'rank' ? 'rank' : 'bp';
  var isRank = function () { return boardSel.value === 'rank'; };
  var rows = function (g) { return isRank() ? (g.rankPlayers || []) : g.players; };
  var rankCell = function (p) { var v = p.value || []; var r = RANKS[v[0]]; return r ? (r.i ? '<img src="' + r.i + '" width="24" alt=""> ' : '') + esc(r.n) : (v.length ? esc(v[0]) : '-'); };
  var cmp = function (a, b) { if (isRank()) { var x = a.value || [], y = b.value || []; for (var i = 0; i < Math.max(x.length, y.length); i++) { if ((y[i] || 0) !== (x[i] || 0)) return (y[i] || 0) - (x[i] || 0); } return 0; } return b.bp - a.bp; };
  fetch(API).then(function (r) { if (!r.ok) throw new Error(r.status === 503 ? 'The leaderboards have not been collected yet.' : 'HTTP ' + r.status); return r.json(); }).then(function (d) {
    root.querySelector('.lb-updated').textContent = 'Updated ' + new Date(d.updated).toLocaleString() + ' (refreshed every day at 23:00 Bangkok time).';
    status.textContent = '';
    var show = mode === 'server' ? server(d) : top(d);
    boardSel.addEventListener('change', function () { setParam('board', isRank() ? 'rank' : ''); show(true); });
  }).catch(function (e) { status.textContent = 'Could not load the leaderboards: ' + e.message; });

  function table(list, withGroup) {
    var head = '<th>#</th><th>Player</th><th>Server</th>' + (withGroup ? '<th>Merged servers</th>' : '') + (isRank() ? '<th>Military rank</th>' : '<th>BP</th>');
    return '<table class="lb-table"><thead><tr>' + head + '</tr></thead><tbody>' + list.map(function (r) {
      var tail = isRank() ? '<td>' + rankCell(r.p) + '</td>' : '<td>' + num(r.p.bp) + '</td>';
      return '<tr><td>' + r.n + '</td><td>' + who(r.p) + '</td><td>' + r.p.server + '</td>' + (withGroup ? '<td>' + esc(r.g) + '</td>' : '') + tail + '</tr>';
    }).join('') + '</tbody></table>';
  }

  function server(d) {
    var sel = root.querySelector('.lb-select');
    var out = root.querySelector('.lb-out');
    sel.innerHTML = d.groups.map(function (g, i) { return '<option value="' + i + '">Server ' + esc(g.label) + (g.servers.length > 1 ? ' (merged)' : '') + '</option>'; }).join('');
    var want = Number(params.get('server'));
    var start = want ? d.groups.findIndex(function (g) { return g.servers.indexOf(want) >= 0; }) : -1;
    sel.value = String(start >= 0 ? start : 0);
    var show = function () {
      var g = d.groups[Number(sel.value)];
      setParam('server', String(g.servers[0]));
      var list = rows(g);
      out.innerHTML = (g.servers.length > 1 ? '<p>Servers ' + esc(g.label) + ' are merged and share this leaderboard.</p>' : '') + (g.stale ? '<p>This server could not be read today; this is its last leaderboard.</p>' : '') +
        (list.length ? table(list.map(function (p) { return { n: p.rank, p: p }; }), false) : '<p>No players on this leaderboard.</p>');
    };
    sel.addEventListener('change', show);
    show();
    return show;
  }

  function top(d) {
    var PAGE = 100;
    var input = root.querySelector('.lb-search');
    var out = root.querySelector('.lb-out');
    var pager = root.querySelector('.lb-pager');
    var page = Math.max(1, Number(params.get('page')) || 1);
    var all = null;
    var build = function () {
      var seen = {};
      all = [];
      d.groups.forEach(function (g) { rows(g).forEach(function (p) { if (!seen[p.uuid]) { seen[p.uuid] = 1; all.push({ p: p, g: g.label }); } }); });
      all.sort(function (a, b) { return cmp(a.p, b.p); });
      all.forEach(function (r, i) { r.n = i + 1; });
    };
    input.value = params.get('q') || '';
    var show = function (rebuild) {
      if (rebuild || !all) { build(); if (rebuild) page = 1; }
      var q = input.value.trim().toLowerCase();
      var list = q ? all.filter(function (r) { return r.p.name.toLowerCase().indexOf(q) >= 0 || r.p.uuid === q; }) : all;
      var pages = Math.max(1, Math.ceil(list.length / PAGE));
      if (page > pages) page = pages;
      setParam('q', q); setParam('page', page > 1 ? String(page) : '');
      root.querySelector('.lb-count').textContent = num(list.length) + ' players' + (q ? ' match' : ' from ' + d.groups.length + ' leaderboards (top 100 of every server)');
      out.innerHTML = table(list.slice((page - 1) * PAGE, page * PAGE), true);
      var b = [];
      for (var i = 1; i <= pages; i++) b.push('<button type="button" data-p="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + i + '</button>');
      pager.innerHTML = pages > 1 ? b.join('') : '';
    };
    pager.addEventListener('click', function (e) { var p = e.target.getAttribute('data-p'); if (p) { page = Number(p); show(); root.scrollIntoView(); } });
    input.addEventListener('input', function () { page = 1; show(); });
    show();
    return show;
  }
})();
