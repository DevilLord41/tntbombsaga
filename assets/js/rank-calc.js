// Honor calculator for the Military rank page
(function () {
  var R = [{"name":"Veteran","honor":0,"diamond":0,"win":0},{"name":"Corporal","honor":520,"diamond":0,"win":0},{"name":"Sergeant","honor":1058,"diamond":0,"win":0},{"name":"Staff Sgt","honor":1500,"diamond":0,"win":1},{"name":"Master Sgt","honor":3000,"diamond":0,"win":5},{"name":"Second Lt.","honor":5500,"diamond":50,"win":0},{"name":"Lieutenant","honor":15000,"diamond":100,"win":0},{"name":"Captain","honor":40000,"diamond":200,"win":0},{"name":"Major","honor":70000,"diamond":400,"win":0},{"name":"Lt Colonel","honor":110000,"diamond":800,"win":0},{"name":"Colonel","honor":160000,"diamond":1000,"win":0},{"name":"Major General","honor":230000,"diamond":1500,"win":0},{"name":"Lt. General","honor":310000,"diamond":2000,"win":0},{"name":"General","honor":400000,"diamond":3000,"win":0},{"name":"Marshal","honor":550000,"diamond":4000,"win":0},{"name":"Grand Marshal","honor":800000,"diamond":5000,"win":0},{"name":"The Supreme Marshal","honor":1500000,"diamond":6000,"win":0}];
  var $ = function (id) { return document.getElementById(id); };
  var cur = $('rc-cur'), tgt = $('rc-target'), hon = $('rc-honor'), out = $('rc-out');
  if (!cur) return;
  var n = function (x) { return Number(x).toLocaleString('en-US'); };
  R.forEach(function (r, i) { cur.add(new Option(r.name, i)); tgt.add(new Option(r.name, i)); });
  tgt.value = String(R.length - 1);
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
  [cur, tgt, hon].forEach(function (el) { el.addEventListener('input', calc); el.addEventListener('change', calc); });
  calc();
})();
