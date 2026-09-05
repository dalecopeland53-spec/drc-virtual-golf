import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

// 1. GOLF COURSE DATA (CAPRICORN RESORT - SAMPLE)
const COURSE_NAME = "Capricorn Resort";
const HOLE_DATA = [
  {
    holeNumber: 1,
    par: 5,
    si: 5,
    elevationChange: 4,
    safeMissZone: "Right side of fairway",
    caddieText: "498 metres to the green. Heavy hazard on the left side. Aim for the safe miss zone on the right.",
    recommendedClub: "Driver",
  }
];

export default function CaddieHomeScreen() {
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const currentHole = HOLE_DATA[currentHoleIndex];

  // Trigger voice caddie overview
  const speakCaddieAdvice = () => {
    Speech.stop(); // Stop any ongoing speech first
    Speech.speak(currentHole.caddieText, {
      language: 'en-AU', // Clean Australian voice accent 
      pitch: 1.0,
      rate: 0.95,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.courseTitle}>{COURSE_NAME}</Text>
          <Text style={styles.holeTitle}>Hole {currentHole.holeNumber}</Text>
        </View>

        {/* Stats Grid */}
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

        {/* Caddie Tip Card */}
        <View style={styles.caddieCard}>
          <Text style={styles.cardHeader}>🎙️ CADDIE STRATEGY</Text>
          <Text style={styles.caddieText}>{currentHole.caddieText}</Text>
          
          <TouchableOpacity style={styles.audioButton} onPress={speakCaddieAdvice}>
            <Text style={styles.audioButtonText}>🔊 Speak Advice</Text>
          </TouchableOpacity>
        </View>

        {/* Tactical Recommendation Info */}
        <View style={styles.tacticalCard}>
          <Text style={styles.tacticalLabel}>Target Club: <Text style={styles.tacticalValue}>{currentHole.recommendedClub}</Text></Text>
          <Text style={styles.tacticalLabel}>Safe Zone: <Text style={styles.safeValue}>{currentHole.safeMissZone}</Text></Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  courseTitle: { fontSize: 16, color: '#666', fontWeight: '600', uppercase: true },
  holeTitle: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statLabel: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  caddieCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  cardHeader: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  caddieText: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 15 },
  audioButton: { backgroundColor: '#2e7d32', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  audioButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tacticalCard: { backgroundColor: '#e8f5e9', padding: 15, borderRadius: 12 },
  tacticalLabel: { fontSize: 15, color: '#333', marginBottom: 5 },
  tacticalValue: { fontWeight: 'bold', color: '#1b5e20' },
  safeValue: { fontWeight: 'bold', color: '#c62828' }
});
