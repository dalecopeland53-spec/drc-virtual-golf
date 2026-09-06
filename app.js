import React,{useEffect,useRef,useState}from'react';
import{SafeAreaView,StyleSheet,StatusBar,Text,View,TouchableOpacity,TextInput,ScrollView,Platform,PermissionsAndroid}from'react-native';
import{ExpoSpeechRecognitionModule,useSpeechRecognitionEvent}from'expo-speech-recognition';

export default function App(){
const[listening,setListening]=useState(false);
const[status,setStatus]=useState('READY');
const[transcript,setTranscript]=useState('');
const[answer,setAnswer]=useState('Tap the microphone and ask your caddie.');
const[caddieName,setCaddieName]=useState('Pete');
const[distance,setDistance]=useState('150');
const[lie,setLie]=useState('FAIRWAY');
const[wind,setWind]=useState('NONE');
const recognizingRef=useRef(false);

useEffect(()=>{
(async()=>{
if(Platform.OS==='android'){
try{
await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
}catch(e){}
}
})();
return()=>{
try{ExpoSpeechRecognitionModule.abort()}catch(e){}
};
},[]);

const getClub=d=>{
if(d>=230)return'Driver';
if(d>=210)return'3 Wood';
if(d>=195)return'5 Wood';
if(d>=180)return'4 Iron';
if(d>=170)return'5 Iron';
if(d>=160)return'6 Iron';
if(d>=150)return'7 Iron';
if(d>=140)return'8 Iron';
if(d>=130)return'9 Iron';
if(d>=115)return'Pitching Wedge';
if(d>=100)return'Gap Wedge';
if(d>=80)return'Sand Wedge';
return'Lob Wedge';
};

const makeAdvice=(spoken='')=>{
let d=parseInt(distance,10)||150;
const txt=spoken.toLowerCase();

const nums=txt.match(/\d+/g);
if(nums&&nums.length){
const n=parseInt(nums[0],10);
if(n>=30&&n<=400){
d=n;
setDistance(String(n));
}
}

let selectedLie=lie;
if(txt.includes('rough')){
selectedLie='ROUGH';
setLie('ROUGH');
}else if(txt.includes('bunker')){
selectedLie='BUNKER';
setLie('BUNKER');
}else if(txt.includes('tee')){
selectedLie='TEE';
setLie('TEE');
}else if(txt.includes('fairway')){
selectedLie='FAIRWAY';
setLie('FAIRWAY');
}

let adjusted=d;
let note='';

if(txt.includes('headwind')||txt.includes('into the wind')||wind==='HEAD'){
adjusted=Math.round(d*1.08);
note+=' Headwind: play a little more club.';
}

if(txt.includes('tailwind')||txt.includes('wind behind')||wind==='TAIL'){
adjusted=Math.round(d*.94);
note+=' Tailwind: take a little off.';
}

if(selectedLie==='ROUGH'){
adjusted=Math.round(adjusted*1.05);
note+=' From the rough, expect less control.';
}

if(selectedLie==='BUNKER'){
adjusted=Math.round(adjusted*1.08);
note+=' From the fairway bunker, favour clean contact.';
}

const club=getClub(adjusted);
const msg=`${caddieName}: ${d} metres, ${selectedLie.toLowerCase()}. Plays about ${adjusted} metres. ${club}.${note}`;
setAnswer(msg);
};

useSpeechRecognitionEvent('start',()=>{
recognizingRef.current=true;
setListening(true);
setStatus('LISTENING');
setTranscript('');
});

useSpeechRecognitionEvent('result',event=>{
const text=event?.results?.[0]?.transcript?.trim()||'';
if(!text)return;

setTranscript(text);

if(event.isFinal){
makeAdvice(text);
}
});

useSpeechRecognitionEvent('end',()=>{
recognizingRef.current=false;
setListening(false);
setStatus('READY');
});

useSpeechRecognitionEvent('error',event=>{
recognizingRef.current=false;
setListening(false);

const e=event?.error||'';

if(e==='no-speech'){
setStatus('NO SPEECH HEARD');
setAnswer('Tap the microphone and speak again.');
}else if(e==='not-allowed'||e==='permission-denied'){
setStatus('MICROPHONE BLOCKED');
setAnswer('Microphone permission is blocked.');
}else{
setStatus('VOICE ERROR');
setAnswer(`Voice error: ${e||'unknown'}`);
}
});

const startSpeech=async()=>{
if(recognizingRef.current)return;

try{
const permission=await ExpoSpeechRecognitionModule.requestPermissionsAsync();

if(!permission?.granted){
setStatus('MICROPHONE BLOCKED');
setAnswer('Microphone permission is blocked.');
return;
}

setStatus('STARTING');

ExpoSpeechRecognitionModule.start({
lang:'en-AU',
interimResults:true,
continuous:false
});

}catch(e){
recognizingRef.current=false;
setListening(false);
setStatus('VOICE ERROR');
setAnswer("The microphone couldn't start.");
}
};

return(
<SafeAreaView style={s.app}>
<StatusBar barStyle="light-content" backgroundColor="#03081e"/>

<ScrollView contentContainerStyle={s.content}>

<Text style={s.brand}>DRC</Text>
<Text style={s.title}>VIRTUAL GOLF</Text>
<Text style={s.subtitle}>STANDALONE CADDIE</Text>

<View style={s.card}>
<Text style={s.label}>CADDIE NAME</Text>
<TextInput
style={s.input}
value={caddieName}
onChangeText={setCaddieName}
placeholderTextColor="#71809d"
/>

<Text style={s.label}>DISTANCE</Text>
<View style={s.distanceRow}>
<TouchableOpacity style={s.smallButton} onPress={()=>setDistance(String(Math.max(1,(parseInt(distance)||0)-1)))}>
<Text style={s.smallButtonText}>−</Text>
</TouchableOpacity>

<TextInput
style={s.distanceInput}
value={distance}
onChangeText={setDistance}
keyboardType="number-pad"
/>

<Text style={s.metres}>m</Text>

<TouchableOpacity style={s.smallButton} onPress={()=>setDistance(String((parseInt(distance)||0)+1))}>
<Text style={s.smallButtonText}>+</Text>
</TouchableOpacity>
</View>
</View>

<View style={s.card}>
<Text style={s.label}>LIE</Text>
<View style={s.row}>
{['TEE','FAIRWAY','ROUGH','BUNKER'].map(x=>(
<TouchableOpacity
key={x}
style={[s.choice,lie===x&&s.choiceActive]}
onPress={()=>setLie(x)}>
<Text style={[s.choiceText,lie===x&&s.choiceTextActive]}>{x}</Text>
</TouchableOpacity>
))}
</View>

<Text style={s.label}>WIND</Text>
<View style={s.row}>
{[
['NONE','NONE'],
['HEAD','HEADWIND'],
['TAIL','TAILWIND']
].map(([v,t])=>(
<TouchableOpacity
key={v}
style={[s.choice,wind===v&&s.choiceActive]}
onPress={()=>setWind(v)}>
<Text style={[s.choiceText,wind===v&&s.choiceTextActive]}>{t}</Text>
</TouchableOpacity>
))}
</View>
</View>

<View style={s.voiceCard}>
<Text style={s.voiceTitle}>VOICE CADDIE</Text>
<Text style={s.status}>{status}</Text>

<TouchableOpacity
style={[s.mic,listening&&s.micListening]}
onPress={startSpeech}>
<Text style={s.micIcon}>🎤</Text>
</TouchableOpacity>

<Text style={s.tapText}>
{listening?'Speak now...':`Tap and ask ${caddieName}`}
</Text>

{!!transcript&&(
<View style={s.transcriptBox}>
<Text style={s.transcriptLabel}>HEARD</Text>
<Text style={s.transcript}>{transcript}</Text>
</View>
)}

<View style={s.answerBox}>
<Text style={s.answer}>{answer}</Text>
</View>

<TouchableOpacity
style={s.askButton}
onPress={()=>makeAdvice('')}>
<Text style={s.askButtonText}>ASK {caddieName.toUpperCase()}</Text>
</TouchableOpacity>
</View>

<Text style={s.footer}>DRC Virtual Golf • Standalone Native Build</Text>

</ScrollView>
</SafeAreaView>
);
}

