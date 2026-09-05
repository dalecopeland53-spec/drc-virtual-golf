import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { StrokesGainedEngine } from './GolfProEngine';

export default function App() {
  const [shots, setShots] = useState([]);
  const [selectedLie, setSelectedLie] = useState('tee');
  const [selectedClub, setSelectedClub] = useState('Driver');
  const [currentDistance, setCurrentDistance] = useState(498);
  
  // Real-time environmental metrics 
  const currentTemp = 24;
  const currentWindSpeed = 8;
  const headwindAngle = 0; 

  const dynamicCarry = StrokesGainedEngine.calculateTrueCarryAdjustment(230, currentTemp, currentWindSpeed, headwindAngle);

  const handleLogShot = () => {
    const newShot = {
      id: Math.random().toString(36).substr(2, 9),
      club: selectedClub,
      lieType: selectedLie,
      distanceRemainingYards: currentDistance
    };

    let nextDistanceTarget = currentDistance - 230;
    if (nextDistanceTarget < 0) nextDistanceTarget = 0;

    setShots([...shots, newShot]);
    setCurrentDistance(nextDistanceTarget);
    setSelectedLie(nextDistanceTarget === 0 ? 'green' : 'fairway');
    if (nextDistanceTarget <= 20 && nextDistanceTarget > 0) setSelectedClub('Wedge');
    if (nextDistanceTarget === 0) setSelectedClub('Putter');
  };

  const handleResetRound = () => {
    setShots([]);
    setCurrentDistance(498);
    setSelectedLie('tee');
    setSelectedClub('Driver');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER TELEMETRY */}
      <View style={styles.topBar}>
        <Text style={styles.menuIcon}>☰</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.titleMain}>TOUR PRO</Text>
          <Text style={styles.titleSub}>— ELITE —</Text>
        </View>
        <View style={styles.weatherBox}>
          <Text style={styles.weatherIcon}>☀️</Text>
          <View>
            <Text style={styles.weatherDeg}>{currentTemp}°C</Text>
            <Text style={styles.weatherWind}>Wind {currentWindSpeed} km/h</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollCanvas}>
        <View style={styles.splitGrid}>
          
          {/* GRAPHIC RADAR COMPONENT */}
          <View style={styles.leftCol}>
            <View style={styles.mapCanvas}>
              <View style={styles.mapPin}>
                <Text style={styles.mapText}>⛳ {currentDistance}m</Text>
              </View>
              <View style={styles.arcLine}><Text style={styles.arcText}>280 m</Text></View>
              <View style={styles.arcLine}><Text style={styles.arcText}>230 m</Text></View>
              <View style={styles.ballNode} />
            </View>
          </View>

          {/* OPTIONS AND RECOMMENDATIONS */}
          <View style={styles.rightCol}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardHeader}>Hole 1 <Text style={styles.subInfoText}>Par 5</Text></Text>
              <Text style={styles.metricLabel}>To Centre</Text>
              <Text style={styles.metricValue}>{currentDistance} m</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardHeader}>AI Target Strategy</Text>
              <Text style={styles.caddieSpeech}>
                "Target is {currentDistance}m. Dynamic adjusted carry range factors headwind down to {dynamicCarry}m output."
              </Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardHeader}>Recommended Club</Text>
              <Text style={styles.clubName}>{selectedClub}</Text>
              <Text style={styles.carrySub}>Est. Carry: {dynamicCarry}m</Text>
            </View>
          </View>

        </View>

        {/* OPERATIONS MODULE */}
        <View style={styles.controlPanel}>
          <Text style={styles.panelTitle}>Operations Control Pipeline</Text>
          
          <View style={styles.selectorGroup}>
            {['tee', 'fairway', 'rough', 'sand', 'green'].map((lie) => (
              <TouchableOpacity 
                key={lie} 
                style={[styles.tileBtn, selectedLie === lie && styles.tileBtnActive]}
                onPress={() => setSelectedLie(lie)}
              >
                <Text style={[styles.tileText, selectedLie === lie && styles.tileTextActive]}>{lie.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.actionCommitBtn} onPress={handleLogShot}>
            <Text style={styles.actionCommitText}>Execute Matrix Shot Log</Text>
          </TouchableOpacity>

          {shots.length > 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetRound}>
              <Text style={styles.resetText}>Reset Hole Matrix</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* COMPRESSION RENDERING LOG DATA */}
        <View style={styles.logContainer}>
          <Text style={styles.logHeader}>Live Strokes Gained Data Pipeline</Text>
          {shots.length === 0 ? (
            <Text style={styles.emptyLogText}>Awaiting engine telemetry strings...</Text>
          ) : (
            shots.map((item, index) => {
              const sgValue = StrokesGainedEngine.calculateShotStrokesGained(item, shots[index + 1]);
              return (
                <View key={item.id} style={styles.logRow}>
                  <Text style={styles.logDetails}>Shot {index + 1}: {item.club} ({item.lieType})</Text>
                  <Text style={[styles.logSg, { color: sgValue >= 0 ? '#4caf50' : '#f44336' }]}>
                    {sgValue >= 0 ? `+${sgValue}` : sgValue} SG
                  </Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030812' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#101a30' },
  menuIcon: { color: '#fff', fontSize: 18 },
  titleContainer: { alignItems: 'center' },
  titleMain: { color: '#d4af37', fontSize: 15, fontWeight: 'bold', letterSpacing: 2 },
  titleSub: { color: '#d4af37', fontSize: 8, letterSpacing: 3, marginTop: -2 },
  weatherBox: { backgroundColor: '#0d1527', padding: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  weatherIcon: { marginRight: 4 },
  weatherDeg: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  weatherWind: { color: '#8fa0c0', fontSize: 8 },
  scrollCanvas: { flex: 1, padding: 8 },
  splitGrid: { flexDirection: 'row', gap: 8 },
  leftCol: { flex: 0.48 },
  rightCol: { flex: 0.52, gap: 8 },
  mapCanvas: { height: 360, backgroundColor: '#132913', borderRadius: 10, padding: 12, justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  mapPin: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 4, borderRadius: 4 },
  mapText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  arcLine: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  arcText: { color: '#668866', fontSize: 8, marginTop: -12 },
  ballNode: { width: 12, height: 12, backgroundColor: '#fff', borderRadius: 6, borderHorizontalWidth: 2, borderColor: '#1a73e8', position: 'absolute', bottom: 40 },
  cardInfo: { backgroundColor: '#0d1527', borderRadius: 8, padding: 10, marginBottom: 8 },
  cardHeader: { color: '#8fa0c0', fontSize: 11, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#1a2744', paddingBottom: 4, marginBottom: 6 },
  subInfoText: { color: '#fff', fontSize: 10 },
  metricLabel: { color: '#607898', fontSize: 10 },
  metricValue: { color: '#ffcc00', fontSize: 24, fontWeight: 'bold' },
  caddieSpeech: { color: '#a0b2d6', fontSize: 10, fontStyle: 'italic', lineHeight: 14 },
  clubName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  carrySub: { color: '#ffcc00', fontSize: 12 },
  controlPanel: { backgroundColor: '#0a0f1d', borderRadius: 8, padding: 12, marginVertical: 10, borderHorizontalWidth: 1, borderColor: '#16223f' },
  panelTitle: { color: '#8fa0c0', fontSize: 11, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  selectorGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 10 },
  tileBtn: { backgroundColor: '#16223f', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4 },
  tileBtnActive: { backgroundColor: '#d4af37' },
  tileText: { color: '#8fa0c0', fontSize: 9, fontWeight: '600' },
  tileTextActive: { color: '#030812', fontWeight: 'bold' },
  actionCommitBtn: { backgroundColor: '#1a73e8', padding: 12, borderRadius: 6, alignItems: 'center' },
  actionCommitText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  resetBtn: { marginTop: 8, alignItems: 'center' },
  resetText: { color: '#f44336', fontSize: 11 },
  logContainer: { backgroundColor: '#0d1527', borderRadius: 8, padding: 12, marginBottom: 20 },
  logHeader: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  emptyLogText: { color: '#435875', fontSize: 11, fontStyle: 'italic', textAlign: 'center' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#16223f' },
  logDetails: { color: '#fff', fontSize: 11 },
  logSg: { fontSize: 11, fontWeight: 'bold' }
});
