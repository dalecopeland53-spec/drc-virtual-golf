import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  // Global App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMetres, setIsMetres] = useState(true);
  
  // Interactive Feature Hooks
  const [isListening, setIsListening] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [peteResponse, setPeteResponse] = useState(
    '"498 metres to the centre. With a slight headwind, I\'d suggest driver. Just right of centre."'
  );

  // LIVE STAT COUNTERS (From your exact mockup parameters)
  const [scoreCount, setScoreCount] = useState(0);
  const [puttsCount, setPuttsCount] = useState(0);
  const [girCount, setGirCount] = useState(0);
  const [fairwayCount, setFairwayCount] = useState(0);
  const [penaltyCount, setPenaltyCount] = useState(0);

  // 14-Club Distance Matrix
  const [clubs, setClubs] = useState([
    { id: '1', name: 'Driver', distance: 230, type: 'Wood' },
    { id: '2', name: '3-Wood', distance: 210, type: 'Wood' },
    { id: '3', name: '5-Wood', distance: 195, type: 'Wood' },
    { id: '4', name: '4-Iron', distance: 180, type: 'Iron' },
    { id: '5', name: '5-Iron', distance: 170, type: 'Iron' },
    { id: '6', name: '6-Iron', distance: 160, type: 'Iron' },
    { id: '7', name: '7-Iron', distance: 150, type: 'Iron' },
    { id: '8', name: '8-Iron', distance: 140, type: 'Iron' },
    { id: '9', name: '9-Iron', distance: 130, type: 'Iron' },
    { id: '10', name: 'PW', distance: 115, type: 'Wedge' },
    { id: '11', name: 'GW', distance: 100, type: 'Wedge' },
    { id: '12', name: 'SW', distance: 85, type: 'Wedge' },
    { id: '13', name: 'LW', distance: 70, type: 'Wedge' },
    { id: '14', name: 'Putter', distance: 0, type: 'Putter' },
  ]);

  const adjustClubDistance = (id, amount) => {
    setClubs(prev => prev.map(c => c.id === id ? { ...c, distance: Math.max(0, c.distance + amount) } : c));
  };

  // Voice Interaction Activation
  const handleVoiceTrigger = () => {
    if (!isListening) {
      setIsListening(true);
      setPeteResponse('"Pete is listening to your shot voice link stream..."');
      setTimeout(() => {
        setIsListening(false);
        setPeteResponse('"Data updated via voice. Target adjusted: Driver off the tee box, favor the right portion of the fairway runway."');
      }, 3000);
    }
  };

  // Secret Developer Override Tracker
  const processSecretTap = () => {
    const nextCount = secretTapCount + 1;
    setSecretTapCount(nextCount);
    if (nextCount >= 5) {
      setSecretTapCount(0);
      Alert.alert(
        "DRC ELITE MODIFIER DETECTED",
        "Secret Tour override unlocked. GPS calibration loops, raw atmospheric density feeds, and telemetry logs are now active.",
        [{ text: "CONFIRM SYSTEM STATUS", style: "default" }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      
      {/* 1. BRAND GLOBAL NAVIGATION HEADER PANEL */}
      <View style={styles.globalHeader}>
        <TouchableOpacity activeOpacity={0.9} onPress={processSecretTap}>
          <Text style={styles.brandLogoTextTitle}>DRC</Text>
          <Text style={styles.brandLogoSubtitleText}>VIRTUAL GOLF ELITE</Text>
        </TouchableOpacity>
        
        <View style={styles.telemetryCoordinateBox}>
          <Text style={styles.monoCoordinateLine}>LAT: -23.1314° S</Text>
          <Text style={styles.monoCoordinateLine}>LNG: 150.7423° E</Text>
        </View>

        <View style={styles.liveSystemStatusBadge}>
          <View style={[styles.statusDot, isListening && styles.statusDotPulseActive]} />
          <Text style={styles.statusBadgeTextValue}>{isListening ? "RECORDING" : "CADDIE LIVE"}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollWindowView} showsVerticalScrollIndicator={false}>
        
        {/* INTERACTIVE MODULE VIEW A: INTEGRATED GPS PLAYBOARD */}
        {activeTab === 'dashboard' && (
          <View>
            <View style={styles.locationSummaryMetaLine}>
              <Text style={styles.mainHoleTextDisplay}>Hole 1 <Text style={styles.parMetaInlineSub}>• Par 5 • S.I. 5</Text></Text>
              <Text style={styles.courseLocationHeaderLabel}>Yeppoon Golf Club</Text>
            </View>

            {/* DYNAMIC PIVOTING FAIRWAY MAP COMPONENT CONTAINER */}
            <TouchableOpacity 
              style={[styles.collapsibleMapToggleBanner, isMapExpanded && styles.mapBannerExpandedBorderColor]} 
              activeOpacity={0.9}
              onPress={() => setIsMapExpanded(!isMapExpanded)}
            >
              <View style={styles.bannerHeaderFlexRow}>
                <Text style={styles.bannerHeadingText}>🗺️ {isMapExpanded ? "CLOSE HOLE MAP DIAGRAM" : "TAP TO EXPAND INTERACTIVE HOLE MAP"}</Text>
                <Text style={styles.bannerStatusArrowIndicator}>{isMapExpanded ? "▲" : "▼"}</Text>
              </View>

              {isMapExpanded && (
                <View style={styles.matteGraphicMapWrapper}>
                  <View style={styles.matteVectorFairwayBar}>
                    <View style={styles.greenZonePatch}><Text style={styles.vectorLabelStringText}>🚩 Pin: 498m Target</Text></View>
                    <View style={styles.bunkerHazardBlock} />
                    <View style={styles.layupTargetSegment}><Text style={styles.vectorLabelStringText}>🔸 Layup: 280m Vector</Text></View>
                    <View style={styles.teeBoxZonePatch}><Text style={styles.vectorLabelStringText}>🔵 Tee Box: 230m Carry</Text></View>
                  </View>
                  <Text style={styles.antiGlareSystemIndicatorText}>Matte Vector Display • Anti-Glare Engine Active</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* MAIN PERFORMANCE DISTANCE INFORMATION FIELDS */}
            <View style={styles.metricsTwoColumnDashboardGrid}>
              <View style={styles.flatAntiGlareDataCard}>
                <Text style={styles.metricLabelTinyCapText}>TO CENTRE</Text>
                <Text style={styles.primaryMetricDigitDisplay}>498</Text>
                <Text style={styles.goldMetricUnitText}>METRES</Text>
                <View style={styles.cardInternalBorderDivider} />
                <View style={styles.inlineStatsFlexRow}>
                  <Text style={styles.monospaceSubStatText}>F: 480m</Text>
                  <Text style={styles.monospaceSubStatText}>B: 512m</Text>
                </View>
              </View>

              <View style={styles.flatAntiGlareDataCard}>
                <Text style={styles.metricLabelTinyCapText}>WEATHER VECTOR</Text>
                <Text style={styles.greenWindDigitDisplay}>8 <Text style={styles.windSubLabelUnitString}>km/h</Text></Text>
                <Text style={styles.windDirectionStringLabel}>💨 HEADWIND • NE</Text>
                <View style={styles.cardInternalBorderDivider} />
                <View style={styles.inlineStatsFlexRow}>
                  <Text style={styles.monospaceSubStatText}>Slope: 0°</Text>
                  <Text style={styles.monospaceSubStatText}>Temp: 24°C</Text>
                </View>
              </View>
            </View>

            {/* AI CADDIES SYSTEM ADVICE MODULE */}
            <View style={styles.aiAssistantCaddieModuleBox}>
              <View style={styles.aiCaddieHeaderLineRow}>
                <Text style={styles.aiModuleBadgeTitle}>🎙️ DEPLOY PETE</Text>
                <Text style={[styles.aiModuleStatusTextValue, isListening && styles.aiModuleStatusTextValueRecording]}>
                  {isListening ? "PROCESSING VOICE DATA..." : "CALCULATIONS ACTIVE"}
                </Text>
              </View>
              <Text style={styles.aiOutputAdviceParagraphString}>{peteResponse}</Text>
              
              <TouchableOpacity 
                style={[styles.voiceMicInteractionButton, isListening && styles.voiceMicInteractionButtonRecordingColor]} 
                activeOpacity={0.85}
                onPress={handleVoiceTrigger}
              >
                <Text style={styles.voiceMicInteractionButtonTextString}>
                  {isListening ? "🛑 DISCONNECT MIC INPUT CHANNEL" : "🎙️ HOLD TO TALK TO PETE"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DYNAMIC SHOT TRACKING LOG INPUT CARD COUNTER ELEMENT ROW */}
            <View style={styles.liveScoreTrackerContainerBlockCard}>
              <Text style={styles.scoreTrackerHeadlineBlockLabel}>LIVE HOLE SCORE CONSOLE COUNTERS</Text>
              
              <View style={styles.scoreCounterAdjustmentFlexRowTrack}>
                {/* Score Stepper */}
                <View style={styles.individualMetricStepperCellBox}>
                  <Text style={styles.stepperCellMetaLabel}>SCORE</Text>
                  <Text style={styles.stepperCellNumericOutputDisplay}>{scoreCount}</Text>
                  <View style={styles.stepperControlPadsFlexRow}>
                    <TouchableOpacity style={styles.stepperTouchPadButton} onPress={() => setScoreCount(Math.max(0, scoreCount - 1))}><Text style={styles.stepperControlBtnLabelText}>-</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.stepperTouchPadButton} onPress={() => setScoreCount(scoreCount + 1)}><Text style={styles.stepperControlBtnLabelText}>+</Text></TouchableOpacity>
                  </View>
                </View>

                {/* Putts Stepper */}
                <View style={styles.individualMetricStepperCellBox}>
                  <Text style={styles.stepperCellMetaLabel}>PUTTS</Text>
                  <Text style={styles.stepperCellNumericOutputDisplay}>{puttsCount}</Text>
