import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Switch, Dimensions 
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const GolfAppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F172A',
    card: '#1E293B',
    text: '#FFFFFF',
    primary: '#3B82F6',
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer theme={GolfAppTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: { backgroundColor: '#1E293B', borderTopWidth: 0, height: 60, paddingBottom: 8 },
        })}
      >
        <Tab.Screen name="Auth" component={AuthStack} options={{ tabBarLabel: 'Sign In', tabBarIcon: ({color, size}) => <Ionicons name="log-in-outline" color={color} size={size}/> }} />
        <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: 'Home', tabBarIcon: ({color, size}) => <Ionicons name="home-outline" color={color} size={size}/> }} />
        <Tab.Screen name="PlayRound" component={PlayRoundStack} options={{ tabBarLabel: 'Golf GPS', tabBarIcon: ({color, size}) => <Ionicons name="golf-outline" color={color} size={size}/> }} />
        <Tab.Screen name="Analytics" component={AnalyticsStack} options={{ tabBarLabel: 'Stats', tabBarIcon: ({color, size}) => <Ionicons name="bar-chart-outline" color={color} size={size}/> }} />
        <Tab.Screen name="AppControl" component={AppControlStack} options={{ tabBarLabel: 'System', tabBarIcon: ({color, size}) => <Ionicons name="options-outline" color={color} size={size}/> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#FFF', headerTitleAlign: 'center' }}>
      <Stack.Screen name="SignIn" component={Screen01_SignIn} options={{ title: 'DRC LOGIN' }} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#FFF', headerTitleAlign: 'center' }}>
      <Stack.Screen name="Home" component={Screen02_Home} options={{ title: 'YOUR CADDIE. YOUR GAME.' }} />
      <Stack.Screen name="MyGear" component={Screen09_MyGear} options={{ title: 'MY GEAR DETAILS' }} />
      <Stack.Screen name="Profile" component={Screen10_Profile} options={{ title: 'MY PROFILE INSIGHTS' }} />
    </Stack.Navigator>
  );
}

function PlayRoundStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#FFF', headerTitleAlign: 'center' }}>
      <Stack.Screen name="CourseSelect" component={Screen03_CourseSelect} options={{ title: 'SELECT COURSE' }} />
      <Stack.Screen name="CourseInfo" component={Screen11_CourseInfo} options={{ title: 'COURSE OVERVIEW' }} />
      <Stack.Screen name="ActivePlay" component={Screen04_ActiveGPSPlay} options={{ title: 'ACTIVE LIVE PLAY' }} />
      <Stack.Screen name="AICaddie" component={Screen05_AICaddie} options={{ title: 'AI REAL-TIME CADDIE' }} />
      <Stack.Screen name="RoundSummary" component={Screen15_RoundSummary} options={{ title: 'ROUND PERFORMANCE OVERVIEW' }} />
      <Stack.Screen name="CourseMapper" component={Screen17_CourseMapper} options={{ title: 'GPS COURSE MAPPER' }} />
    </Stack.Navigator>
  );
}

function AnalyticsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#FFF', headerTitleAlign: 'center' }}>
      <Stack.Screen name="Scorecard" component={Screen06_Scorecard} options={{ title: 'DIGITAL SCORECARD' }} />
      <Stack.Screen name="Performance" component={Screen07_Performance} options={{ title: 'DATA PERFORMANCE' }} />
      <Stack.Screen name="Tournaments" component={Screen08_Tournaments} options={{ title: 'ELITE TOURNAMENTS' }} />
    </Stack.Navigator>
  );
}

function AppControlStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#FFF', headerTitleAlign: 'center' }}>
      <Stack.Screen name="Practice" component={Screen12_Practice} options={{ title: 'TRAINING HUBS' }} />
      <Stack.Screen name="WarmUp" component={Screen13_WarmUp} options={{ title: 'PRE-ROUND PREPARATION' }} />
      <Stack.Screen name="Routines" component={Screen14_Routines} options={{ title: 'PSYCHOLOGICAL PRESETS' }} />
      <Stack.Screen name="SettingsHelp" component={Screen16_SettingsHelp} options={{ title: 'DEVICE CONTROL PANEL' }} />
    </Stack.Navigator>
  );
}

