import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from 'react-native';

const C = {
  bg: '#E7E2D8',
  panel: '#F3F0E8',
  panel2: '#DDD6C9',
  blue: '#123F68',
  blue2: '#1E5A87',
  ink: '#17324A',
  muted: '#6F7780',
  line: '#B8B1A5',
  white: '#FCFBF7',
};

const CLUBS = [
  ['Driver', 230], ['3 Wood', 210], ['5 Wood', 195], ['4 Iron', 180],
  ['5 Iron', 170], ['6 Iron', 160], ['7 Iron', 150], ['8 Iron', 140],
  ['9 Iron', 130], ['PW', 115], ['GW', 100], ['SW', 85], ['LW', 70], ['Putter', 0],
];

const WARMUP = ['Loosen Up', 'Short Wedges', 'Mid Irons', 'Long Club', 'Driver', 'Chipping', 'Putting', 'Ready'];
const ROUTINES = ['Target', 'Lie', 'Club', 'Picture', 'Commit', 'Breathe', 'Reset', 'Next'];
const PRACTICE = ['Wedges', 'Irons', 'Driver', 'Chipping', 'Bunker', 'Putting'];

function Button({ title, onPress, secondary, small }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary, small && styles.buttonSmall]}>
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary, small && styles.buttonTextSmall]}>{title}</Text>
    </TouchableOpacity>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Brand() {
  return (
    <View style={styles.brandWrap}>
      <Text style={styles.drc}>DRC</Text>
      <Text style={styles.brandTitle}>VIRTUAL GOLF</Text>
      <Text style={styles.elite}>ELITE</Text>
      <Text style={styles.tag}>YOUR CADDIE  •  YOUR GAME</Text>
    </View>
  );
}

