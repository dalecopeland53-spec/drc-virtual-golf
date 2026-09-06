import React,{useEffect,useRef,useState}from'react';
import{SafeAreaView,StyleSheet,StatusBar,Platform,PermissionsAndroid}from'react-native';
import{WebView}from'react-native-webview';
import{ExpoSpeechRecognitionModule,useSpeechRecognitionEvent}from'expo-speech-recognition';

export default function App(){
const webRef=useRef(null);
const[recognizing,setRecognizing]=useState(false);
const recognizingRef=useRef(false);
const lastTranscriptRef=useRef('');
const commandSentRef=useRef(false);
const liveProjectUrl='https://dalecopeland53-spec.github.io/drc-virtual-golf/';

const sendToWeb=code=>{
try{if(webRef.current)webRef.current.injectJavaScript(`try{${code}}catch(e){console.log("DRC injected error",e)};true;`)}catch(e){console.log('WebView injection error:',e)}
};

const setWebAnswer=message=>{
sendToWeb(`
if(typeof setCaddieAnswers==="function"){
setCaddieAnswers(${JSON.stringify(message)});
}else{
window.dispatchEvent(new CustomEvent("DRC_CADDIE_STATUS",{detail:${JSON.stringify(message)}}));
}`);
};

const setListening=listening=>{
sendToWeb(`
if(typeof setListeningState==="function")setListeningState(${listening?'true':'false'});
window.dispatchEvent(new CustomEvent("DRC_LISTENING",{detail:${listening?'true':'false'}}));`);
};

const deliverCommand=text=>{
const clean=(text||'').trim();
if(!clean||commandSentRef.current)return;
commandSentRef.current=true;
lastTranscriptRef.current=clean;
sendToWeb(`
(function(){
var speech=${JSON.stringify(clean)};
window.DRC_LAST_SPEECH=speech;
window.dispatchEvent(new CustomEvent("DRC_SPEECH_RESULT",{detail:speech}));
if(typeof handleGolfCommand==="function"){
handleGolfCommand(speech);
}else if(typeof window.handleGolfCommand==="function"){
window.handleGolfCommand(speech);
}else if(typeof setCaddieAnswers==="function"){
setCaddieAnswers("I heard: "+speech);
}
})();`);
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
}catch(e){console.log('Permission error:',e)}
};
requestPermissions();
return()=>{
try{
if(recognizingRef.current)ExpoSpeechRecognitionModule.abort();
}catch(e){}
};
},[]);

useSpeechRecognitionEvent('start',()=>{
recognizingRef.current=true;
setRecognizing(true);
lastTranscriptRef.current='';
commandSentRef.current=false;
setListening(true);
setWebAnswer('Listening...');
});

useSpeechRecognitionEvent('result',event=>{
const text=event?.results?.[0]?.transcript?.trim()||'';
if(!text)return;
lastTranscriptRef.current=text;

sendToWeb(`
window.DRC_LAST_SPEECH=${JSON.stringify(text)};
window.dispatchEvent(new CustomEvent("DRC_SPEECH_INTERIM",{detail:${JSON.stringify(text)}}));`);

if(event?.isFinal===true)deliverCommand(text);
});

useSpeechRecognitionEvent('end',()=>{
recognizingRef.current=false;
setRecognizing(false);
setListening(false);

if(!commandSentRef.current&&lastTranscriptRef.current){
deliverCommand(lastTranscriptRef.current);
}else if(!commandSentRef.current){
setWebAnswer("Didn't hear anything. Tap the mic and speak again.");
}
});

useSpeechRecognitionEvent('error',event=>{
recognizingRef.current=false;
setRecognizing(false);
setListening(false);

const saved=lastTranscriptRef.current;

if(saved&&!commandSentRef.current){
deliverCommand(saved);
return;
}

let message="Didn't catch that. Tap the mic and try again.";
const error=event?.error||'';

if(error==='not-allowed'||error==='permission-denied'){
message='Microphone permission is blocked.';
}else if(error==='audio-capture'){
message="The microphone isn't available right now.";
}else if(error==='no-speech'||error==='speech-timeout'){
message="Didn't hear anything. Tap the mic and speak again.";
}else if(error==='network'){
message="Voice recognition couldn't reach the speech service.";
}else if(error==='service-not-allowed'){
message='Speech recognition is not available on this phone.';
}else if(error==='busy'){
message='The microphone is busy. Tap it again.';
}

console.log('Speech recognition error:',error,event?.message||'');
setWebAnswer(message);
});

