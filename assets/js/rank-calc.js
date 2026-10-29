// Honor calculator for the Military rank page
(function () {
  var R = [{"name":"Veteran","icon":"img/ranks/veteran.png","honor":0,"diamond":0,"win":0},{"name":"Corporal","icon":"img/ranks/corporal.png","honor":520,"diamond":0,"win":0},{"name":"Sergeant","icon":"img/ranks/sergeant.png","honor":1058,"diamond":0,"win":0},{"name":"Staff Sgt","icon":"img/ranks/staff-sgt.png","honor":1500,"diamond":0,"win":1},{"name":"Master Sgt","icon":"img/ranks/master-sgt.png","honor":3000,"diamond":0,"win":5},{"name":"Second Lt.","icon":"img/ranks/second-lt.png","honor":5500,"diamond":50,"win":0},{"name":"Lieutenant","icon":"img/ranks/lieutenant.png","honor":15000,"diamond":100,"win":0},{"name":"Captain","icon":"img/ranks/captain.png","honor":40000,"diamond":200,"win":0},{"name":"Major","icon":"img/ranks/major.png","honor":70000,"diamond":400,"win":0},{"name":"Lt Colonel","icon":"img/ranks/lt-colonel.png","honor":110000,"diamond":800,"win":0},{"name":"Colonel","icon":"img/ranks/colonel.png","honor":160000,"diamond":1000,"win":0},{"name":"Major General","icon":"img/ranks/major-general.png","honor":230000,"diamond":1500,"win":0},{"name":"Lt. General","icon":"img/ranks/lt-general.png","honor":310000,"diamond":2000,"win":0},{"name":"General","icon":"img/ranks/general.png","honor":400000,"diamond":3000,"win":0},{"name":"Marshal","icon":"img/ranks/marshal.png","honor":550000,"diamond":4000,"win":0},{"name":"Grand Marshal","icon":"img/ranks/grand-marshal.png","honor":800000,"diamond":5000,"win":0},{"name":"The Supreme Marshal","icon":"img/ranks/the-supreme-marshal.png","honor":1500000,"diamond":6000,"win":0}];
  var $ = function (id) { return document.getElementById(id); };
  var hon = $('rc-honor'), out = $('rc-out');
  if (!hon) return;
  var n = function (x) { return Number(x).toLocaleString('en-US'); };
  var entry = function (r) { return (r.icon ? '<img src="' + r.icon + '" width="24" height="24" alt="">' : '') + '<span>' + r.name + '</span>'; };
  var pickers = [];
  function picker(host, initial) {
    var value = initial, active = initial, id = host.id;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.id = id + '-btn'; btn.className = 'rc-sel-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-labelledby', id + '-label ' + id + '-btn');
    var list = document.createElement('ul');
    list.className = 'rc-sel-list'; list.setAttribute('role', 'listbox'); list.tabIndex = -1; list.hidden = true;
    list.setAttribute('aria-labelledby', id + '-label');
    R.forEach(function (r, i) { var li = document.createElement('li'); li.id = id + '-opt-' + i; li.setAttribute('role', 'option'); li.setAttribute('data-i', i); li.innerHTML = entry(r); list.appendChild(li); });
    host.appendChild(btn); host.appendChild(list);
    // the box is redrawn only when the value changes: redrawing it on open would detach the clicked element, and the
    // outside-click check below would then close the list straight away
    function renderBtn() { btn.innerHTML = entry(R[value]) + '<span class="rc-caret" aria-hidden="true">&#9662;</span>'; }
    function render() {
      for (var i = 0; i < list.children.length; i++) { list.children[i].setAttribute('aria-selected', i === value ? 'true' : 'false'); list.children[i].className = i === active ? 'active' : ''; }
      list.setAttribute('aria-activedescendant', id + '-opt-' + active);
    }
    function open() { pickers.forEach(function (p) { if (p !== api) p.close(false); }); active = value; list.hidden = false; btn.setAttribute('aria-expanded', 'true'); render(); list.focus(); list.children[active].scrollIntoView({ block: 'nearest' }); }
    function close(focusBtn) { if (list.hidden) return; list.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focusBtn) btn.focus(); }
    function choose(i) { value = i; active = i; renderBtn(); render(); close(true); calc(); }
    btn.addEventListener('click', function () { if (list.hidden) open(); else close(false); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
    list.addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) choose(Number(li.getAttribute('data-i'))); });
    list.addEventListener('mousemove', function (e) { var li = e.target.closest('li'); if (li && Number(li.getAttribute('data-i')) !== active) { active = Number(li.getAttribute('data-i')); render(); } });
    list.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') active = Math.min(R.length - 1, active + 1);
      else if (e.key === 'ArrowUp') active = Math.max(0, active - 1);
      else if (e.key === 'Home') active = 0;
      else if (e.key === 'End') active = R.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); return; }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      else if (e.key === 'Tab') { close(false); return; }
      else return;
      e.preventDefault(); render(); list.children[active].scrollIntoView({ block: 'nearest' });
    });
    document.addEventListener('click', function (e) { if (!host.contains(e.target)) close(false); });
    var api = { close: close, get value() { return value; } };
    pickers.push(api);
    renderBtn(); render();
    return api;
  }
  var cur = picker($('rc-cur'), 0), tgt = picker($('rc-target'), R.length - 1);
  function calc() {
    var c = Number(cur.value), t = Number(tgt.value), h = Math.max(0, Math.floor(Number(hon.value) || 0));
    if (t <= c) { out.innerHTML = '<p>Pick a target rank above your current rank.</p>'; return; }
    var need = 0, dia = 0, rows = '', left = h, wins = [];
    for (var i = c + 1; i <= t; i++) {
      need += R[i].honor; dia += R[i].diamond;
      var use = Math.min(left, R[i].honor); left -= use;
      if (R[i].win) wins.push(R[i].name + ': ' + n(R[i].win) + ' Free Arena wins');
      rows += '<tr><td>' + R[i].name + '</td><td>' + n(R[i].honor) + '</td><td>' + n(R[i].honor - use) + '</td><td>' + (R[i].diamond ? n(R[i].diamond) : '-') + '</td></tr>';
    }
    var still = Math.max(0, need - h);
    var html = '<p class="rc-big">Honor still needed: <b>' + n(still) + '</b></p>';
    html += '<p>Honor for these promotions: ' + n(need) + (h ? ' (you have ' + n(h) + ')' : '') + '</p>';
    if (!still) html += '<p>You already have enough Honor to reach ' + R[t].name + '.</p>';
    if (dia) html += '<p>Diamonds spent on the way: <b>' + n(dia) + '</b></p>';
    if (wins.length) html += '<p>Also needed: ' + wins.join('; ') + '</p>';
    html += '<table><thead><tr><th>Promote to</th><th>Honor</th><th>Still to earn</th><th>Diamonds</th></tr></thead><tbody>' + rows + '</tbody></table>';
    out.innerHTML = html;
  }
  hon.addEventListener('input', calc); hon.addEventListener('change', calc);
  calc();
})();
