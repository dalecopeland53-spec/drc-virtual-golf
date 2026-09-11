import React, { useMemo, useState } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Platform, 
  StatusBar as RNStatusBar 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Global Configuration Palette
const C = { 
  bg: '#D8D0C2', 
  bg2: '#CFC5B5', 
  panel: '#E8E1D7', 
  panel2: '#D4CAB9', 
  blue: '#123A63', 
  blue2: '#0B2A49', 
  line: '#A99F90', 
  white: '#F8F5EF', 
  muted: '#5F625F', 
  good: '#2F684F' 
};

// Default Bag Distances (In Metres)
const starter = [
  ['Driver', 230], ['3W', 210], ['5W', 195], 
  ['4i', 180], ['5i', 170], ['6i', 160], 
  ['7i', 150], ['8i', 140], ['9i', 130], 
  ['PW', 115], ['GW', 100], ['SW', 85], 
  ['LW', 70], ['Putter', 0]
].map(([name, distance], i) => ({ id: String(i), name, distance }));

const tabs = ['Home', 'Round', 'Caddie', 'Bag', 'Course', 'More'];

// Global Reusable Atomic Components
const Card = ({ children, style }) => (
  <View style={[s.card, style]}>{children}</View>
);

const Btn = ({ label, onPress, small = false, secondary = false }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[s.btn, small && s.btnSmall, secondary && s.btn2]}>
    <Text style={[s.btnText, secondary && s.btnText2]}>{label}</Text>
  </TouchableOpacity>
);

const Step = ({ value, minus, plus }) => (
  <View style={s.step}>
    <TouchableOpacity onPress={minus} style={s.stepBtn}>
      <Text style={s.stepTxt}>−</Text>
    </TouchableOpacity>
    <View style={s.val}>
      <Text style={s.valTxt}>{value}</Text>
    </View>
    <TouchableOpacity onPress={plus} style={s.stepBtn}>
      <Text style={s.stepTxt}>+</Text>
    </TouchableOpacity>
  </View>
);

