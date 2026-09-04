import React, { useState, createContext, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform
} from 'react-native';

// --- GLOBAL STATE ENGINE ---
const GolfAppContext = createContext();

const production18HoleCourseData = [
  { hole: 1, par: 4, index: 7, yardsGold: 415, yardsSilver: 385, adviceLow: "Driver down the left-centre. Avoid fairway bunker.", adviceHigh: "Aim right of the bunker. Play for a safe 5." },
  { hole: 2, par: 3, index: 13, yardsGold: 185, yardsSilver: 155, adviceLow: "Club up to clear false front. Mid-green is safe.", adviceHigh: "Take extra club. Miss short-right is safe." },
  { hole: 3, par: 5, index: 1, yardsGold: 535, yardsSilver: 495, adviceLow: "Reach in two if wind allows. Stay below hole.", adviceHigh: "Three-shot hole. Lay up to your wedge yardage." },
  { hole: 4, par: 4, index: 11, yardsGold: 390, yardsSilver: 360, adviceLow: "Precision iron placement off tee required.", adviceHigh: "Aim for wide part of fairway. Avoid left tree line." },
  { hole: 5, par: 4, index: 3, yardsGold: 440, yardsSilver: 410, adviceLow: "Long challenge. Aim right-centre off tee.", adviceHigh: "Treat as a par 5. Stay short of green hazard." },
  { hole: 6, par: 5, index: 9, yardsGold: 510, yardsSilver: 480, adviceLow: "Aggressive line over lake unlocks eagle chance.", adviceHigh: "Safe path down right side. Avoid water completely." },
  { hole: 7, par: 3, index: 17, yardsGold: 140, yardsSilver: 120, adviceLow: "Short hole but tight pin. Check wind direction.", adviceHigh: "Aim directly at center of green. Ignore tough pins." },
  { hole: 8, par: 4, index: 5, yardsGold: 425, yardsSilver: 395, adviceLow: "Keep approach shot beneath flagstick.", adviceHigh: "Aim left-centre. Right side falls off into sand." },
  { hole: 9, par: 4, index: 15, yardsGold: 365, yardsSilver: 335, adviceLow: "Fairway wood off tee leaves simple approach wedge.", adviceHigh: "Bunker is reachable. Lay up short for clean shot." },
  { hole: 10, par: 4, index: 8, yardsGold: 402, yardsSilver: 372, adviceLow: "Slight draw needed to match fairway camber.", adviceHigh: "Aim out right. Let slope feed ball back to middle." },
  { hole: 11, par: 4, index: 14, yardsGold: 380, yardsSilver: 350, adviceLow: "Attack front pin placement aggressively.", adviceHigh: "Keep ball short of back bunkers at all costs." },
  { hole: 12, par: 3, index: 18, yardsGold: 135, yardsSilver: 115, adviceLow: "Target center-cup regardless of layout.", adviceHigh: "Safest miss is wide left. Heavy rough on right." },
  { hole: 13, par: 5, index: 2, yardsGold: 555, yardsSilver: 515, adviceLow: "Tee shot requires maximum distance over waste area.", adviceHigh: "Take detour path around waste. Safe entry route." },
  { hole: 14, par: 4, index: 10, yardsGold: 412, yardsSilver: 382, adviceLow: "Aim down left slot. Avoid overhanging trees.", adviceHigh: "Use mid-iron off tee for placement accuracy." },
  { hole: 15, par: 4, index: 4, yardsGold: 434, yardsSilver: 404, adviceLow: "Uphill target. Take 1 extra club for approach.", adviceHigh: "Add 2 clubs to fight incline. Miss short is safe." },
  { hole: 16, par: 3, index: 12, yardsGold: 172, yardsSilver: 142, adviceLow: "Carry over front bunker is mandatory.", adviceHigh: "Aim right side. Completely avoids sand entry lines." },
  { hole: 17, par: 5, index: 6, yardsGold: 524, yardsSilver: 494, adviceLow: "Keep approach on lower shelf for birdie look.", adviceHigh: "Lay up to 100 yard marker. Avoid cross-bunkers." },
  { hole: 18, par: 4, index: 16, yardsGold: 350, yardsSilver: 320, adviceLow: "Iron off tee avoids water on far side.", adviceHigh: "Aim down left fairway runway. Keep clear of lake right." }
];

