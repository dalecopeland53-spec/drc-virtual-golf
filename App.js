import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StrokesGainedEngine, LaunchMonitorBridge } from './GolfProEngine';

export default function App() {
  // Application Data States
  const [shots, setShots] = useState([]);
  const [distanceInput, setDistanceInput] = useState('');
  const [selectedLie, setSelectedLie] = useState('tee');
  const [selectedClub, setSelectedClub] = useState('Driver');
  
  // Hardware Monitor State Simulation
  const [simulatedTelemetry, setSimulatedTelemetry] = useState('No Device Data Connected');

  // Adds a shot safely into the processing array
  const handleAddShot = () => {
    const distance = parseFloat(distanceInput);
    if (isNaN(distance) || distance <= 0) {
      alert('Please enter a valid remaining distance matrix yardage.');
      return;
    }

    const newShot = {
      id: Math.random().toString(36).substr(2, 9),
      club: selectedClub,
      lieType: selectedLie,
      distanceRemainingYards: distance,
    };

    setShots([...shots, newShot]);
    setDistanceInput('');
  };

  // Simulates a Bluetooth telemetry data packet coming from a TrackMan / Mevo+ launch monitor
  const handleSimulateHardwareStream = () => {
    const rawMockPacket = "SPEED:168.5,LAUNCH:11.8,SPIN:2380";
    const parsedData = LaunchMonitorBridge.processHardwareTelemetry(rawMockPacket);
    
    if (parsedData) {
      setSimulatedTelemetry(`Ball Speed: ${parsedData.ballSpeedMph}mph | Launch: ${parsedData.launchAngleDeg}° | Spin: ${parsedData.spinRateRpm}rpm`);
    } else {
      setSimulatedTelemetry('Error parsing hardware streaming metrics.');
    }
  };

  // Resets the current scorecard array
  const handleClearRound = () => {
    setShots([]);
    setSimulatedTelemetry('No Device Data Connected');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GOLF PRO PERFORMANCE</Text>
        <Text style={styles.headerSubtitle}>Elite Shot Engine & Analytics</Text>
      </View>

      <ScrollView style={styles.scrollArea}>
        
        {/* SECTION 1: LAUNCH MONITOR HARDWARE TEST */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛰️ Hardware Telemetry Stream</Text>
          <Text style={styles.telemetryText}>{simulatedTelemetry}</Text>
          <TouchableOpacity style={styles.simButton} onPress={handleSimulateHardwareStream}>
            <Text style={styles.buttonText}>Simulate Launch Monitor Bluetooth Feed</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 2: SHOT TRACKER ENTRY MODULE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏌️ Record Practice Shot</Text>
          
          <Text style={styles.label}>Select Lie Type:</Text>
          <View style={styles.row}>
            {['tee', 'fairway', 'rough', 'sand', 'green'].map((lie) => (
              <TouchableOpacity 
                key={lie} 
                style={[styles.chip, selectedLie === lie && styles.chipActive]} 
                onPress={() => setSelectedLie(lie)}
              >
                <Text style={[styles.chipText, selectedLie === lie && styles.chipTextActive]}>{lie.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Select Club:</Text>
          <View style={styles.row}>
            {['Driver', '7-Iron', 'Wedge', 'Putter'].map((club) => (
              <TouchableOpacity 
                key={club} 
                style={[styles.chip, selectedClub === club && styles.chipActive]} 
                onPress={() => setSelectedClub(club)}
              >
                <Text style={[styles.chipText, selectedClub === club && styles.chipTextActive]}>{club}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Distance Remaining to Hole (Yards):</Text>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 150"
            placeholderTextColor="#888"
            value={distanceInput}
            onChangeText={setDistanceInput}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddShot}>
            <Text style={styles.buttonText}>Log Shot Matrix</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: LIVE ANALYTICS BREAKDOWN */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>📊 Strokes Gained Summary</Text>
            {shots.length > 0 && (
              <TouchableOpacity onPress={handleClearRound}>
                <Text style={styles.clearText}>Clear Log</Text>
              </TouchableOpacity>
            )}
          </View>

          {shots.length === 0 ? (
            <Text style={styles.emptyText}>No shots logged yet. Enter your practice data above to compute Strokes Gained analytics.</Text>
          ) : (
            shots.map((shot, index) => {
              const nextShot = shots[index + 1];
              const strokesGained = StrokesGainedEngine.calculateShotStrokesGained(shot, nextShot);
              const sgColor = strokesGained >= 0 ? '#2e7d32' : '#c62828';

              return (
                <View key={shot.id} style={styles.shotRow}>
                  <Text style={styles.shotInfo}>
                    Shot {index + 1}: <Text style={{fontWeight: 'bold'}}>{shot.club}</Text> from {shot.lieType.toUpperCase()} ({shot.distanceRemainingYards} yds)
                  </Text>
                  <Text style={[styles.shotSg, { color: sgColor }]}>
                    {strokesGained >= 0 ? `+${strokesGained}` : strokesGained} SG
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
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { padding: 20, backgroundColor: '#1a237e', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  headerSubtitle: { color: '#9fa8da', fontSize: 13, marginTop: 4 },
  scrollArea: { flex: 1, padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  telemetryText: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 6, color: '#444', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', marginBottom: 10 },
  simButton: { backgroundColor: '#3949ab', padding: 12, borderRadius: 8, alignItems: 'center' },
  addButton: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  label: { fontSize: 13, color: '#555', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#eee' },
  chipActive: { backgroundColor: '#1a237e' },
  chipText: { fontSize: 12, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, color: '#000', fontSize: 15, backgroundColor: '#fafafa' },
  emptyText: { color: '#777', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10, fontSize: 13 },
  shotRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  shotInfo: { fontSize: 13, color: '#333', flex: 0.85 },
  shotSg: { fontSize: 14, fontWeight: 'bold', flex: 0.15, textAlign: 'right' },
  clearText: { color: '#c62828', fontSize: 13, fontWeight: 'bold' }
});
