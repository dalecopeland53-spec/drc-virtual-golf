(()=>{
const DEFAULT_BAG={"Driver":230,"3 Wood":210,"5 Wood":195,"4 Iron":180,"5 Iron":170,"6 Iron":160,"7 Iron":150,"8 Iron":140,"9 Iron":130,"PW":115,"GW":100,"SW":85,"LW":70};
const byId=id=>document.getElementById(id);
function cleanBag(){let changed=false;Object.entries(DEFAULT_BAG).forEach(([club,fallback])=>{const v=Number(bagMetres&&bagMetres[club]);if(!Number.isFinite(v)||v<10||v>400){bagMetres[club]=fallback;changed=true}});if(changed)localStorage.setItem("drcBagMetres",JSON.stringify(bagMetres));return bagMetres}
function nearestClub(distance){cleanBag();const t=Number(distance);if(!Number.isFinite(t)||t<=0)return"Driver";let best="Driver",gap=Infinity;Object.entries(bagMetres).forEach(([club,carry])=>{const c=Number(carry);if(!Number.isFinite(c)||c<=0)return;const d=Math.abs(t-c);if(d<gap){gap=d;best=club}});return best}
window.chooseNearestClub=nearestClub;
window.recommendClub=function(){cleanBag();const t=Number(getCurrentCentreDistance());const max=Math.max(...Object.values(bagMetres).map(Number).filter(Number.isFinite));setRecommendedClub(t>max?"Driver":nearestClub(t))};
const originalSaveBag=window.saveBag;
window.saveBag=function(){if(typeof originalSaveBag==="function")originalSaveBag();cleanBag();window.recommendClub()};
function canonicalName(){const main=(byId("caddieName")?.value||"").trim(),stored=(localStorage.getItem("drcCaddieName")||"").trim();return main||stored||"Pete"}
function syncName(name,announce=false){const n=String(name||"").trim()||"Pete";localStorage.setItem("drcCaddieName",n);["caddieName","moreCaddieName"].forEach(id=>{const e=byId(id);if(e&&e.value!==n)e.value=n});["askName","largeCaddieName"].forEach(id=>{const e=byId(id);if(e)e.textContent=n});if(announce&&typeof setCaddieAnswers==="function")setCaddieAnswers("Ready. Ask "+n+" for the shot.");return n}
window.getCaddieName=function(){return canonicalName()};
window.saveCaddieName=function(){return syncName(byId("caddieName")?.value,true)};
window.saveCaddieNameFromMore=function(){return syncName(byId("moreCaddieName")?.value,true)};
function bindNameInputs(){const main=byId("caddieName"),more=byId("moreCaddieName");if(main&&!main.dataset.drcBound){main.dataset.drcBound="1";main.addEventListener("blur",()=>window.saveCaddieName());main.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();main.blur()}})}if(more&&!more.dataset.drcBound){more.dataset.drcBound="1";more.addEventListener("blur",()=>window.saveCaddieNameFromMore());more.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();more.blur()}})}}
function init(){cleanBag();const saved=(localStorage.getItem("drcCaddieName")||"Pete").trim()||"Pete";syncName(saved,false);bindNameInputs();window.recommendClub();if(typeof updateCaddiePage==="function")updateCaddiePage()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();