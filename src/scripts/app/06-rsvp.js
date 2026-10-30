/* ---------- RSVP FORM LOGIC (D1 & SUPABASE REALTIME INSERT) ---------- */
function countRsvpWords(str) {
  if (!str) return 0;
  var m = str.trim().match(/\S+/g);
  return m ? m.length : 0;
}

var form=$('#form'),result=$('#result'),msgText='';
var fMsg = $('#fMsg'), wordCounter = $('#wordCounter');

if(fMsg && wordCounter) {
  var updateWordCount = function() {
    var cnt = countRsvpWords(fMsg.value);
    wordCounter.textContent = cnt + ' / 80 kata';
    if(cnt > 80) {
      wordCounter.style.color = '#dc2626';
      wordCounter.style.fontWeight = '700';
    } else {
      wordCounter.style.color = 'var(--gold-deep)';
      wordCounter.style.fontWeight = '600';
    }
  };
  fMsg.addEventListener('input', updateWordCount);
  updateWordCount();
}

if(form) {
  form.addEventListener('change',function(){var off=form.hadir.value==='Berhalangan';$('#fCount').disabled=off});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var nm=(window.__GUEST_NAME || form.nama.value).trim();
    var city = form.asal ? form.asal.value.trim() : '';
    var h=form.hadir.value,n=+form.jumlah.value||1,p=form.pesan.value.trim();

    var words = countRsvpWords(p);
    if(words > 80) {
      alert('Mohon maaf, doa & ucapan maksimal 80 kata (saat ini ' + words + ' kata).');
      form.pesan.focus();
      return;
    }

    var m="Assalamu'alaikum Wr. Wb.\n\nSaya "+nm+(city ? " ("+city+")" : "")+" mengonfirmasi kehadiran pada walimatul 'urs "+CONFIG.eventTitle+".\n\nKehadiran: "+(h==='Hadir'?'Insya Allah hadir ('+n+' orang)':'Mohon maaf, berhalangan hadir');
    if(p)m+="\n\nDoa & ucapan:\n"+p;
    m+="\n\nJazakumullahu khairan.";
    msgText=m;
    if($('#resMsg')) $('#resMsg').textContent=m;
    var phone = (CONFIG.whatsapp || '6285171542025').replace(/[^0-9]/g, '');
    if($('#waBtn')) $('#waBtn').href='https://wa.me/'+phone+'?text='+encodeURIComponent(m);
    form.hidden=true;
    if(result) {
      result.hidden=false;
      result.scrollIntoView({block:'center',behavior:K<1?'auto':'smooth'});
    }

    // Update live wish carousel immediately so user sees their wish right away
    var curSlug = window.__WEDDING_SLUG || 'nabil-izza';
    var newWish = {
      wedding_slug: curSlug,
      name: nm,
      city: city,
      category: window.__GUEST_CATEGORY || 'Umum',
      presence: h,
      pax: (h==='Hadir' ? n : 0) + ' Orang',
      message: p,
      created_at: new Date().toISOString()
    };
    // Jika tamu menekan "Ubah" lalu kirim ulang, ganti kartu sebelumnya (jangan dobel)
    var prev = window.__lastOwnWish;
    if(prev && prev.slide && prev.slide.parentNode) prev.slide.parentNode.removeChild(prev.slide);
    window.__lastOwnWish = null;
    // Kartu ucapan hanya menampilkan tamu yang menulis doa/ucapan
    if(p && window.__addLiveWishToCarousel) {
      window.__lastOwnWish = { slide: window.__addLiveWishToCarousel(newWish, true), created_at: newWish.created_at };
    }
    try {
      var savedWishes = JSON.parse(localStorage.getItem('wedding_wishes_' + curSlug) || '[]');
      if(!Array.isArray(savedWishes)) savedWishes = [];
      if(prev) savedWishes = savedWishes.filter(function(w){ return w.created_at !== prev.created_at; });
      if(p) savedWishes.unshift(newWish);
      localStorage.setItem('wedding_wishes_' + curSlug, JSON.stringify(savedWishes.slice(0, 30)));
    } catch(e){}
    if(prev && !p) { currentWishIndex = 0; ensureActiveWishSlide(); updateDots(); updateStageHeight(); }

    // Simpan RSVP & Ucapan ke Cloudflare D1 via /api/rsvps
    try {
      fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nm,
          city: city,
          category: window.__GUEST_CATEGORY || 'Umum',
          attendance: h,
          pax: n,
          message: p
        })
      }).catch(function(err){
        console.warn('Gagal sync RSVP ke Cloudflare D1:', err);
      });
    } catch(err){}

    // Simpan ke Supabase wedding_wishes jika server online
    try {
      var sb = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if(sb) {
        // supabase-js tidak melempar error, tapi mengembalikannya di res.error
        sb.from('wedding_wishes').insert([newWish]).then(function(res){
          if(res && res.error) console.warn('Gagal menyimpan ucapan ke Supabase:', res.error.message);
        }, function(err){
          console.warn('Wishes sync to Supabase offline:', err && err.message ? err.message : err);
        });
      }
    } catch(err){}
  });
}
if($('#copyMsg')) $('#copyMsg').addEventListener('click',function(){var b=this;copyText(msgText).then(function(){flash(b,'Tersalin')},function(){flash(b,'Gagal')})});
if($('#editMsg')) $('#editMsg').addEventListener('click',function(){if(result) result.hidden=true;if(form) { form.hidden=false;form.nama.focus(); }});

