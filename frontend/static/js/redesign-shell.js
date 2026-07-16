"use strict";
(function(){
  function byId(id){return document.getElementById(id)}
  function show(el){if(!el)return;el.hidden=false;document.body.style.overflow="hidden"}
  function hide(el){if(!el)return;el.hidden=true;if(!document.querySelector('.rd-modal:not([hidden]),.rd-mobile-sheet:not([hidden])'))document.body.style.overflow=""}
  var add=byId('rd-add-modal'),addBg=byId('rd-modal-backdrop'),more=byId('rd-more-sheet'),moreBg=byId('rd-more-backdrop'),notif=byId('notif-sheet');
  function openAdd(){show(addBg);show(add)} function closeAdd(){hide(add);hide(addBg)}
  function openMore(){show(moreBg);show(more)} function closeMore(){hide(more);hide(moreBg)}
  ['topbar-add-expense-btn','rd-mobile-add'].forEach(function(id){var e=byId(id);if(e)e.addEventListener('click',openAdd)});
  ['rd-mobile-more','rd-mobile-menu'].forEach(function(id){var e=byId(id);if(e)e.addEventListener('click',openMore)});
  var e=byId('rd-add-close');if(e)e.addEventListener('click',closeAdd);if(addBg)addBg.addEventListener('click',closeAdd);
  e=byId('rd-more-close');if(e)e.addEventListener('click',closeMore);if(moreBg)moreBg.addEventListener('click',closeMore);
  var bell=byId('topbar-bell-btn');if(bell)bell.addEventListener('click',function(){if(!notif)return;notif.hidden?show(notif):hide(notif);if(window.Notifications&&window.Notifications.refresh)window.Notifications.refresh()});
  e=byId('notif-sheet-cancel');if(e)e.addEventListener('click',function(){hide(notif)});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'){closeAdd();closeMore();hide(notif)}});
  var search=byId('shell-global-search');if(search)search.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&search.value.trim())window.location.href='/transactions?search='+encodeURIComponent(search.value.trim())});
})();