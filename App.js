import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, Animated, Easing, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

// High-Fidelity Tactical Metallic Theme
const C = {
  bg: '#0B0F19', paper: '#161E2E', panel: '#1F293D',
  navy: '#0F172A', blue: '#3B82F6', sky: '#60A5FA',
  gold: '#F59E0B', steel: '#94A3B8', lightSteel: '#E2E8F0',
  white: '#FFFFFF', textDark: '#F1F5F9', textMuted: '#64748B',
  green: '#10B981', pin: '#EF4444', neonCyan: '#06B6D4',
  hazardPond: '#1E3A8A', warningRed: '#DC2626'
};

const DEFAULT_CLUBS = [
  { name: 'Driver', carry: 230, type: 'Wood' },
  { name: '3 Wood', carry: 210, type: 'Wood' },
  { name: '5 Iron', carry: 170, type: 'Iron' },
  { name: '7 Iron', carry: 150, type: 'Iron' },
  { name: '9 Iron', carry: 130, type: 'Iron' },
  { name: 'PW', carry: 115, type: 'Wedge' },
  { name: 'SW', carry: 85, type: 'Wedge' }
];

// Universal 18-Hole Championship Layout Array Map Data Matrices
const TOURNAMENT_COURSE_MAP = {
  1: { par: 4, si: 1, label: "Hole 1 - Opening Chute", targetLat: -27.45120, targetLon: 153.02510, baseDist: 385 },
  2: { par: 5, si: 5, label: "Hole 2 - Hazard Valley", targetLat: -27.45210, targetLon: 153.02680, baseDist: 495 },
  3: { par: 3, si: 18, label: "Hole 3 - Island Green", targetLat: -27.45330, targetLon: 153.02440, baseDist: 145 },
  4: { par: 4, si: 9, label: "Hole 4 - Dogleg Spine", targetLat: -27.45410, targetLon: 153.02320, baseDist: 365 },
  5: { par: 4, si: 3, label: "Hole 5 - Plateau Tier", targetLat: -27.45500, targetLon: 153.02610, baseDist: 412 },
  6: { par: 3, si: 13, targetLat: -27.45590, targetLon: 153.02720, baseDist: 168 },
  7: { par: 5, si: 7, targetLat: -27.45680, targetLon: 153.02850, baseDist: 512 },
  8: { par: 4, si: 11, targetLat: -27.45790, targetLon: 153.02920, baseDist: 340 },
  9: { par: 4, si: 15, targetLat: -27.45880, targetLon: 153.03010, baseDist: 322 },
  10: { par: 4, si: 2, targetLat: -27.45970, targetLon: 153.03150, baseDist: 398 },
  11: { par: 4, si: 6, targetLat: -27.46080, targetLon: 153.03220, baseDist: 425 },
  12: { par: 3, si: 16, targetLat: -27.46150, targetLon: 153.03350, baseDist: 155 },
  13: { par: 5, si: 12, targetLat: -27.46240, targetLon: 153.03480, baseDist: 485 },
  14: { par: 4, si: 4, targetLat: -27.46350, targetLon: 153.03520, baseDist: 436 },
  15: { par: 4, si: 14, targetLat: -27.46420, targetLon: 153.03610, baseDist: 350 },
  16: { par: 3, si: 17, targetLat: -27.46510, targetLon: 153.03750, baseDist: 138 },
  17: { par: 5, si: 8, targetLat: -27.46620, targetLon: 153.03820, baseDist: 535 },
  18: { par: 4, si: 10, targetLat: -27.46730, targetLon: 153.03950, baseDist: 402 }
};