const startNativeSpeech=async()=>{
try{
if(recognizingRef.current){
try{ExpoSpeechRecognitionModule.stop()}catch(e){}
return;
}

lastTranscriptRef.current='';
commandSentRef.current=false;

const permission=await ExpoSpeechRecognitionModule.requestPermissionsAsync();

if(!permission?.granted){
setWebAnswer('Microphone permission is blocked.');
return;
}

setWebAnswer('Starting microphone...');

ExpoSpeechRecognitionModule.start({
lang:'en-AU',
interimResults:true,
maxAlternatives:1,
continuous:false,
requiresOnDeviceRecognition:false,
androidIntentOptions:{
EXTRA_LANGUAGE_MODEL:'free_form',
EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS:1500,
EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS:1000,
EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS:500
}
});
}catch(e){
recognizingRef.current=false;
setRecognizing(false);
console.log('Speech start error:',e);
setListening(false);
setWebAnswer("The microphone couldn't start. Tap it again.");
}
};

const onMessage=event=>{
try{
const raw=event?.nativeEvent?.data;
if(!raw)return;

let data;
try{data=JSON.parse(raw)}catch(e){data={type:raw}}

if(data?.type==='DRC_START_SPEECH'||data?.type==='START_SPEECH'||data?.type==='ASK_CADDIE'){
startNativeSpeech();
}
}catch(e){
console.log('WebView message error:',e);
}
};

const injectedJavaScript=`
(function(){
if(window.__DRC_NATIVE_BRIDGE_INSTALLED__)return;
window.__DRC_NATIVE_BRIDGE_INSTALLED__=true;

function nativeSpeech(){
try{
window.ReactNativeWebView.postMessage(JSON.stringify({type:"DRC_START_SPEECH"}));
return true;
}catch(e){
try{
if(typeof setCaddieAnswers==="function")setCaddieAnswers("Microphone bridge unavailable.");
}catch(x){}
return false;
}
}

window.DRCNativeSpeech=nativeSpeech;
window.askCaddieNative=nativeSpeech;

try{
window.askCaddie=nativeSpeech;
}catch(e){}

document.addEventListener("click",function(ev){
try{
var el=ev.target;
if(!el)return;
var button=el.closest?el.closest('button,[role="button"],[data-action],a'):null;
if(!button)return;

var text=((button.innerText||"")+" "+(button.getAttribute("aria-label")||"")+" "+(button.getAttribute("title")||"")+" "+(button.getAttribute("data-action")||"")+" "+(button.id||"")+" "+(button.className||"")).toLowerCase();

var isMic=
text.indexOf("mic")!==-1||
text.indexOf("microphone")!==-1||
text.indexOf("voice")!==-1||
text.indexOf("ask caddie")!==-1||
text.indexOf("ask-caddie")!==-1||
text.indexOf("caddie-mic")!==-1;

if(isMic){
ev.preventDefault();
ev.stopPropagation();
if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
nativeSpeech();
}
}catch(e){}
},true);

window.addEventListener("DRC_FORCE_MIC",nativeSpeech);

setTimeout(function(){
try{window.askCaddie=nativeSpeech}catch(e){}
},500);

setInterval(function(){
try{
if(typeof window.askCaddie!=="function"||window.askCaddie!==nativeSpeech){
window.askCaddie=nativeSpeech;
}
}catch(e){}
},1500);
})();
true;
`;

return(
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor="#03081e"/>
<WebView
ref={webRef}
source={{uri:liveProjectUrl}}
style={styles.webview}
javaScriptEnabled={true}
domStorageEnabled={true}
geolocationEnabled={true}
startInLoadingState={true}
mediaPlaybackRequiresUserAction={false}
allowsInlineMediaPlayback={true}
mixedContentMode="compatibility"
injectedJavaScript={injectedJavaScript}
onMessage={onMessage}
onLoadEnd={()=>sendToWeb(`
window.dispatchEvent(new CustomEvent("DRC_NATIVE_READY"));
`)}
/>
</SafeAreaView>
);
}

const styles=StyleSheet.create({
container:{flex:1,backgroundColor:'#03081e'},
webview:{flex:1,backgroundColor:'#03081e'}
});
