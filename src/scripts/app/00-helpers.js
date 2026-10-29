var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
var rnd = function(a,b){ return a+Math.random()*(b-a); };
var html = document.documentElement;
var K = html.classList.contains('rm') ? 0.2 : 1;

function get(o,p){ return p.split('.').reduce(function(a,k){ return a==null ? a : a[k]; }, o); }

