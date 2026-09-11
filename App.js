import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';

// A clean custom Card component that securely avoids unterminated JSX syntax errors
const Card = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

export default function App() {
  const [playerName] = useState("Golfer");
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Sample data array for virtual golf rounds
  const rounds = [
    { id: '1', course: 'Augusta National', score: '-2', date: '10/09/2026' },
    { id: '2', course: 'St Andrews Links', score: 'E', date: '08/09/2026' },
    { id: '3', course: 'Pebble Beach GL', score: '+3', date: '03/09/2026' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2B3C" />
      
      {/* Top Banner Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DRC VIRTUAL GOLF</Text>
        <Text style={styles.headerSubtitle}>ELITE SIMULATION</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, selectedTab === 'dashboard' && styles.activeTab]}
            onPress={() => setSelectedTab('dashboard')}
          >
            <Text style={[styles.tabText, selectedTab === 'dashboard' && styles.activeTabText]}>DASHBOARD</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, selectedTab === 'rounds' && styles.activeTab]}
            onPress={() => setSelectedTab('rounds')}
          >
            <Text style={[styles.tabText, selectedTab === 'rounds' && styles.activeTabText]}>MY ROUNDS</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'dashboard' ? (
          <View>
            {/* Welcome Message Hero */}
            <View style={styles.welcomeHero}>
              <Text style={styles.welcomeText}>WELCOME BACK,</Text>
              <Text style={styles.page}>{playerName.toUpperCase()}</Text>
            </View>

            {/* Metrics Dashboard Row */}
            <View style={styles.statsRow}>
              {/* Correctly terminated, standalone custom Cards */}
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>HANDICAP</Text>
                <Text style={styles.statValue}>4.2</Text>
              </Card>

              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>AVG SCORE</Text>
                <Text style={styles.statValue}>74.5</Text>
              </Card>
            </View>

            <Card style={styles.mainActionCard}>
              <Text style={styles.actionTitle}>Ready for your next round?</Text>
              <Text style={styles.actionBody}>Connect your golf simulator setup or launch a solo target practice range run.</Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>START SIMULATOR SESSION</Text>
              </TouchableOpacity>
            </Card>
          </View>
        ) : (
          <View>
            {/* Rounds Tab List View */}
            <Text style={styles.sectionHeader}>Recent Simulation Matches</Text>
            {rounds.map((round) => (
              <Card key={round.id} style={styles.roundItem}>
                <View>
                  <Text style={styles.roundCourse}>{round.course}</Text>
                  <Text style={styles.roundDate}>{round.date}</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{round.score}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Sleek dark aesthetic matching the application icon
  },
  header: {
    backgroundColor: '#1E293B',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0284C7', // Accent blue line matching neon app design
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#0284C7',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  welcomeHero: {
    marginBottom: 20,
  },
  welcomeText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  page: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: '#0284C7',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  mainActionCard: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 24,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionBody: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roundCourse: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  roundDate: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  scoreBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  scoreText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 14,
  },
});
