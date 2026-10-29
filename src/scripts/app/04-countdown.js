/* ---------- LIVE COUNTDOWN TIMER ---------- */
(function(){
  var els={d:$('#cdD'),h:$('#cdH'),m:$('#cdM'),s:$('#cdS')},last={};
  function set(k,v){var s=String(v).padStart(2,'0');if(last[k]!==s){last[k]=s;if(els[k]){els[k].textContent=s;els[k].classList.remove('tick');void els[k].offsetWidth;els[k].classList.add('tick')}}}
  function tick(){
    var t=new Date(CONFIG.targetDate).getTime();
    var d=Math.max(0,t-Date.now());
    set('d',Math.floor(d/864e5));
    set('h',Math.floor(d%864e5/36e5));
    set('m',Math.floor(d%36e5/6e4));
    set('s',Math.floor(d%6e4/1e3));
  }
  tick();setInterval(tick,1000);
})();