function Header({ title, onBack }) {
  return (
    <View style={styles.screenHeader}>
      <TouchableOpacity onPress={onBack} style={styles.back}><Text style={styles.backText}>‹</Text></TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.miniBrand}>DRC VIRTUAL GOLF</Text>
        <Text style={styles.screenTitle}>{title}</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [handicap, setHandicap] = useState('4.2');
  const [units, setUnits] = useState('METRES');
  const [caddieName, setCaddieName] = useState('Pete');
  const [clubData, setClubData] = useState(CLUBS.map(x => [...x]));

  const Home = () => (
    <View style={styles.homeBody}>
      <Brand />

      <View style={styles.infoStrip}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>HANDICAP</Text>
          <TextInput
            value={handicap}
            onChangeText={setHandicap}
            keyboardType="decimal-pad"
            style={styles.hdcInput}
            selectTextOnFocus
          />
        </View>
        <View style={styles.infoDivider} />
        <TouchableOpacity style={styles.infoCell} onPress={() => setUnits(units === 'METRES' ? 'YARDS' : 'METRES')}>
          <Text style={styles.infoLabel}>UNITS</Text>
          <Text style={styles.infoValue}>{units}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tileGrid}>
        {[
          ['ROUTINES', 'Pre-shot & reset', 'routines'],
          ['WARM-UP', '8 step warm-up', 'warmup'],
          ['PRACTICE', 'Purposeful sessions', 'practice'],
          ['SCORECARD', '18 hole scoring', 'scorecard'],
        ].map(([a, b, s]) => (
          <TouchableOpacity key={s} style={styles.tile} onPress={() => setScreen(s)}>
            <Text style={styles.tileTitle}>{a}</Text>
            <Text style={styles.tileSub}>{b}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.homeLinks}>
        <TouchableOpacity onPress={() => setScreen('bag')}><Text style={styles.homeLink}>MY BAG</Text></TouchableOpacity>
        <Text style={styles.dot}>•</Text>
        <TouchableOpacity onPress={() => setScreen('course')}><Text style={styles.homeLink}>COURSE</Text></TouchableOpacity>
        <Text style={styles.dot}>•</Text>
        <TouchableOpacity onPress={() => setScreen('more')}><Text style={styles.homeLink}>MORE</Text></TouchableOpacity>
      </View>

      <Button title="START ROUND" onPress={() => setScreen('round')} />
    </View>
  );

  const Round = () => (
    <ScrollView contentContainerStyle={styles.pageBody}>
      <Header title="ROUND" onBack={() => setScreen('home')} />
      <View style={styles.holeBar}><Text style={styles.holeTitle}>HOLE 1</Text><Text style={styles.holeMeta}>PAR 4  •  SI 7</Text></View>
      <Card>
        <Text style={styles.cardEyebrow}>PIN DISTANCE</Text>
        <Text style={styles.distance}>154 <Text style={styles.distanceUnit}>{units === 'METRES' ? 'm' : 'yd'}</Text></Text>
        <View style={styles.distanceRow}>
          <Text style={styles.distanceMini}>FRONT 146</Text><Text style={styles.distanceMini}>CENTRE 154</Text><Text style={styles.distanceMini}>BACK 162</Text>
        </View>
      </Card>
      <Card>
        <Text style={styles.cardEyebrow}>ASK {caddieName.toUpperCase()}</Text>
        <TouchableOpacity style={styles.mic}><Text style={styles.micIcon}>🎤</Text><Text style={styles.micText}>TAP TO ASK</Text></TouchableOpacity>
        <View style={styles.answerBox}>
          <Text style={styles.heard}>Heard: “154 metres, light rough, slight headwind.”</Text>
          <Text style={styles.answer}>Playing 160. Smooth 6 iron. Middle of the green. Commit.</Text>
        </View>
      </Card>
      <View style={styles.twoCol}>
        <Card style={styles.half}><Text style={styles.cardEyebrow}>CLUB</Text><Text style={styles.bigBlue}>6 IRON</Text></Card>
        <Card style={styles.half}><Text style={styles.cardEyebrow}>LIE</Text><Text style={styles.bigBlue}>ROUGH</Text></Card>
      </View>
      <Button title="SCORE THIS HOLE" onPress={() => setScreen('scorecard')} />
    </ScrollView>
  );

  const ListScreen = ({ title, items, note }) => (
    <ScrollView contentContainerStyle={styles.pageBody}>
      <Header title={title} onBack={() => setScreen('home')} />
      {note ? <Text style={styles.intro}>{note}</Text> : null}
      <View style={styles.compactList}>
        {items.map((x, i) => (
          <View style={styles.listRow} key={x}>
            <View style={styles.stepCircle}><Text style={styles.stepText}>{i + 1}</Text></View>
            <Text style={styles.listText}>{x}</Text>
            <Text style={styles.chev}>›</Text>
          </View>
        ))}
      </View>
      {title === 'WARM-UP' && <Button title="ADVICE ONLY" secondary onPress={() => {}} />}
    </ScrollView>
  );

  const Bag = () => (
    <ScrollView contentContainerStyle={styles.pageBody}>
      <Header title="MY BAG" onBack={() => setScreen('home')} />
      <Text style={styles.intro}>Your carry distances • {units}</Text>
      {clubData.map((club, i) => (
        <View style={styles.clubRow} key={club[0]}>
          <Text style={styles.clubName}>{club[0]}</Text>
          {club[0] === 'Putter' ? <Text style={styles.clubDistance}>—</Text> : (
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setClubData(d => d.map((c, j) => j === i ? [c[0], Math.max(0, c[1] - 1)] : c))}><Text style={styles.stepBtn}>−</Text></TouchableOpacity>
              <Text style={styles.clubDistance}>{club[1]}</Text>
              <TouchableOpacity onPress={() => setClubData(d => d.map((c, j) => j === i ? [c[0], c[1] + 1] : c))}><Text style={styles.stepBtn}>+</Text></TouchableOpacity>
            </View>
          )}
        </View>
      ))}
      <Button title="SAVE BAG" onPress={() => setScreen('home')} />
    </ScrollView>
  );

  const Course = () => (
    <ScrollView contentContainerStyle={styles.pageBody}>
      <Header title="COURSE" onBack={() => setScreen('home')} />
      <Card>
        <Text style={styles.cardEyebrow}>COURSE NAME</Text><Text style={styles.fieldText}>Yeppoon Golf Club</Text>
        <View style={styles.rule} />
        <Text style={styles.cardEyebrow}>TEE</Text><Text style={styles.fieldText}>MEN • WHITE</Text>
      </Card>
      <Card>
        <Text style={styles.cardEyebrow}>COURSE INFO</Text>
        <Text style={styles.infoText}>Phone • Email • Membership</Text>
        <Text style={styles.infoText}>Cart available • Club hire</Text>
        <Text style={styles.infoText}>Pro shop • Golf professional</Text>
      </Card>
      <Card>
        <Text style={styles.cardEyebrow}>COURSE MAPPER</Text>
        <Text style={styles.bigBlue}>0 / 54 POINTS</Text>
        <Text style={styles.infoText}>Capture FRONT • CENTRE • BACK for each hole.</Text>
      </Card>
      <Button title="USE THIS COURSE" onPress={() => setScreen('home')} />
    </ScrollView>
  );

  const Scorecard = () => (
    <ScrollView contentContainerStyle={styles.pageBody}>
      <Header title="SCORECARD" onBack={() => setScreen('home')} />
      <View style={styles.scoreHead}><Text style={[styles.scoreCell, {flex:0.5}]}>H</Text><Text style={styles.scoreCell}>PAR</Text><Text style={styles.scoreCell}>SCORE</Text><Text style={styles.scoreCell}>PUTTS</Text><Text style={styles.scoreCell}>GIR</Text></View>
      {Array.from({ length: 18 }).map((_, i) => (
        <View style={styles.scoreRow} key={i}>
          <Text style={[styles.scoreCell, styles.scoreHole, {flex:0.5}]}>{i + 1}</Text><Text style={styles.scoreCell}>{[4,4,3,5,4][i%5]}</Text><Text style={styles.scoreCell}>—</Text><Text style={styles.scoreCell}>—</Text><Text style={styles.scoreCell}>—</Text>
        </View>
      ))}
    </ScrollView>
  );

  const More = () => (
    <ScrollView contentContainerStyle={styles.pageBody}>
      <Header title="MORE" onBack={() => setScreen('home')} />
      <Card>
        <Text style={styles.cardEyebrow}>CADDIE NAME</Text>
        <TextInput value={caddieName} onChangeText={setCaddieName} style={styles.textField} />
      </Card>
      <TouchableOpacity style={styles.settingRow} onPress={() => setUnits(units === 'METRES' ? 'YARDS' : 'METRES')}><Text style={styles.settingTitle}>Units</Text><Text style={styles.settingValue}>{units} ›</Text></TouchableOpacity>
      <TouchableOpacity style={styles.settingRow}><Text style={styles.settingTitle}>FAQ / How to use</Text><Text style={styles.settingValue}>›</Text></TouchableOpacity>
      <TouchableOpacity style={styles.settingRow}><Text style={styles.settingTitle}>Round Summary</Text><Text style={styles.settingValue}>›</Text></TouchableOpacity>
      <TouchableOpacity style={styles.settingRow}><Text style={styles.settingTitle}>GPS Position</Text><Text style={styles.settingValue}>READY</Text></TouchableOpacity>
    </ScrollView>
  );

  let body;
  if (screen === 'home') body = <Home />;
  else if (screen === 'round') body = <Round />;
  else if (screen === 'routines') body = <ListScreen title="ROUTINES" items={ROUTINES} note="Simple routine. Same process. Every shot." />;
  else if (screen === 'warmup') body = <ListScreen title="WARM-UP" items={WARMUP} note="Compact 8-step preparation." />;
  else if (screen === 'practice') body = <ListScreen title="PRACTICE" items={PRACTICE} note="Practice like you play." />;
  else if (screen === 'bag') body = <Bag />;
  else if (screen === 'course') body = <Course />;
  else if (screen === 'scorecard') body = <Scorecard />;
  else body = <More />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  homeBody: { flex: 1, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14, justifyContent: 'space-between' },
  brandWrap: { alignItems: 'center', paddingTop: 2 },
  drc: { color: C.blue, fontSize: 46, lineHeight: 48, fontWeight: '900', letterSpacing: 5 },
  brandTitle: { color: C.blue, fontSize: 21, lineHeight: 23, fontWeight: '900', letterSpacing: 4 },
  elite: { color: C.blue2, fontSize: 14, fontWeight: '900', letterSpacing: 8, marginTop: 3 },
  tag: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.8, marginTop: 5 },
  infoStrip: { flexDirection: 'row', backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 8, marginTop: 4 },
  infoCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  infoDivider: { width: 1, backgroundColor: C.line },
  infoLabel: { color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  infoValue: { color: C.blue, fontSize: 18, fontWeight: '900', marginTop: 2 },
  hdcInput: { color: C.blue, fontSize: 18, fontWeight: '900', textAlign: 'center', padding: 0, marginTop: 0, minWidth: 70 },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 },
  tile: { width: '48.5%', backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 13, padding: 14, minHeight: 94, justifyContent: 'center', marginBottom: 10 },
  tileTitle: { color: C.blue, fontSize: 17, fontWeight: '900', letterSpacing: 0.8 },
  tileSub: { color: C.muted, fontSize: 11, marginTop: 5, fontWeight: '600' },
  homeLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
  homeLink: { color: C.blue, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  dot: { color: C.line, marginHorizontal: 12 },
  button: { backgroundColor: C.blue, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonSecondary: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.blue },
  buttonSmall: { minHeight: 38 },
  buttonText: { color: C.white, fontSize: 16, fontWeight: '900', letterSpacing: 1.4 },
  buttonTextSecondary: { color: C.blue },
  buttonTextSmall: { fontSize: 13 },
  pageBody: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 26 },
  screenHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  backText: { color: C.blue, fontSize: 32, lineHeight: 32, fontWeight: '700' },
  miniBrand: { color: C.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },
  screenTitle: { color: C.blue, fontSize: 24, fontWeight: '900', letterSpacing: 1.2 },
  card: { backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 13, padding: 14, marginBottom: 10 },
  cardEyebrow: { color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  holeBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  holeTitle: { color: C.blue, fontSize: 19, fontWeight: '900' },
  holeMeta: { color: C.muted, fontSize: 11, fontWeight: '800' },
  distance: { color: C.blue, fontSize: 46, lineHeight: 52, fontWeight: '900', textAlign: 'center' },
  distanceUnit: { fontSize: 18 },
  distanceRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
  distanceMini: { color: C.ink, fontSize: 10, fontWeight: '800' },
  mic: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 92, height: 70, marginVertical: 6 },
  micIcon: { fontSize: 34 },
  micText: { color: C.blue, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  answerBox: { backgroundColor: C.panel2, borderRadius: 10, padding: 11 },
  heard: { color: C.muted, fontSize: 11, marginBottom: 4 },
  answer: { color: C.blue, fontSize: 16, lineHeight: 21, fontWeight: '800' },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48.5%' },
  bigBlue: { color: C.blue, fontSize: 19, fontWeight: '900', marginTop: 4 },
  intro: { color: C.muted, fontSize: 12, fontWeight: '600', marginBottom: 10 },
  compactList: { borderRadius: 13, overflow: 'hidden', borderWidth: 1, borderColor: C.line, marginBottom: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 12, backgroundColor: C.panel, borderBottomWidth: 1, borderBottomColor: C.line },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  stepText: { color: C.white, fontSize: 12, fontWeight: '900' },
  listText: { color: C.ink, fontSize: 15, fontWeight: '800', flex: 1 },
  chev: { color: C.blue, fontSize: 24 },
  clubRow: { flexDirection: 'row', minHeight: 46, backgroundColor: C.panel, borderBottomWidth: 1, borderBottomColor: C.line, paddingHorizontal: 12, alignItems: 'center' },
  clubName: { flex: 1, color: C.ink, fontSize: 14, fontWeight: '800' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { color: C.blue, fontSize: 24, fontWeight: '900', width: 36, textAlign: 'center' },
  clubDistance: { color: C.blue, fontSize: 16, fontWeight: '900', minWidth: 44, textAlign: 'center' },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 12 },
  fieldText: { color: C.blue, fontSize: 17, fontWeight: '900', marginTop: 4 },
  infoText: { color: C.ink, fontSize: 13, lineHeight: 21, fontWeight: '600', marginTop: 3 },
  scoreHead: { flexDirection: 'row', backgroundColor: C.blue, borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingVertical: 9 },
  scoreRow: { flexDirection: 'row', backgroundColor: C.panel, borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 8 },
  scoreCell: { flex: 1, textAlign: 'center', color: C.ink, fontSize: 11, fontWeight: '800' },
  scoreHole: { color: C.blue, fontWeight: '900' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 11, paddingHorizontal: 14, minHeight: 52, marginBottom: 9 },
  settingTitle: { color: C.ink, fontSize: 14, fontWeight: '800' },
  settingValue: { color: C.blue, fontSize: 12, fontWeight: '900' },
  textField: { color: C.blue, fontSize: 18, fontWeight: '900', borderBottomWidth: 1, borderBottomColor: C.blue, paddingVertical: 5, marginTop: 3 },
});
