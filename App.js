import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const C = {
  bg: '#D8D0C2', bg2: '#CFC5B5', panel: '#E8E1D7', panel2: '#D4CAB9',
  blue: '#123A63', blue2: '#0B2A49', line: '#A99F90', white: '#F8F5EF',
  muted: '#5F625F', good: '#2F684F',
};

const starterClubs = [
  ['Driver',230],['3W',210],['5W',195],['4i',180],['5i',170],['6i',160],['7i',150],
  ['8i',140],['9i',130],['PW',115],['GW',100],['SW',85],['LW',70],['Putter',0],
].map(([name,distance],i)=>({id:String(i+1),name,distance}));

const tools = ['Scorecard','Practice','Warm-Up','Routines'];
const tabs = ['Home','Round','Caddie','Bag','Course','More'];

function Card({children, style}) { return <View style={[styles.card, style]}>{children}</View>; }
function Button({label,onPress,secondary=false,small=false}) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[styles.button,secondary&&styles.buttonSecondary,small&&styles.buttonSmall]}><Text style={[styles.buttonText,secondary&&styles.buttonTextSecondary,small&&styles.buttonTextSmall]}>{label}</Text></TouchableOpacity>;
}
function Stepper({value,onMinus,onPlus}) {
  return <View style={styles.stepper}><TouchableOpacity onPress={onMinus} style={styles.stepBtn}><Text style={styles.stepTxt}>−</Text></TouchableOpacity><View style={styles.valueBox}><Text style={styles.valueTxt}>{value}</Text></View><TouchableOpacity onPress={onPlus} style={styles.stepBtn}><Text style={styles.stepTxt}>+</Text></TouchableOpacity></View>;
}