function Screen01_SignIn({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>01. SIGN IN</Text>
        <View style={styles.logoPlaceholder}><Text style={styles.logoText}>DRC</Text></View>
        <Text style={styles.titleText}>Welcome Back</Text>
        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#64748B" />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#64748B" />
        <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('Dashboard', { screen: 'Home' })}>
          <Text style={styles.btnText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Screen02_Home({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>02. HOME SCREEN</Text>
        <Text style={styles.welcomeTitle}>Hello, Andrew!</Text>
        <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('PlayRound', { screen: 'CourseSelect' })}>
          <Text style={styles.btnText}>START NEW ROUND</Text>
        </TouchableOpacity>
        <View style={[styles.innerCard, { borderLeftWidth: 4, borderLeftColor: '#3B82F6' }]}>
          <Text style={styles.accentText}>YOUR VIRTUAL CADDIE</Text>
          <Text style={styles.bodyText}>Caddie Advice: Expect crosswinds blowing on hole 4 today.</Text>
        </View>
        <View style={styles.rowSpace}>
          <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate('MyGear')}>
            <Text style={styles.accentText}>MY GEAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.miniCard} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.accentText}>PROFILE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function Screen03_CourseSelect({ navigation }) {
  const courses = [
    { id: '1', name: 'Pebble Beach', details: '235 Yds | Par 4' },
    { id: '2', name: 'St Andrews', details: '255 Yds | Par 4' }
  ];
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>03. COURSE SELECT</Text>
        <TextInput style={styles.input} placeholder="Search courses globally..." placeholderTextColor="#64748B" />
        {courses.map(course => (
          <View key={course.id} style={styles.listItem}>
            <View>
              <Text style={styles.itemTitle}>{course.name}</Text>
              <Text style={styles.subText}>{course.details}</Text>
            </View>
            <TouchableOpacity style={styles.greenButton} onPress={() => navigation.navigate('CourseInfo')}>
              <Text style={styles.btnText}>PLAY NOW</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Screen04_ActiveGPSPlay({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>04. ACTIVE GPS PLAY</Text>
        <View style={styles.mapGraphicPlaceholder}>
          <Text style={styles.mapText}>[ Live Aerial Mapping View Overlay ]</Text>
          <View style={styles.badgeOverlay}><Text style={styles.btnText}>345 Yds to Pin</Text></View>
        </View>
        <View style={styles.rowSpace}>
          <Text style={styles.bodyText}>Par 4</Text>
          <Text style={styles.itemTitle}>Hole 12</Text>
          <Text style={styles.bodyText}>Par 4</Text>
        </View>
        <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('AICaddie')}>
          <Text style={styles.btnText}>CONSULT AI CADDIE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Screen05_AICaddie({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>05. AI CADDIE ADVICE</Text>
        <Text style={styles.accentText}>Club Suggestion: 7 Iron</Text>
        <Text style={styles.titleText}>Expected Distance: 155 Yds</Text>
        <View style={styles.rowSpace}>
          <View style={styles.pill}><Text style={styles.subText}>💨 Wind Vector Enabled</Text></View>
          <View style={styles.pill}><Text style={styles.subText}>📐 Slope Factor Comp</Text></View>
        </View>
        <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('RoundSummary')}>
          <Text style={styles.btnText}>PROCEED TO HOLE SUMMARY</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Screen06_Scorecard() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>06. SCORECARD</Text>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 2 }]}>Hole Grid</Text>
          <Text style={styles.tableHeader}>1</Text>
          <Text style={styles.tableHeader}>2</Text>
          <Text style={styles.tableHeader}>3</Text>
          <Text style={styles.tableHeader}>4</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.bodyText, { flex: 2 }]}>Par Limits</Text>
          <Text style={styles.bodyText}>4</Text>
          <Text style={styles.bodyText}>4</Text>
          <Text style={styles.bodyText}>3</Text>
          <Text style={styles.bodyText}>5</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.accentText, { flex: 2 }]}>Player Net</Text>
          <Text style={styles.accentText}>+1</Text>
          <Text style={styles.accentText}>E</Text>
          <Text style={styles.accentText}>E</Text>
          <Text style={styles.redText}>-1</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Screen07_Performance() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>07. PERFORMANCE ANALYTICS</Text>
        <Text style={styles.titleText}>Handicap Trend Status (12.4)</Text>
        <View style={styles.graphPlaceholder}><Text style={styles.subText}>[ Active fl_chart Vector Graph Display ]</Text></View>
        <View style={styles.rowSpace}>
          <Text style={styles.bodyText}>Avg Putts: 1.4</Text>
          <Text style={styles.accentText}>GIR Rank: 68%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Screen08_Tournaments() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>08. TOURNAMENTS METRICS</Text>
        <Text style={styles.titleText}>DRC Elite Open Standings</Text>
        <View style={styles.listItem}>
          <Text style={styles.bodyText}>1st Pl. Andrew</Text>
          <Text style={styles.redText}>-3 Net Score</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bodyText}>2nd Pl. Korton</Text>
          <Text style={styles.redText}>-3 Net Score</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Screen09_MyGear() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>09. MY GEAR PROFILES</Text>
        <View style={styles.listItem}>
          <Text style={styles.bodyText}>Driver Performance Max</Text>
          <Text style={styles.itemTitle}>245 Yds Avg</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bodyText}>7-Iron Track Range</Text>
          <Text style={styles.itemTitle}>155 Yds Avg</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Screen10_Profile() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>10. PROFILE OVERVIEW</Text>
        <Text style={styles.welcomeTitle}>Andrew</Text>
        <Text style={styles.subText}>Global Handicap Registry Index: 12.4</Text>
        <View style={styles.rowSpace}>
          <View style={styles.pill}><Text style={styles.subText}>🏅 Badge Earned</Text></View>
          <View style={styles.pill}><Text style={styles.subText}>🏆 Leaderboard Tier</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

