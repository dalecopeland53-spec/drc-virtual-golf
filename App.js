import React,{useEffect,useRef}from'react';
import{SafeAreaView,StyleSheet,StatusBar,Platform,PermissionsAndroid}from'react-native';
import{WebView}from'react-native-webview';
import{ExpoSpeechRecognitionModule,useSpeechRecognitionEvent}from'expo-speech-recognition';
import*as Speech from'expo-speech';

export default function App(){
const webRef=useRef(null);
const recognizingRef=useRef(false);
const lastTranscriptRef=useRef('');
const commandSentRef=useRef(false);
const webReadyRef=useRef(false);
const pendingCommandRef=useRef('');

const liveProjectUrl='https://dalecopeland53-spec.github.io/drc-virtual-golf/?build=20260908';

const sendToWeb=code=>{
try{
if(webRef.current){
webRef.current.injectJavaScript(`
try{
${code}
}catch(e){}
true;
`);
}
}catch(e){}
};

const showAnswer=text=>{
sendToWeb(`
(function(){
var a=document.getElementById("caddieAnswer");
var b=document.getElementById("largeCaddieAnswer");
if(a)a.textContent=${JSON.stringify(text)};
if(b)b.textContent=${JSON.stringify(text)};
})();
`);
};

const showHeard=text=>{
sendToWeb(`
(function(){
var a=document.getElementById("caddieHeard");
var b=document.getElementById("largeCaddieHeard");
if(a)a.textContent=${JSON.stringify(text)};
if(b)b.textContent=${JSON.stringify(text)};
})();
`);
};

const setListening=on=>{
sendToWeb(`
(function(){
var a=document.getElementById("micButton");
var b=document.getElementById("largeMic");
if(a)a.classList.toggle("listening",${on});
if(b)b.classList.toggle("listening",${on});
})();
`);
};

const speakAnswer=text=>{
const clean=String(text||'').trim();
if(!clean)return;

Speech.stop();

Speech.speak(clean,{
language:'en-AU',
rate:.9,
pitch:1,
volume:1
});
};

const deliverCommand=text=>{
const clean=String(text||'').trim();

if(!clean||commandSentRef.current)return;

commandSentRef.current=true;
lastTranscriptRef.current=clean;
showHeard(clean);

if(!webReadyRef.current){
pendingCommandRef.current=clean;
showAnswer('Caddie is loading your shot...');
return;
}

sendToWeb(`
(function(){
var speech=${JSON.stringify(clean)};
var fn=null;

if(typeof window.DRC_RUN_COMMAND==="function"){
fn=window.DRC_RUN_COMMAND;
}else if(typeof window.handleGolfCommand==="function"){
fn=window.handleGolfCommand;
}else{
try{
if(typeof handleGolfCommand==="function"){
fn=handleGolfCommand;
}
}catch(e){}
}

if(fn){
try{
fn(speech);
}catch(e){
var a=document.getElementById("caddieAnswer");
var b=document.getElementById("largeCaddieAnswer");
var message="The caddie could not process that question.";
if(a)a.textContent=message;
if(b)b.textContent=message;
}
}else{
var a=document.getElementById("caddieAnswer");
var b=document.getElementById("largeCaddieAnswer");
var message="Caddie connection is not ready. Tap the microphone again.";
if(a)a.textContent=message;
if(b)b.textContent=message;
}
})();
`);
};

useEffect(()=>{
const requestPermissions=async()=>{
if(Platform.OS!=='android')return;

try{
await PermissionsAndroid.requestMultiple([
PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
]);
}catch(e){}
};

requestPermissions();

return()=>{
try{
ExpoSpeechRecognitionModule.abort();
Speech.stop();
}catch(e){}
};
},[]);

useSpeechRecognitionEvent('start',()=>{
recognizingRef.current=true;
lastTranscriptRef.current='';
commandSentRef.current=false;
setListening(true);
showHeard('Listening...');
showAnswer('Listening...');
});

useSpeechRecognitionEvent('result',event=>{
try{
const text=event?.results?.[0]?.transcript?.trim()||'';

if(!text)return;

lastTranscriptRef.current=text;
showHeard(text);

if(event?.isFinal===true){
deliverCommand(text);
}
}catch(e){
showAnswer("I heard you, but couldn't process the words.");
}
});

useSpeechRecognitionEvent('end',()=>{
recognizingRef.current=false;
setListening(false);

if(!commandSentRef.current&&lastTranscriptRef.current){
deliverCommand(lastTranscriptRef.current);
return;
}

if(!commandSentRef.current){
showHeard('No words heard');
showAnswer("Didn't hear anything. Tap the microphone and speak again.");
}
});

useSpeechRecognitionEvent('error',event=>{
recognizingRef.current=false;
setListening(false);

if(lastTranscriptRef.current&&!commandSentRef.current){
deliverCommand(lastTranscriptRef.current);
return;
}

const error=event?.error||'';
let message="Didn't catch that. Tap the microphone and try again.";

if(error==='not-allowed'||error==='permission-denied'){
message='Microphone permission is blocked.';
}else if(error==='audio-capture'){
message="The microphone isn't available right now.";
}else if(error==='no-speech'||error==='speech-timeout'){
message="Didn't hear anything. Tap the microphone and speak again.";
}else if(error==='network'){
message="Voice recognition couldn't reach the phone's speech service.";
}else if(error==='service-not-allowed'){
message='Speech recognition is not available on this phone.';
}else if(error==='busy'){
message='The microphone is busy. Tap it again.';
}

showHeard('Voice error');
showAnswer(message);
});

const startNativeSpeech=async()=>{
try{
if(recognizingRef.current){
ExpoSpeechRecognitionModule.stop();
return;
}

await Speech.stop();

lastTranscriptRef.current='';
commandSentRef.current=false;

const permission=await ExpoSpeechRecognitionModule.requestPermissionsAsync();

if(!permission?.granted){
showAnswer('Microphone permission is blocked.');
return;
}

showHeard('Listening...');
showAnswer('Listening...');

const defaultService=Platform.OS==='android'
?ExpoSpeechRecognitionModule.getDefaultRecognitionService?.()?.packageName
:undefined;

ExpoSpeechRecognitionModule.start({
lang:'en-AU',
interimResults:true,
maxAlternatives:1,
continuous:false,
requiresOnDeviceRecognition:false,
addsPunctuation:false,
androidRecognitionServicePackage:defaultService||undefined
});
}catch(e){
recognizingRef.current=false;
setListening(false);
showAnswer("The microphone couldn't start.");
}
};

const onMessage=event=>{
try{
const raw=event.nativeEvent.data;
let data;

try{
data=JSON.parse(raw);
}catch(e){
data={type:raw};
}

if(
data?.type==='DRC_START_SPEECH'||
data?.type==='START_SPEECH'||
data?.type==='ASK_CADDIE'
){
startNativeSpeech();
return;
}

if(data?.type==='DRC_SPEAK_ANSWER'&&data?.text){
speakAnswer(data.text);
return;
}

if(data?.type==='DRC_WEB_READY'){
webReadyRef.current=true;
const pending=pendingCommandRef.current;
pendingCommandRef.current='';
if(pending){
commandSentRef.current=false;
deliverCommand(pending);
}
}
}catch(e){}
};

const compactBridge=`
(function(){
function addCompactStyle(){
if(document.getElementById("drcNativeCompactStyle"))return;

var style=document.createElement("style");
style.id="drcNativeCompactStyle";
style.textContent=
'html,body{margin:0!important;padding:0!important;background:#020812!important;overflow-x:hidden!important}'+
'.app{min-height:100vh!important;padding:0 6px 74px!important;background:#020812!important}'+
'.header{min-height:54px!important;height:54px!important;padding:4px 8px!important;display:grid!important;grid-template-columns:42px 1fr 92px!important;align-items:center!important}'+
'.menu{font-size:28px!important}.brand-main{font-size:17px!important;line-height:19px!important;white-space:nowrap!important}.brand-sub{font-size:10px!important}.weather{font-size:10px!important;line-height:14px!important}'+
'.play-grid{display:flex!important;flex-direction:column!important;gap:6px!important}'+
'.right{display:contents!important}'+
'.hole-panel{order:1!important;min-height:54px!important;padding:7px 10px!important;margin:0!important}'+
'.hole-title{font-size:22px!important;line-height:24px!important}.hole-meta{font-size:12px!important}.hole-nav button{width:38px!important;height:38px!important;font-size:22px!important}'+
'.map-card{order:2!important;width:100%!important;height:205px!important;min-height:205px!important;margin:0!important;border-radius:12px!important}'+
'.gps-badge{font-size:10px!important;padding:5px 8px!important}.map-switch{transform:scale(.84)!important;transform-origin:bottom right!important}'+
'.marker-label{font-size:12px!important}.player-dot{width:22px!important;height:22px!important}'+
'.distance-panel{order:3!important;min-height:68px!important;padding:7px 10px!important;margin:0!important}'+
'.distance-panel .label{font-size:10px!important}.big-distance{font-size:28px!important;line-height:31px!important}.distance-list{font-size:11px!important;line-height:18px!important}'+
'.voice-panel{order:4!important;padding:9px!important;margin:0!important}'+
'.voice-top{min-height:28px!important}.voice-title{font-size:16px!important}.caddie-name{height:30px!important;max-width:88px!important;font-size:14px!important}'+
'.mic-area{display:grid!important;grid-template-columns:52px 1fr!important;grid-template-rows:auto auto!important;column-gap:10px!important;align-items:center!important;margin:3px 0 7px!important;text-align:left!important}'+
'.mic{grid-row:1/3!important;width:50px!important;height:50px!important;font-size:24px!important;margin:0!important}.ask-name{font-size:16px!important;margin:0!important}.tap-text{font-size:11px!important;margin:0!important}'+
'.native-heard-box{background:#030b18!important;border:1px solid #28527d!important;border-radius:9px!important;padding:7px 9px!important;margin:5px 0!important}'+
'.native-box-label{color:#88a3c8!important;font-size:9px!important;font-weight:900!important;letter-spacing:1.3px!important;margin-bottom:3px!important}'+
'.native-heard-text{color:#fff!important;font-size:13px!important;line-height:17px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}'+
'.answer,.caddie-response-large{position:relative!important;min-height:68px!important;max-height:92px!important;overflow:auto!important;padding:23px 10px 8px!important;margin:5px 0 0!important;border:1px solid #d4ae55!important;border-radius:9px!important;color:#fff!important;font-size:13px!important;line-height:18px!important;text-align:left!important;background:#030b18!important}'+
'.answer:before,.caddie-response-large:before{content:"CADDIE\\\\'S ADVICE";position:absolute;top:6px;left:10px;color:#d4ae55;font-size:9px;font-weight:900;letter-spacing:1.2px}'+
'.club-panel{order:5!important;min-height:62px!important;padding:7px 10px!important;margin:0!important}'+
'.club-panel .section-title{font-size:10px!important}.club-row{min-height:32px!important}.club-name{font-size:20px!important}.club-icon{font-size:22px!important}.carry{font-size:9px!important}.carry strong{font-size:17px!important}.club-select{height:29px!important;font-size:12px!important}'+
'.last-shot-panel{display:none!important}'+
'.score-panel{min-height:82px!important;margin:6px 0!important;padding:0!important}.score-cell{padding:5px 2px!important}.score-label{font-size:10px!important}.score-number{font-size:20px!important;line-height:23px!important}.score-btn,.circle{width:28px!important;height:28px!important;font-size:18px!important}'+
'.actions{height:46px!important;margin:0 0 5px!important;gap:6px!important}.actions button{height:44px!important;font-size:13px!important;padding:0 8px!important}'+
'.bottom-nav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;height:68px!important;padding:5px 4px 8px!important;background:#020812!important;z-index:9999!important;border-top:1px solid #17304c!important}'+
'.bottom-nav button{font-size:10px!important;padding:2px!important}.nav-icon{font-size:20px!important;margin-bottom:1px!important}'+
'.screen-page{padding:10px 8px 82px!important}.screen-title{font-size:24px!important}.large-card{padding:12px!important;margin-bottom:9px!important}';

document.head.appendChild(style);
}

function addHeardBoxes(){
var answer=document.getElementById("caddieAnswer");

if(answer&&!document.getElementById("caddieHeardBox")){
var box=document.createElement("div");
box.id="caddieHeardBox";
box.className="native-heard-box";
box.innerHTML='<div class="native-box-label">HEARD</div><div id="caddieHeard" class="native-heard-text">Tap the microphone and speak</div>';
answer.parentNode.insertBefore(box,answer);
}

var largeAnswer=document.getElementById("largeCaddieAnswer");

if(largeAnswer&&!document.getElementById("largeCaddieHeardBox")){
var largeBox=document.createElement("div");
largeBox.id="largeCaddieHeardBox";
largeBox.className="native-heard-box";
largeBox.innerHTML='<div class="native-box-label">HEARD</div><div id="largeCaddieHeard" class="native-heard-text">Tap the microphone and speak</div>';
largeAnswer.parentNode.insertBefore(largeBox,largeAnswer);
}
}

function sendMic(){
try{
window.ReactNativeWebView.postMessage(
JSON.stringify({type:"DRC_START_SPEECH"})
);
}catch(e){}
}

function sendSpeech(text){
try{
window.ReactNativeWebView.postMessage(
JSON.stringify({
type:"DRC_SPEAK_ANSWER",
text:String(text||"")
})
);
}catch(e){}
}

function connectCaddie(){
var connected=false;
try{
if(typeof window.handleGolfCommand==="function"){
window.DRC_RUN_COMMAND=function(text){
return window.handleGolfCommand(text);
};
connected=true;
}else if(typeof handleGolfCommand==="function"){
window.DRC_RUN_COMMAND=function(text){
return handleGolfCommand(text);
};
connected=true;
}
}catch(e){}

window.speak=function(text){
sendSpeech(text);
};

if(connected){
try{window.ReactNativeWebView.postMessage(JSON.stringify({type:"DRC_WEB_READY"}));}catch(e){}
}
}

window.DRCNativeSpeech=sendMic;

addCompactStyle();
addHeardBoxes();
connectCaddie();

setTimeout(function(){
addHeardBoxes();
connectCaddie();
},500);

setTimeout(function(){
addHeardBoxes();
connectCaddie();
},1500);

document.addEventListener(
"click",
function(e){
var target=e.target;
if(!target)return;

var button=target.closest?target.closest("button"):null;
if(!button)return;

if(button.id==="micButton"||button.id==="largeMic"){
e.preventDefault();
e.stopPropagation();

if(e.stopImmediatePropagation){
e.stopImmediatePropagation();
}

sendMic();
}
},
true
);
})();
true;
`;

return(
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor="#020812"/>

<WebView
ref={webRef}
source={{
uri:liveProjectUrl,
headers:{'Cache-Control':'no-cache'}
}}
style={styles.webview}
javaScriptEnabled={true}
domStorageEnabled={true}
geolocationEnabled={true}
cacheEnabled={false}
cacheMode="LOAD_NO_CACHE"
startInLoadingState={true}
mediaPlaybackRequiresUserAction={false}
allowsInlineMediaPlayback={true}
mixedContentMode="compatibility"
injectedJavaScriptBeforeContentLoaded={compactBridge}
injectedJavaScript={compactBridge}
onMessage={onMessage}
onLoadEnd={()=>{
webReadyRef.current=false;
sendToWeb(compactBridge);
sendToWeb('(function(){var n=localStorage.getItem("drcCaddieName")||"Pete";var t="Ready. Ask "+n+" for the shot.";if(window.setCaddieAnswers)window.setCaddieAnswers(t);})();');
}}
/>
</SafeAreaView>
);
}

const styles=StyleSheet.create({
container:{
flex:1,
backgroundColor:'#020812',
paddingTop:Platform.OS==='android'?StatusBar.currentHeight||0:0,
paddingBottom:Platform.OS==='android'?34:0
},
webview:{
flex:1,
backgroundColor:'#020812'
}
});
