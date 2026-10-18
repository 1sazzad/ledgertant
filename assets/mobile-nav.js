/* Accessible mobile navigation controller. All ten sections stay discoverable. */
(function(root){
"use strict";
const sidebar=document.querySelector(".side");
const button=document.getElementById("mobileMenuToggle");
const menu=document.getElementById("menu");
if(!sidebar||!button||!menu)return;
const glyph=button.querySelector(".mobile-menu-glyph");
function setOpen(open){
  const value=Boolean(open);
  sidebar.classList.toggle("menu-open",value);
  button.setAttribute("aria-expanded",String(value));
  button.setAttribute("aria-label",value?"Close navigation menu":"Open navigation menu");
  if(glyph)glyph.textContent=value?"✕":"☰";
}
button.addEventListener("click",function(){setOpen(button.getAttribute("aria-expanded")!=="true")});
document.addEventListener("click",function(event){
  const element=event.target;
  if(element.closest("[data-nav]")||element.closest('[data-experience="view"]')){
    setOpen(false);return;
  }
  if(!sidebar.contains(element))setOpen(false);
});
document.addEventListener("keydown",function(event){
  if(event.key==="Escape"&&sidebar.classList.contains("menu-open")){
    setOpen(false);
    button.focus();
  }
});
window.addEventListener("resize",function(){
  if(window.innerWidth>900)setOpen(false);
});
root.LedgertantMobileNav=Object.freeze({close:function(){setOpen(false)}});
})(globalThis);
