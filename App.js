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

const liveProjectUrl='https://dalecopeland53-spec.github.io/drc-virtual-golf/?voicefix=20260907';

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

const deliverCommand=text=>{
const clean=(text||'').trim();

if(!clean||commandSentRef.current)return;

commandSentRef.current=true;
lastTranscriptRef.current=clean;

sendToWeb(`
(function(){
var speech=${JSON.stringify(clean)};

if(typeof window.handleGolfCommand==="function"){
window.handleGolfCommand(speech);
}else if(typeof handleGolfCommand==="function"){
handleGolfCommand(speech);
}else{
var a=document.getElementById("caddieAnswer");
var b=document.getElementById("largeCaddieAnswer");
var msg="I heard: "+speech;
if(a)a.textContent=msg;
if(b)b.textContent=msg;
}
})();
`);
};

useEffect(()=>{
const permissions=async()=>{
if(Platform.OS!=='android')return;

try{
await PermissionsAndroid.requestMultiple([
PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
]);
}catch(e){}
};

permissions();

return()=>{
try{
ExpoSpeechRecognitionModule.abort();
}catch(e){}
};
},[]);

useSpeechRecognitionEvent('start',()=>{
recognizingRef.current=true;
setRecognizing(true);
lastTranscriptRef.current='';
commandSentRef.current=false;
setListening(true);
showAnswer('Listening...');
});

useSpeechRecognitionEvent('result',event=>{
const text=
event?.results?.[0]?.transcript?.trim()||'';

if(!text)return;

lastTranscriptRef.current=text;

if(event?.isFinal===true){
deliverCommand(text);
}
});

useSpeechRecognitionEvent('end',()=>{
recognizingRef.current=false;
setRecognizing(false);
setListening(false);

if(
!commandSentRef.current&&
lastTranscriptRef.current
){
deliverCommand(lastTranscriptRef.current);
return;
}

if(!commandSentRef.current){
showAnswer(
"Didn't hear anything. Tap the mic and speak again."
);
}
});

useSpeechRecognitionEvent('error',event=>{
recognizingRef.current=false;
setRecognizing(false);
setListening(false);

if(
lastTranscriptRef.current&&
!commandSentRef.current
){
deliverCommand(lastTranscriptRef.current);
return;
}

const error=event?.error||'';

let message=
"Didn't catch that. Tap the mic and try again.";

if(
error==='not-allowed'||
error==='permission-denied'
){
message='Microphone permission is blocked.';
}else if(error==='audio-capture'){
message="The microphone isn't available right now.";
}else if(
error==='no-speech'||
error==='speech-timeout'
){
message="Didn't hear anything. Tap the mic and speak again.";
}else if(error==='network'){
message="Voice recognition couldn't reach the speech service.";
}else if(error==='service-not-allowed'){
message='Speech recognition is not available on this phone.';
}else if(error==='busy'){
message='The microphone is busy. Tap it again.';
}

showAnswer(message);
});

const startNativeSpeech=async()=>{
try{

showAnswer('Native microphone received.');

if(recognizingRef.current){
try{
ExpoSpeechRecognitionModule.stop();
}catch(e){}
return;
}

lastTranscriptRef.current='';
commandSentRef.current=false;

const permission=
await ExpoSpeechRecognitionModule.requestPermissionsAsync();

if(!permission?.granted){
showAnswer('Microphone permission is blocked.');
return;
}

showAnswer('Starting microphone...');

ExpoSpeechRecognitionModule.start({
lang:'en-AU',
interimResults:true,
maxAlternatives:1,
continuous:false,
requiresOnDeviceRecognition:false
});

}catch(e){
recognizingRef.current=false;
setRecognizing(false);

showAnswer(
"The microphone couldn't start."
);
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
}

}catch(e){}
};

const bridge=`
(function(){

function sendMic(){

try{

var a=document.getElementById("caddieAnswer");
var b=document.getElementById("largeCaddieAnswer");

if(a)a.textContent="Mic button received.";
if(b)b.textContent="Mic button received.";

window.ReactNativeWebView.postMessage(
JSON.stringify({
type:"DRC_START_SPEECH"
})
);

}catch(e){

var a=document.getElementById("caddieAnswer");
var b=document.getElementById("largeCaddieAnswer");

if(a)a.textContent="Native bridge unavailable.";
if(b)b.textContent="Native bridge unavailable.";
}

}

window.DRCNativeSpeech=sendMic;

document.addEventListener(
"click",
function(e){

var target=e.target;

if(!target)return;

var button=
target.closest?
target.closest("button"):
null;

if(!button)return;

if(
button.id==="micButton"||
button.id==="largeMic"
){

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

<StatusBar
barStyle="light-content"
backgroundColor="#03081e"
/>

<WebView
ref={webRef}
source={{
uri:liveProjectUrl,
headers:{
'Cache-Control':'no-cache'
}
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
injectedJavaScriptBeforeContentLoaded={bridge}
injectedJavaScript={bridge}
onMessage={onMessage}
onLoadEnd={()=>{
sendToWeb(`
var a=document.getElementById("caddieAnswer");
if(a)a.textContent="Ready. Tap the microphone.";
`);
}}
/>

</SafeAreaView>
);
}

const styles=StyleSheet.create({
container:{
flex:1,
backgroundColor:'#03081e'
},
webview:{
flex:1,
backgroundColor:'#03081e'
}
});
