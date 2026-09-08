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
const voiceModeRef=useRef('caddie');

const liveProjectUrl='https://dalecopeland53-spec.github.io/drc-virtual-golf/?build=20260909d';

const sendToWeb=code=>{try{if(webRef.current){webRef.current.injectJavaScript(`try{${code}}catch(e){}true;`);}}catch(e){}};
const showAnswer=text=>{const safe=JSON.stringify(text);sendToWeb(`(function(){if(${JSON.stringify(voiceModeRef.current)}==="course"){var s=document.getElementById("courseVoiceStatus");if(s)s.textContent=${safe};}else{var a=document.getElementById("caddieAnswer"),b=document.getElementById("largeCaddieAnswer");if(a)a.textContent=${safe};if(b)b.textContent=${safe};}})();`)};
const setListening=on=>{sendToWeb(`(function(){["micButton","largeMic","courseMicButton"].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.toggle("listening",${on});});})();`)};
const sendCommand=text=>{if(!text)return;const safe=JSON.stringify(text),mode=voiceModeRef.current;sendToWeb(`(function(){if(${JSON.stringify(mode)}==="course"&&typeof window.handleCourseVoiceCommand==="function")window.handleCourseVoiceCommand(${safe});else if(typeof window.handleGolfCommand==="function")window.handleGolfCommand(${safe});})();`)};
const stopRecognition=async()=>{try{await ExpoSpeechRecognitionModule.stop();}catch(e){}recognizingRef.current=false;setListening(false)};
const startRecognition=async(mode='caddie')=>{voiceModeRef.current=mode==='course'?'course':'caddie';if(recognizingRef.current){await stopRecognition();return;}lastTranscriptRef.current='';commandSentRef.current=false;try{if(Platform.OS==='android'){const granted=await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);if(granted!==PermissionsAndroid.RESULTS.GRANTED){showAnswer('Microphone permission is blocked.');return;}}const result=await ExpoSpeechRecognitionModule.requestPermissionsAsync();if(result&&!result.granted){showAnswer('Microphone permission is blocked.');return;}recognizingRef.current=true;setListening(true);showAnswer(voiceModeRef.current==='course'?'Listening for course setup...':'Listening...');ExpoSpeechRecognitionModule.start({lang:'en-AU',interimResults:true,continuous:false,maxAlternatives:3});}catch(e){recognizingRef.current=false;setListening(false);showAnswer("The microphone couldn't start. Tap it again.");}};

useSpeechRecognitionEvent('start',()=>{recognizingRef.current=true;setListening(true)});
useSpeechRecognitionEvent('result',event=>{try{const text=event?.results?.[0]?.transcript?.trim()||'';if(text)lastTranscriptRef.current=text;if(event?.isFinal&&text&&!commandSentRef.current){commandSentRef.current=true;sendCommand(text);}}catch(e){}});
useSpeechRecognitionEvent('end',()=>{recognizingRef.current=false;setListening(false);const text=lastTranscriptRef.current.trim();if(text&&!commandSentRef.current){commandSentRef.current=true;sendCommand(text);}});
useSpeechRecognitionEvent('error',event=>{recognizingRef.current=false;setListening(false);const code=event?.error||'';if(code==='no-speech')showAnswer("Didn't hear anything. Tap the mic and speak again.");else if(code==='not-allowed'||code==='service-not-allowed')showAnswer('Microphone permission is blocked.');else if(code==='audio-capture')showAnswer("The microphone isn't available right now.");else if(code==='network')showAnswer("Voice recognition couldn't reach the speech service.");else showAnswer("Didn't catch that clearly. Tap the mic and try again.");});

const handleWebMessage=async event=>{let msg=null;try{msg=JSON.parse(event.nativeEvent.data);}catch(e){return;}if(!msg||!msg.type)return;if(msg.type==='DRC_START_SPEECH'){await startRecognition(msg.mode||'caddie');return;}if(msg.type==='DRC_STOP_SPEECH'){await stopRecognition();return;}if(msg.type==='DRC_SPEAK'){const text=String(msg.text||'').trim();if(text)try{Speech.stop();Speech.speak(text,{language:'en-AU',rate:.92,pitch:1});}catch(e){}return;}if(msg.type==='DRC_WEB_READY'){webReadyRef.current=true;if(pendingCommandRef.current){const t=pendingCommandRef.current;pendingCommandRef.current='';sendCommand(t);}}};

useEffect(()=>()=>{try{ExpoSpeechRecognitionModule.stop();Speech.stop();}catch(e){}},[]);

const injected=`(function(){if(window.__DRC_NATIVE_BRIDGE__)return;window.__DRC_NATIVE_BRIDGE__=true;window.__DRC_ORIGINAL_SPEAK__=window.speakAnswer;window.speakAnswer=function(text){try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'DRC_SPEAK',text:String(text||'')}));}catch(e){}};try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'DRC_WEB_READY'}));}catch(e){}})();true;`;

return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor="#020812"/><WebView ref={webRef} source={{uri:liveProjectUrl}} style={styles.web} originWhitelist={['*']} javaScriptEnabled domStorageEnabled geolocationEnabled allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} mixedContentMode="always" cacheEnabled={false} incognito={false} injectedJavaScript={injected} onMessage={handleWebMessage}/></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#020812'},web:{flex:1,backgroundColor:'#020812'}});