const s=StyleSheet.create({
app:{flex:1,backgroundColor:'#03081e'},
content:{padding:18,paddingBottom:40},
brand:{color:'#d4ae55',fontSize:18,fontWeight:'800',letterSpacing:4,textAlign:'center',marginTop:10},
title:{color:'#fff',fontSize:30,fontWeight:'900',letterSpacing:2,textAlign:'center'},
subtitle:{color:'#4fa1ff',fontSize:12,fontWeight:'800',letterSpacing:3,textAlign:'center',marginBottom:20},
card:{backgroundColor:'#091329',borderWidth:1,borderColor:'#1e3255',borderRadius:18,padding:16,marginBottom:14},
label:{color:'#8fa6c9',fontSize:11,fontWeight:'800',letterSpacing:1.5,marginBottom:8,marginTop:5},
input:{height:48,borderRadius:12,borderWidth:1,borderColor:'#29446f',backgroundColor:'#050c1c',color:'#fff',fontSize:18,paddingHorizontal:14,marginBottom:10},
distanceRow:{flexDirection:'row',alignItems:'center'},
smallButton:{width:48,height:48,borderRadius:12,backgroundColor:'#13294b',alignItems:'center',justifyContent:'center'},
smallButtonText:{color:'#fff',fontSize:26,fontWeight:'700'},
distanceInput:{width:90,height:48,borderRadius:12,borderWidth:1,borderColor:'#29446f',backgroundColor:'#050c1c',color:'#fff',fontSize:22,fontWeight:'800',textAlign:'center',marginLeft:10},
metres:{color:'#9fb1cb',fontSize:18,marginHorizontal:10},
row:{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:12},
choice:{paddingVertical:9,paddingHorizontal:11,borderRadius:10,borderWidth:1,borderColor:'#29446f',backgroundColor:'#071023'},
choiceActive:{backgroundColor:'#1676e8',borderColor:'#52a5ff'},
choiceText:{color:'#9eb0ca',fontSize:11,fontWeight:'800'},
choiceTextActive:{color:'#fff'},
voiceCard:{backgroundColor:'#091329',borderWidth:1,borderColor:'#365d95',borderRadius:22,padding:18,alignItems:'center'},
voiceTitle:{color:'#fff',fontSize:20,fontWeight:'900',letterSpacing:2},
status:{color:'#58a8ff',fontSize:12,fontWeight:'800',letterSpacing:2,marginTop:5,marginBottom:18},
mic:{width:92,height:92,borderRadius:46,backgroundColor:'#126be1',alignItems:'center',justifyContent:'center',borderWidth:4,borderColor:'#65b2ff'},
micListening:{transform:[{scale:1.08}],borderColor:'#fff'},
micIcon:{fontSize:42},
tapText:{color:'#b7c6dd',fontSize:14,marginTop:12,marginBottom:14},
transcriptBox:{width:'100%',backgroundColor:'#050c1c',borderRadius:12,padding:12,marginBottom:10},
transcriptLabel:{color:'#5f81ad',fontSize:10,fontWeight:'900',letterSpacing:1},
transcript:{color:'#fff',fontSize:16,marginTop:4},
answerBox:{width:'100%',minHeight:92,backgroundColor:'#050c1c',borderRadius:14,borderWidth:1,borderColor:'#243d63',padding:14,justifyContent:'center'},
answer:{color:'#fff',fontSize:17,lineHeight:24,textAlign:'center'},
askButton:{marginTop:14,width:'100%',height:50,borderRadius:13,backgroundColor:'#d4ae55',alignItems:'center',justifyContent:'center'},
askButtonText:{color:'#061025',fontSize:15,fontWeight:'900',letterSpacing:1},
footer:{color:'#536886',fontSize:11,textAlign:'center',marginTop:20}
});