export default function App() {
  const [tab,setTab]=useState('Home');
  const [morePage,setMorePage]=useState(null);
  const [units,setUnits]=useState('METRES');
  const [handicap,setHandicap]=useState('12');
  const [caddieName,setCaddieName]=useState('Pete');
  const [course,setCourse]=useState('Yeppoon Golf Club');
  const [tee,setTee]=useState('WHITE');
  const [hole,setHole]=useState(1);
  const [listening,setListening]=useState(false);
  const [heard,setHeard]=useState('Tap the microphone and ask for the shot.');
  const [advice,setAdvice]=useState('498 metres to centre. Driver. Aim just right of centre and commit.');
  const [clubs,setClubs]=useState(starterClubs);
  const [score,setScore]=useState(0);
  const [putts,setPutts]=useState(0);
  const [gir,setGir]=useState(false);
  const [fw,setFw]=useState(false);
  const [penalty,setPenalty]=useState(0);
  const [mapOpen,setMapOpen]=useState(false);

  const unitLabel=units==='METRES'?'m':'yd';
  const displayDistance=n=>units==='METRES'?n:Math.round(n*1.09361);
  const bestClub=useMemo(()=>clubs.reduce((a,b)=>Math.abs(b.distance-180)<Math.abs(a.distance-180)?b:a,clubs[0]),[clubs]);
  const selectTab=t=>{setMorePage(null);setTab(t);};
  const openMore=p=>{setTab('More');setMorePage(p);};

  const askCaddie=()=>{
    if(listening){setListening(false);return;}
    setListening(true); setHeard('Listening…');
    setTimeout(()=>{setListening(false);setHeard('Heard: 180 metres, light rough, slight headwind.');setAdvice(`${bestClub.name}. Play it as ${displayDistance(187)} ${unitLabel}. Smooth swing, centre target, commit.`);},1200);
  };
  const adjustClub=(id,delta)=>setClubs(prev=>prev.map(c=>c.id===id&&c.name!=='Putter'?{...c,distance:Math.max(0,c.distance+delta)}:c));

  const Header=()=> <View style={styles.header}><View><Text style={styles.logo}>DRC</Text><Text style={styles.logoSub}>VIRTUAL GOLF ELITE</Text><Text style={styles.tagline}>Your caddie. Your game.</Text></View><View style={styles.hdcBox}><Text style={styles.hdcLabel}>HDC</Text><TextInput value={handicap} onChangeText={setHandicap} keyboardType="numeric" style={styles.hdcInput}/></View></View>;

  const Home=()=> <View>
    <Card style={styles.heroCard}><Text style={styles.eyebrow}>READY TO PLAY</Text><Text style={styles.heroTitle}>{course}</Text><Text style={styles.heroMeta}>Handicap {handicap}  •  {units}</Text></Card>
    <View style={styles.grid2}>{tools.map(t=><TouchableOpacity key={t} style={styles.homeTile} onPress={()=>t==='Scorecard'?selectTab('Round'):openMore(t)}><Text style={styles.homeTileText}>{t}</Text><Text style={styles.homeTileSub}>{t==='Scorecard'?'Round scoring':t==='Practice'?'Structured sessions':t==='Warm-Up'?'Quick preparation':'Pre-shot routine'}</Text></TouchableOpacity>)}</View>
    <TouchableOpacity onPress={()=>openMore('Advice Only')}><Card><Text style={styles.sectionTitle}>QUICK ADVICE</Text><Text style={styles.body}>No warm-up? Use Advice Only. Keep the first swing simple: target, lie, club, picture, commit.</Text></Card></TouchableOpacity>
    <Button label="START ROUND" onPress={()=>selectTab('Round')}/>
  </View>;

  const Round=()=> <View><View style={styles.rowBetween}><View><Text style={styles.pageTitle}>HOLE {hole}</Text><Text style={styles.pageSub}>{course} • Par 5 • S.I. 5</Text></View><View style={styles.holeNav}><Button small secondary label="‹" onPress={()=>setHole(Math.max(1,hole-1))}/><Text style={styles.holeNum}>{hole}</Text><Button small secondary label="›" onPress={()=>setHole(Math.min(18,hole+1))}/></View></View><TouchableOpacity style={styles.mapThumb} onPress={()=>setMapOpen(v=>!v)}><Text style={styles.mapTitle}>{mapOpen?'CLOSE HOLE VIEW':'TAP FOR HOLE VIEW'}</Text>{mapOpen&&<View style={styles.mapInside}><View style={styles.fairway}/><View style={styles.green}/><View style={styles.bunker}/><Text style={styles.mapLabel}>TEE  •  FAIRWAY  •  GREEN</Text></View>}</TouchableOpacity><View style={styles.grid3}>{[['FRONT',480],['CENTRE',498],['BACK',512]].map(([l,n])=><Card key={l} style={styles.distanceCard}><Text style={styles.eyebrow}>{l}</Text><Text style={styles.distance}>{displayDistance(n)}</Text><Text style={styles.unit}>{unitLabel}</Text></Card>)}</View><Card><View style={styles.rowBetween}><Text style={styles.sectionTitle}>ASK {caddieName.toUpperCase()}</Text><Text style={styles.live}>{listening?'LISTENING':'READY'}</Text></View><Text style={styles.heard}>{heard}</Text><Text style={styles.advice}>{advice}</Text><Button label={listening?'STOP MIC':'🎙  ASK CADDIE'} onPress={askCaddie}/></Card><Card><Text style={styles.sectionTitle}>HOLE SCORE</Text><View style={styles.scoreRow}><View><Text style={styles.scoreLabel}>SCORE</Text><Stepper value={score} onMinus={()=>setScore(Math.max(0,score-1))} onPlus={()=>setScore(score+1)}/></View><View><Text style={styles.scoreLabel}>PUTTS</Text><Stepper value={putts} onMinus={()=>setPutts(Math.max(0,putts-1))} onPlus={()=>setPutts(putts+1)}/></View></View><View style={styles.toggleRow}><Button small secondary label={`GIR ${gir?'✓':'—'}`} onPress={()=>setGir(!gir)}/><Button small secondary label={`FW ${fw?'✓':'—'}`} onPress={()=>setFw(!fw)}/><Button small secondary label={`PEN ${penalty}`} onPress={()=>setPenalty(penalty+1)}/></View></Card></View>;

  const Caddie=()=> <View><Text style={styles.pageTitle}>CADDIE</Text><Text style={styles.pageSub}>Tap only when you want advice.</Text><Card style={styles.micCard}><TouchableOpacity onPress={askCaddie} style={[styles.mic,listening&&styles.micLive]}><Text style={styles.micText}>🎙</Text></TouchableOpacity><Text style={styles.micName}>ASK {caddieName.toUpperCase()}</Text><Text style={styles.heard}>{heard}</Text><Text style={styles.adviceLarge}>{advice}</Text></Card><Card><Text style={styles.sectionTitle}>CURRENT SHOT</Text><Text style={styles.body}>180 {unitLabel} • Light rough • Slight headwind</Text><Text style={styles.clubBig}>{bestClub.name}</Text></Card></View>;
  const Bag=()=> <View><Text style={styles.pageTitle}>MY BAG</Text><Text style={styles.pageSub}>14 clubs. Set your real carry distances.</Text>{clubs.map(c=><View key={c.id} style={styles.clubRow}><Text style={styles.clubName}>{c.name}</Text><Stepper value={`${displayDistance(c.distance)} ${unitLabel}`} onMinus={()=>adjustClub(c.id,-1)} onPlus={()=>adjustClub(c.id,1)}/></View>)}</View>;
  const Course=()=> <View><Text style={styles.pageTitle}>COURSE</Text><Text style={styles.pageSub}>Course setup and information.</Text><Card><Text style={styles.sectionTitle}>COURSE SETUP</Text><TextInput style={styles.input} value={course} onChangeText={setCourse}/><View style={styles.teeRow}>{['BLACK','BLUE','WHITE','RED','YELLOW'].map(x=><TouchableOpacity key={x} onPress={()=>setTee(x)} style={[styles.teeBtn,tee===x&&styles.teeBtnActive]}><Text style={[styles.teeText,tee===x&&styles.teeTextActive]}>{x}</Text></TouchableOpacity>)}</View></Card><Card><Text style={styles.sectionTitle}>COURSE INFO</Text><Text style={styles.body}>Yeppoon Golf Club</Text><Text style={styles.infoLine}>Phone: Club contact</Text><Text style={styles.infoLine}>Email: Club email</Text><Text style={styles.infoLine}>Membership: Available</Text><Text style={styles.infoLine}>Cart hire: Yes</Text><Text style={styles.infoLine}>Club hire: Yes</Text><Text style={styles.infoLine}>Pro shop: Yes</Text><Text style={styles.infoLine}>Golf professional: Club professional</Text></Card></View>;

  const Detail=({title,children})=> <View><TouchableOpacity onPress={()=>setMorePage(null)} style={styles.backRow}><Text style={styles.backText}>‹ MORE</Text></TouchableOpacity><Text style={styles.pageTitle}>{title.toUpperCase()}</Text><Text style={styles.pageSub}>DRC Virtual Golf Elite</Text>{children}</View>;
  const AdviceOnly=()=> <Detail title="Advice Only"><Card><Text style={styles.sectionTitle}>PLAY YOUR NEXT SHOT</Text><Text style={styles.adviceLarge}>{advice}</Text><Button label="ASK CADDIE" onPress={askCaddie}/></Card></Detail>;
  const Practice=()=> <Detail title="Practice"><Card>{['Wedges','Irons','Driver','Chipping','Bunker','Putting'].map(x=><TouchableOpacity key={x} style={styles.menuRow}><Text style={styles.menuText}>{x}</Text><Text style={styles.chev}>›</Text></TouchableOpacity>)}</Card></Detail>;
  const WarmUp=()=> <Detail title="Warm-Up"><Card>{['Loosen Up','Short Wedges','Mid Irons','Long Club','Driver','Chipping','Putting','Ready'].map((x,i)=><View key={x} style={styles.menuRow}><Text style={styles.menuText}>{i+1}. {x}</Text></View>)}</Card><Button label="ADVICE ONLY" secondary onPress={()=>setMorePage('Advice Only')}/></Detail>;
  const Routines=()=> <Detail title="Routines"><Card>{['Target','Lie','Club','Picture','Commit','Breathe','Reset','Next'].map((x,i)=><View key={x} style={styles.menuRow}><Text style={styles.menuText}>{i+1}. {x}</Text></View>)}</Card></Detail>;
  const RoundSummary=()=> <Detail title="Round Summary"><Card><Text style={styles.sectionTitle}>CURRENT ROUND</Text><Text style={styles.body}>Hole {hole} • Score {score} • Putts {putts} • GIR {gir?'Yes':'No'} • FW {fw?'Yes':'No'} • Penalties {penalty}</Text></Card></Detail>;
  const HowTo=()=> <Detail title="How To / FAQ"><Card><Text style={styles.sectionTitle}>QUICK START</Text><Text style={styles.body}>Set your bag, choose your course and tees, then tap Start Round. Use the microphone only when you want caddie advice.</Text></Card></Detail>;

  const More=()=> {
    if(morePage==='Advice Only') return <AdviceOnly/>;
    if(morePage==='Practice') return <Practice/>;
    if(morePage==='Warm-Up') return <WarmUp/>;
    if(morePage==='Routines') return <Routines/>;
    if(morePage==='Round Summary') return <RoundSummary/>;
    if(morePage==='How To / FAQ') return <HowTo/>;
    return <View><Text style={styles.pageTitle}>MORE</Text><Card><Text style={styles.sectionTitle}>SETTINGS</Text><View style={styles.settingRow}><Text style={styles.body}>Units</Text><Button small secondary label={units} onPress={()=>setUnits(units==='METRES'?'YARDS':'METRES')}/></View><Text style={styles.inputLabel}>Caddie name</Text><TextInput style={styles.input} value={caddieName} onChangeText={setCaddieName}/><Text style={styles.inputLabel}>Handicap</Text><TextInput style={styles.input} value={handicap} onChangeText={setHandicap} keyboardType="numeric"/></Card>{['Advice Only','Practice','Warm-Up','Routines','Round Summary','How To / FAQ'].map(x=><TouchableOpacity key={x} onPress={()=>setMorePage(x)} activeOpacity={0.7} style={styles.menuRow}><Text style={styles.menuText}>{x}</Text><Text style={styles.chev}>›</Text></TouchableOpacity>)}</View>;
  };

  const render=()=>({Home:<Home/>,Round:<Round/>,Caddie:<Caddie/>,Bag:<Bag/>,Course:<Course/>,More:<More/>}[tab]);
  return <SafeAreaView style={styles.safe}><StatusBar style="dark"/><Header/><ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{render()}</ScrollView><View style={styles.nav}>{tabs.map(t=><TouchableOpacity key={t} onPress={()=>selectTab(t)} style={styles.navItem}><Text style={[styles.navText,tab===t&&styles.navTextActive]}>{t}</Text>{tab===t&&<View style={styles.navDot}/>}</TouchableOpacity>)}</View></SafeAreaView>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},scroll:{flex:1},content:{padding:14,paddingBottom:22},
  header:{backgroundColor:C.bg2,borderBottomWidth:1,borderColor:C.line,paddingHorizontal:16,paddingTop:8,paddingBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  logo:{fontSize:31,fontWeight:'900',letterSpacing:2,color:C.blue2,lineHeight:32},logoSub:{fontSize:13,fontWeight:'800',letterSpacing:1.4,color:C.blue},tagline:{fontSize:10,color:C.muted,marginTop:2},
  hdcBox:{alignItems:'center'},hdcLabel:{fontSize:9,fontWeight:'800',color:C.blue},hdcInput:{width:46,height:34,borderWidth:1,borderColor:C.blue,borderRadius:8,textAlign:'center',color:C.blue2,fontWeight:'900',backgroundColor:C.white},
  card:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:14,padding:14,marginBottom:12},heroCard:{paddingVertical:18},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.1,color:C.blue},heroTitle:{fontSize:24,fontWeight:'900',color:C.blue2,marginTop:4},heroMeta:{fontSize:12,color:C.muted,marginTop:5},
  grid2:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},homeTile:{width:'48.5%',backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:14,padding:14,marginBottom:10,minHeight:94},homeTileText:{fontSize:16,fontWeight:'900',color:C.blue2},homeTileSub:{fontSize:11,color:C.muted,marginTop:5},
  button:{backgroundColor:C.blue2,borderRadius:11,minHeight:46,alignItems:'center',justifyContent:'center',paddingHorizontal:14,marginTop:8},buttonSecondary:{backgroundColor:C.panel2,borderWidth:1,borderColor:C.blue},buttonSmall:{minHeight:34,paddingHorizontal:10,marginTop:0},buttonText:{color:C.white,fontWeight:'900',letterSpacing:.5,fontSize:13},buttonTextSecondary:{color:C.blue2},buttonTextSmall:{fontSize:11},
  sectionTitle:{fontSize:12,fontWeight:'900',letterSpacing:.8,color:C.blue2,marginBottom:8},body:{fontSize:13,lineHeight:19,color:C.blue2},pageTitle:{fontSize:24,fontWeight:'900',color:C.blue2},pageSub:{fontSize:12,color:C.muted,marginTop:2,marginBottom:12},rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  backRow:{alignSelf:'flex-start',paddingVertical:6,paddingRight:20,marginBottom:4},backText:{fontSize:12,fontWeight:'900',color:C.blue2},
  holeNav:{flexDirection:'row',alignItems:'center',gap:6},holeNum:{fontSize:18,fontWeight:'900',color:C.blue2,minWidth:26,textAlign:'center'},
  mapThumb:{backgroundColor:C.panel2,borderWidth:1,borderColor:C.line,borderRadius:14,padding:12,marginBottom:12},mapTitle:{fontSize:11,fontWeight:'900',color:C.blue2,textAlign:'center'},mapInside:{height:130,marginTop:10,borderRadius:10,backgroundColor:'#B8B19F',overflow:'hidden'},fairway:{position:'absolute',left:'43%',top:14,width:'18%',height:100,borderRadius:30,backgroundColor:'#738A65'},green:{position:'absolute',left:'37%',top:5,width:'30%',height:28,borderRadius:20,backgroundColor:'#81966F'},bunker:{position:'absolute',left:'28%',top:45,width:30,height:18,borderRadius:12,backgroundColor:'#D8C59A'},mapLabel:{position:'absolute',bottom:7,width:'100%',textAlign:'center',fontSize:9,fontWeight:'800',color:C.blue2},
  grid3:{flexDirection:'row',gap:8},distanceCard:{flex:1,alignItems:'center',paddingVertical:11},distance:{fontSize:28,fontWeight:'900',color:C.blue2,lineHeight:31},unit:{fontSize:10,fontWeight:'800',color:C.blue},live:{fontSize:9,fontWeight:'900',color:C.good},heard:{fontSize:11,color:C.muted,marginBottom:8},advice:{fontSize:15,fontWeight:'800',lineHeight:21,color:C.blue2},adviceLarge:{fontSize:18,fontWeight:'900',lineHeight:25,color:C.blue2,textAlign:'center',marginTop:10},
  scoreRow:{flexDirection:'row',justifyContent:'space-between',gap:14},scoreLabel:{fontSize:10,fontWeight:'900',color:C.blue,marginBottom:5},stepper:{flexDirection:'row',alignItems:'center',gap:5},stepBtn:{width:34,height:34,borderRadius:8,backgroundColor:C.blue2,alignItems:'center',justifyContent:'center'},stepTxt:{color:C.white,fontSize:22,fontWeight:'800',lineHeight:23},valueBox:{minWidth:48,height:34,paddingHorizontal:8,borderWidth:1,borderColor:C.line,borderRadius:8,backgroundColor:C.white,alignItems:'center',justifyContent:'center'},valueTxt:{fontSize:14,fontWeight:'900',color:C.blue2},toggleRow:{flexDirection:'row',gap:8,marginTop:12},
  micCard:{alignItems:'center',paddingVertical:20},mic:{width:94,height:94,borderRadius:47,backgroundColor:C.blue2,alignItems:'center',justifyContent:'center',marginBottom:10},micLive:{backgroundColor:C.good},micText:{fontSize:42},micName:{fontSize:13,fontWeight:'900',color:C.blue2,marginBottom:12},clubBig:{fontSize:28,fontWeight:'900',color:C.blue2,marginTop:6},
  clubRow:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:12,padding:10,marginBottom:7,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},clubName:{fontSize:14,fontWeight:'900',color:C.blue2,minWidth:74},
  input:{height:42,borderWidth:1,borderColor:C.line,borderRadius:9,backgroundColor:C.white,paddingHorizontal:10,color:C.blue2,fontWeight:'700',marginBottom:10},inputLabel:{fontSize:10,fontWeight:'900',color:C.blue,marginBottom:4},teeRow:{flexDirection:'row',flexWrap:'wrap',gap:6},teeBtn:{paddingVertical:7,paddingHorizontal:9,borderRadius:8,borderWidth:1,borderColor:C.line,backgroundColor:C.panel2},teeBtnActive:{backgroundColor:C.blue2,borderColor:C.blue2},teeText:{fontSize:9,fontWeight:'900',color:C.blue2},teeTextActive:{color:C.white},infoLine:{fontSize:12,color:C.blue2,marginTop:5},settingRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
  menuRow:{minHeight:48,borderBottomWidth:1,borderColor:C.line,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},menuText:{fontSize:14,fontWeight:'800',color:C.blue2},chev:{fontSize:26,color:C.blue},
  nav:{minHeight:58,backgroundColor:C.bg2,borderTopWidth:1,borderColor:C.line,flexDirection:'row',justifyContent:'space-around',alignItems:'center',paddingBottom:3},navItem:{flex:1,alignItems:'center',justifyContent:'center'},navText:{fontSize:10,fontWeight:'800',color:C.muted},navTextActive:{color:C.blue2},navDot:{width:18,height:3,borderRadius:2,backgroundColor:C.blue2,marginTop:4},
});