// High Accuracy Haversine Vector Calculus
const getGeodeticDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Absolute distance in meters
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [holeNo, setHoleNo] = useState(1);
  const [units, setUnits] = useState('METRES');
  const [myClubs, setMyClubs] = useState(DEFAULT_CLUBS);
  const [roundScores, setRoundScores] = useState(Array(18).fill(''));
  
  // Real Hardware GPS Engine States
  const [playerCoords, setPlayerCoords] = useState({ latitude: -27.4501, longitude: 153.0239 });
  const [gpsLocked, setGpsLocked] = useState(false);
  const [weatherMatrix, setWeatherMatrix] = useState({ temp: '25', windSpeed: 14, windDir: 65, cardinal: 'ENE' });
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Ballistic Simulation State Variables
  const [selectedClubIdx, setSelectedClubIdx] = useState(0);
  const [simulatedTrajectory, setSimulatedTrajectory] = useState([]);
  const [ballisticMetrics, setBallisticMetrics] = useState({ carry: 0, maxApex: 0, drift: 0 });
  const [caddieAnalysisText, setCaddieAnalysisText] = useState("System booting. Intercepting telemetry feeds...");

  const radarRotationAnim = useRef(new Animated.Value(0)).current;
  const caddiePulseAnim = useRef(new Animated.Value(1)).current;
  const activeHole = TOURNAMENT_COURSE_MAP[holeNo];

  // Geodetic Distance Pipeline
  const currentPinDistance = getGeodeticDistance(
    playerCoords.latitude,
    playerCoords.longitude,
    activeHole.targetLat,
    activeHole.targetLon
  );

  const parsedPinMetrics = currentPinDistance > 0 && currentPinDistance < 6000 ? {
    front: Math.round(currentPinDistance - 12),
    centre: Math.round(currentPinDistance),
    back: Math.round(currentPinDistance + 14),
    isLive: true
  } : {
    front: activeHole.baseDist - 12,
    centre: activeHole.baseDist,
    back: activeHole.baseDist + 14,
    isLive: false
  };

  // Hardware Location Sync Hook
  useEffect(() => {
    let geoFenceWatcher;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCaddieAnalysisText("GPS Access Blocked. Operating in fallback baseline catalog mode.");
        return;
      }
      const initialPos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPlayerCoords({ latitude: initialPos.coords.latitude, longitude: initialPos.coords.longitude });
      setGpsLocked(true);

      geoFenceWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1 },
        (update) => {
          setPlayerCoords({ latitude: update.coords.latitude, longitude: update.coords.longitude });
          setGpsLocked(true);
        }
      );
    })();
    return () => geoFenceWatcher && geoFenceWatcher.remove();
  }, []);

  // Meteorology Satellite Request Link
  useEffect(() => {
    if (!playerCoords.latitude) return;
    const streamMeteorology = async () => {
      setTelemetryLoading(true);
      try {
        const query = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${playerCoords.latitude}&longitude=${playerCoords.longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m`);
        const payload = await query.json();
        if (payload && payload.current) {
          const deg = payload.current.wind_direction_10m;
          const speed = Math.round(payload.current.wind_speed_10m);
          const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
          const lookup = cardinals[Math.round(deg / 22.5) % 16];
          setWeatherMatrix({ temp: Math.round(payload.current.temperature_2m), windSpeed: speed, windDir: deg, cardinal: lookup });
        }
      } catch (err) {
        console.log("Meteorology connection timeout:", err);
      } finally {
        setTelemetryLoading(false);
      }
    };
    streamMeteorology();
  }, [playerCoords, holeNo]);

  // UI Engine Continuous Animation Drivers
  useEffect(() => {
    Animated.loop(
      Animated.timing(radarRotationAnim, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(caddiePulseAnim, { toValue: 1.08, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(caddiePulseAnim, { toValue: 1.0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Live Predictive Strategy Generator Subroutine
  useEffect(() => {
    const activeClub = myClubs[selectedClubIdx] || myClubs[0];
    const distanceGap = parsedPinMetrics.centre;
    
    let optimalClub = myClubs[0];
    let processingDelta = Math.abs(myClubs[0].carry - distanceGap);
    
    myClubs.forEach((club) => {
      const delta = Math.abs(club.carry - distanceGap);
      if (delta < processingDelta) {
        processingDelta = delta;
        optimalClub = club;
      }
    });

    const headwindImpact = Math.cos((weatherMatrix.windDir * Math.PI) / 180) * weatherMatrix.windSpeed;
    const windCorrectionAdvice = headwindImpact > 5 
      ? `Wind resistance adding +${Math.round(headwindImpact * 0.8)}m to profile. Option: Club up to ${optimalClub.name}.`
      : `Cross-velocity noticed. Hold baseline target line left of the flagstick alignment pin.`;

    setCaddieAnalysisText(`Hole ${holeNo} Analysis: True target distance reads ${distanceGap}m. ${windCorrectionAdvice} Fast turf roll expected.`);
  }, [holeNo, selectedClubIdx, playerCoords, weatherMatrix]);

  // Fluid-Dynamics Trajectory Aerodynamics Physics Engine Simulator
  const executeBallisticCalculation = () => {
    const club = myClubs[selectedClubIdx];
    const initialVelocity = club.type === 'Wood' ? 68 : 48; // m/s launch velocity parameters
    const launchAngleDeg = club.type === 'Wood' ? 11 : 28; // standard loft angles
    const theta = (launchAngleDeg * Math.PI) / 180;
    
    let vx = initialVelocity * Math.cos(theta);
    let vy = initialVelocity * Math.sin(theta);
    let x = 0;
    let y = 0;
    const dt = 0.05;
    const g = 9.81;
    const dragCoefficient = 0.0018; // fluid drag factor profile array
    
    const computedPoints = [];
    let computedApex = 0;

    const crossWindFactor = Math.sin((weatherMatrix.windDir * Math.PI) / 180) * (weatherMatrix.windSpeed * 0.15);

