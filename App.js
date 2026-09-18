import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, Animated, Easing, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Premium Metallic Luxury Theme Palette
const C = {
  bg: '#E2E8F0', paper: '#FFFFFF', panel: '#F8FAFC',
  navy: '#061F3E', blue: '#0F4C81', sky: '#3A8BCD',
  gold: '#B88A30', steel: '#64748B', lightSteel: '#CBD5E1',
  white: '#FFFFFF', textDark: '#0F172A', textMuted: '#475569',
  green: '#10B981', pin: '#EF4444', glass: 'rgba(255,255,255,0.85)'
};

const CLUBS = [
  ['Driver', 230], ['3 Wood', 210], ['5 Wood', 195],
  ['4 Iron', 180], ['5 Iron', 170], ['6 Iron', 160],
  ['7 Iron', 150], ['8 Iron', 140], ['9 Iron', 130],
  ['PW', 115], ['GW', 100], ['SW', 85], ['LW', 70], ['Putter', 0]
];

const WARM = ['Loosen Up Elasticity Stretch', 'Short Wedge Fluidity Scans', 'Mid Iron Tempo Drills', 'Long Iron Core Stability Passes', 'Fairway Wood Sweeps', 'Green-side Chipping Arc Scans', 'Putting Distance Control Calibration', 'Ready Protocol Engaged'];
const ROUT = ['Define Target Apex', 'Scan Lie & Turf Density', 'Calculate Adjusted Wind Clubbing', 'Visualize Flight Path & Apex', 'Full Trust & Commitment Check', 'Breathe & Diaphragm Release', 'Execute & Monitor Output', 'Reset Focus for Next Sequence'];
const PRACT = ['Wedges', 'Irons', 'Driver', 'Chipping', 'Bunker', 'Putting'];

// Clean, Universal 18-Hole Layout Database (Using generic placeholders)
const COURSE_DATABASE = {
  1: { par: 4, si: 7, targetLat: -27.4512, targetLon: 153.0251, meters: 364, front: 354, centre: 364, back: 374 },
  2: { par: 5, si: 3, targetLat: -27.4519, targetLon: 153.0265, meters: 470, front: 460, centre: 470, back: 480 },
  3: { par: 3, si: 18, targetLat: -27.4528, targetLon: 153.0242, meters: 127, front: 119, centre: 127, back: 135 },
  4: { par: 4, si: 11, targetLat: -27.4535, targetLon: 153.0231, meters: 340, front: 330, centre: 340, back: 350 },
  5: { par: 4, si: 1, targetLat: -27.4542, targetLon: 153.0258, meters: 410, front: 400, centre: 410, back: 420 },
  6: { par: 3, si: 15, targetLat: -27.4550, targetLon: 153.0260, meters: 160, front: 150, centre: 160, back: 170 },
  7: { par: 5, si: 9, targetLat: -27.4560, targetLon: 153.0270, meters: 490, front: 480, centre: 490, back: 500 },
  8: { par: 4, si: 5, targetLat: -27.4570, targetLon: 153.0280, meters: 375, front: 365, centre: 375, back: 385 },
  9: { par: 4, si: 13, targetLat: -27.4580, targetLon: 153.0290, meters: 315, front: 305, centre: 315, back: 325 },
  10: { par: 4, si: 8, targetLat: -27.4590, targetLon: 153.0300, meters: 355, front: 345, centre: 355, back: 365 },
  11: { par: 4, si: 4, targetLat: -27.4600, targetLon: 153.0310, meters: 395, front: 385, centre: 395, back: 405 },
  12: { par: 3, si: 16, targetLat: -27.4610, targetLon: 153.0320, meters: 135, front: 125, centre: 135, back: 145 },
  13: { par: 5, si: 12, targetLat: -27.4620, targetLon: 153.0330, meters: 475, front: 465, centre: 475, back: 485 },
  14: { par: 4, si: 2, targetLat: -27.4630, targetLon: 153.0340, meters: 420, front: 410, centre: 420, back: 430 },
  15: { par: 4, si: 14, targetLat: -27.4640, targetLon: 153.0350, meters: 330, front: 320, centre: 330, back: 340 },
  16: { par: 3, si: 17, targetLat: -27.4650, targetLon: 153.0360, meters: 145, front: 135, centre: 145, back: 155 },
  17: { par: 5, si: 6, targetLat: -27.4660, targetLon: 153.0370, meters: 515, front: 505, centre: 515, back: 525 },
  18: { par: 4, si: 10, targetLat: -27.4670, targetLon: 153.0380, meters: 380, front: 370, centre: 380, back: 390 }
};

