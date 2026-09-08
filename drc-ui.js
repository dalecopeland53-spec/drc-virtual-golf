(function(){
function openLogin(){var s=document.getElementById("drcLogin");if(s)s.classList.remove("hidden")}
function enterApp(){document.getElementById("drcLogin").classList.add("hidden");showView("round")}
window.DRC_LOGOUT=openLogin;
var s=document.createElement("section");s.className="login-screen";s.id="drcLogin";
s.innerHTML='<div class="login-shell welcome-shell"><img class="login-logo" src="drc-virtual-golf-icon.png" alt="DRC Virtual Golf Elite"><div class="welcome-copy"><div class="welcome-title">Welcome back, Dale</div><div class="login-tag">Your caddie. Your game.</div><button id="loginGo" class="login-go welcome-go">ENTER DRC VIRTUAL GOLF</button><div class="login-links welcome-links"><span id="welcomeHelp">Help &amp; Support</span></div></div></div>';
document.body.appendChild(s);
document.getElementById("loginGo").onclick=enterApp;
document.getElementById("welcomeHelp").onclick=function(){s.classList.add("hidden");if(typeof openTool==="function")openTool("help")};
var m=document.querySelector(".menu");if(m){m.setAttribute("role","button");m.setAttribute("aria-label","Return to welcome");m.onclick=openLogin}
var t=document.querySelector("#scorecardView .screen-title");if(t)t.textContent="Round Summary";
var u=document.querySelector("#scorecardView .screen-subtitle");if(u)u.textContent="Your complete 18-hole round";
var v=document.querySelector(".actions .scorecard");if(v)v.innerHTML="☷ ROUND SUMMARY";
var oldNext=window.nextHole;window.nextHole=function(){if(currentHole>=17){openTool("scorecard");return}oldNext()}
var stable=document.createElement("script");stable.src="drc-stability.js?v=20260909-s1";stable.defer=false;document.body.appendChild(stable);
var intel=document.createElement("script");intel.src="drc-intelligence.js?v=20260909-ci2";intel.defer=false;document.body.appendChild(intel);
})();