export function GolfAppProvider({ children }) {
  const [handicap, setHandicap] = useState(18);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [voiceLog, setVoiceLog] = useState(
    "Caddie System Status: Ready for voice simulation..."
  );
  const [isSunlightMode, setIsSunlightMode] = useState(false);

  const activeHole = production18HoleCourseData[currentHoleIndex];

  const nextHole = () => {
    if (currentHoleIndex < production18HoleCourseData.length - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    }
  };

  const prevHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    }
  };

  const updateScore = (score) => {
    const numericScore = parseInt(score) || 0;

    setScores((prev) => ({
      ...prev,
      [activeHole.hole]: numericScore
    }));

    if (numericScore > 0) {
      const phrases = [
        `Caddie Audio Feed: "Stroke logged successfully for Hole ${activeHole.hole}. Great tracking."`,
        `Caddie Audio Feed: "Score updated to ${numericScore}. Moving on, stay focused."`,
        `Caddie Audio Feed: "Confirmed. Saving card parameters for analytics."`
      ];

      setVoiceLog(
        phrases[Math.floor(Math.random() * phrases.length)]
      );
    }
  };

  const handleVoiceCommand = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("next")) {
      nextHole();
      setVoiceLog("Voice Executed: Advanced to next hole.");
    } else if (
      lowerText.includes("back") ||
      lowerText.includes("previous")
    ) {
      prevHole();
      setVoiceLog("Voice Executed: Returned to previous hole.");
    } else if (lowerText.includes("score")) {
      const match = lowerText.match(/\d+/);

      if (match) {
        updateScore(match[0]);
      }
    } else {
      setVoiceLog(
        `Command '${text}' not recognised. Try 'next hole' or 'score 4'.`
      );
    }
  };

  return (
    <GolfAppContext.Provider
      value={{
        handicap,
        setHandicap,
        activeHole,
        currentHoleIndex,
        scores,
        updateScore,
        nextHole,
        prevHole,
        voiceLog,
        setVoiceLog,
        handleVoiceCommand,
        isSunlightMode,
        setIsSunlightMode,
        courseData: production18HoleCourseData
      }}
    >
      {children}
    </GolfAppContext.Provider>
  );
}

// --- MAIN GRAPHICAL INTERFACE ---
export default function App() {
  return (
    <GolfAppProvider>
      <MainDashboard />
    </GolfAppProvider>
  );
}

