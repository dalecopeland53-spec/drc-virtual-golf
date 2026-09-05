import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';

export default function App() {
  // Score Tracking States
  const [score, setScore] = useState(0);
  const [putts, setPutts] = useState(0);
  const [gir, setGir] = useState(0);
  const [fairway, setFairway] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [voiceCaddieOn, setVoiceCaddieOn] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. TOP BRANDING & WEATHER TELEMETRY BAR */}
      <View style={styles.topBar}>
        <Text style={styles.hamburgerMenu}>☰</Text>
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>TOUR PRO</Text>
          <Text style={styles.subBrandText}>— ELITE —</Text>
        </View>
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherIcon}>☀️</Text>
          <View>
            <Text style={styles.weatherText}>24°C</Text>
            <Text style={styles.windText}>Wind 8 km/h</Text>
          </View>
          <Text style={styles.weatherArrow}>❯</Text>
        </View>
      </View>

      <ScrollView style={styles.mainContent}>
        <View style={styles.splitLayout}>
          
          {/* 2. LEFT SIDE: HOLE GRAPHIC / GPS CONTAINER */}
          <View style={styles.leftColumn}>
            <View style={styles.mapMockup}>
              {/* Replace background color with <ImageBackground> or Mapview when tracking live */}
              <View style={styles.placeholderMapGraphic}>
                <Text style={styles.mapLabelPin}>🏁 498 m</Text>
                <Text style={styles.mapLabelArc2}>• 280 m</Text>
                <Text style={styles.mapLabelArc1}>• 230 m</Text>
                <View style={styles.ballIndicatorDot} />
              </View>
              
              {/* GPS / Aerial Toggle Switches */}
              <View style={styles.toggleRow}>
                <TouchableOpacity style={[styles.toggleBtn, styles.toggleBtnActive]}>
                  <Text style={styles.toggleBtnTextActive}>🗺️ GPS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toggleBtn}>
                  <Text style={styles.toggleBtnText}>Aerial</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 3. RIGHT SIDE: HOLE METRICS & AI VOICE CADDIE */}
          <View style={styles.rightColumn}>
            
            {/* Hole & Distance Information Card */}
            <View style={styles.holeInfoCard}>
              <View style={styles.holeHeaderRow}>
                <View>
                  <Text style={styles.holeTitleText}>Hole 1</Text>
                  <Text style={styles.holeSubText}>Par 5  |  S.I. 5</Text>
                </View>
                <View style={styles.arrowBoxRow}>
                  <TouchableOpacity style={styles.navArrow}><Text style={styles.arrowText}>❮</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.navArrow}><Text style={styles.arrowText}>❯</Text></TouchableOpacity>
                </View>
              </View>

              <View style={styles.distanceMetricBlock}>
                <Text style={styles.distanceLabel}>To Centre</Text>
                <Text style={styles.distanceMainValue}>498 m</Text>
              </View>

              <View style={styles.yardageGrid}>
                <View style={styles.gridCell}><Text style={styles.gridLabel}>Front</Text><Text style={styles.gridVal}>480 m</Text></View>
                <View style={styles.gridCell}><Text style={styles.gridLabel}>Centre</Text><Text style={styles.gridVal}>498 m</Text></View>
                <View style={styles.gridCell}><Text style={styles.gridLabel}>Back</Text><Text style={styles.gridVal}>512 m</Text></View>
              </View>
            </View>

            {/* AI Voice Caddie Smart Engine */}
            <View style={styles.caddieCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.caddieCardTitle}>Voice Caddie</Text>
                <TouchableOpacity 
                  style={[styles.switchTrack, voiceCaddieOn ? styles.switchOn : styles.switchOff]}
                  onPress={() => setVoiceCaddieOn(!voiceCaddieOn)}
                >
                  <View style={[styles.switchThumb, voiceCaddieOn ? styles.thumbRight : styles.thumbLeft]} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.micButton}>
                <Text style={styles.micIcon}>🎙️</Text>
                <Text style={styles.micText}>Ask Caddie</Text>
                <Text style={styles.micSubText}>Tap and speak</Text>
              </TouchableOpacity>

              <View style={styles.caddieSpeechBubble}>
                <Text style={styles.speechText}>
                  "498 metres to the centre. With a slight headwind, I'd suggest driver. Aim just right of centre."
                </Text>
              </View>
            </View>

            {/* Recommended Strategy Club Card */}
            <View style={styles.clubCard}>
              <Text style={styles.clubCardLabel}>Recommended Club</Text>
              <View style={styles.clubDataRow}>
                <Text style={styles.clubNameText}>Driver</Text>
                <View style={styles.carryBox}>
                  <Text style={styles.carryLabel}>Est. Carry</Text>
                  <Text style={styles.carryVal}>230 m</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.dropdownSelector}>
                <Text style={styles.dropdownText}>Use Another Club  ▼</Text>
              </TouchableOpacity>
            </View>

            {/* Last Shot Telemetry Log */}
            <View style={styles.lastShotCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.lastShotTitle}>Last Shot</Text>
                <Text style={styles.editIcon}>✏️</Text>
              </View>
              <Text style={styles.lastShotPlaceholder}>-  No shot recorded</Text>
            </View>

          </View>
        </View>

        {/* 4. BOTTOM SECTION: COMPREHENSIVE SCORECARD INPUTS */}
        <View style={styles.scorecardContainer}>
          <View style={styles.statGridRow}>
            
            {/* Score Counter */}
            <View style={styles.statInputCell}>
              <Text style={styles.statInputLabel}>Score</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setScore(Math.max(0, score - 1))}><Text style={styles.btnSymbol}>-</Text></TouchableOpacity>
                <Text style={styles.counterVal}>{score}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setScore(score + 1)}><Text style={styles.btnSymbol}>+</Text></TouchableOpacity>
              </View>
            </View>

            {/* Putts Counter */}
            <View style={styles.statInputCell}>
              <Text style={styles.statInputLabel}>Putts</Text>
              <View style={styles.counterRowSmall}>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setPutts(Math.max(0, putts - 1))}><Text style={styles.btnSymbolSmall}>-</Text></TouchableOpacity>
                <Text style={styles.counterValSmall}>{putts}</Text>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setPutts(putts + 1)}><Text style={styles.btnSymbolSmall}>+</Text></TouchableOpacity>
              </View>
            </View>

            {/* GIR Tracking */}
            <View style={styles.statInputCell}>
              <Text style={styles.statInputLabel}>GIR</Text>
              <View style={styles.counterRowSmall}>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setGir(Math.max(0, gir - 1))}><Text style={styles.btnSymbolSmall}>-</Text></TouchableOpacity>
                <Text style={styles.counterValSmall}>{gir}</Text>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setGir(gir + 1)}><Text style={styles.btnSymbolSmall}>+</Text></TouchableOpacity>
              </View>
            </View>

            {/* Fairway Accuracy Tracking */}
            <View style={styles.statInputCell}>
              <Text style={styles.statInputLabel}>Fairway</Text>
              <View style={styles.counterRowSmall}>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setFairway(Math.max(0, fairway - 1))}><Text style={styles.btnSymbolSmall}>-</Text></TouchableOpacity>
                <Text style={styles.counterValSmall}>{fairway}</Text>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setFairway(fairway + 1)}><Text style={styles.btnSymbolSmall}>+</Text></TouchableOpacity>
              </View>
            </View>

            {/* Penalty Strokes */}
            <View style={styles.statInputCell}>
              <Text style={styles.statInputLabel}>Penalty ⚠️</Text>
              <View style={styles.counterRowSmall}>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setPenalty(Math.max(0, penalty - 1))}><Text style={styles.btnSymbolSmall}>-</Text></TouchableOpacity>
                <Text style={styles.counterValSmall}>{penalty}</Text>
                <TouchableOpacity style={styles.counterBtnSmall} onPress={() => setPenalty(penalty + 1)}><Text style={styles.btnSymbolSmall}>+</Text></TouchableOpacity>
              </View>
            </View>

          </View>

          {/* Action Strategy Forward Buttons */}
          <View style={styles.actionButtonRow}>
            <TouchableOpacity style={styles.nextHoleButton}>
              <Text style={styles.nextHoleText}>⛳ Next Hole</Text>
            </TouchableOpacity>
