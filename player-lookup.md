---
title: Player lookup
---

# Player lookup

Enter a player's UID to see their profile as it looks in the game: equipment, stats, rank, guild, title, marriage and more. The UID is the number on the player's profile in the game. Players on every server can be looked up.

To share a profile, add `?uid=<UID>` to this page's address.

<iframe id="player-lookup-frame" title="Player profile" style="width:100%;aspect-ratio:938/680;min-height:420px;border:0" allow="fullscreen"></iframe>
<script>(function () { var u = new URLSearchParams(location.search).get('uid'); document.getElementById('player-lookup-frame').src = 'https://162-35-14-143.sslip.io/profile.html' + (u && /^\d{1,12}$/.test(u) ? '?uid=' + u : ''); })();</script>
