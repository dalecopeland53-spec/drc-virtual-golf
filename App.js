import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  // Navigation & Control Unit States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMetres, setIsMetres] = useState(true);
  
  // INTERACTIVE FEATURE STATES
  const [isListening, setIsListening] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false); 
  const [currentLatitude, setCurrentLatitude] = useState('-23.1314° S');
  const [currentLongitude, setCurrentLongitude] = useState('150.7423° E');
  const [peteResponse, setPeteResponse] = useState(
    '"498 metres to the centre. With a slight headwind, I\'d suggest driver. Just right of centre."'
  );

  // MOCKUP GAMEPLAY COUNTERS STATE
  const [holeScore, setHoleScore] = useState(0);
  const [puttsCount, setPuttsCount] = useState(0);
  const [girStatus, setGirStatus] = useState(false); // Green in Regulation
  const [fairwayStatus, setFairwayStatus] = useState('Hit'); // Hit | Left | Right | Miss
  const [penaltyCount, setPenaltyCount] = useState(0);

  // 14-Club Inventory Array Database
  const [clubs, setClubs] = useState([
    { id: '1', name: 'Driver', distance: 230, type: 'Wood' },
    { id: '2', name: '3-Wood', distance: 210, type: 'Wood' },
    { id: '3', name: '5-Wood', distance: 195, type: 'Wood' },
    { id: '4', name: '4-Iron', distance: 180, type: 'Iron' },
    { id: '5', name: '5-Iron', distance: 170, type: 'Iron' },
    { id: '6', name:
