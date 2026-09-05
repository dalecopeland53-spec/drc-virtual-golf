import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

export default function App() {
  const [shots, setShots] = useState([]);
  const [selectedLie, setSelectedLie] = useState('tee');
  const [selectedClub, setSelectedClub] = useState('Driver');
  const [currentDistance, setCurrentDistance] = useState(498);
  const [adrenalineOn, setAdrenalineOn] = useState(false);
  
  const currentTemp = 24;
  const currentWindSpeed = 8;

  // Tiger-Proof environmental carry calculation formula
  const getAdjustedCarry = () => {
    let base = 230;
    base += (currentTemp - 20) * 0.12; // Air density temperature delta
    base -= currentWindSpeed * 0.85;     // Headwind drag impedance reduction
    if (adrenalineOn) base = base * 0.94; // Adrenaline engine protection shaving 6% force
    return Math.max(0, base).toFixed(1);
  };

  const dynamicCarry = getAdjustedCarry();

  const handleLogShot = () => {
    const newShot = {
      id: Math.random().toString(36).substr(2, 9),
      club: selectedClub,
      lieType: selectedLie,
      distanceRemainingYards: currentDistance
    };

    let nextDistanceTarget = currentDistance - Math.round(dynamicCarry);
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
    setAdrenalineOn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. TOP TELEMETRY BAR */}
      <View style={styles.topBar}>
        <Text style={styles.menuIcon}>☰</Text>
        <View style={styles.brandBox}>
          <Text style={styles.brandTitle}>TOUR PRO</Text>
          <Text style={styles.brandSub}>— ELITE —</Text>
        </View>
        <View style={styles.weatherBox}>
          <Text style={styles.weatherTxt}>{currentTemp}°C</Text>
          <Text style={styles.windTxt}>💨 {currentWindSpeed} km/h</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollArea}>
        
        {/* 2. SPLIT INTERACTIVE DISPLAY MODES */}
        <View style={styles.rowLayout}>
          
          {/* LEFT: GRAPHIC MAP BLOCK */}
          <View style={styles.leftCol}>
            <View style={styles.radarBox}>
              <View style={styles.flagBadge}><Text style={styles.flagText}>⛳ {currentDistance}m</Text></View>
              <View style={styles.rangeArc}><Text style={styles.arcText}>280 m</Text></View>
              <View style={styles.rangeArc}><Text style={styles.arcText}>230 m</Text></View>
              <View style={styles.ballMarker} />
            </View>
          </View>

          {/* RIGHT: STRATEGY MATRIX */}
          <View style={styles.rightCol}>
            <View style={styles.podCard}>
              <Text style={styles.podHeader}>Hole 1 <Text style={styles.parText}>Par 5</Text></Text>
              <Text style={styles.metricVal}>{currentDistance} m</Text>
            </View>

            <View style={styles.podCard}>
              <Text style={styles.podHeader}>AI Voice Caddie</Text>
              <Text style={styles.speechBubble}>
                "Target requires {currentDistance}m. Wind limits adjusted carry carry parameter to {dynamicCarry}m target."
              </Text>
            </View>

            <View style={styles.podCard}>
              <Text style={styles.podHeader}>Recommended club</Text>
              <Text style={styles.clubName}>{selectedClub}</Text>
              <Text style={styles.carryVal}>Est: {dynamicCarry}m</Text>
            </View>
          </View>
        </View>

        {/* 3. TIGER-PROOF OPERATIONAL SELECTION TILES PANEL */}
        <View style={styles.panelCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.panelTitle}>Operations Control Pipeline</Text>
            <TouchableOpacity 
              style={[styles.adrenBtn, adrenalineOn && styles.adrenBtnActive]}
              onPress={() => setAdrenalineOn(!adrenalineOn)}
            >
              <Text style={styles.adrenText}>{adrenalineOn ? "⚡ Adrenaline ON" : "Adrenaline Dampener"}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chipCluster}>
            {['tee', 'fairway', 'rough', 'sand', 'green'].map((lie) => (
              <TouchableOpacity 
                key={lie} 
                style={[styles.lieChip, selectedLie === lie && styles.lieChipActive]}
                onPress={() => setSelectedLie(lie)}
              >
                <Text style={[styles.chipLabel, selectedLie === lie && styles.chipLabelActive]}>{lie.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.commitBtn} onPress={handleLogShot}>
            <Text style={styles.commitText}>Execute Matrix Shot Log</Text>
          </TouchableOpacity>

          {shots.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleResetRound}>
              <Text style={styles.clearText}>Reset Hole Telemetry Matrix</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. SHOT HISTORY STROKES GAINED LOG */}
        <View style={styles.logCard}>
          <Text style={styles.logTitle}>Live Strokes Gained Data Streams</Text>
          {shots.length === 0 ? (
            <Text style={styles.emptyText}>Awaiting tournament telemetry entries...</Text>
          ) : (
            shots.map((shot, idx) => (
              <View key={shot.id} style={styles.logItemRow}>
                <Text style={styles.logInfoText}>Shot {idx + 1}: {shot.club} from {shot.lieType.toUpperCase()}</Text>
                <Text style={styles.sgTextVal}>+0.142 SG</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030812' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#101a30' },
  menuIcon: { color: '#fff', fontSize: 16 },
  brandBox: { alignItems: 'center' },
  brandTitle: { color: '#d4af37', fontSize: 14, fontWeight: 'bold', letterSpacing: 1.5 },
  brandSub: { color: '#d4af37', fontSize: 7, letterSpacing: 2, marginTop: -2 },
  weatherBox: { backgroundColor: '#0d1527', padding: 5, borderRadius: 6, alignItems: 'flex-end' },
  weatherTxt: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  windTxt: { color: '#8fa0c0', fontSize: 8 },
  scrollArea: { flex: 1, padding: 6 },
  rowLayout: { flexDirection: 'row', gap: 6 },
  leftCol: { flex: 0.46 },
  rightCol: { flex: 0.54, gap: 6 },
  radarBox: { height: 320, backgroundColor: '#112511', borderRadius: 8, padding: 10, justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  flagBadge: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 4 },
  flagText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  rangeArc: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  arcText: { color: '#557555', fontSize: 8, marginTop: -10 },
  ballMarker: { width: 10, height: 10, backgroundColor: '#fff', borderRadius: 5, position: 'absolute', bottom: 30 },
  podCard: { backgroundColor: '#0d1527', borderRadius: 8, padding: 8, marginBottom: 6 },
  podHeader: { color: '#607898', fontSize: 10, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#1a2744', paddingBottom: 2, marginBottom: 4 },
  parText: { color: '#fff' },
  metricVal: { color: '#ffcc00', fontSize: 22, fontWeight: 'bold' },
  speechBubble: { color: '#a0b2d6', fontSize: 9, fontStyle: 'italic', lineHeight: 12 },
  clubName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  carryVal: { color: '#ffcc00', fontSize: 11 },
  panelCard: { backgroundColor: '#0a0f1d', borderRadius: 8, padding: 10, marginVertical: 8, borderWidth: 1, borderColor: '#16223f' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  panelTitle: { color: '#8fa0c0', fontSize: 10, fontWeight: 'bold' },
  adrenBtn: { backgroundColor: '#16223f', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  adrenBtnActive: { backgroundColor: '#ff9800' },
  adrenText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  chipCluster: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8, justifyContent: 'center' },
  lieChip: { backgroundColor: '#16223f', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4 },
  lieChipActive: { backgroundColor: '#d4af37' },
  chipLabel: { color: '#8fa0c0', fontSize: 8, fontWeight: '600' },
  chipLabelActive: { color: '#030812', fontWeight: 'bold' },
  commitBtn: { backgroundColor: '#1a73e8', padding: 10, borderRadius: 6, alignItems: 'center' },
  commitText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  clearBtn: { marginTop: 6, alignItems: 'center' },
  clearText: { color: '#f44336', fontSize: 10 },
  logCard: { backgroundColor: '#0d1527', borderRadius: 8, padding: 10, marginBottom: 15 },
  logTitle: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  emptyText: { color: '#435875', fontSize: 10, fontStyle: 'italic', textAlign: 'center' },
  logItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#16223f' },
  logInfoText: { color: '#fff', fontSize: 10 },
  sgTextVal: { color: '#4caf50', fontSize: 10, fontWeight: 'bold' }
});
