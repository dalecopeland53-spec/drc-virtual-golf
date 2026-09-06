import React,{useEffect,useRef,useState}from'react';
import{SafeAreaView,StyleSheet,StatusBar,Platform,PermissionsAndroid}from'react-native';
import{WebView}from'react-native-webview';
import{ExpoSpeechRecognitionModule,useSpeechRecognitionEvent}from'expo-speech-recognition';

export default function App(){
const webRef=useRef(null);
const[recognizing,setRecognizing]=useState(false);
const liveProjectUrl='https://dalecopeland53-spec.github.io/drc-virtual-golf/';

const sendToWeb=(code)=>{
if(webRef.current)webRef.current.injectJavaScript(code+';true;');
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
},[]);

useSpeechRecognitionEvent('start',()=>{
setRecognizing(true);
sendToWeb(`if(typeof setListeningState==="function")setListeningState(true);if(typeof setCaddieAnswers==="function")setCaddieAnswers("Listening...")`);
});

useSpeechRecognitionEvent('end',()=>{
setRecognizing(false);
sendToWeb(`if(typeof setListeningState==="function")setListeningState(false)`);
});

useSpeechRecognitionEvent('result',(event)=>{
const text=event?.results?.[0]?.transcript?.trim();
if(!text)return;
sendToWeb(`if(typeof handleGolfCommand==="function"){handleGolfCommand(${JSON.stringify(text)})}else if(typeof setCaddieAnswers==="function"){setCaddieAnswers("Caddie engine not ready.")}`);
});

useSpeechRecognitionEvent('error',(event)=>{
setRecognizing(false);
let message="Didn't catch that. Tap the mic and try again.";
if(event?.error==='not-allowed')message='Microphone permission is blocked.';
else if(event?.error==='audio-capture')message="The microphone isn't available right now.";
else if(event?.error==='no-speech'||event?.error==='speech-timeout')message="Didn't hear anything. Tap the mic and speak again.";
else if(event?.error==='network')message="Voice recognition couldn't reach the speech service.";
else if(event?.error==='service-not-allowed')message='Speech recognition is not available on this phone.';
sendToWeb(`if(typeof setListeningState==="function")setListeningState(false);if(typeof setCaddieAnswers==="function")setCaddieAnswers(${JSON.stringify(message)})`);
});

const startNativeSpeech=async()=>{
try{
if(recognizing){
ExpoSpeechRecognitionModule.stop();
return;
}
const permission=await ExpoSpeechRecognitionModule.requestPermissionsAsync();
if(!permission.granted){
sendToWeb(`if(typeof setCaddieAnswers==="function")setCaddieAnswers("Microphone permission is blocked.")`);
return;
}
ExpoSpeechRecognitionModule.start({
lang:'en-AU',
interimResults:false,
maxAlternatives:3,
continuous:false,
requiresOnDeviceRecognition:false
});
}catch(e){
console.log('Speech start error:',e);
sendToWeb(`if(typeof setCaddieAnswers==="function")setCaddieAnswers("The microphone couldn't start. Tap it again.")`);
}
};

const onMessage=(event)=>{
try{
const data=JSON.parse(event.nativeEvent.data);
if(data?.type==='DRC_START_SPEECH')startNativeSpeech();
}catch(e){}
};

const injectedJavaScript=`
(function(){
function installDRCBridge(){
if(typeof window.askCaddie==="function"){
window.askCaddie=function(){
try{
window.ReactNativeWebView.postMessage(JSON.stringify({type:"DRC_START_SPEECH"}));
}catch(e){
if(typeof setCaddieAnswers==="function")setCaddieAnswers("Microphone bridge unavailable.");
}
};
}
}
installDRCBridge();
setInterval(installDRCBridge,1000);
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
javaScriptEnabled
domStorageEnabled
geolocationEnabled
startInLoadingState
mediaPlaybackRequiresUserAction={false}
allowsInlineMediaPlayback
injectedJavaScript={injectedJavaScript}
onMessage={onMessage}
/>
</SafeAreaView>
);
}

const styles=StyleSheet.create({
container:{flex:1,backgroundColor:'#03081e'},
webview:{flex:1,backgroundColor:'#03081e'}
});
