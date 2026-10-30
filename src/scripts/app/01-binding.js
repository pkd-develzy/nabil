/* ---------- FORMAT TANGGAL DARI TARGETDATE ---------- */
function parseDateInfo(dateStr) {
  try {
    var t = new Date(dateStr).getTime();
    if(isNaN(t)) return null;
    // Selalu tampilkan dalam WIB (UTC+7) agar tamu di zona waktu lain melihat tanggal yang sama
    var d = new Date(t + 7 * 36e5);
    var days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    var dayName = days[d.getUTCDay()];
    var dateNum = d.getUTCDate();
    var monthName = months[d.getUTCMonth()];
    var yearNum = d.getUTCFullYear();
    var pad = function(n){ return n < 10 ? '0' + n : '' + n; };
    return {
      day: dayName,
      num: dateNum,
      monthYear: monthName + ' ' + yearNum,
      formattedDots: pad(dateNum) + ' · ' + pad(d.getUTCMonth() + 1) + ' · ' + yearNum
    };
  } catch(e) { return null; }
}

/* ---------- BIND DATA DASHBOARD KE DOM ---------- */
function applyConfigToDom(cfg) {
  if(!cfg) return;

  if(cfg.groom && cfg.bride) {
    document.title = 'Undangan Pernikahan ' + (cfg.groom.short || '') + ' & ' + (cfg.bride.short || '');
  }

  $$('[data-t]').forEach(function(el){
    var v = get(cfg, el.dataset.t);
    if(v != null) el.textContent = v;
  });

  if(cfg.seal) {
    $$('[data-seal], .wish-mini-seal').forEach(function(el){
      el.textContent = cfg.seal;
    });
  }

  // Dynamic Typography Font
  if(cfg.fontDisplay) {
    document.documentElement.style.setProperty('--font-display', "'" + cfg.fontDisplay + "', serif");
    document.documentElement.style.setProperty('--font-decorative', "'" + cfg.fontDisplay + "', serif");
    $$('.title, #heroTitle, .brand-title, #coverSealText').forEach(function(el){
      if (!el.matches('.names, .name, .pname, .c-names, .sl-l-names, .person h3')) {
        el.style.fontFamily = "'" + cfg.fontDisplay + "', serif";
      }
    });
  }
  if(cfg.fontBody) {
    document.documentElement.style.setProperty('--font-body', "'" + cfg.fontBody + "', sans-serif");
    document.body.style.fontFamily = "'" + cfg.fontBody + "', sans-serif";
  }

  var dInfo = parseDateInfo(cfg.targetDate);
  if(dInfo) {
    var covD = $('#coverDate');
    if(covD) covD.textContent = dInfo.formattedDots;
    if($('#letterDay')) $('#letterDay').textContent = dInfo.day;
    if($('#letterNum')) $('#letterNum').textContent = dInfo.num;
    if($('#letterMY')) $('#letterMY').textContent = dInfo.monthYear;
    var hDay = $('#heroDateDay');
    if(hDay) hDay.textContent = dInfo.day;
    var hNum = $('#heroDateNum');
    if(hNum) hNum.textContent = dInfo.num;
    var hMY = $('#heroDateMonthYear');
    if(hMY) hMY.textContent = dInfo.monthYear;
  }

  // Foto Mempelai (Cloudinary / Pria / Wanita)
  function photoSrc(p) {
    if(!p || typeof p !== 'string' || p === 'none') return '';
    p = p.trim();
    if(/^(https?:|data:)/.test(p)) return p;
    return '/' + p.replace(/^\/+/, '');
  }
  function setArchPhoto(sel, person, fallbackAlt) {
    var el = $(sel);
    var src = photoSrc(person && person.photo);
    if(!el || !src) return;
    var img = document.createElement('img');
    img.src = src;
    img.alt = (person && person.full) || fallbackAlt;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:inherit;';
    img.onerror = function(){ this.style.display = 'none'; };
    el.innerHTML = '';
    el.appendChild(img);
  }
  setArchPhoto('#groomArch', cfg.groom, 'Mempelai Pria');
  setArchPhoto('#brideArch', cfg.bride, 'Mempelai Wanita');

  // Ambient Photo Backdrops (Menyatu Sempurna dengan Elemen)
  var pBgSrc = photoSrc(cfg.groom && cfg.groom.photo) || photoSrc(cfg.bride && cfg.bride.photo) || '/pria.png';
  pBgSrc = pBgSrc.replace(/["\\]/g, '\\$&');

  var cImg = $('#coverAmbientImg');
  if(cImg) cImg.style.backgroundImage = 'url("' + pBgSrc + '")';

  var hImg = $('#heroPhotoImg');
  if(hImg) hImg.style.backgroundImage = 'url("' + pBgSrc + '")';

  var mImg = $('#mempelaiBackdropImg');
  if(mImg) mImg.style.backgroundImage = 'url("' + pBgSrc + '")';

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Amplop Rekening Bank
  var bWrap = $('#banksContainer');
  if(bWrap && Array.isArray(cfg.banks) && cfg.banks.length > 0) {
    bWrap.innerHTML = cfg.banks.map(function(b, i){
      return '<article class="bank rv">' +
        '<div class="bn">' + escapeHtml(b.bank || 'Bank') + '</div>' +
        '<div class="no">' + escapeHtml(b.number || '-') + '</div>' +
        '<div class="an">a.n. ' + escapeHtml(b.name || '-') + '</div>' +
        '<button class="btn ghost copy" type="button" data-copy-num="' + escapeHtml(b.number || '') + '">Salin Nomor</button>' +
      '</article>';
    }).join('');
    // Klik tombol salin ditangani oleh satu listener delegasi (lihat COPY TO CLIPBOARD)
    // Kartu baru: beri gerak masuk (bila sistem reveal sudah aktif)
    if (window.__observeReveal) window.__observeReveal(bWrap);
  }

  // Google Maps Links & Iframes
  var mapUrl = function(q){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q || ''); };
  var mAkad = $('#mapAkad');
  if(mAkad && cfg.akad && cfg.akad.mapQuery) mAkad.href = mapUrl(cfg.akad.mapQuery);
  var mResepsi = $('#mapResepsi');
  if(mResepsi && cfg.resepsi && cfg.resepsi.mapQuery) mResepsi.href = mapUrl(cfg.resepsi.mapQuery);

  if (cfg.akad && cfg.akad.mapEmbed) {
    var aIframe = $('#mapAkadIframe');
    if (aIframe) aIframe.src = cfg.akad.mapEmbed;
  }
  if (cfg.resepsi && cfg.resepsi.mapEmbed) {
    var rIframe = $('#mapResepsiIframe');
    if (rIframe) rIframe.src = cfg.resepsi.mapEmbed;
  }

  // Visibility Toggles
  var v = cfg.visibility || {};
  var coverEl = $('#cover');
  if (coverEl && v.cover === false) {
    // Sampul dimatikan: buka kunci scroll agar halaman tetap bisa digulir
    coverEl.style.display = 'none';
    html.classList.remove('locked');
    html.classList.add('revealed');
    if ($('#music')) $('#music').classList.add('show');
  } else if (coverEl && !html.classList.contains('revealed')) {
    coverEl.style.display = '';
  }
  var evCards = $$('#acara .ev'), locCards = $$('#lokasi .loc');
  if (evCards[0]) evCards[0].style.display = (v.akad === false ? 'none' : '');
  if (evCards[1]) evCards[1].style.display = (v.resepsi === false ? 'none' : '');
  if (locCards[0]) locCards[0].style.display = (v.akad === false ? 'none' : '');
  if (locCards[1]) locCards[1].style.display = (v.resepsi === false ? 'none' : '');
  var hideMaps = v.maps === false || (v.akad === false && v.resepsi === false);
  if ($('#lokasi')) $('#lokasi').style.display = (hideMaps ? 'none' : '');
  if ($('#salam')) $('#salam').style.display = (v.salam === false ? 'none' : '');
  if ($('#cd')) $('#cd').style.display = (v.countdown === false ? 'none' : '');
  if ($('.dress')) $('.dress').style.display = (v.dressCode === false ? 'none' : '');
  if ($('#hadiah')) $('#hadiah').style.display = (v.hadiah === false ? 'none' : '');
  if ($('#rsvp')) $('#rsvp').style.display = (v.rsvp === false ? 'none' : '');
  if ($('#ucapan')) $('#ucapan').style.display = (v.ucapan === false ? 'none' : '');
  if ($('#music')) $('#music').style.display = (v.music === false ? 'none' : '');
  // Sembunyikan menu navigasi untuk bagian yang dimatikan
  $$('#navBar .nav-item').forEach(function(a){
    var sec = document.getElementById(a.getAttribute('href').slice(1));
    a.style.display = (sec && sec.style.display === 'none') ? 'none' : '';
  });
  if (window.__decorateCardsWithFlora) {
    window.__decorateCardsWithFlora();
  }
}

window.__rebindConfig = function(){
  applyConfigToDom(CONFIG);
};

// Initial apply
applyConfigToDom(CONFIG);

/* ---------- GUEST NAME & CATEGORY DARI URL PARAMETER ?to= & ?c= ---------- */
var urlParams = new URLSearchParams(location.search);
var to = (urlParams.get('to') || '').replace(/[-_+]+/g, ' ').trim();
var cat = (urlParams.get('c') || urlParams.get('cat') || urlParams.get('category') || '').trim();
var isGroup = urlParams.get('grp') === '1' || urlParams.get('type') === 'group' || cat.toLowerCase().indexOf('grup') !== -1 || cat.toLowerCase().indexOf('group') !== -1;

window.__GUEST_NAME = to;
window.__GUEST_CATEGORY = cat || 'Umum';
window.__IS_GROUP = isGroup;
window.__GROUP_NAME = isGroup ? to : '';

var guest = to || 'Bapak/Ibu/Saudara/i';
if($('#guestName')) {
  if (isGroup && to) {
    $('#guestName').textContent = to;
    var guestSmall = $('#guestName').parentElement ? $('#guestName').parentElement.querySelector('small') : null;
    if (guestSmall) guestSmall.textContent = 'Kepada Yth. Sahabat & Rekan:';
  } else {
    $('#guestName').textContent = guest;
  }
}
if($('#paperGuest')) $('#paperGuest').textContent = guest;

if($('#fName')) {
  if (isGroup && to) {
    // Mode Undangan Grup: Nama TIDAK dikunci, tamu mengisi nama masing-masing
    $('#fName').value = '';
    $('#fName').readOnly = false;
    $('#fName').removeAttribute('readonly');
    $('#fName').classList.remove('readonly-locked');
    $('#fName').placeholder = 'Tuliskan nama Anda (Anggota ' + to + ')';
    if($('#nameLockNote')) $('#nameLockNote').style.display = 'none';
    if($('#groupNote')) {
      $('#groupNote').style.display = 'block';
      if($('#groupNameText')) $('#groupNameText').textContent = to;
    }
  } else if(to) {
    // Mode Undangan Personal: Nama dikunci
    $('#fName').value = to;
    $('#fName').readOnly = true;
    $('#fName').setAttribute('readonly', 'readonly');
    $('#fName').classList.add('readonly-locked');
    if($('#nameLockNote')) $('#nameLockNote').style.display = 'block';
    if($('#groupNote')) $('#groupNote').style.display = 'none';
  } else {
    // Mode Buka Langsung: Nama bebas
    $('#fName').value = '';
    $('#fName').readOnly = false;
    $('#fName').removeAttribute('readonly');
    $('#fName').classList.remove('readonly-locked');
    if($('#nameLockNote')) $('#nameLockNote').style.display = 'none';
    if($('#groupNote')) $('#groupNote').style.display = 'none';
  }
}

