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
const voiceModeRef=useRef('caddie');
const liveProjectUrl='https://dalecopeland53-spec.github.io/drc-virtual-golf/?build=20260909b4';
const sendToWeb=code=>{try{if(webRef.current)webRef.current.injectJavaScript(`try{${code}}catch(e){}true;`)}catch(e){}};
const showAnswer=text=>{const safe=JSON.stringify(text),mode=JSON.stringify(voiceModeRef.current);sendToWeb(`(function(){var m=${mode},ids=m==='course'?['courseVoiceStatus']:m==='score'?['roundSummaryVoice']:m==='practice'?['practiceResult']:m==='routine'?['routineVoiceStatus']:['caddieAnswer','largeCaddieAnswer'];ids.forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=${safe};});})();`)};
const setListening=on=>{sendToWeb(`(function(){['micButton','largeMic','courseMicButton','roundSummaryMic','practiceMic','routineMic'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.toggle('listening',${on});});})();`)};
const sendCommand=text=>{if(!text)return;const safe=JSON.stringify(text),mode=JSON.stringify(voiceModeRef.current);sendToWeb(`(function(){var m=${mode};if(typeof window.handleDRCVoiceResult==='function')window.handleDRCVoiceResult(m,${safe});else if(m==='course'&&typeof window.handleCourseVoiceCommand==='function')window.handleCourseVoiceCommand(${safe});else if(typeof window.handleGolfCommand==='function')window.handleGolfCommand(${safe});})();`)};
const stopRecognition=async()=>{try{await ExpoSpeechRecognitionModule.stop()}catch(e){}recognizingRef.current=false;setListening(false)};
const startRecognition=async(mode='caddie')=>{voiceModeRef.current=String(mode||'caddie');if(recognizingRef.current){await stopRecognition();return}lastTranscriptRef.current='';commandSentRef.current=false;try{if(Platform.OS==='android'){const granted=await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);if(granted!==PermissionsAndroid.RESULTS.GRANTED){showAnswer('Microphone permission is blocked.');return}}const result=await ExpoSpeechRecognitionModule.requestPermissionsAsync();if(result&&!result.granted){showAnswer('Microphone permission is blocked.');return}recognizingRef.current=true;setListening(true);showAnswer('Listening...');ExpoSpeechRecognitionModule.start({lang:'en-AU',interimResults:true,continuous:false,maxAlternatives:3})}catch(e){recognizingRef.current=false;setListening(false);showAnswer("The microphone couldn't start. Tap it again.")}};
useSpeechRecognitionEvent('start',()=>{recognizingRef.current=true;setListening(true)});
useSpeechRecognitionEvent('result',event=>{try{const text=event?.results?.[0]?.transcript?.trim()||'';if(text)lastTranscriptRef.current=text;if(event?.isFinal&&text&&!commandSentRef.current){commandSentRef.current=true;sendCommand(text)}}catch(e){}});
useSpeechRecognitionEvent('end',()=>{recognizingRef.current=false;setListening(false);const text=lastTranscriptRef.current.trim();if(text&&!commandSentRef.current){commandSentRef.current=true;sendCommand(text)}});
useSpeechRecognitionEvent('error',event=>{recognizingRef.current=false;setListening(false);const code=event?.error||'';if(code==='no-speech')showAnswer("Didn't hear anything. Tap the mic and speak again.");else if(code==='not-allowed'||code==='service-not-allowed')showAnswer('Microphone permission is blocked.');else if(code==='audio-capture')showAnswer("The microphone isn't available right now.");else if(code==='network')showAnswer("Voice recognition couldn't reach the speech service.");else showAnswer("Didn't catch that clearly. Tap the mic and try again.")});
const handleWebMessage=async event=>{let msg=null;try{msg=JSON.parse(event.nativeEvent.data)}catch(e){return}if(!msg||!msg.type)return;if(msg.type==='DRC_START_SPEECH'){await startRecognition(msg.mode||'caddie');return}if(msg.type==='DRC_STOP_SPEECH'){await stopRecognition();return}if(msg.type==='DRC_SPEAK'){const text=String(msg.text||'').trim();if(text)try{await Speech.stop();Speech.speak(text,{language:'en-AU',rate:.92,pitch:1})}catch(e){}return}};
useEffect(()=>()=>{try{ExpoSpeechRecognitionModule.stop();Speech.stop()}catch(e){}},[]);
const injected=`(function(){if(window.__DRC_NATIVE_BRIDGE_B4__)return;window.__DRC_NATIVE_BRIDGE_B4__=true;function nativeSpeak(text){try{window.ReactNativeWebView.postMessage(JSON.stringify({type:'DRC_SPEAK',text:String(text||'')}));}catch(e){}}window.speak=nativeSpeak;window.speakAnswer=nativeSpeak;})();true;`;
return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor="#020812"/><WebView ref={webRef} source={{uri:liveProjectUrl}} style={styles.web} originWhitelist={['*']} javaScriptEnabled domStorageEnabled geolocationEnabled allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} mixedContentMode="always" cacheEnabled={false} incognito={false} injectedJavaScript={injected} onMessage={handleWebMessage}/></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#020812'},web:{flex:1,backgroundColor:'#020812'}});