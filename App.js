import React, { useState } from 'react';
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
  <View style={[styles.card, style]}>{children}</View>
);

const Btn = ({ label, onPress, small = false, secondary = false }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[styles.btn, small && styles.btnSmall, secondary && styles.btn2]}>
    <Text style={[styles.btnText, secondary && styles.btnText2]}>{label}</Text>
  </TouchableOpacity>
);

const Step = ({ value, minus, plus }) => (
  <View style={styles.step}>
    <TouchableOpacity onPress={minus} style={styles.stepBtn}>
      <Text style={styles.stepTxt}>−</Text>
    </TouchableOpacity>
    <View style={styles.val}>
      <Text style={styles.valTxt}>{value}</Text>
    </View>
    <TouchableOpacity onPress={plus} style={styles.stepBtn}>
      <Text style={styles.stepTxt}>+</Text>
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
      setAdvice(`Driver. Play it as ${dist(CURRENT_TARGET_DISTANCE + 9)} ${ul}. Smooth swing, centre target, commit.`);
    }, 1200);
  };

  // Screen View Layout Modules
  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>DRC</Text>
        <Text style={styles.logoSub}>VIRTUAL GOLF ELITE</Text>
        <Text style={styles.tag}>Your caddie. Your game.</Text>
      </View>
      <View style={styles.hdc}>
        <Text style={styles.hdcL}>HDC</Text>
        <TextInput 
          value={hdc} 
          onChangeText={v => setHdc(v.replace(/[^0-9.]/g, '') || '0')} 
          keyboardType="decimal-pad" 
          style={styles.hdcI} 
        />
      </View>
    </View>
  );

  const Home = () => (
    <View>
      <Card>
        <Text style={styles.eye}>READY TO PLAY</Text>
        <Text style={styles.hero}>{course}</Text>
        <Text style={styles.sub}>Handicap {hdc} • {units}</Text>
      </Card>
      <View style={styles.grid2}>
        {['Scorecard', 'Practice', 'Warm-Up', 'Routines'].map(x => (
          <TouchableOpacity key={x} style={styles.tile} onPress={() => x === 'Scorecard' ? go('Round') : open(x)}>
            <Text style={styles.tileT}>{x}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => open('Advice Only')}>
        <Card>
          <Text style={styles.title}>QUICK ADVICE</Text>
          <Text style={styles.body}>No warm-up? Use Advice Only. Target, lie, club, picture, commit.</Text>
        </Card>
      </TouchableOpacity>
      <Btn label="START ROUND" onPress={() => go('Round')} />
    </View>
  );

  const Round = () => (
    <View>
      <View style={styles.row}>
        <View>
          <Text style={styles.page}>HOLE {hole}</Text>
          <Text style={styles.sub}>{course} • Par 5 • S.I. 5</Text>
        </View>
        <View style={styles.row}>
          <Btn small secondary label="‹" onPress={() => setHole(Math.max(1, hole - 1))} />
          <Text style={styles.hole}>{hole}</Text>
          <Btn small secondary label="›" onPress={() => setHole(Math.min(18, hole + 1))} />
        </View>
      </View>
      
      <TouchableOpacity style={styles.map} onPress={() => setMap(!map)}>
        <Text style={styles.mapT}>{map ? 'CLOSE HOLE VIEW' : 'TAP FOR HOLE VIEW'}</Text>
        {map && (
          <View style={styles.mapIn}>
            <Text style={styles.mapLabel}>TEE  •  FAIRWAY  •  GREEN</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.grid3}>
        {[
          ['FRONT', 480], 
          ['CENTRE', 498], 
          ['BACK', 512]
        ].map(([x, n]) => (
          <Card key={x} style={styles.distanceCard}>
            <Text style={styles.eye}>{x}</Text>
            <Text style={styles.distance}>{dist(n)}</Text>
            <Text style={styles.unit}>{ul}</Text>
          </Card>
        ))}
      </View>
      
      <Card>
        <View style={styles.row}>
          <Text style={styles.title}>ASK PETE</Text>
          <Text style={styles.ready}>{listening ? 'LISTENING' : 'READY'}</Text>
        </View>
        <Text style={styles.heard}>{heard}</Text>
        <Text style={styles.advice}>{advice}</Text>
        <Btn label={listening ? 'STOP MIC' : '🎙  ASK CADDIE'} onPress={ask} />
      </Card>
      
      <Card>
        <Text style={styles.title}>HOLE SCORE</Text>
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.eye}>SCORE</Text>
            <Step value={score} minus={() => setScore(Math.max(0, score - 1))} plus={() => setScore(score + 1)} />
          </View>
          <View>
            <Text style={styles.eye}>PUTTS</Text>
            <Step value={putts} minus={() => setPutts(Math.max(0, putts - 1))} plus={() => setPutts(putts + 1)} />
          </View>
        </View>
        <View style={styles.toggles}>
          <Btn small secondary label={`GIR ${gir ? '✓' : '—'}`} onPress={() => setGir(!gir)} />
          <Btn small secondary label={`FW ${fw ? '✓' : '—'}`} onPress={() => setFw(!fw)} />
          <Btn small secondary label={`PEN ${pen}`} onPress={() => setPen(pen + 1)} />
        </View>
      </Card>
    </View>
  );

  const CaddieView = () => (
    <View style={styles.center}>
      <Text style={styles.page}>CADDIE</Text>
      <Text style={styles.sub}>Tap only when you want advice.</Text>
      <Card style={styles.centerCard}>
        <TouchableOpacity onPress={ask} style={styles.mic}>
          <Text style={styles.micT}>🎙</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ASK PETE</Text>
        <Text style={styles.heard}>{heard}</Text>
        <Text style={styles.advice}>{advice}</Text>
      </Card>
    </View>
  );

  const Bag = () => (
    <View>
      <Text style={styles.page}>MY BAG</Text>
      <Text style={styles.sub}>14 clubs • real carry distances</Text>
      {clubs.map(c => (
        <View key={c.id} style={styles.club}>
          <Text style={styles.clubT}>{c.name}</Text>
          <Step 
            value={`${dist(c.distance)} ${ul}`} 
            minus={() => setClubs(prev => prev.map(x => x.id === c.id && x.name !== 'Putter' ? { ...x, distance: Math.max(0, x.distance - 1) } : x))} 
            plus={() => setClubs(prev => prev.map(x => x.id === c.id && x.name !== 'Putter' ? { ...x, distance: x.distance + 1 } : x))} 
          />
        </View>
      ))}
    </View>
  );

  const CourseView = () => (
    <View>
      <Text style={styles.page}>COURSE</Text>
      <Card>
        <Text style={styles.title}>COURSE SETUP</Text>
        <TextInput style={styles.input} value={course} onChangeText={setCourse} />
        <View style={styles.wrap}>
          {['BLACK', 'BLUE', 'WHITE', 'RED', 'YELLOW'].map(x => (
            <TouchableOpacity key={x} onPress={() => setTee(x)} style={[styles.tee, tee === x && styles.teeOn]}>
              <Text style={[styles.teeT, tee === x && styles.teeTOn]}>{x}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.title}>COURSE INFO</Text>
        <Text style={styles.body}>{course}{'\n'}Phone • Email • Membership • Cart hire • Club hire • Pro shop</Text>
      </Card>
    </View>
  );

  const Detail = ({ name }) => (
    <View>
      <TouchableOpacity onPress={() => setMore(null)}>
        <Text style={styles.back}>‹ BACK</Text>
      </TouchableOpacity>
      <Text style={styles.page}>{name.toUpperCase()}</Text>
      <Card>
