/* ---------- COPY TO CLIPBOARD ---------- */
function copyText(txt){
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(txt).catch(function(){return fb(txt)});
  return fb(txt);
}
function fb(txt){return new Promise(function(res,rej){var ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,99999);var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(ta);ok?res():rej()})}
function flash(btn,label){var o=btn.dataset.o||btn.textContent;btn.dataset.o=o;btn.textContent=label;clearTimeout(btn._t);btn._t=setTimeout(function(){btn.textContent=o},1800)}
// Satu listener delegasi: tetap berfungsi walau daftar rekening dirender ulang dari dashboard
if($('#banksContainer')) $('#banksContainer').addEventListener('click',function(e){
  var b=e.target.closest('.copy');if(!b)return;
  var num=b.getAttribute('data-copy-num');
  if(!num&&b.dataset.copy!=null&&CONFIG.banks&&CONFIG.banks[+b.dataset.copy])num=CONFIG.banks[+b.dataset.copy].number;
  if(!num)return;
  copyText(String(num).replace(/\s+/g,'')).then(function(){flash(b,'Tersalin')},function(){flash(b,'Gagal')});
});