const calculateDistanceMatrix = (lat1, lon1, lat2, lon2, targetUnit) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInMetres = R * c;

  return targetUnit === 'YARDS' ? Math.round(distanceInMetres * 1.09361) : Math.round(distanceInMetres);
};

const getWindDirection = (deg) => {
  const src = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return src[Math.round(deg / 22.5) % 16];
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [holeNo, setHoleNo] = useState(1);
  const [units, setUnits] = useState('METRES');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  
  // Game Scores Arrays
  const [scores, setScores] = useState(Array(18).fill(''));
  
  // Core Tracking Telemetry
  const [coords, setCoords] = useState({ latitude: -27.4512, longitude: 153.0251 });
  const [weather, setWeather] = useState({ temp: '24', windSpeed: 12, windDir: 45, cardinal: 'NNE' });
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [caddieSpeech, setCaddieSpeech] = useState("Aim at the left centre. Smooth driver. Commit.");
  const [isListening, setIsListening] = useState(false);
  const [calculatedDistances, setCalculatedDistances] = useState({ front: 354, centre: 364, back: 374, dynamicMode: false });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const windAnim = useRef(new Animated.Value(0)).current;
  const currentHoleConfig = COURSE_DATABASE[holeNo];

  // Hardware Location Hooks
  useEffect(() => {
    let subscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 2 },
          (loc) => {
            setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }
        );
      }
    })();
    return () => subscription && subscription.remove();
  }, []);

  // Distance Delta Calculation Engine
  useEffect(() => {
    if (!coords.latitude) return;

    const realTimeDistance = calculateDistanceMatrix(
      coords.latitude,
      coords.longitude,
      currentHoleConfig.targetLat,
      currentHoleConfig.targetLon,
      units
    );

    if (realTimeDistance && realTimeDistance < 5000) {
      setCalculatedDistances({
        front: Math.max(10, realTimeDistance - 10),
        centre: realTimeDistance,
        back: realTimeDistance + 10,
        dynamicMode: true
      });
    } else {
      setCalculatedDistances({
        front: currentHoleConfig.defaultFront || currentHoleConfig.front,
        centre: currentHoleConfig.defaultCentre || currentHoleConfig.centre,
        back: currentHoleConfig.defaultBack || currentHoleConfig.back,
        dynamicMode: false
      });
    }
  }, [coords, holeNo, units]);

  // Weather Satellite System Sync
  useEffect(() => {
    if (!coords.latitude) return;

    const fetchLiveMetrics = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch(
          `https://open-meteo.com{coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m`
        );
        const data = await response.json();
        if (data && data.current) {
          const wSpeed = Math.round(data.current.wind_speed_10m);
          const wDir = data.current.wind_direction_10m;
          const temp = Math.round(data.current.temperature_2m);
          const card = getWindDirection(wDir);

          setWeather({ temp, windSpeed: wSpeed, windDir: wDir, cardinal: card });
          setCaddieSpeech(`Aim at the left centre. Wind is ${wSpeed} km/h from ${card}. Smooth swing.`);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchLiveMetrics();
  }, [coords]);

  // Visual Animation Pulse Effects Loops
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    windAnim.setValue(0);
    Animated.timing(windAnim, { toValue: weather.windDir, duration: 1200, useNativeDriver: true }).start();
  }, [weather.windDir]);

  const windRotation = windAnim.interpolate({
    inputRange:,
    outputRange: ['0deg', '360deg']
  });

  const fireVoiceSimulation = () => {
    setIsListening(true);
    setCaddieSpeech("Heard: Recalculating aerodynamic trajectories...");
    setTimeout(() => {
      setIsListening(false);
      setCaddieSpeech(`Advice: Adjusted playing center is ${calculatedDistances.centre} ${units.toLowerCase()}. Smooth cut down the fairway line.`);
    }, 2000);
  };

  const handleScoreInput = (index, value) => {
    const updated = [...scores];
    updated[index] = value;
    setScores(updated);
  };

  const calculateTotals = () => {
    let grossOut = 0;
    let grossIn = 0;
    for (let i = 0; i < 9; i++) grossOut += parseInt(scores[i]) || 0;
    for (let i = 9; i < 18; i++) grossIn += parseInt(scores[i]) || 0;
    return { out: grossOut, in: grossIn, total: grossOut + grossIn };
  };

  const totals = calculateTotals();

  // Screen Layout Definitions
  const LoginView = () => (
    <View style={ss.container}>
      <View style={ss.loginHeader}>
        <View style={ss.metallicIconBorder}>
          <Text style={ss.logoTextMain}>DRC</Text>
          <Text style={ss.logoTextSub}>VIRTUAL GOLF</Text>
          <Text style={ss.logoTextElite}>E L I T E</Text>