function Screen11_CourseInfo({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>11. COURSE INFO REGISTRY</Text>
        <Text style={styles.titleText}>The Club at Pebble Beach</Text>
        <Text style={styles.accentText}>Line: (769) 336-7890</Text>
        <Text style={styles.bodyText}>Cart & Equipment Packages: $45 Vehicle Fee / $60 TaylorMade Premium Hardware Sets</Text>
        <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('ActivePlay')}>
          <Text style={styles.btnText}>LAUNCH LIVE MONITORING</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Screen12_Practice() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>12. PRACTICE MODULE TRACKS</Text>
        <View style={styles.rowSpace}>
          <View style={styles.miniCard}><Text style={styles.btnText}>Wedges Track (85%)</Text></View>
          <View style={styles.miniCard}><Text style={styles.btnText}>Chipping Drills (43%)</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

// 13. WARM-UP
function Screen13_WarmUp() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>13. PRE-ROUND WARM-UP DRILLS</Text>
        <Text style={styles.bodyText}>✅ 1. Joint Mobilization Drill Completed</Text>
        <Text style={styles.bodyText}>✅ 2. Dynamic Stretching Sequences Matrix</Text>
        <Text style={styles.bodyText}>⬜ 3. Swing Tempo Calibration Review</Text>
      </View>
    </ScrollView>
  );
}

// 14. ROUTINES
function Screen14_Routines() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>14. COGNITIVE / PSYCHOLOGICAL ROUTINES</Text>
        <Text style={styles.accentText}>Focus Pillar 1: Target Isolation</Text>
        <Text style={styles.subText}>Lock target coordinates before executing your stance setup.</Text>
      </View>
    </ScrollView>
  );
}

// 15. ROUND SUMMARY
function Screen15_RoundSummary({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>15. HOLE METRICS SUMMARY</Text>
        <Text style={styles.titleText}>Round Context: Hole 4</Text>
        <Text style={styles.bodyText}>Environmental Factor: Par 4, Uphill Dogleg Route Right</Text>
        <Text style={styles.accentText}>Final Ball State: Fairway Center Area</Text>
        <Text style={styles.bodyText}>Par Target: 4</Text>
        <Text style={styles.itemTitle}>Strokes Logged: 4</Text>
        <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('CourseMapper')}>
          <Text style={styles.btnText}>PROCEED TO SYSTEM MAPPER</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 16. SETTINGS / HELP
function Screen16_SettingsHelp() {
  const [metricUnit, setMetricUnit] = useState(true);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>16. SETTINGS PANEL</Text>
        <View style={styles.rowSpace}>
          <Text style={styles.bodyText}>Display Metrics in Yards/Imperial</Text>
          <Switch value={metricUnit} onValueChange={setMetricUnit} />
        </View>
        <Text style={styles.subText}>AI Voice Core Assistant Profile Accent: British English</Text>
      </View>
    </ScrollView>
  );
}

// 17. COURSE MAPPER
function Screen17_CourseMapper() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.screenLabel}>17. GEO-LOCATIONAL COURSE MAPPER</Text>
        <Text style={styles.titleText}>Capture Coordinates Framework</Text>
        <View style={styles.rowSpace}>
          <View style={styles.miniCard}><Text style={styles.subText}>Green Front Edge Edge</Text></View>
          <View style={styles.miniCard}><Text style={styles.subText}>Pin Center Tracking</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#0F172A' },
  cardContainer: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  screenLabel: { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 12, letterSpacing: 1.5 },
  titleText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  welcomeTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  bodyText: { color: '#E2E8F0', fontSize: 14, marginVertical: 4, lineHeight: 20 },
  accentText: { color: '#3B82F6', fontWeight: '700', fontSize: 15, marginVertical: 4 },
  subText: { color: '#94A3B8', fontSize: 13, marginBottom: 6 },
  redText: { color: '#EF4444', fontWeight: '700' },
  itemTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  input: { backgroundColor: '#0F172A', color: '#FFF', padding: 12, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#334155' },
  blueButton: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  greenButton: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  innerCard: { backgroundColor: '#0F172A', padding: 12, borderRadius: 8, marginTop: 12 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: 12, borderRadius: 8, marginVertical: 6 },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  miniCard: { backgroundColor: '#0F172A', padding: 14, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  pill: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginHorizontal: 2 },
  logoPlaceholder: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  mapGraphicPlaceholder: { height: 160, backgroundColor: '#15803D', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginVertical: 12, position: 'relative' },
  mapText: { color: '#FFF', fontWeight: '600', opacity: 0.8, fontSize: 13 },
  badgeOverlay: { position: 'absolute', top: 10, right: 10, backgroundColor: '#1E293B', padding: 6, borderRadius: 4 },
  graphPlaceholder: { height: 100, backgroundColor: '#0F172A', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginVertical: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#475569' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  tableHeader: { color: '#64748B', fontWeight: '700' },
});