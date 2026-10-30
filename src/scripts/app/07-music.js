/* ---------- MUSIC (AUDIO FILE PLAYLIST & MAQAM HIJAZ SYNTHESIZER FALLBACK) ---------- */
var Music=(function(){
  var ctx,master,verb,timer,next=0,beat=0,bar=0,playing=false,audioEl=null,started=false;
  var SC=[-12,-11,-8,-7,-5,-4,-2,0,1,4,5,7,8,10,12];
  var PH=[[[7,8,9,8,7,6,7],[1,.5,1.5,.5,1,1,2]],[[9,10,11,10,9,8,7,8,7],[1,.5,1,.5,1,1,1,.5,.5]],[[11,12,11,10,9,8,7],[1.5,.5,1,1,1,1,2]],[[7,6,5,6,7,8,9,7],[1,.5,1,.5,1,1,1,1]],[[9,8,7,8,9,11,10,9,7],[.5,.5,1,.5,.5,1.5,1,1,1.5]]];
  var BT=.8,pi=0;
  function f(semi){return 293.66*Math.pow(2,semi/12)}
  function impulse(){var len=ctx.sampleRate*3.2,b=ctx.createBuffer(2,len,ctx.sampleRate);for(var c=0;c<2;c++){var d=b.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}return b}
  function init(){
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    ctx=new AC();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    verb=ctx.createConvolver();verb.buffer=impulse();var vg=ctx.createGain();vg.gain.value=.75;verb.connect(vg);vg.connect(master);
    var dry=ctx.createGain();dry.gain.value=.85;dry.connect(master);ctx.dry=dry;
    [[73.42,.06],[110,.04],[146.83,.03],[185,.018],[220,.016]].forEach(function(p,i){
      var o=ctx.createOscillator(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();
      o.type=i<2?'sawtooth':'sine';o.frequency.value=p[0];o.detune.value=(i%2?4:-4);
      var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=i<2?420:1200;
      g.gain.value=p[1];l.frequency.value=.07+i*.03;lg.gain.value=p[1]*.45;l.connect(lg);lg.connect(g.gain);
      o.connect(lp);lp.connect(g);g.connect(dry);g.connect(verb);o.start();l.start();
    });
    return true;
  }
  function pluck(t,freq,vel,dur){
    var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type='triangle';o2.type='sawtooth';o.frequency.value=freq;o2.frequency.value=freq*1.003;
    lp.type='lowpass';lp.Q.value=2;lp.frequency.setValueAtTime(3200,t);lp.frequency.exponentialRampToValueAtTime(420,t+.55);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    var g2=ctx.createGain();g2.gain.value=.35;o.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);g.connect(ctx.dry);g.connect(verb);
    o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);
  }
  function doum(t,v){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(52,t+.16);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.42);o.connect(g);g.connect(ctx.dry);o.start(t);o.stop(t+.45)}
  function tek(t,v){var len=ctx.sampleRate*.08,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);var s=ctx.createBufferSource();s.buffer=b;var hp=ctx.createBiquadFilter();hp.type='bandpass';hp.frequency.value=2400;hp.Q.value=.8;var g=ctx.createGain();g.gain.value=v;s.connect(hp);hp.connect(g);g.connect(ctx.dry);g.connect(verb);s.start(t)}
  function bell(t,freq){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+3);o.connect(g);g.connect(verb);g.connect(ctx.dry);o.start(t);o.stop(t+3.1)}
  function scheduleBar(t0){
    [0,4].forEach(function(b){doum(t0+b*BT,.2)});
    [2,6].forEach(function(b){tek(t0+b*BT,.05)});
    doum(t0+3*BT,.08);doum(t0+5*BT,.08);tek(t0+7.5*BT,.03);
    var ph=PH[pi%PH.length];pi++;var tt=t0+.5*BT,sum=ph[1].reduce(function(a,b){return a+b},0),sc=6.6/sum;
    if(bar%4===3){bell(t0+BT,f(SC[11]+12));bell(t0+4*BT,f(SC[9]+12));}
    else ph[0].forEach(function(ix,i){var d=ph[1][i]*sc*BT;pluck(tt,f(SC[ix]),.2,Math.max(1.4,d*1.8));tt+=d});
    pluck(t0,f(SC[bar%2?3:0]),.16,2.4);
    bar++;
  }
  function loop(){
    while(next<ctx.currentTime+1.6){scheduleBar(next);next+=8*BT}
  }
  function fade(to,sec){var t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(to,t+sec)}

  function normalizeMusic(src) {
    if(!src || src==='none') return '';
    src = src.trim();
    if(src.indexOf('http://')===0 || src.indexOf('https://')===0 || src.indexOf('data:')===0) return src;
    if(src.indexOf('/music/')===0) return src;
    if(src.indexOf('music/')===0) return '/' + src;
    if(src.indexOf('/')===0) return '/music' + src;
    return '/music/' + src;
  }

  var defaultPlaylist = [
    '/music/Maher Zain - Sepanjang Hidup.mp3'
  ];
  var currentTrackIndex = 0;
  var useSynth = false;

  function getPlaylist() {
    if (CONFIG && CONFIG.playlist && Array.isArray(CONFIG.playlist) && CONFIG.playlist.length) {
      return CONFIG.playlist;
    }
    return defaultPlaylist;
  }

  function startSynth(){
    useSynth=true;
    if(!ctx&&!init())return;
    ctx.resume();if(!started){next=ctx.currentTime+.2;started=true}
    if(!timer)timer=setInterval(loop,250);loop();fade(.55,4);playing=true;ui();
  }

  function playTrack(idx) {
    var list = getPlaylist();
    currentTrackIndex = idx % list.length;
    var track = normalizeMusic(list[currentTrackIndex]);
    if (!track) { startSynth(); return; }

    if (!audioEl) {
      audioEl = new Audio();
      audioEl.volume = 0.6;
      audioEl.loop = false; // Memungkinkan event 'ended' terpicu saat lagu selesai
      audioEl.addEventListener('ended', function() {
        // Otomatis ganti ke lagu berikutnya ketika lagu saat ini selesai
        var l = getPlaylist();
        currentTrackIndex = (currentTrackIndex + 1) % l.length;
        playTrack(currentTrackIndex);
      });
    }

    var encoded = encodeURI(track).replace(/%25([0-9A-F]{2})/gi, '%$1');
    audioEl.src = encoded;
    audioEl.dataset.src = track;
    playing = true;
    ui();

    audioEl.play().catch(function(err) {
      if (err && err.name === 'NotAllowedError') {
        playing = false;
        ui();
        return;
      }
      // Bila berkas audio gagal dimuat, coba putar lagu berikutnya di playlist
      var l = getPlaylist();
      if (l.length > 1) {
        currentTrackIndex = (currentTrackIndex + 1) % l.length;
        var nextTrack = normalizeMusic(l[currentTrackIndex]);
        if (audioEl.dataset.src !== nextTrack) {
          playTrack(currentTrackIndex);
          return;
        }
      }
      startSynth();
    });
  }

  function start() {
    if (useSynth) { startSynth(); return; }
    if (audioEl && audioEl.dataset.src && audioEl.paused) {
      playing = true;
      ui();
      audioEl.play().catch(function(err) {
        if (err && err.name === 'NotAllowedError') {
          playing = false;
          ui();
          return;
        }
        startSynth();
      });
      return;
    }
    playTrack(currentTrackIndex);
  }

  function stop() {
    playing = false;
    ui();
    if (audioEl && !useSynth) {
      audioEl.pause();
      return;
    }
    if (!ctx) return;
    fade(0, 0.6);
    setTimeout(function() {
      if (!playing && ctx && ctx.state === 'running') ctx.suspend();
    }, 700);
  }

  function ui() {
    var b = $('#music');
    if (!b) return;
    b.setAttribute('aria-pressed', playing ? 'true' : 'false');
    b.classList.toggle('playing', playing);
  }

  return {
    start: start,
    stop: stop,
    toggle: function() { playing ? stop() : start(); },
    isOn: function() { return playing; },
    next: function() {
      var l = getPlaylist();
      currentTrackIndex = (currentTrackIndex + 1) % l.length;
      playTrack(currentTrackIndex);
    }
  };
})();
if($('#music')) $('#music').addEventListener('click',function(){Music.toggle()});
