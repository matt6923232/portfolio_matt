(function(){
  "use strict";
  const KEY="portfolioTheme";
  function apply(theme, animate){
    const t=theme === "light" ? "light" : "dark";
    if(animate && document.body){
      document.body.classList.add("theme-switching");
      clearTimeout(window.__themeSwitchTimer);
      window.__themeSwitchTimer=setTimeout(()=>document.body.classList.remove("theme-switching"),650);
    }
    document.documentElement.dataset.theme=t;
    const b=document.getElementById("themeToggle");
    if(b){b.innerHTML=t==="dark"?'<span class="profile-item-icon">☀</span><span>LIGHT MODE</span>':'<span class="profile-item-icon">☾</span><span>DARK MODE</span>';b.setAttribute("aria-label",t==="dark"?"Switch to light mode":"Switch to dark mode");}
  }
  function toggle(){const next=(localStorage.getItem(KEY)||"dark")==="dark"?"light":"dark";localStorage.setItem(KEY,next);apply(next,true);}
  apply(localStorage.getItem(KEY)||"dark",false);
  document.addEventListener("DOMContentLoaded",function(){apply(localStorage.getItem(KEY)||"dark",false);document.addEventListener("click",function(e){const b=e.target.closest("#themeToggle");if(b){e.preventDefault();e.stopPropagation();toggle();}});});
  window.portfolioThemeToggle=toggle;
})();