function MainDashboard() {
  const {
    handicap,
    setHandicap,
    activeHole,
    scores,
    updateScore,
    nextHole,
    prevHole,
    voiceLog,
    handleVoiceCommand,
    isSunlightMode,
    setIsSunlightMode,
    courseData
  } = useContext(GolfAppContext);

  const [voiceInputText, setVoiceInputText] = useState("");

  const theme = {
    bg: isSunlightMode ? '#F8FAFC' : '#0F172A',
    cardBg: isSunlightMode ? '#FFFFFF' : '#1E293B',
    border: isSunlightMode ? '#64748B' : '#94A3B8',
    textMain: isSunlightMode ? '#0F172A' : '#F8FAFC',
    textSub: isSunlightMode ? '#475569' : '#94A3B8',
    inputBg: isSunlightMode ? '#E2E8F0' : '#334155'
  };

  let totalStrokes = 0;
  let totalPar = 0;

  courseData.forEach((holeObj) => {
    const holeScore = scores[holeObj.hole] || 0;

    if (holeScore > 0) {
      totalStrokes += holeScore;
      totalPar += holeObj.par;
    }
  });

  const relationToPar = totalStrokes - totalPar;

  const relationText =
    totalStrokes === 0
      ? "-"
      : relationToPar === 0
      ? "E"
      : relationToPar > 0
      ? `+${relationToPar}`
      : `${relationToPar}`;

  const netScore =
    totalStrokes > 0
      ? totalStrokes - Math.round(handicap)
      : 0;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.bg }
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* SUNLIGHT MODE */}
        <TouchableOpacity
          style={[
            styles.metallicButton,
            {
              backgroundColor: isSunlightMode
                ? '#0F172A'
                : '#E2E8F0',
              width: '100%',
              marginBottom: 12
            }
          ]}
          onPress={() =>
            setIsSunlightMode(!isSunlightMode)
          }
        >
          <Text
            style={[
              styles.metallicButtonText,
              {
                color: isSunlightMode
                  ? '#FFFFFF'
                  : '#0F172A'
              }
            ]}
          >
            {isSunlightMode
              ? "🌙 SWITCH TO CLUBHOUSE DARK"
              : "☀️ SWITCH TO HIGH-CONTRAST SUN LIGHT"}
          </Text>
        </TouchableOpacity>

        {/* PROFILE HEADER */}
        <View
          style={[
            styles.metallicHeader,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              { color: theme.textMain }
            ]}
          >
            ⛳ LUXURY CADDIEMASTER PRO
          </Text>

          <View style={styles.handicapRow}>
            <Text
              style={[
                styles.labelBright,
                { color: theme.textMain }
              ]}
            >
              PLAYER HANDICAP:
            </Text>

            <TextInput
              style={[
                styles.metallicNumericInput,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.textMain
                }
              ]}
              keyboardType="numeric"
              value={String(handicap)}
              onChangeText={(val) =>
                setHandicap(parseInt(val) || 0)
              }
            />
          </View>
        </View>

        {/* LIVE SCORECARD MATRIX */}
        <View
          style={[
            styles.metallicHeader,
            {
              backgroundColor: theme.cardBg,
              borderColor: '#F59E0B'
            }
          ]}
        >
          <Text style={styles.caddieTitle}>
            📊 LIVE TOURNAMENT SCORECARD MATRIX
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 12
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text
                style={[
                  styles.gpsLabel,
                  { color: theme.textSub }
                ]}
              >
                GROSS TOTAL
              </Text>

              <Text
                style={[
                  styles.goldTextHeading,
                  {
                    fontSize: 28,
                    color: theme.textMain
                  }
                ]}
              >
                {totalStrokes}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text
                style={[
                  styles.gpsLabel,
                  { color: theme.textSub }
                ]}
              >
                VS PAR
              </Text>

              <Text
                style={[
                  styles.silverTextHeading,
                  {
                    fontSize: 28,
                    color:
                      totalStrokes === 0
                        ? theme.textMain
                        : relationToPar > 0
                        ? '#EF4444'
                        : '#10B981'
                  }
                ]}
              >
                {relationText}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text
                style={[
                  styles.gpsLabel,
                  { color: theme.textSub }
                ]}
              >
                NET SCORE
              </Text>

              <Text
                style={[
                  styles.goldTextHeading,
                  {
                    fontSize: 28,
                    color: '#F59E0B'
                  }
                ]}
              >
                {netScore}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIVE HOLE */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.border
            }
          ]}
        >
          <View style={styles.holeHeader}>
            <Text
              style={[
                styles.holeTitle,
                { color: theme.textMain }
              ]}
            >
              HOLE {activeHole.hole}
            </Text>

            <Text
              style={[
                styles.indexBadge,
                { color: '#F59E0B' }
              ]}
            >
              HCP INDEX {activeHole.index}
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBlock}>
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.textSub }
                ]}
              >
                PAR
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  { color: theme.textMain }
                ]}
              >
                {activeHole.par}
              </Text>
            </View>

            <View style={styles.metricBlock}>
              <Text
                style={[
                  styles.metricLabel,
                  { color: '#F59E0B' }
                ]}
              >
                GOLD YARDS
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  { color: '#F59E0B' }
                ]}
              >
                {activeHole.yardsGold}
              </Text>
            </View>

            <View style={styles.metricBlock}>
              <Text
                style={[
                  styles.metricLabel,
                  { color: '#94A3B8' }
                ]}
              >
                SILVER YARDS
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  { color: '#94A3B8' }
                ]}
              >
                {activeHole.yardsSilver}
              </Text>
            </View>
          </View>

          {/* CADDIE ADVICE */}
          <View style={styles.adviceContainer}>
            <Text style={styles.adviceHeader}>
              🧠 TARGET REAL-TIME CADDIE INSIGHTS
            </Text>

            <View style={styles.adviceItem}>
              <Text style={styles.adviceLabel}>
                Low-Hcp Playbook:
              </Text>

              <Text
                style={[
                  styles.adviceBody,
                  { color: theme.textMain }
                ]}
              >
                {activeHole.adviceLow}
              </Text>
            </View>

            <View style={styles.adviceItem}>
              <Text style={styles.adviceLabel}>
                High-Hcp Strategy:
              </Text>

              <Text
                style={[
                  styles.adviceBody,
                  { color: theme.textMain }
                ]}
              >
                {activeHole.adviceHigh}
              </Text>
            </View>
          </View>

          {/* SCORE INPUT */}
          <View style={styles.scoreActionRow}>
            <Text
              style={[
                styles.labelBright,
                {
                  color: theme.textMain,
                  flex: 1
                }
              ]}
            >
              LOG HOLE SCORE:
            </Text>

            <TextInput
              style={[
                styles.scoreInput,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.textMain
                }
              ]}
              placeholder="--"
              placeholderTextColor={theme.textSub}
              keyboardType="numeric"
              value={String(
                scores[activeHole.hole] || ""
              )}
              onChangeText={updateScore}
            />
          </View>
        </View>

        {/* NAVIGATION */}
        <View style={styles.navigationRow}>
          <TouchableOpacity
            style={[
              styles.navButton,
              {
                opacity:
                  activeHole.hole === 1 ? 0.4 : 1
              }
            ]}
            onPress={prevHole}
            disabled={activeHole.hole === 1}
          >
            <Text style={styles.navButtonText}>
              ◀ PREV HOLE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              {
                opacity:
                  activeHole.hole === 18 ? 0.4 : 1
              }
            ]}
            onPress={nextHole}
            disabled={activeHole.hole === 18}
          >
            <Text style={styles.navButtonText}>
              NEXT HOLE ▶
            </Text>
          </TouchableOpacity>
        </View>

        {/* VOICE COMMAND */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBg,
              borderColor: '#10B981'
            }
          ]}
        >
          <Text
            style={[
              styles.caddieTitle,
              { color: '#10B981' }
            ]}
          >
            🎙️ VOICE COMM COMMAND INPUT
          </Text>

          <Text style={styles.voiceLogText}>
            {voiceLog}
          </Text>

          <View style={styles.voiceInputRow}>
            <TextInput
              style={[
                styles.voiceInput,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.textMain
                }
              ]}
              placeholder="e.g., 'next hole' or 'score 4'"
              placeholderTextColor={theme.textSub}
              value={voiceInputText}
              onChangeText={setVoiceInputText}
            />

            <TouchableOpacity
              style={styles.voiceSubmitBtn}
              onPress={() => {
                if (
                  voiceInputText.trim().length > 0
                ) {
                  handleVoiceCommand(
                    voiceInputText
                  );
                  setVoiceInputText("");
                }
              }}
            >
              <Text style={styles.voiceSubmitBtnText}>
                SAY
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },

  container: {
    padding: 16
  },

  metallicButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },

  metallicButtonText: {
    fontWeight: 'bold',
    fontSize: 14
  },

  metallicHeader: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1
  },

  handicapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },

  labelBright: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8
  },

  metallicNumericInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },

  caddieTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    color: '#F59E0B',
    letterSpacing: 0.5
  },

  gpsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1
  },

  goldTextHeading: {
    fontWeight: '900'
  },

  silverTextHeading: {
    fontWeight: '900'
  },

  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },

  holeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 10,
    marginBottom: 12
  },

  holeTitle: {
    fontSize: 22,
    fontWeight: '900'
  },

  indexBadge: {
    fontSize: 12,
    fontWeight: '800'
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },

  metricBlock: {
    flex: 1,
    alignItems: 'center'
  },

  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4
  },

  metricValue: {
    fontSize: 20,
    fontWeight: '800'
  },

  adviceContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B'
  },

  adviceHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 8
  },

  adviceItem: {
    marginBottom: 6
  },

  adviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },

  adviceBody: {
    fontSize: 13,
    lineHeight: 18
  },

  scoreActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12
  },

  scoreInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800'
  },

  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },

  navButton: {
    backgroundColor: '#3b82f6',
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },

  navButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },

  voiceLogText: {
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    fontFamily:
      Platform.OS === 'ios'
        ? 'Courier'
        : 'monospace',
    fontSize: 12,
    padding: 10,
    borderRadius: 6,
    marginVertical: 12
  },

  voiceInputRow: {
    flexDirection: 'row'
  },

  voiceInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14
  },

  voiceSubmitBtn: {
    backgroundColor: '#10B981',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8
  },

  voiceSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '900'
  }
});