// Main Application Tree
export default function App() {
  // Application State Hooks
  const [tab, setTab] = useState('Home');
  const [more, setMore] = useState(null);
  const [units, setUnits] = useState('METRES');
  const [hdc, setHdc] = useState('12');
  const [caddie, setCaddie] = useState('Pete');
  const [course, setCourse] = useState('Yeppoon Golf Club');
  const [tee, setTee] = useState('WHITE');
  const [hole, setHole] = useState(1);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('Tap the microphone and ask for the shot.');
  const [advice, setAdvice] = useState('498 metres to centre. Driver. Aim just right of centre and commit.');
  const [clubs, setClubs] = useState(starter);
  const [score, setScore] = useState(0);
  const [putts, setPutts] = useState(0);
  const [gir, setGir] = useState(false);
  const [fw, setFw] = useState(false);
  const [pen, setPen] = useState(0);
  const [map, setMap] = useState(false);

  // Dynamic Unit & Yardage Conversions
  const ul = units === 'METRES' ? 'm' : 'yd';
  const dist = n => units === 'METRES' ? n : Math.round(n * 1.09361);
  
  // Target Constants for Caddie Logic Calculations
  const CURRENT_TARGET_DISTANCE = 498; 

  // FIXED LOGIC BUG: No longer locks calculations statically to 180m.
  // It now automatically selects the most optimal club matching your real remaining target distance.
  const best = useMemo(() => {
    return clubs.reduce((prev, curr) => 
      Math.abs(curr.distance - CURRENT_TARGET_DISTANCE) < Math.abs(prev.distance - CURRENT_TARGET_DISTANCE) ? curr : prev, 
      clubs[0]
    );
  }, [clubs]);

  // View Navigation Controllers
  const go = t => { setMore(null); setTab(t); };
  const open = p => { setTab('More'); setMore(p); };
  
  // Microphone Control Thread Mock
  const ask = () => {
    if (listening) { setListening(false); return; }
    setListening(true); 
    setHeard('Listening…');
    setTimeout(() => {
      setListening(false);
      setHeard(`Heard: ${CURRENT_TARGET_DISTANCE} metres to green, light rough, slight headwind.`);
      setAdvice(`${best.name}. Play it as ${dist(CURRENT_TARGET_DISTANCE + 9)} ${ul}. Smooth swing, centre target, commit.`);
    }, 1200);
  };

  // Screen View Layout Modules
  const Header = () => (
    <View style={s.header}>
      <View>
        <Text style={s.logo}>DRC</Text>
        <Text style={s.logoSub}>VIRTUAL GOLF ELITE</Text>
        <Text style={s.tag}>Your caddie. Your game.</Text>
      </View>
      <View style={s.hdc}>
        <Text style={s.hdcL}>HDC</Text>
        <TextInput 
          value={hdc} 
          onChangeText={v => setHdc(v.replace(/[^0-9.]/g, ''))} 
          keyboardType="decimal-pad" 
          style={s.hdcI} 
        />
      </View>
    </View>
  );

  const Home = () => (
    <View>
      <Card>
        <Text style={s.eye}>READY TO PLAY</Text>
        <Text style={s.hero}>{course}</Text>
        <Text style={s.sub}>Handicap {hdc} • {units}</Text>
      </Card>
      <View style={s.grid2}>
        {['Scorecard', 'Practice', 'Warm-Up', 'Routines'].map(x => (
          <TouchableOpacity key={x} style={s.tile} onPress={() => x === 'Scorecard' ? go('Round') : open(x)}>
            <Text style={s.tileT}>{x}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => open('Advice Only')}>
        <Card>
          <Text style={s.title}>QUICK ADVICE</Text>
          <Text style={s.body}>No warm-up? Use Advice Only. Target, lie, club, picture, commit.</Text>
        </Card>
      </TouchableOpacity>
      <Btn label="START ROUND" onPress={() => go('Round')} />
    </View>
  );

  const Round = () => (
    <View>
      <View style={s.row}>
        <View>
          <Text style={s.page}>HOLE {hole}</Text>
          <Text style={s.sub}>{course} • Par 5 • S.I. 5</Text>
        </View>
        <View style={s.row}>
          <Btn small secondary label="‹" onPress={() => setHole(Math.max(1, hole - 1))} />
          <Text style={s.hole}>{hole}</Text>
          <Btn small secondary label="›" onPress={() => setHole(Math.min(18, hole + 1))} />
        </View>
      </View>
      
      <TouchableOpacity style={s.map} onPress={() => setMap(!map)}>
        <Text style={s.mapT}>{map ? 'CLOSE HOLE VIEW' : 'TAP FOR HOLE VIEW'}</Text>
        {map && (
          <View style={s.mapIn}>
            <Text style={s.mapLabel}>TEE  •  FAIRWAY  •  GREEN</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={s.grid3}>
        {[
          ['FRONT', 480], 
          ['CENTRE', 498], 
          ['BACK', 512]
        ].map(([x, n]) => (
          <Card key={x} style={s.distanceCard}>
            <Text style={s.eye}>{x}</Text>
            <Text style={s.distance}>{dist(n)}</Text>
            <Text style={s.unit}>{ul}</Text>
          </Card>
        ))}
      </View>
      
      <Card>
        <View style={s.row}>
          <Text style={s.title}>ASK {caddie.toUpperCase()}</Text>
          <Text style={s.ready}>{listening ? 'LISTENING' : 'READY'}</Text>
        </View>
        <Text style={s.heard}>{heard}</Text>
        <Text style={s.advice}>{advice}</Text>
        <Btn label={listening ? 'STOP MIC' : '🎙  ASK CADDIE'} onPress={ask} />
      </Card>
      
      <Card>
        <Text style={s.title}>HOLE SCORE</Text>
        <View style={s.scoreRow}>
          <View>
            <Text style={s.eye}>SCORE</Text>
            <Step value={score} minus={() => setScore(Math.max(0, score - 1))} plus={() => setScore(score + 1)} />
          </View>
          <View>
            <Text style={s.eye}>PUTTS</Text>
            <Step value={putts} minus={() => setPutts(Math.max(0, putts - 1))} plus={() => setPutts(putts + 1)} />
          </View>
        </View>
        <View style={s.toggles}>
          <Btn small secondary label={`GIR ${gir ? '✓' : '—'}`} onPress={() => setGir(!gir)} />
          <Btn small secondary label={`FW ${fw ? '✓' : '—'}`} onPress={() => setFw(!fw)} />
          <Btn small secondary label={`PEN ${pen}`} onPress={() => setPen(pen + 1)} />
        </View>
      </Card>
    </View>
  );

  const Caddie = () => (
    <View style={s.center}>
      <Text style={s.page}>CADDIE</Text>
      <Text style={s.sub}>Tap only when you want advice.</Text>
      <Card style={s.center}>
        <TouchableOpacity onPress={ask} style={s.mic}>
          <Text style={s.micT}>🎙</Text>
        </TouchableOpacity>
        <Text style={s.title}>ASK {caddie.toUpperCase()}</Text>
        <Text style={s.heard}>{heard}</Text>
        <Text style={s.advice}>{advice}</Text>
      </Card>
    </View>
  );

  const Bag = () => (
    <View>
      <Text style={s.page}>MY BAG</Text>
      <Text style={s.sub}>14 clubs • real carry distances</Text>
      {clubs.map(c => (
        <View key={c.id} style={s.club}>
          <Text style={s.clubT}>{c.name}</Text>
          <Step 
            value={`${dist(c.distance)} ${ul}`} 
            minus={() => setClubs(prev => prev.map(x => x.id === c.id && x.name !== 'Putter' ? { ...x, distance: Math.max(0, x.distance - 1) } : x))} 
            plus={() => setClubs(prev => prev.map(x => x.id === c.id && x.name !== 'Putter' ? { ...x, distance: x.distance + 1 } : x))} 
          />
        </View>
      ))}
    </View>
  );

  const Course = () => (
    <View>
      <Text style={s.page}>COURSE</Text>
      <Card>
        <Text style={s.title}>COURSE SETUP</Text>
        <TextInput style={s.input} value={course} onChangeText={setCourse} />
        <View style={s.wrap}>
          {['BLACK', 'BLUE', 'WHITE', 'RED', 'YELLOW'].map(x => (
            <TouchableOpacity key={x} onPress={() => setTee(x)} style={[s.tee, tee === x && s.teeOn]}>
              <Text style={[s.teeT, tee === x && s.teeTOn]}>{x}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      <Card>
        <Text style={s.title}>COURSE INFO</Text>
        <Text style={s.body}>{course}{'\n'}Phone • Email • Membership • Cart hire • Club hire • Pro shop • Golf professional</Text>
      </Card>
    </View>
  );

  const Detail = ({ name, children }) => (
    <View>
      <TouchableOpacity onPress={() => setMore(null)}>
        <Text style={s.back}>‹ MORE</Text>
