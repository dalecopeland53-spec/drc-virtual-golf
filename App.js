import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import * as Speech from 'expo-speech';

// 1. EXPANDED GOLF COURSE DATA (CAPRICORN RESORT SAMPLE)
const COURSE_NAME = "Capricorn Resort";
const HOLE_DATA = [
  {
    holeNumber: 1,
    par: 5,
    si: 5,
    caddieText: "Hole 1. 498 metres to the green. Heavy hazard on the left side. Aim for the safe miss zone on the right side of the fairway.",
    recommendedClub: "Driver",
    safeMissZone: "Right Fairway",
  },
  {
    holeNumber: 2,
    par: 4,
    si: 11,
    caddieText: "Hole 2. 365 metres. Bunkers guard the front right of the green. Keep your approach shot slightly left.",
    recommendedClub: "3-Wood / Driver",
    safeMissZone: "Left Green Side",
  },
  {
    holeNumber: 3,
    par: 3,
    si: 17,
    caddieText: "Hole 3. 145 metres par 3. Protected by water on the right. Take one extra club if the wind is coming off the ocean.",
    recommendedClub: "7-Iron",
    safeMissZone: "Short Left",
  }
];

export default function App() {
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [scores, setScores] = useState({ 1: 0, 2: 0, 3: 0 });
  const [putts, setPutts] = useState({ 1: 0, 2: 0, 3: 0 });

  const currentHole = HOLE_DATA[currentHoleIndex];
  const hNum = currentHole.holeNumber;

  // Audio guidance logic
  const speakCaddieAdvice = () => {
    Speech.stop(); 
    Speech.speak(currentHole.caddieText, {
      language: 'en-AU', // Australian voice
      pitch: 1.0,
      rate: 0.95,
    });
  };

  // Score adjusting helper functions
  const adjustScore = (amount) => {
    setScores(prev => ({ ...prev, [hNum]: Math.max(0, (prev[hNum] || currentHole.par) + amount) }));
  };

  const adjustPutts = (amount) => {
    setPutts(prev => ({ ...prev, [hNum]: Math.max(0, (prev[hNum] || 2) + amount) }));
  };

  // Navigation handlers
  const nextHole = () => {
    if (currentHoleIndex < HOLE_DATA.length - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    }
  };

  const prevHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Course Header */}
        <View style={styles.header}>
          <Text style={styles.courseTitle}>{COURSE_NAME}</Text>
          <View style={styles.navRow}>
            <TouchableOpacity style={[styles.navButton, currentHoleIndex === 0 && styles.disabledBtn]} onPress={prevHole} disabled={currentHoleIndex === 0}>
              <Text style={styles.navBtnText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.holeTitle}>Hole {hNum}</Text>
            <TouchableOpacity style={[styles.navButton, currentHoleIndex === HOLE_DATA.length - 1 && styles.disabledBtn]} onPress={nextHole} disabled={currentHoleIndex === HOLE_DATA.length - 1}>
              <Text style={styles.navBtnText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Course Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PAR</Text>
            <Text style={styles.statValue}>{currentHole.par}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>INDEX (SI)</Text>
            <Text style={styles.statValue}>{currentHole.si}</Text>
          </View>
        </View>

        {/* Audio Caddie Assistant */}
        <View style={styles.caddieCard}>
          <Text style={styles.cardHeader}>🎙️ CADDIE STRATEGY</Text>
          <Text style={styles.caddieText}>{currentHole.caddieText}</Text>
          <TouchableOpacity style={styles.audioButton} onPress={speakCaddieAdvice}>
            <Text style={styles.audioButtonText}>🔊 Play Audio Advice</Text>
          </TouchableOpacity>
        </View>

        {/* Club & Target Zone Info */}
        <View style={styles.tacticalCard}>
          <Text style={styles.tacticalLabel}>Target Club: <Text style={styles.tacticalValue}>{currentHole.recommendedClub}</Text></Text>
          <Text style={styles.tacticalLabel}>Safe Zone: <Text style={styles.safeValue}>{currentHole.safeMissZone}</Text></Text>
        </View>

        {/* Interactive Digital Scorecard */}
        <View style={styles.scorecard}>
          <Text style={styles.scorecardHeader}>📝 LIVE SCORECARD</Text>
          
          {/* Total Strokes Counter */}
          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>Total Strokes:</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => adjustScore(-1)}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
              <Text style={styles.counterValue}>{scores[hNum] || currentHole.par}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => adjustScore(1)}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>

          {/* Putts Counter */}
          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>Putts:</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => adjustPutts(-1)}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
              <Text style={styles.counterValue}>{putts[hNum] || 2}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => adjustPutts(1)}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  courseTitle: { fontSize: 14, color: '#666', fontWeight: 'bold', letterSpacing: 1 },
  navRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  navButton: { backgroundColor: '#2e7d32', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginHorizontal: 20 },
  disabledBtn: { backgroundColor: '#b0bec5' },
  navBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  holeTitle: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, elevation: 2 },
  statLabel: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  caddieCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 3 },
  cardHeader: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  caddieText: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 15 },
  audioButton: { backgroundColor: '#2e7d32', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  audioButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tacticalCard: { backgroundColor: '#e8f5e9', padding: 15, borderRadius: 12, marginBottom: 20 },
  tacticalLabel: { fontSize: 15, color: '#333', marginBottom: 5 },
  tacticalValue: { fontWeight: 'bold', color: '#1b5e20' },
  safeValue: { fontWeight: 'bold', color: '#c62828' },
  scorecard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 3 },
  scorecardHeader: { fontSize: 13, fontWeight: 'bold', color: '#37474f', marginBottom: 15 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  counterLabel: { fontSize: 16, color: '#333', fontWeight: '500' },
  counterControls: { flexDirection: 'row', alignItems: 'center' },
  counterBtn: { backgroundColor: '#cfd8dc', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { fontSize: 20, fontWeight: 'bold', color: '#37474f' },
  counterValue: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, minWidth: 20, textAlign: 'center' }
});
