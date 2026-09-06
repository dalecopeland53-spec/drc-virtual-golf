import React,{useEffect,useRef}from'react';
import{SafeAreaView,StyleSheet,StatusBar,Platform,PermissionsAndroid}from'react-native';
import{WebView}from'react-native-webview';
import{ExpoSpeechRecognitionModule,useSpeechRecognitionEvent}from'expo-speech-recognition';

export default function App(){
const webRef=useRef(null);
const recognizingRef=useRef(false);

const liveProjectUrl='https://dalecopeland53-spec.github.io/drc-virtual-golf/?voicefix=20260907c';

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
const clean=String(text||'').trim();
if(!clean)return;

sendToWeb(`
(function(){
var speech=${JSON.stringify(clean)};

if(typeof window.handleGolfCommand==="function"){
window.handleGolfCommand(speech);
return;
}

if(typeof handleGolfCommand==="function"){
handleGolfCommand(speech);
return;
}

var a=document.getElementById("caddieAnswer");
var b=document.getElementById("largeCaddieAnswer");
var msg="Heard: "+speech;

if(a)a.textContent=msg;
if(b)b.textContent=msg;
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
setListening(true);
showAnswer('Listening...');
});

useSpeechRecognitionEvent('result',event=>{
const transcript=event?.results?.[0]?.transcript?.trim()||'';

if(!transcript)return;

showAnswer('Heard: '+transcript);

if(event.isFinal){
deliverCommand(transcript);
}
});

useSpeechRecognitionEvent('end',()=>{
recognizingRef.current=false;
setListening(false);
});

useSpeechRecognitionEvent('error',event=>{
recognizingRef.current=false;
setListening(false);

const error=event?.error||'';

if(error==='aborted'||error==='no-speech'){
showAnswer("Didn't hear anything. Tap the mic and speak again.");
return;
}

if(error==='not-allowed'||error==='permission-denied'){
showAnswer('Microphone permission is blocked.');
return;
}

if(error==='audio-capture'){
showAnswer("The microphone isn't available right now.");
return;
}

if(error==='network'){
showAnswer("Voice recognition couldn't reach the speech service.");
return;
}

showAnswer('Voice error: '+error);
});

const startNativeSpeech=async()=>{
try{
if(recognizingRef.current)return;

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
continuous:false
});

}catch(e){
recognizingRef.current=false;
showAnswer("The microphone couldn't start.");
}
};

const onMessage=event=>{
try{
const raw=event?.nativeEvent?.data;
if(!raw)return;

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

if(a)a.textContent="Starting microphone...";
if(b)b.textContent="Starting microphone...";

window.ReactNativeWebView.postMessage(
JSON.stringify({type:"DRC_START_SPEECH"})
);

}catch(e){}
}

window.DRCNativeSpeech=sendMic;

document.addEventListener("click",function(e){

var button=e.target&&e.target.closest?
e.target.closest("button"):
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

},true);

})();
true;
`;

return(
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor="#03081e"/>

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
injectedJavaScriptBeforeContentLoaded={bridge}
injectedJavaScript={bridge}
onMessage={onMessage}
/>
</SafeAreaView>
);
}

const styles=StyleSheet.create({
container:{flex:1,backgroundColor:'#03081e'},
webview:{flex:1,backgroundColor:'#03081e'}
});
