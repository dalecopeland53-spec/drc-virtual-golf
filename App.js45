import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const METRES_PER_YARD = 0.9144;
const KMH_PER_MPH = 1.60934;

const getDeviceSpeechLocale = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale || undefined;
  } catch (error) {
    return undefined;
  }
};

/*
TOUR PRO ELITE
RECOVERY 15 â€” VOICE CADDIE

RECOVERY 13 BASELINE + SPEECH UPGRADE

IMPORTANT:
Storage keys deliberately remain Recovery 11 keys so existing
saved clubs, rounds, courses and player information are preserved.
*/

const STORAGE_MAIN = 'tour_pro_elite_recovery11_main';
const STORAGE_ROUNDS = 'tour_pro_elite_recovery11_rounds';
const STORAGE_SHOTS = 'tour_pro_elite_recovery11_shots';
const STORAGE_PRACTICE = 'tour_pro_elite_recovery11_practice';
const STORAGE_ROUTINES = 'tour_pro_elite_recovery11_routines';
const STORAGE_ONBOARDING = 'tour_pro_elite_recovery11_onboarding';
const STORAGE_SESSION = 'tour_pro_elite_recovery11_session';
const STORAGE_PROFILE = 'tour_pro_elite_recovery11_profile';
const STORAGE_ACTIVE_ROUND = 'tour_pro_elite_recovery11_active_round';
const STORAGE_COURSES = 'tour_pro_elite_recovery11_courses';

const STARTING_CLUBS = [
  { id: 'driver', name: 'Driver', shortName: 'Driver', carryYards: 250 },
  { id: '3wood', name: '3 Wood', shortName: '3 Wood', carryYards: 225 },
  { id: '5wood', name: '5 Wood', shortName: '5 Wood', carryYards: 205 },
  { id: '4iron', name: '4 Iron', shortName: '4 Iron', carryYards: 190 },
  { id: '5iron', name: '5 Iron', shortName: '5 Iron', carryYards: 180 },
  { id: '6iron', name: '6 Iron', shortName: '6 Iron', carryYards: 170 },
  { id: '7iron', name: '7 Iron', shortName: '7 Iron', carryYards: 160 },
  { id: '8iron', name: '8 Iron', shortName: '8 Iron', carryYards: 150 },
  { id: '9iron', name: '9 Iron', shortName: '9 Iron', carryYards: 140 },
  { id: 'pw', name: 'Pitching Wedge', shortName: 'PW', carryYards: 125 },
  { id: 'gw', name: 'Gap Wedge', shortName: 'GW', carryYards: 110 },
  { id: 'sw', name: 'Sand Wedge', shortName: 'SW', carryYards: 95 },
  { id: 'lw', name: 'Lob Wedge', shortName: 'LW', carryYards: 80 },
  { id: 'putter', name: 'Putter', shortName: 'Putter', carryYards: 0 },
];

const TEE_TYPES = [
  ['men', 'MEN'],
  ['ladies', 'LADIES'],
];

const TEE_COLOURS = [
  ['yellow', 'YELLOW'],
  ['red', 'RED'],
  ['white', 'WHITE'],
  ['blue', 'BLUE'],
  ['black', 'BLACK'],
];

const LIE_OPTIONS = [
  ['tee', 'TEE'],
  ['fairway', 'FAIRWAY'],
  ['rough', 'ROUGH'],
  ['deepRough', 'DEEP ROUGH'],
  ['water', 'WATER'],
  ['fairwayBunker', 'FAIRWAY BUNKER'],
  ['greensideBunker', 'GREENSIDE BUNKER'],
];

const SHOT_RESULTS = [
  'GREAT',
  'GOOD',
  'SHORT',
  'LONG',
  'LEFT',
  'RIGHT',
];

const PRACTICE_TYPES = [
  'DRIVER',
  'IRONS',
  'WEDGES',
  'CHIPPING',
  'BUNKER',
  'PUTTING',
];

const PRACTICE_SHAPES = [
  'STRAIGHT',
  'DRAW',
  'FADE',
];

const ONBOARDING = [
  {
    title: 'KNOW YOUR NUMBER',
    text: 'Use your real carry distances and make better club decisions.',
  },
  {
    title: 'MAKE THE DECISION',
    text: 'Get simple plays-like, club and recovery calls without clutter.',
  },
  {
    title: 'PLAY THE ROUND',
    text: 'Track the complete hole without bouncing between screens.',
  },
  {
    title: 'LEARN YOUR GAME',
    text: 'Track clubs, shots, practice, routines and preparation.',
  },
  {
    title: 'KEEP IT SIMPLE',
    text: 'Less screen time. More attention on the shot in front of you.',
  },
];

const WARMUP_STEPS = [
  { title: 'LOOSEN UP', text: '2â€“3 minutes. Easy shoulder turns, hip rotations and gentle swings. Start at about 50% effort and let the body loosen naturally.' },
  { title: 'SHORT WEDGES', text: 'Hit 6â€“8 short wedges. Begin with half swings, find centred contact and a consistent landing point, then build the length gradually.' },
  { title: 'MID IRONS', text: 'Hit 5â€“6 mid irons at normal rhythm. Check strike, start line and balance. Do not chase technical changes before the round.' },
  { title: 'LONG CLUB', text: 'Hit 4â€“5 long irons, hybrids or fairway woods. Build to normal speed, confirm your stock flight and finish in balance.' },
  { title: 'DRIVER', text: 'Hit 4â€“6 committed drives. Start at controlled speed, then reach normal playing speed. Finish by rehearsing the first-tee shot you intend to play.' },
  { title: 'CHIPPING', text: 'Hit 6â€“10 chips from at least two lies. Pick landing spots, vary trajectory and confirm how the ball is reacting on the day.' },
  { title: 'PUTTING', text: 'Start with short putts for start line, then 4â€“6 long putts for pace. Finish with a few putts you expect to hole.' },
  { title: 'READY', text: 'Warm-up complete. Confirm the first-hole plan, take one normal pre-shot routine and go to the tee with the swing you brought today.' },
];

const createDefaultPar = (holeNumber) => {
  if ([3, 6, 12, 16].includes(holeNumber)) {
    return 3;
  }

  if ([2, 8, 13, 18].includes(holeNumber)) {
    return 5;
  }

  return 4;
};

const createCourseHole = (holeNumber) => ({
  hole: holeNumber,
  par: createDefaultPar(holeNumber),
  distance: '',
  strokeIndex: '',
  front: '',
  centre: '',
  back: '',
});

const createCourseHoles = () =>
  Array.from({ length: 18 }, (_, index) =>
    createCourseHole(index + 1)
  );

const createEmptyHole = (
  holeNumber,
  par = createDefaultPar(holeNumber)
) => ({
  hole: holeNumber,
  par,
  score: '',
  putts: '',
  gir: '',
  fairway: '',
  clubsUsed: [],
  shots: [],
  notes: '',
});

const createEmptyScorecard = (courseHoles = createCourseHoles()) =>
  courseHoles.map((hole) =>
    createEmptyHole(hole.hole, hole.par)
  );

/*
FOUR PLAYER SCORECARD

P1 = Tour Pro Elite owner.
The TPE owner manually enters the scores for the whole group.
Score entry is deliberately NOT controlled by voice.
*/
const createGroupScores = () =>
  Array.from({ length: 18 }, (_, index) => ({
    hole: index + 1,
    p2: '',
    p3: '',
    p4: '',
  }));

const DEFAULT_GROUP_PLAYERS = [
  { id: 'p1', name: 'Player 1', handicap: '' },
  { id: 'p2', name: 'Player 2', handicap: '' },
  { id: 'p3', name: 'Player 3', handicap: '' },
  { id: 'p4', name: 'Player 4', handicap: '' },
];

const getTodayDate = () => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `${day}/${month}/${year}`;
};

const normaliseCourseKey = (courseName, teeType, teeColour) =>
  `${String(courseName || '').trim().toLowerCase()}|${teeType || ''}|${teeColour || ''}`;

const clubAliases = [
  { name: 'Driver', patterns: ['driver'] },
  { name: '3 Wood', patterns: ['3 wood', '3wood', 'three wood'] },
  { name: '5 Wood', patterns: ['5 wood', '5wood', 'five wood'] },
  { name: '4 Iron', patterns: ['4 iron', '4iron', 'four iron'] },
  { name: '5 Iron', patterns: ['5 iron', '5iron', 'five iron'] },
  { name: '6 Iron', patterns: ['6 iron', '6iron', 'six iron'] },
  { name: '7 Iron', patterns: ['7 iron', '7iron', 'seven iron'] },
  { name: '8 Iron', patterns: ['8 iron', '8iron', 'eight iron'] },
  { name: '9 Iron', patterns: ['9 iron', '9iron', 'nine iron'] },
  {
    name: 'Pitching Wedge',
    patterns: ['pitching wedge', 'pw'],
  },
  {
    name: 'Gap Wedge',
    patterns: ['gap wedge', 'gw'],
  },
  {
    name: 'Sand Wedge',
    patterns: ['sand wedge', 'sw'],
  },
  {
    name: 'Lob Wedge',
    patterns: ['lob wedge', 'lw'],
  },
  {
    name: 'Putter',
    patterns: ['putter'],
  },
];

const NUMBER_WORDS = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const wordsToNumber = (spokenText) => {
  if (!spokenText) {
    return null;
  }

  const direct = String(spokenText).match(/\d+/);

  if (direct) {
    return Number(direct[0]);
  }

  const words = String(spokenText)
    .toLowerCase()
    .replace(/-/g, ' ')
    .split(/\s+/);

  let current = 0;
  let found = false;

  for (const word of words) {
    if (word === 'and') {
      continue;
    }

    if (word === 'hundred') {
      current = Math.max(1, current) * 100;
      found = true;
      continue;
    }

    if (NUMBER_WORDS[word] !== undefined) {
      current += NUMBER_WORDS[word];
      found = true;
      continue;
    }

    if (found) {
      break;
    }
  }

  return found ? current : null;
};

const numberAfterPhrase = (text, phrases) => {
  const lower = String(text || '').toLowerCase();

  for (const phrase of phrases) {
    const index = lower.indexOf(phrase);

    if (index >= 0) {
      const tail = lower.slice(index + phrase.length).trim();
      return wordsToNumber(tail);
    }
  }

  return null;
};

const findClubInSpeech = (text) => {
  const lower = String(text || '').toLowerCase();

  for (const club of clubAliases) {
    for (const pattern of club.patterns) {
      if (lower.includes(pattern)) {
        return club.name;
      }
    }
  }

  return null;
};

export default function App() {
  const [entryStage, setEntryStage] = useState('SPLASH');
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  const [authMode, setAuthMode] = useState('LOGIN');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [profileName, setProfileName] = useState('');
  const authEmailRef = useRef(null);
  const authPasswordRef = useRef(null);
  const authConfirmPasswordRef = useRef(null);

  const [page, setPage] = useState('HOME');
  const [unitMode, setUnitMode] = useState('metres');
  const [infoMode, setInfoMode] = useState('AMATEUR');
  const [bunkerPinDistance, setBunkerPinDistance] = useState('');

  const [clubs, setClubs] = useState(STARTING_CLUBS);
  const [carryDrafts, setCarryDrafts] = useState({});
  const [clubSavedId, setClubSavedId] = useState('');

  const [distanceYards, setDistanceYards] = useState(150);
  const [windMph, setWindMph] = useState(8);
  const [windDirection, setWindDirection] = useState('headwind');
  const [ballLie, setBallLie] = useState('fairway');
  const [chosenClubId, setChosenClubId] = useState(null);

  const [courseName, setCourseName] = useState('');
  const [teeType, setTeeType] = useState('');
  const [teeColour, setTeeColour] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [courseHoles, setCourseHoles] = useState(createCourseHoles());
  const [courseProfiles, setCourseProfiles] = useState([]);
  const [courseCardStatus, setCourseCardStatus] = useState('');

  const [temperatureC, setTemperatureC] = useState(22);
  const [groundCondition, setGroundCondition] = useState('normal');
  const [surfaceCondition, setSurfaceCondition] = useState('dry');
  const [elevationCondition, setElevationCondition] = useState('level');

  const [scorecard, setScorecard] = useState(createEmptyScorecard());
  const [currentHole, setCurrentHole] = useState(1);
  const [savedRounds, setSavedRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);

  const [groupPlayers, setGroupPlayers] =
    useState(DEFAULT_GROUP_PLAYERS);
  const [groupScores, setGroupScores] =
    useState(createGroupScores());

  const [quickEntry, setQuickEntry] = useState('');

  const [shotClub, setShotClub] = useState('Driver');
  const [shotDistance, setShotDistance] = useState('');
  const [shotLie, setShotLie] = useState('fairway');
  const [shotResult, setShotResult] = useState('GOOD');
  const [showShotDetail, setShowShotDetail] = useState(false);

  const [trackClub, setTrackClub] = useState('Driver');
  const [trackDistance, setTrackDistance] = useState('');
  const [trackLie, setTrackLie] = useState('fairway');
  const [trackResult, setTrackResult] = useState('GOOD');
  const [trackedShots, setTrackedShots] = useState([]);

  /*
  PROFESSIONAL PRACTICE
  */
  const [practiceType, setPracticeType] = useState('WEDGES');
  const [practiceClub, setPracticeClub] =
    useState('Pitching Wedge');
  const [practiceTargetDistance, setPracticeTargetDistance] =
    useState('');
  const [practiceShotShape, setPracticeShotShape] =
    useState('STRAIGHT');
  const [practiceBalls, setPracticeBalls] = useState('20');
  const [practiceGoodShots, setPracticeGoodShots] = useState(0);
  const [practiceLeftMisses, setPracticeLeftMisses] = useState(0);
  const [practiceRightMisses, setPracticeRightMisses] = useState(0);
  const [practiceShortMisses, setPracticeShortMisses] = useState(0);
  const [practiceLongMisses, setPracticeLongMisses] = useState(0);
  const [practiceQuality, setPracticeQuality] = useState('GOOD');
  const [practiceNote, setPracticeNote] = useState('');
  const [practiceHistory, setPracticeHistory] = useState([]);

  const [warmupStep, setWarmupStep] = useState(0);

  const [routineSection, setRoutineSection] = useState('PRE');
  const [routineSteps, setRoutineSteps] = useState(['', '', '', '', '', '']);

  const [practiceThinStrikes, setPracticeThinStrikes] = useState(0);
  const [practiceToppedStrikes, setPracticeToppedStrikes] = useState(0);
  const [practiceHeavyStrikes, setPracticeHeavyStrikes] = useState(0);

  const [routineChecks, setRoutineChecks] = useState({
    target: false,
    lie: false,
    club: false,
    picture: false,
    commit: false,
    breathe: false,
    reset: false,
    next: false,
  });

  const [practiceActive, setPracticeActive] = useState(false);

  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState('OFF');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceLastCommand, setVoiceLastCommand] = useState('');
  const [voiceResponse, setVoiceResponse] =
    useState('Caddie ready.');
  const [voiceStatus, setVoiceStatus] = useState('VOICE READY');

  const voiceModeRef = useRef('OFF');
  const voiceSpeakingRef = useRef(false);
  const restartTimerRef = useRef(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  useEffect(
    () => () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }

      Speech.stop();

      try {
        ExpoSpeechRecognitionModule.abort();
      } catch (error) {
        // Recognition may already be stopped.
      }
    },
    []
  );

  useSpeechRecognitionEvent('start', () => {
    setVoiceListening(true);
    setVoiceStatus('LISTENING');
  });

  useSpeechRecognitionEvent('end', () => {
    setVoiceListening(false);

    if (
      voiceModeRef.current !== 'OFF' &&
      !voiceSpeakingRef.current
    ) {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }

      restartTimerRef.current = setTimeout(() => {
        startRecognitionOnly();
      }, 650);
    } else if (voiceModeRef.current === 'OFF') {
      setVoiceStatus('VOICE READY');
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript || '';

    if (!transcript) {
      return;
    }

    setVoiceTranscript(transcript);

    if (event.isFinal) {
      setVoiceLastCommand(transcript);
      processVoiceCommand(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setVoiceListening(false);

    const code = event?.error || '';

    if (code === 'aborted' || code === 'no-speech') {
      return;
    }

    setVoiceStatus(
      `VOICE: ${event?.message || code || 'ERROR'}`
    );
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const main = await AsyncStorage.getItem(STORAGE_MAIN);
        const rounds = await AsyncStorage.getItem(STORAGE_ROUNDS);
        const shots = await AsyncStorage.getItem(STORAGE_SHOTS);
        const practice = await AsyncStorage.getItem(STORAGE_PRACTICE);
        const routines = await AsyncStorage.getItem(STORAGE_ROUTINES);
        const onboarding = await AsyncStorage.getItem(
          STORAGE_ONBOARDING
        );
        const session = await AsyncStorage.getItem(STORAGE_SESSION);
        const profile = await AsyncStorage.getItem(STORAGE_PROFILE);
        const savedActiveRound = await AsyncStorage.getItem(
          STORAGE_ACTIVE_ROUND
        );
        const savedCourses = await AsyncStorage.getItem(
          STORAGE_COURSES
        );

        if (main) {
          const parsed = JSON.parse(main);

          if (parsed.unitMode) {
            setUnitMode(parsed.unitMode);
          }

          if (parsed.infoMode) {
            setInfoMode(parsed.infoMode === 'ADVANCED' ? 'PRO' : parsed.infoMode === 'STANDARD' ? 'AMATEUR' : parsed.infoMode);
          }

          if (Array.isArray(parsed.clubs)) {
            const migratedClubs = parsed.clubs.map((club) => ({
              ...club,
              shortName:
                club.shortName ||
                STARTING_CLUBS.find(
                  (item) => item.id === club.id
                )?.shortName ||
                club.name,
            }));

            setClubs(migratedClubs);
          }

          if (parsed.courseName !== undefined) {
            setCourseName(parsed.courseName);
          }

          if (parsed.teeType !== undefined) {
            setTeeType(parsed.teeType);
          }

          if (parsed.teeColour !== undefined) {
            setTeeColour(parsed.teeColour);
          }

          if (parsed.roundDate !== undefined) {
            setRoundDate(parsed.roundDate);
          }

          if (
            Array.isArray(parsed.courseHoles) &&
            parsed.courseHoles.length === 18
          ) {
            const migratedCourseHoles =
              parsed.courseHoles.map((hole, index) => ({
                ...createCourseHole(index + 1),
                ...hole,
                distance:
                  hole.distance !== undefined
                    ? String(hole.distance)
                    : '',
                strokeIndex:
                  hole.strokeIndex !== undefined
                    ? String(hole.strokeIndex)
                    : '',
              }));

            setCourseHoles(migratedCourseHoles);
          }

          if (
            Array.isArray(parsed.scorecard) &&
            parsed.scorecard.length === 18
          ) {
            const migratedScorecard =
              parsed.scorecard.map((hole) => ({
                ...hole,
                clubsUsed: Array.isArray(hole.clubsUsed)
                  ? hole.clubsUsed
                  : hole.club
                  ? [hole.club]
                  : [],
                shots: Array.isArray(hole.shots)
                  ? hole.shots
                  : [],
              }));

            setScorecard(migratedScorecard);
          }

          if (
            Array.isArray(parsed.groupPlayers) &&
            parsed.groupPlayers.length === 4
          ) {
            setGroupPlayers(
              DEFAULT_GROUP_PLAYERS.map((fallback, index) => ({
                ...fallback,
                ...(parsed.groupPlayers[index] || {}),
                name: String(
                  parsed.groupPlayers[index]?.name ||
                    fallback.name
                ),
                handicap: String(
                  parsed.groupPlayers[index]?.handicap ?? ''
                ),
              }))
            );
          }

          if (
            Array.isArray(parsed.groupScores) &&
            parsed.groupScores.length === 18
          ) {
            setGroupScores(
              createGroupScores().map((fallback, index) => ({
                ...fallback,
                ...(parsed.groupScores[index] || {}),
                p2: String(
                  parsed.groupScores[index]?.p2 ?? ''
                ),
                p3: String(
                  parsed.groupScores[index]?.p3 ?? ''
                ),
                p4: String(
                  parsed.groupScores[index]?.p4 ?? ''
                ),
              }))
            );
          }

          if (typeof parsed.temperatureC === 'number') {
            setTemperatureC(parsed.temperatureC);
          }

          if (parsed.groundCondition) {
            setGroundCondition(parsed.groundCondition);
          }

          if (parsed.surfaceCondition) {
            setSurfaceCondition(parsed.surfaceCondition);
          }

          if (parsed.elevationCondition) {
            setElevationCondition(parsed.elevationCondition);
          }
        }

        if (rounds) {
          const parsed = JSON.parse(rounds);

          if (Array.isArray(parsed)) {
            setSavedRounds(parsed);
          }
        }

        if (shots) {
          const parsed = JSON.parse(shots);

          if (Array.isArray(parsed)) {
            setTrackedShots(parsed);
          }
        }

        if (practice) {
          const parsed = JSON.parse(practice);

          if (Array.isArray(parsed)) {
            setPracticeHistory(parsed);
          }
        }

        if (routines) {
          const parsed = JSON.parse(routines);

          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.steps)) {
              setRoutineSteps([...parsed.steps.slice(0, 6), '', '', '', '', '', ''].slice(0, 6));
            } else {
              setRoutineChecks(parsed);
            }
          }
        }

        if (profile) {
          const parsed = JSON.parse(profile);

          if (parsed.firstName) {
            setProfileName(parsed.firstName);
            setAuthFirstName(parsed.firstName);
          }

          if (parsed.email) {
            setAuthEmail(parsed.email);
          }
        }

        if (savedActiveRound) {
          const parsed = JSON.parse(savedActiveRound);

          if (parsed && parsed.id) {
            setActiveRound(parsed);

            if (parsed.currentHole) {
              setCurrentHole(parsed.currentHole);
            }
          }
        }

        if (savedCourses) {
          const parsed = JSON.parse(savedCourses);

          if (Array.isArray(parsed)) {
            const migratedCourses = parsed.map((profile) => ({
              ...profile,
              holes: Array.isArray(profile.holes)
                ? profile.holes.map((hole, index) => ({
                    ...createCourseHole(index + 1),
                    ...hole,
                    distance:
                      hole.distance !== undefined
                        ? String(hole.distance)
                        : '',
                    strokeIndex:
                      hole.strokeIndex !== undefined
                        ? String(hole.strokeIndex)
                        : '',
                  }))
                : createCourseHoles(),
            }));

            setCourseProfiles(migratedCourses);
          }
        }

        setTimeout(() => {
          if (session === 'logged-in') {
            setEntryStage('APP');
          } else if (onboarding === 'complete') {
            setEntryStage('AUTH');
          } else {
            setEntryStage('ONBOARDING');
          }
        }, 1200);
      } catch (error) {
        console.log('Load error', error);

        setTimeout(() => {
          setEntryStage('ONBOARDING');
        }, 1200);
      } finally {
        setLoaded(true);
      }
    };

    loadAll();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const saveMain = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_MAIN,
          JSON.stringify({
            unitMode,
            infoMode,
            clubs,
            courseName,
            teeType,
            teeColour,
            roundDate,
            courseHoles,
            scorecard,
            groupPlayers,
            groupScores,
            temperatureC,
            groundCondition,
            surfaceCondition,
            elevationCondition,
          })
        );
      } catch (error) {
        console.log('Save error', error);
      }
    };

    saveMain();
  }, [
    loaded,
    unitMode,
    infoMode,
    clubs,
    courseName,
    teeType,
    teeColour,
    roundDate,
    courseHoles,
    scorecard,
    groupPlayers,
    groupScores,
    temperatureC,
    groundCondition,
    surfaceCondition,
    elevationCondition,
  ]);useEffect(() => {
if (!loaded) {
return;
}

const saveActiveRound = async () => {
try {
if (!activeRound) {
await AsyncStorage.removeItem(STORAGE_ACTIVE_ROUND);
return;
}

const updated = {
...activeRound,
currentHole,
courseName,
teeType,
teeColour,
roundDate,
};

await AsyncStorage.setItem(
STORAGE_ACTIVE_ROUND,
JSON.stringify(updated)
);
} catch (error) {
console.log('Active round save error', error);
}
};

saveActiveRound();
}, [
loaded,
activeRound,
currentHole,
courseName,
teeType,
teeColour,
roundDate,
]);

const roundedWindMph = Math.round(windMph);
const windKmh = Math.round(windMph * KMH_PER_MPH);

let windAdjustmentYards = 0;

if (windDirection === 'headwind') {
windAdjustmentYards = windMph * 0.75;
}

if (windDirection === 'tailwind') {
windAdjustmentYards = windMph * -0.75;
}

if (elevationCondition === 'uphill') {
windAdjustmentYards += distanceYards * 0.05;
}

if (elevationCondition === 'downhill') {
windAdjustmentYards -= distanceYards * 0.05;
}

const playsLikeYards = Math.max(
1,
distanceYards + windAdjustmentYards
);

const playableClubs = useMemo(
() =>
clubs.filter(
(club) =>
club.id !== 'putter' &&
club.carryYards > 0
),
[clubs]
);

const sortedClubs = useMemo(
() =>
[...playableClubs].sort(
(a, b) => b.carryYards - a.carryYards
),
[playableClubs]
);

const normalClub = useMemo(() => {
if (!sortedClubs.length) {
return STARTING_CLUBS[0];
}

return sortedClubs.reduce(
(best, club) => {
const bestDifference = Math.abs(
best.carryYards - playsLikeYards
);

const clubDifference = Math.abs(
club.carryYards - playsLikeYards
);

return clubDifference < bestDifference
? club
: best;
},
sortedClubs[0]
);
}, [sortedClubs, playsLikeYards]);

let recommendedClub = normalClub;

const normalClubIndex = sortedClubs.findIndex(
(club) => club.id === normalClub.id
);

if (
['rough', 'deepRough'].includes(ballLie) &&
normalClubIndex > 0
) {
recommendedClub = sortedClubs[normalClubIndex - 1];
}

if (ballLie === 'greensideBunker') {
recommendedClub =
clubs.find((club) => club.id === 'sw') || normalClub;
}

const chosenClub = chosenClubId
? clubs.find((club) => club.id === chosenClubId)
: null;

const actualClub = chosenClub || recommendedClub;

const currentHoleData =
scorecard[currentHole - 1] ||
createEmptyHole(currentHole);

const currentCourseHole =
courseHoles[currentHole - 1] ||
createCourseHole(currentHole);

const completedHoles = scorecard.filter(
(hole) => hole.score !== ''
);

const totalScore = completedHoles.reduce(
(total, hole) =>
total + Number(hole.score || 0),
0
);

const totalPar = completedHoles.reduce(
(total, hole) =>
total + Number(hole.par || 0),
0
);

const totalPutts = scorecard.reduce(
(total, hole) =>
total + Number(hole.putts || 0),
0
);

const courseParTotal = courseHoles.reduce(
(total, hole) =>
total + Number(hole.par || 0),
0
);

const courseDistanceTotal = courseHoles.reduce(
(total, hole) =>
total + Number(hole.distance || 0),
0
);

const scoreToPar = totalScore - totalPar;

/*
PRACTICE CALCULATIONS
*/
const practiceMisses =
practiceLeftMisses +
practiceRightMisses +
practiceShortMisses +
practiceLongMisses +
practiceThinStrikes +
practiceToppedStrikes +
practiceHeavyStrikes;

const practiceShotsRecorded =
practiceGoodShots +
practiceMisses;

const practiceSuccess =
practiceShotsRecorded > 0
? Math.round(
(practiceGoodShots /
practiceShotsRecorded) *
100
)
: 0;

const formatDistance = (yards) => {
const y = Math.round(yards);
const m = Math.round(yards * METRES_PER_YARD);

return unitMode === 'metres'
? `${m} M / ${y} Yds`
: `${y} Yds / ${m} M`;
};

const primaryDistance = (yards) =>
unitMode === 'metres'
? Math.round(yards * METRES_PER_YARD)
: Math.round(yards);

const primaryLabel = () =>
unitMode === 'metres'
? 'M'
: 'YDS';

const toParText = () => {
if (!completedHoles.length) {
return 'E';
}

if (scoreToPar === 0) {
return 'E';
}

if (scoreToPar > 0) {
return `+${scoreToPar}`;
}

return String(scoreToPar);
};

const stopRecognitionOnly = () => {
if (restartTimerRef.current) {
clearTimeout(restartTimerRef.current);
restartTimerRef.current = null;
}

try {
ExpoSpeechRecognitionModule.stop();
} catch (error) {
// Safe fallback if recognition is already stopped.
}
};

const startRecognitionOnly = async () => {
if (voiceSpeakingRef.current || voiceModeRef.current === 'OFF') {
return;
}

try {
const permission =
await ExpoSpeechRecognitionModule.requestPermissionsAsync();

if (!permission?.granted) {
setVoiceMode('OFF');
voiceModeRef.current = 'OFF';
setVoiceStatus('MICROPHONE PERMISSION NEEDED');

Alert.alert(
'Microphone permission',
'Allow microphone and speech recognition so the Caddie can hear you.'
);

return;
}

ExpoSpeechRecognitionModule.start({
lang: getDeviceSpeechLocale(),
interimResults: true,
continuous: false,
});
} catch (error) {
setVoiceStatus('VOICE START ERROR');
console.log('Voice start error', error);
}
};

const speakCaddie = (message, restart = true) => {
const cleanMessage =
String(message || '').trim();

if (!cleanMessage) {
return;
}

setVoiceResponse(cleanMessage);
setVoiceStatus('SPEAKING');
voiceSpeakingRef.current = true;

stopRecognitionOnly();
Speech.stop();

Speech.speak(cleanMessage, {
language: getDeviceSpeechLocale(),
rate: 0.92,
pitch: 1,
onDone: () => {
voiceSpeakingRef.current = false;

if (
restart &&
voiceModeRef.current !== 'OFF'
) {
setVoiceStatus('LISTENING');

setTimeout(() => {
startRecognitionOnly();
}, 450);
} else {
setVoiceStatus('VOICE READY');
}
},
onStopped: () => {
voiceSpeakingRef.current = false;
},
onError: () => {
voiceSpeakingRef.current = false;
setVoiceStatus('SPEECH ERROR');
},
});
};

const startVoiceMode = async (mode) => {
const nextMode =
mode === 'PRACTICE'
? 'PRACTICE'
: 'ROUND';

setVoiceMode(nextMode);
voiceModeRef.current = nextMode;
setVoiceStatus('STARTING VOICE');

setVoiceResponse(
nextMode === 'PRACTICE'
? 'Practice voice is ready. Describe the shot normally and I will record the result.'
: 'Caddie voice is ready. Tell me the shot in normal golf language.'
);

await startRecognitionOnly();
};

const stopVoiceMode = () => {
setVoiceMode('OFF');
voiceModeRef.current = 'OFF';
setVoiceListening(false);
setVoiceStatus('VOICE READY');

stopRecognitionOnly();
Speech.stop();
};

const caddieVoiceCall = () => {
if (ballLie === 'water') {
return 'Take relief first, then give me the new distance and lie.';
}

const number = primaryDistance(playsLikeYards);
const actualNumber = primaryDistance(distanceYards);
const unitWord = unitMode === 'metres' ? 'metres' : 'yards';

if (ballLie === 'greensideBunker') {
const pin = Number(bunkerPinDistance);
if (!pin) return 'Greenside bunker. Give me the distance to the pin.';
const pinUnit = unitMode === 'metres' ? 'metres' : 'yards';
let shot = 'standard splash';
let cue = 'Commit to the sand and keep the speed through.';
if (pin <= 10) { shot = 'high soft splash'; cue = 'Use the loft and land it softly.'; }
else if (pin >= 25) { shot = 'long bunker shot'; cue = 'Use less loft and carry it farther onto the green.'; }
return `${shot}. ${pin} ${pinUnit} to the pin. ${cue}`;
}

if (infoMode === 'AMATEUR') {
let aim = '';
if (windDirection === 'leftToRight') aim = ' Aim a little left.';
if (windDirection === 'rightToLeft') aim = ' Aim a little right.';
return `${number} ${unitWord}. ${recommendedClub.name}.${aim}`;
}

let lieAdvice = 'Normal strike.';
if (ballLie === 'fairwayBunker') lieAdvice = 'Ball first and clear the lip.';
if (ballLie === 'deepRough') lieAdvice = 'Prioritise solid contact and the safer recovery.';
if (ballLie === 'rough') lieAdvice = 'Allow for the lie and prioritise contact.';
return `${recommendedClub.name}. ${actualNumber} actual, playing ${number} ${unitWord}. ${getWindLabel()}. ${getLieLabel()}. ${lieAdvice}`;
};
const processVoiceCommand = async (spoken) => {
const text =
String(spoken || '')
.toLowerCase()
.trim();

if (!text) {
return;
}

if (
text.includes('stop listening') ||
text.includes('voice off') ||
text === 'stop voice'
) {
setVoiceResponse('Voice stopped.');
stopVoiceMode();
return;
}

if (voiceModeRef.current === 'PRACTICE') {
const hasAny = (terms) => terms.some((term) => text.includes(term));

if (hasAny(['reset counters', 'clear counters'])) {
resetPracticeCounters();
speakCaddie('Practice counters reset.', true);
return;
}

if (hasAny(['save practice', 'save session'])) {
await savePractice();
return;
}

const spokenPracticeClub = findClubInSpeech(text);
if (spokenPracticeClub) {
  const matchingClub = clubs.find((club) => (club.shortName || club.name) === spokenPracticeClub || club.name === spokenPracticeClub);
  if (matchingClub) setPracticeClub(matchingClub.name);
}
const ballsMatch = text.match(/\b(\d{1,3})\s*(?:balls?|shots?)\b/);
if (ballsMatch) setPracticeBalls(String(ballsMatch[1]));
const countFor = (terms) => {
  for (const term of terms) {
    const match = text.match(new RegExp(`\\b(\\d{1,3})\\s+(?:\\w+\\s+){0,1}${term}\\b`));
    if (match) return Number(match[1]);
  }
  return 0;
};
const pureCount = countFor(['pure', 'good', 'great', 'flushed', 'solid', 'sweet', 'perfect', 'ok']);
const thinCount = countFor(['thin', 'thinned']);
const toppedCount = countFor(['topped', 'top']);
const heavyCount = countFor(['fat', 'heavy', 'chunked', 'duffed']);
const leftCount = countFor(['left', 'hooked', 'hook', 'pulled', 'pull']);
const rightCount = countFor(['right', 'slice', 'sliced', 'pushed', 'push', 'blocked', 'block']);
const shortCount = countFor(['short']);
const longCount = countFor(['long']);
const aggregateCount = pureCount + thinCount + toppedCount + heavyCount + leftCount + rightCount + shortCount + longCount;
if (aggregateCount > 0) {
  if (pureCount) setPracticeGoodShots((value) => value + pureCount);
  if (thinCount) setPracticeThinStrikes((value) => value + thinCount);
  if (toppedCount) setPracticeToppedStrikes((value) => value + toppedCount);
  if (heavyCount) setPracticeHeavyStrikes((value) => value + heavyCount);
  if (leftCount) setPracticeLeftMisses((value) => value + leftCount);
  if (rightCount) setPracticeRightMisses((value) => value + rightCount);
  if (shortCount) setPracticeShortMisses((value) => value + shortCount);
  if (longCount) setPracticeLongMisses((value) => value + longCount);
  speakCaddie(`${aggregateCount} practice results recorded.`, true);
  return;
}

if (hasAny(['hook', 'pulled', 'pull ', 'overdraw', 'turned it over', 'left'])) {
setPracticeLeftMisses((value) => value + 1);
speakCaddie(hasAny(['hook', 'overdraw', 'turned it over']) ? 'Hook recorded.' : 'Left miss recorded.', true);
return;
}

if (hasAny(['slice', 'push', 'pushed', 'block', 'blocked', 'right'])) {
setPracticeRightMisses((value) => value + 1);
speakCaddie(text.includes('slice') ? 'Slice recorded.' : hasAny(['block', 'blocked']) ? 'Block recorded.' : 'Right miss recorded.', true);
return;
}

if (hasAny(['short', 'came up short', 'under club', 'underclub'])) {
setPracticeShortMisses((value) => value + 1);
speakCaddie('Short recorded.', true);
return;
}

if (hasAny(['long', 'flew the green', 'over the green', 'too much club'])) {
setPracticeLongMisses((value) => value + 1);
speakCaddie('Long recorded.', true);
return;
}

if (hasAny(['good', 'great', 'pure', 'flushed', 'solid', 'sweet', 'nailed', 'smoked', 'perfect'])) {
setPracticeGoodShots((value) => value + 1);
speakCaddie(hasAny(['pure', 'flushed', 'sweet']) ? 'Pure strike recorded.' : 'Good shot recorded.', true);
return;
}

if (hasAny(['thin', 'thinned'])) { setPracticeThinStrikes((value) => value + 1); speakCaddie('Thin recorded.', true); return; }
if (hasAny(['topped', 'top'])) { setPracticeToppedStrikes((value) => value + 1); speakCaddie('Topped recorded.', true); return; }
if (hasAny(['fat', 'heavy', 'chunked', 'duffed'])) { setPracticeHeavyStrikes((value) => value + 1); speakCaddie('Heavy strike recorded.', true); return; }
if (hasAny(['toe', 'heel'])) { speakCaddie('Strike noted.', true); return; }

speakCaddie(
'I heard you, but I could not classify the shot. Say it naturally: hook, slice, pull, push, block, short, long, pure, thin or heavy.',
true
);

return;
}

const normalisedSpoken = text.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const spokenCourse = courseProfiles.find((profile) => {
  const course = String(profile.courseName || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  return course && (normalisedSpoken.includes(course) || course.includes(normalisedSpoken));
});

if (spokenCourse) {
  setCourseName(spokenCourse.courseName);
  setTeeType(spokenCourse.teeType || '');
  setTeeColour(spokenCourse.teeColour || '');
  setCourseHoles(spokenCourse.holes.map((hole, index) => ({
    ...createCourseHole(index + 1), ...hole,
    distance: hole.distance !== undefined ? String(hole.distance) : '',
  })));
  setScorecard((previous) => spokenCourse.holes.map((hole, index) => ({
    ...createEmptyHole(index + 1, hole.par), ...(previous[index] || {}), hole: index + 1, par: hole.par,
  })));
  setCourseCardStatus('Course loaded by Caddie.');
  speakCaddie(`${spokenCourse.courseName} loaded.`, true);
  return;
}

const holeNumber =
numberAfterPhrase(
text,
['hole']
);

if (
holeNumber !== null &&
holeNumber >= 1 &&
holeNumber <= 18
) {
setLiveHole(holeNumber);

speakCaddie(
`Hole ${holeNumber}.`,
true
);

return;
}

const puttNumber =
numberAfterPhrase(
text,
['putts', 'putt']
);

if (
puttNumber !== null &&
puttNumber >= 0 &&
puttNumber <= 10
) {
updateHole(
'putts',
String(puttNumber)
);

speakCaddie(
`${puttNumber} putts recorded.`,
true
);

return;
}

if (
text.includes('gir yes') ||
text.includes('green in regulation')
) {
updateHole('gir', 'YES');

speakCaddie(
'G I R yes.',
true
);

return;
}

if (
text.includes('gir no') ||
text.includes('missed green')
) {
updateHole('gir', 'NO');

speakCaddie(
'G I R no.',
true
);

return;
}

if (
text.includes('fairway hit') ||
text.includes('hit fairway')
) {
updateHole(
'fairway',
'HIT'
);

speakCaddie(
'Fairway hit.',
true
);

return;
}

if (text.includes('fairway left')) {
updateHole(
'fairway',
'LEFT'
);

speakCaddie(
'Fairway left.',
true
);

return;
}

if (text.includes('fairway right')) {
updateHole(
'fairway',
'RIGHT'
);

speakCaddie(
'Fairway right.',
true
);

return;
}

const bunkerPinNumber =
numberAfterPhrase(text, ['to the pin', 'pin', 'flag']);

if (
ballLie === 'greensideBunker' &&
bunkerPinNumber !== null &&
bunkerPinNumber >= 1 &&
bunkerPinNumber <= 100
) {
setBunkerPinDistance(String(bunkerPinNumber));
speakCaddie(
`Pin ${bunkerPinNumber} ${unitMode === 'metres' ? 'metres' : 'yards'} recorded. Ask for the bunker shot when ready.`,
true
);
return;
}

let distanceNumber =
numberAfterPhrase(
text,
[
'distance',
'yardage',
'range',
'to the green',
'from the green',
'to green',
'out from the green',
'out',
'to the pin',
]
);

if (distanceNumber === null && /(metres|meters|yards|out|green|pin|flag)/.test(text)) {
  const firstNumber = text.match(/\b(\d{2,3})\b/);
  distanceNumber = firstNumber ? Number(firstNumber[1]) : null;
}

if (
distanceNumber !== null &&
distanceNumber >= 1 &&
distanceNumber <= 700
) {
const yards =
unitMode === 'metres'
? distanceNumber / METRES_PER_YARD
: distanceNumber;

setDistanceYards(yards);
setChosenClubId(null);

speakCaddie(
`Distance ${distanceNumber} ${
unitMode === 'metres'
? 'metres'
: 'yards'
}.`,
true
);

return;
}

const windNumber =
numberAfterPhrase(
text,
['wind']
);

if (
windNumber !== null &&
windNumber >= 0 &&
windNumber <= 100
) {
const mph =
unitMode === 'metres'
? windNumber / KMH_PER_MPH
: windNumber;

setWindMph(
Math.max(
0,
Math.min(40, mph)
)
);

speakCaddie(
`Wind ${windNumber} ${
unitMode === 'metres'
? 'kilometres per hour'
: 'miles per hour'
}.`,
true
);

return;
}

if (
text.includes('headwind') ||
text.includes('wind in')
) {
setWindDirection('headwind');
setChosenClubId(null);

speakCaddie(
'Headwind.',
true
);

return;
}

if (
text.includes('tailwind') ||
text.includes('wind behind')
) {
setWindDirection('tailwind');
setChosenClubId(null);

speakCaddie(
'Tailwind.',
true
);

return;
}

if (text.includes('left to right') || text.includes('left-to-right') || text.includes('wins left to right')) {
setWindDirection('leftToRight');
setChosenClubId(null);

speakCaddie(
'Wind left to right.',
true
);

return;
}

if (text.includes('right to left') || text.includes('right-to-left') || text.includes('wins right to left')) {
setWindDirection('rightToLeft');
setChosenClubId(null);

speakCaddie(
'Wind right to left.',
true
);

return;
}

let spokenLie = null;

if (
text.includes('greenside bunker') ||
text.includes('green side bunker')
) {
spokenLie = 'greensideBunker';
} else if (
text.includes('fairway bunker')
) {
spokenLie = 'fairwayBunker';
} else if (
text.includes('deep rough')
) {
spokenLie = 'deepRough';
} else if (
text.includes('rough')
) {
spokenLie = 'rough';
} else if (
text.includes('water')
) {
spokenLie = 'water';
} else if (
text.includes('fairway')
) {
spokenLie = 'fairway';
} else if (
text.includes('tee')
) {
spokenLie = 'tee';
}

if (spokenLie) {
setBallLie(spokenLie);
setChosenClubId(null);

speakCaddie(
`Lie ${
spokenLie === 'deepRough'
? 'deep rough'
: spokenLie.replace(
'Bunker',
' bunker'
)
}.`,
true
);

return;
}

const spokenClub =
findClubInSpeech(text);

if (
spokenClub &&
(
text.includes('used') ||
text.includes('club') ||
text.includes('hit')
)
) {
addClubToCurrentHole(
spokenClub
);

speakCaddie(
`${spokenClub} recorded.`,
true
);

return;
}

if (
text.includes('caddie') ||
text.includes('what club') ||
text.includes('club call') ||
text.includes('plays like')
) {
speakCaddie(
caddieVoiceCall(),
true
);

return;
}

if (text.includes('next hole')) {
const nextHole =
Math.min(
18,
currentHole + 1
);

setLiveHole(nextHole);

speakCaddie(
`Hole ${nextHole}.`,
true
);

return;
}

if (
text.includes('previous hole') ||
text.includes('back a hole')
) {
const previousHole =
Math.max(
1,
currentHole - 1
);

setLiveHole(previousHole);

speakCaddie(
`Hole ${previousHole}.`,
true
);

return;
}

speakCaddie(
'I heard you, but I did not understand the golf instruction. Please say the distance, wind, lie, club, pin distance or shot result again.',
true
);
};

const changePage = (nextPage) => {
Keyboard.dismiss();
setPage(nextPage);
};

const setLiveHole = (holeNumber) => {
const safeHole =
Math.max(
1,
Math.min(
18,
holeNumber
)
);

setCurrentHole(safeHole);

setActiveRound((previous) =>
previous
? {
...previous,
currentHole: safeHole,
}
: previous
);
};

const finishOnboarding = async () => {
await AsyncStorage.setItem(
STORAGE_ONBOARDING,
'complete'
);

setEntryStage('AUTH');
};

const nextOnboarding = () => {
if (
onboardingIndex <
ONBOARDING.length - 1
) {
setOnboardingIndex(
onboardingIndex + 1
);
} else {
finishOnboarding();
}
};

const switchAuthMode = (nextMode) => {
Keyboard.dismiss();

setAuthMode(nextMode);
setAuthPassword('');
setAuthConfirmPassword('');
setShowPassword(false);

if (nextMode !== 'RESET') {
setResetEmail('');
}
};

const submitAuth = async () => {
Keyboard.dismiss();

const email =
authEmail
.trim()
.toLowerCase();

const firstName =
authFirstName.trim();

if (
authMode === 'CREATE' &&
!firstName
) {
Alert.alert(
'First name required',
'Enter your first name.'
);

return;
}

if (
!email ||
!email.includes('@') ||
!email.includes('.')
) {
Alert.alert(
'Email required',
'Enter a valid email address.'
);

return;
}

if (authPassword.length < 6) {
Alert.alert(
'Password',
'Use at least 6 characters.'
);

return;
}

if (
authMode === 'CREATE' &&
authPassword !==
authConfirmPassword
) {
Alert.alert(
'Passwords do not match',
'Enter the same password twice.'
);

return;
}

if (authMode === 'CREATE') {
const profile = {
firstName,
email,
};

await AsyncStorage.setItem(
STORAGE_PROFILE,
JSON.stringify(profile)
);

setProfileName(firstName);

Alert.alert(
'Account created',
`Welcome to Tour Pro Elite, ${firstName}.`,
[
{
text: 'CONTINUE',
onPress: async () => {
await AsyncStorage.setItem(
STORAGE_SESSION,
'logged-in'
);

setAuthPassword('');
setAuthConfirmPassword('');
setEntryStage('APP');
setPage('HOME');
},
},
]
);

return;
}

await AsyncStorage.setItem(
STORAGE_SESSION,
'logged-in'
);

setAuthPassword('');
setAuthConfirmPassword('');
setEntryStage('APP');
setPage('HOME');
};

const submitReset = async () => {
Keyboard.dismiss();

const email =
resetEmail
.trim()
.toLowerCase();

if (
!email ||
!email.includes('@') ||
!email.includes('.')
) {
Alert.alert(
'Email required',
'Enter the email address used for your account.'
);

return;
}

Alert.alert(
'Reset request ready',
'In the finished app, a secure password-reset email will be sent here.',
[
{
text: 'BACK TO LOGIN',
onPress: () => {
setAuthEmail(email);
switchAuthMode('LOGIN');
},
},
]
);
};

const logout = () => {
Alert.alert(
'Sign out?',
'Your rounds, clubs and golf information stay saved.',
[
{
text: 'Cancel',
style: 'cancel',
},
{
text: 'Sign Out',
onPress: async () => {
await AsyncStorage.removeItem(
STORAGE_SESSION
);

setAuthPassword('');
setAuthConfirmPassword('');
setPage('HOME');
setEntryStage('AUTH');
setAuthMode('LOGIN');
},
},
]
);
};

const getLieLabel = () => {
const found =
LIE_OPTIONS.find(
([value]) =>
value === ballLie
);

return found
? found[1]
: 'FAIRWAY';
};

const getShotLieLabel = (value) => {
const found =
LIE_OPTIONS.find(
([optionValue]) =>
optionValue === value
);

return found
? found[1]
: String(value || '').toUpperCase();
};

const getWindLabel = () => {
if (windDirection === 'headwind') {
return 'HEADWIND';
}

if (windDirection === 'tailwind') {
return 'TAILWIND';
}

if (windDirection === 'leftToRight') {
return 'LEFT > RIGHT';
}

return 'RIGHT > LEFT';
};

const adjustDistance = (amount) => {
const amountYards =
unitMode === 'metres'
? amount / METRES_PER_YARD
: amount;

setDistanceYards((previous) =>
Math.max(
10,
Math.min(
600,
previous + amountYards
)
)
);

setChosenClubId(null);
};

const adjustWind = (amount) => {
const amountMph =
unitMode === 'metres'
? amount / KMH_PER_MPH
: amount;

setWindMph((previous) =>
Math.max(
0,
Math.min(
40,
previous + amountMph
)
)
);
};

const saveClubCarry = (club) => {
const draft =
carryDrafts[club.id];

if (!draft) {
return;
}

const entered =
Number(draft);

if (Number.isNaN(entered)) {
return;
}

const yards =
unitMode === 'metres'
? entered / METRES_PER_YARD
: entered;setClubs((previous) =>
previous.map((item) =>
item.id === club.id
? {
...item,
carryYards:
Math.max(
40,
Math.min(
350,
yards
)
),
}
: item
)
);

setCarryDrafts((previous) => {
const next = {
...previous,
};

delete next[club.id];

return next;
});

setClubSavedId(club.id);

setTimeout(() => {
setClubSavedId('');
}, 1000);

Keyboard.dismiss();
};

const updateHole = (field, value) => {
setScorecard((previous) =>
previous.map((hole) =>
hole.hole === currentHole
? {
...hole,
[field]: value,
}
: hole
)
);
};

const updateCourseHolePar = (holeNumber, par) => {
setCourseHoles((previous) =>
previous.map((hole) =>
hole.hole === holeNumber
? {
...hole,
par,
}
: hole
)
);
};

const updateCourseHoleDistance = (holeNumber, distance) => {
const cleanDistance = String(distance || '')
.replace(/[^0-9]/g, '')
.slice(0, 4);

setCourseHoles((previous) =>
previous.map((hole) =>
hole.hole === holeNumber
? {
...hole,
distance: cleanDistance,
}
: hole
)
);

setCourseCardStatus('');
};

const updateCourseHoleStrokeIndex = (holeNumber, value) => {
const clean = String(value || '')
.replace(/[^0-9]/g, '')
.slice(0, 2);

const numeric =
clean === ''
? ''
: String(
Math.max(
1,
Math.min(
18,
Number(clean)
)
)
);

setCourseHoles((previous) =>
previous.map((hole) =>
hole.hole === holeNumber
? {
...hole,
strokeIndex: numeric,
}
: hole
)
);

setCourseCardStatus('');
};

const updateGroupPlayer = (
playerIndex,
field,
value
) => {
setGroupPlayers((previous) =>
previous.map((player, index) =>
index === playerIndex
? {
...player,
[field]:
field === 'handicap'
? String(value || '')
.replace(/[^0-9.-]/g, '')
.slice(0, 5)
: String(value || '')
.slice(0, 18),
}
: player
)
);
};

const updateGroupScore = (
holeNumber,
playerIndex,
value
) => {
const clean = String(value || '')
.replace(/[^0-9]/g, '')
.slice(0, 2);

if (playerIndex === 0) {
setScorecard((previous) =>
previous.map((hole) =>
hole.hole === holeNumber
? {
...hole,
score: clean,
}
: hole
)
);

return;
}

const key =
`p${playerIndex + 1}`;

setGroupScores((previous) =>
previous.map((hole) =>
hole.hole === holeNumber
? {
...hole,
[key]: clean,
}
: hole
)
);
};

const groupScoreForHole = (
holeNumber,
playerIndex
) => {
if (playerIndex === 0) {
return String(
scorecard[holeNumber - 1]?.score ||
''
);
}

const key =
`p${playerIndex + 1}`;

return String(
groupScores[holeNumber - 1]?.[key] ||
''
);
};

const groupNineTotal = (
startHole,
endHole,
playerIndex
) => {
let total = 0;
let entered = 0;

for (
let h = startHole;
h <= endHole;
h += 1
) {
const value =
Number(
groupScoreForHole(
h,
playerIndex
)
);

if (
Number.isFinite(value) &&
value > 0
) {
total += value;
entered += 1;
}
}

return entered > 0
? total
: null;
};

const groupGrossTotal = (
playerIndex
) => {
const out =
groupNineTotal(
1,
9,
playerIndex
);

const incoming =
groupNineTotal(
10,
18,
playerIndex
);

if (
out === null &&
incoming === null
) {
return null;
}

return (out || 0) +
(incoming || 0);
};

const groupNetTotal = (
playerIndex
) => {
const gross =
groupGrossTotal(
playerIndex
);

if (gross === null) {
return null;
}

const handicap =
Number(
groupPlayers[playerIndex]?.handicap
);

return gross -
(
Number.isFinite(handicap)
? handicap
: 0
);
};

const cycleCoursePar = (
holeNumber
) => {
const hole =
courseHoles.find(
(item) =>
item.hole === holeNumber
);

if (!hole) {
return;
}

const nextPar =
hole.par === 3
? 4
: hole.par === 4
? 5
: 3;

updateCourseHolePar(
holeNumber,
nextPar
);

setCourseCardStatus('');
};

const findSavedCourseProfile = () => {
const key =
normaliseCourseKey(
courseName,
teeType,
teeColour
);

return courseProfiles.find(
(profile) =>
profile.key === key
);
};

const loadSavedCourseProfile = () => {
if (!courseName.trim()) {
Alert.alert(
'Course required',
'Enter the course name first.'
);

return;
}

if (!teeType || !teeColour) {
Alert.alert(
'Tees required',
'Select tee type and tee colour first.'
);

return;
}

const profile =
findSavedCourseProfile();

if (!profile) {
setCourseCardStatus(
'No saved card for this course and tee set yet.'
);

Alert.alert(
'No saved course card',
'Enter the pars and hole distances once, then save the course card.'
);

return;
}

setCourseHoles(
profile.holes.map(
(hole, index) => ({
...createCourseHole(
index + 1
),
...hole,
distance:
hole.distance !== undefined
? String(hole.distance)
: '',
})
)
);

setScorecard((previous) =>
profile.holes.map((hole, index) => ({
...createEmptyHole(index + 1, hole.par),
...(previous[index] || {}),
hole: index + 1,
par: hole.par,
}))
);

setCourseCardStatus(
'Saved course card loaded and linked to the scorecard.'
);
};

const saveCourseProfile = async (
silent = false
) => {
const cleanCourseName =
courseName.trim();

if (!cleanCourseName) {
if (!silent) {
Alert.alert(
'Course required',
'Enter the course name.'
);
}

return false;
}

if (!teeType || !teeColour) {
if (!silent) {
Alert.alert(
'Tees required',
'Select tee type and tee colour.'
);
}

return false;
}

const key =
normaliseCourseKey(
cleanCourseName,
teeType,
teeColour
);

const profile = {
key,
courseName:
cleanCourseName,
teeType,
teeColour,
holes:
courseHoles.map(
(hole) => ({
...hole,
distance:
String(
hole.distance || ''
),
})
),
savedAt:
Date.now(),
};

const withoutCurrent =
courseProfiles.filter(
(item) =>
item.key !== key
);

const updated = [
profile,
...withoutCurrent,
].slice(0, 100);

setCourseProfiles(updated);

await AsyncStorage.setItem(
STORAGE_COURSES,
JSON.stringify(updated)
);

setScorecard((previous) =>
courseHoles.map((hole, index) => ({
...createEmptyHole(index + 1, hole.par),
...(previous[index] || {}),
hole: index + 1,
par: hole.par,
}))
);

setCourseCardStatus(
'Course card saved and linked to the scorecard.'
);

if (!silent) {
Alert.alert(
'Course card saved',
`${cleanCourseName} Â· ${teeColour.toUpperCase()} tees`
);
}

return true;
};

const beginRound = async () => {
if (!courseName.trim()) {
Alert.alert(
'Course required',
'Enter the course name.'
);

return;
}

if (!teeType || !teeColour) {
Alert.alert(
'Tee selection required',
'Select tee type and tee colour.'
);

return;
}

let holesForRound =
courseHoles;

const savedProfile =
findSavedCourseProfile();

if (savedProfile) {
holesForRound =
savedProfile.holes;

setCourseHoles(
savedProfile.holes.map(
(hole, index) => ({
...createCourseHole(
index + 1
),
...hole,
distance:
hole.distance !== undefined
? String(hole.distance)
: '',
})
)
);
} else {
await saveCourseProfile(true);
}

const date =
getTodayDate();

const freshScorecard =
createEmptyScorecard(
holesForRound
);

const round = {
id:
String(Date.now()),
courseName:
courseName.trim(),
teeType,
teeColour,
roundDate:
date,
currentHole: 1,
courseHoles:
holesForRound,
startedAt:
Date.now(),
};

setRoundDate(date);

setScorecard(
freshScorecard
);

setGroupScores(
createGroupScores()
);

setCurrentHole(1);
setActiveRound(round);

changePage('SCORE');

startVoiceMode('ROUND');
};

const saveRound = async (
finished = false
) => {
if (!completedHoles.length) {
Alert.alert(
'No scores',
'Enter at least one score.'
);

return;
}

const round = {
id:
activeRound?.id ||
String(Date.now()),
courseName,
roundDate:
roundDate ||
getTodayDate(),
teeType,
teeColour,
courseHoles,
scorecard,
groupPlayers,
groupScores,
totalScore,
totalPutts,
scoreToPar,
holesPlayed:
completedHoles.length,
finished,
finishedAt:
finished
? Date.now()
: null,
};

const withoutSameRound =
savedRounds.filter(
(item) =>
item.id !== round.id
);

const updated = [
round,
...withoutSameRound,
].slice(0, 30);

setSavedRounds(updated);

await AsyncStorage.setItem(
STORAGE_ROUNDS,
JSON.stringify(updated)
);

if (finished) {
stopVoiceMode();
setActiveRound(null);

await AsyncStorage.removeItem(
STORAGE_ACTIVE_ROUND
);

Alert.alert(
'Round finished',
`${courseName} Â· ${totalScore} shots Â· ${toParText()}`,
[
{
text: 'HOME',
onPress: () =>
changePage('HOME'),
},
]
);

return;
}

Alert.alert(
'Round saved',
`${courseName} Â· ${totalScore} shots`
);
};

const confirmFinishRound = () => {
Alert.alert(
'Finish round?',
'This saves the round and closes the active round.',
[
{
text: 'Cancel',
style: 'cancel',
},
{
text: 'Finish Round',
onPress: () =>
saveRound(true),
},
]
);
};

const resumeRound = () => {
if (!activeRound) {
Alert.alert(
'No active round',
'Start a round first.'
);

return;
}

setLiveHole(
activeRound.currentHole || 1
);

changePage('SCORE');

startVoiceMode('ROUND');
};

const addClubToCurrentHole = (
clubName
) => {
const updatedClubs = [
...(currentHoleData.clubsUsed || []),
clubName,
];

updateHole(
'clubsUsed',
updatedClubs
);
};

const removeClubFromCurrentHole = (
indexToRemove
) => {
const updatedClubs =
(currentHoleData.clubsUsed || [])
.filter(
(_, index) =>
index !== indexToRemove
);

updateHole(
'clubsUsed',
updatedClubs
);
};

const addDetailedShot = async () => {
const cleanDistance =
shotDistance.trim();

const shot = {
id:
String(Date.now()),
club:
shotClub,
distance:
cleanDistance,
lie:
shotLie,
result:
shotResult,
date:
getTodayDate(),
roundId:
activeRound?.id ||
null,
courseName:
activeRound
? courseName
: '',
hole:
activeRound
? currentHole
: null,
};

const updatedHoleShots = [
...(currentHoleData.shots || []),
shot,
];

const updatedClubs = [
...(currentHoleData.clubsUsed || []),
shotClub,
];

setScorecard((previous) =>
previous.map((hole) =>
hole.hole === currentHole
? {
...hole,
shots:
updatedHoleShots,
clubsUsed:
updatedClubs,
}
: hole
)
);

const updatedTrackedShots = [
shot,
...trackedShots,
].slice(0, 150);

setTrackedShots(
updatedTrackedShots
);

await AsyncStorage.setItem(
STORAGE_SHOTS,
JSON.stringify(
updatedTrackedShots
)
);

setShotDistance('');
};

const removeDetailedShot = (
shotId
) => {
const shotToRemove =
(currentHoleData.shots || [])
.find(
(shot) =>
shot.id === shotId
);

const updatedShots =
(currentHoleData.shots || [])
.filter(
(shot) =>
shot.id !== shotId
);

let updatedClubs = [
...(currentHoleData.clubsUsed || []),
];

if (shotToRemove) {
const clubIndex =
updatedClubs.lastIndexOf(
shotToRemove.club
);

if (clubIndex >= 0) {
updatedClubs.splice(
clubIndex,
1
);
}
}

setScorecard((previous) =>
previous.map((hole) =>
hole.hole === currentHole
? {
...hole,
shots:
updatedShots,
clubsUsed:
updatedClubs,
}
: hole
)
);
};

const parseQuickEntry = () => {
Keyboard.dismiss();

const raw =
quickEntry.trim();

if (!raw) {
return;
}

const text =
raw.toLowerCase();

const foundClubs = [];

clubAliases.forEach((club) => {
club.patterns.forEach(
(pattern) => {
let startIndex = 0;

while (
startIndex <
text.length
) {
const foundIndex =
text.indexOf(
pattern,
startIndex
);

if (
foundIndex === -1
) {
break;
}

foundClubs.push({
index:
foundIndex,
name:
club.name,
});

startIndex =
foundIndex +
pattern.length;
}
}
);
});

foundClubs.sort(
(a, b) =>
a.index - b.index
);

const uniqueOrderedClubs = [];

foundClubs.forEach((item) => {
const duplicateAtSamePoint =
uniqueOrderedClubs.some(
(existing) =>
existing.index ===
item.index &&
existing.name ===
item.name
);

if (!duplicateAtSamePoint) {
uniqueOrderedClubs.push(
item
);
}
});

let newClubs = [
...(currentHoleData.clubsUsed || []),
...uniqueOrderedClubs.map(
(item) =>
item.name
),
];

let nextPutts =
currentHoleData.putts;

let nextScore =
currentHoleData.score;

let nextGir =
currentHoleData.gir;

let nextFairway =
currentHoleData.fairway;

let nextNotes =
currentHoleData.notes || '';

const puttMatch =
text.match(
/(\d+)\s*putt/
);

if (puttMatch) {
nextPutts =
puttMatch[1];
}

const scoreMatch =
text.match(
/score\s*(\d+)/
);

if (scoreMatch) {
nextScore =
scoreMatch[1];
}

if (
text.includes('gir yes') ||
text.includes(
'green in regulation'
)
) {
nextGir = 'YES';
}

if (
text.includes('gir no')
) {
nextGir = 'NO';
}

if (
text.includes(
'fairway hit'
) ||
text.includes(
'hit fairway'
)
) {
nextFairway = 'HIT';
}

if (
text.includes(
'fairway left'
)
) {
nextFairway = 'LEFT';
}

if (
text.includes(
'fairway right'
)
) {
nextFairway = 'RIGHT';
}

const noteBits = [];

if (
text.includes(
'greenside bunker'
) ||
text.includes(
'green side bunker'
)
) {
noteBits.push(
'Greenside bunker'
);
} else if (
text.includes(
'fairway bunker'
)
) {
noteBits.push(
'Fairway bunker'
);
} else if (
text.includes('bunker')
) {
noteBits.push(
'Bunker'
);
}

if (
text.includes(
'deep rough'
)
) {
noteBits.push(
'Deep rough'
);
} else if (
text.includes('rough')
) {
noteBits.push(
'Rough'
);
}

if (
text.includes('water')
) {
noteBits.push(
'Water'
);
}

if (noteBits.length) {
const extra =
noteBits.join(' Â· ');

nextNotes =
nextNotes
? `${nextNotes} Â· ${extra}`
: extra;
}

setScorecard((previous) =>
previous.map((hole) =>
hole.hole === currentHole
? {
...hole,
clubsUsed:
newClubs,
putts:
nextPutts,
score:
nextScore,
gir:
nextGir,
fairway:
nextFairway,
notes:
nextNotes,
}
: hole
)
);

setQuickEntry('');

Alert.alert(
'Hole updated',
`Hole ${currentHole} quick entry applied.`
);
};

const saveTrackedShot = async () => {
if (!trackDistance) {
Alert.alert(
'Distance needed',
'Enter the shot distance.'
);

return;
}

const shot = {
id:
String(Date.now()),
date:
getTodayDate(),
club:
trackClub,
distance:
trackDistance,
lie:
trackLie,
result:
trackResult,
roundId:
null,
courseName:
'',
hole:
null,
};

const updated = [
shot,
...trackedShots,
].slice(0, 150);

setTrackedShots(updated);

await AsyncStorage.setItem(
STORAGE_SHOTS,
JSON.stringify(updated)
);

setTrackDistance('');

Alert.alert(
'Shot saved',
`${shot.club} Â· ${shot.distance} ${primaryLabel()} Â· ${shot.result}`
);
};

const adjustPracticeCounter = (
setter,
amount
) => {
setter((previous) =>
Math.max(
0,
Math.min(
999,
previous + amount
)
)
);
};

const resetPracticeCounters = () => {
setPracticeGoodShots(0);
setPracticeLeftMisses(0);
setPracticeRightMisses(0);
setPracticeShortMisses(0);
setPracticeLongMisses(0);
setPracticeThinStrikes(0);
setPracticeToppedStrikes(0);
setPracticeHeavyStrikes(0);
};

const resetPracticeSession = () => {
resetPracticeCounters();
setPracticeTargetDistance('');
setPracticeNote('');
};

const savePractice = async () => {
if (
practiceShotsRecorded === 0
) {
Alert.alert(
'No shots recorded',
'Record your good shots or misses before saving the session.'
);

return;
}

const entry = {
id:
String(Date.now()),
date:
getTodayDate(),
type:
practiceType,
club:
practiceClub,
targetDistance:
practiceTargetDistance,
distanceUnit:
primaryLabel(),
shotShape:
practiceShotShape,
balls:
practiceBalls,
goodShots:
practiceGoodShots,
leftMisses:
practiceLeftMisses,
rightMisses:
practiceRightMisses,
shortMisses:
practiceShortMisses,
longMisses:
practiceLongMisses,
misses:
practiceMisses,
shotsRecorded:
practiceShotsRecorded,
successPercentage:
practiceSuccess,
quality:
practiceQuality,
note:
practiceNote.trim(),
};

const updated = [
entry,
...practiceHistory,
].slice(0, 50);

setPracticeHistory(updated);

await AsyncStorage.setItem(
STORAGE_PRACTICE,
JSON.stringify(updated)
);

resetPracticeCounters();
setPracticeNote('');
setPracticeActive(false);

if (
voiceModeRef.current ===
'PRACTICE'
) {
stopVoiceMode();
}

Alert.alert(
'Practice saved',
`${practiceType} Â· ${practiceClub} Â· ${practiceSuccess}% success`
);
};

const saveRoutineSteps = async () => {
  const clean = routineSteps.map((step) => String(step || '').trim());
  setRoutineSteps(clean);
  await AsyncStorage.setItem(STORAGE_ROUTINES, JSON.stringify({ steps: clean }));
  Alert.alert('Routine saved', 'Your routine is saved.');
};

const HomeButton = ({
title,
subtitle,
target,
centered = false,
onPress,
}) => (
<TouchableOpacity
style={[
styles.homeButton,
centered &&
styles.homeButtonCentered,
]}
onPress={
onPress ||
(() =>
changePage(target))
}
>
<Text
style={
styles.homeButtonTitle
}
>
{title}
</Text>

<Text
style={
styles.homeButtonSub
}
>
{subtitle}
</Text>
</TouchableOpacity>
);

const Selector = ({
options,
value,
onChange,
}) => (
<View
style={
styles.selectorWrap
}
>
{options.map(
(option) => {
const optionValue =
Array.isArray(option)
? option[0]
: option;

const optionLabel =
Array.isArray(option)
? option[1]
: option;

return (
<TouchableOpacity
key={
String(
optionValue
)
}
style={[
styles.selectorButton,
value ===
optionValue &&
styles.selectorButtonActive,
]}
onPress={() =>
onChange(
optionValue
)
}
>
<Text
style={[
styles.selectorText,
value ===
optionValue &&
styles.selectorTextActive,
]}
>
{optionLabel}
</Text>
</TouchableOpacity>
);
}
)}
</View>
);

const PracticeCounter = ({
label,
value,
setter,
positive = false,
}) => (
<View
style={[
styles.practiceCounterCard,
positive &&
styles.practiceCounterGood,
]}
>
<Text
style={
styles.practiceCounterLabel
}
>
{label}
</Text>

<Text
style={[
styles.practiceCounterValue,
positive &&
styles.practiceCounterValueGood,
]}
>
{value}
</Text>

<View
style={
styles.practiceCounterControls
}
>
<TouchableOpacity
style={
styles.practiceCounterButton
}
onPress={() =>
adjustPracticeCounter(
setter,
-1
)
}
>
<Text
style={
styles.practiceCounterButtonText
}
>
âˆ’
</Text>
</TouchableOpacity>

<TouchableOpacity
style={[
styles.practiceCounterButton,
styles.practiceCounterAdd,
]}
onPress={() =>
adjustPracticeCounter(
setter,
1
)
}
>
<Text
style={[
styles.practiceCounterButtonText,
styles.practiceCounterAddText,
]}
>
+
</Text>
</TouchableOpacity>
</View>
</View>
);

const VoicePanel = ({
mode = 'ROUND',
}) => {
const isActive =
voiceMode === mode;

return (
<View
style={
styles.voiceCard
}
>
<View
style={
styles.voiceHeaderRow
}
>
<View
style={{
flex: 1,
}}
>
<Text
style={
styles.voiceTitle
}
>
VOICE CADDIE
</Text>

<Text
style={
styles.voiceStatus
}
>
{isActive
? voiceStatus
: 'VOICE READY'}
</Text>
</View>

<View
style={[
styles.voiceDot,
voiceListening &&
isActive &&
styles.voiceDotLive,
]}
/>
</View>

<Text
style={
styles.voiceResponse
}
>
{voiceResponse}
</Text>

{voiceTranscript ? (
<Text
style={
styles.voiceTranscript
}
>
HEARD: {voiceTranscript}
</Text>
) : null}

<View
style={
styles.voiceButtonRow
}
>
<TouchableOpacity
style={[
styles.voiceButton,
isActive &&
styles.voiceButtonStop,
]}
onPress={() =>
isActive
? stopVoiceMode()
: startVoiceMode(mode)
}
>
<Text
style={
styles.voiceButtonText
}
>
{isActive ? 'OFF' : 'ON'}
</Text>
</TouchableOpacity>

<TouchableOpacity
style={
styles.voiceSpeakButton
}
onPress={() =>
speakCaddie(
mode === 'PRACTICE'
? 'Tell me the club, number of balls and the shot results.'
: caddieVoiceCall(),
isActive
)
}
>
<Text
style={
styles.voiceSpeakButtonText
}
>
ASK CADDIE
</Text>
</TouchableOpacity>
</View>
</View>
);
};

const ActiveRoundStrip = () => {
if (!activeRound) {
return null;
}

return (
<TouchableOpacity
style={
styles.activeRoundStrip
}
onPress={
resumeRound
}
>
<View
style={
styles.activeRoundLeft
}
>
<Text
style={
styles.activeRoundLabel
}
>
LIVE ROUND
</Text>

<Text
style={
styles.activeRoundCourse
}
>
{courseName}
</Text>
</View>

<View
style={
styles.activeRoundRight
}
>
<Text
style={
styles.activeRoundHole
}
>
HOLE {currentHole}
</Text>

<Text
style={
styles.activeRoundTap
}
>
TAP TO RETURN
</Text>
</View>
</TouchableOpacity>
);
};

const PasswordBox = ({
value,
onChangeText,
placeholder,
returnKeyType,
inputRef,
onSubmitEditing,
}) => (
<View
style={
styles.passwordInputWrap
}
>
<TextInput
style={[
styles.textInput,
styles.passwordTextInput,
]}
value={value}
onChangeText={
onChangeText
}
secureTextEntry={
!showPassword
}
autoCapitalize="none"
placeholder={
placeholder
}
placeholderTextColor="#777777"
returnKeyType={
returnKeyType
}
ref={inputRef}
onSubmitEditing={onSubmitEditing}
blurOnSubmit={false}
/>

<TouchableOpacity
style={
styles.passwordEyeButton
}
onPress={() =>
setShowPassword(
(previous) =>
!previous
)
}
>
<Text
style={
styles.passwordEyeText
}
>
ðŸ‘
</Text>
</TouchableOpacity>
</View>
);

const renderCompactCourseNine = (
holes,
title
) => (<View style={styles.courseNineBlock}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text style={styles.courseNineTitle}>{title}</Text>
    <Text style={styles.courseSwipeHint}>SWIPE â†”</Text>
  </View>

  <ScrollView
    horizontal
    nestedScrollEnabled={false}
    scrollEnabled
    directionalLockEnabled
    showsHorizontalScrollIndicator={true}
    contentContainerStyle={{ paddingRight: 12 }}
    keyboardShouldPersistTaps="handled"
  >
    <View>
      <View style={styles.courseTableRow}>
        <View style={styles.courseTableLabelCell}>
          <Text style={styles.courseTableLabelText}>HOLE</Text>
        </View>

        {holes.map((hole) => (
          <View key={`hole-${hole.hole}`} style={styles.courseTableCell}>
            <Text style={styles.courseTableHole}>{hole.hole}</Text>
          </View>
        ))}
      </View>

      <View style={styles.courseTableRow}>
        <View style={styles.courseTableLabelCell}>
          <Text style={styles.courseTableLabelText}>PAR</Text>
        </View>

        {holes.map((hole) => (
          <TouchableOpacity
            key={`par-${hole.hole}`}
            style={[
              styles.courseTableCell,
              styles.courseTableParCell,
            ]}
            onPress={() => cycleCoursePar(hole.hole)}
          >
            <Text style={styles.courseTableParText}>{hole.par}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.courseTableRow}>
        <View style={styles.courseTableLabelCell}>
          <Text style={styles.courseTableLabelText}>
            {primaryLabel()}
          </Text>
        </View>

        {holes.map((hole) => (
          <View
            key={`distance-${hole.hole}`}
            style={styles.courseDistanceCell}
          >
            <TextInput
              style={styles.courseDistanceInput}
              value={String(hole.distance || '')}
              onChangeText={(value) =>
                updateCourseHoleDistance(hole.hole, value)
              }
              keyboardType="number-pad"
              maxLength={4}
              placeholder="â€”"
              placeholderTextColor="#666666"
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      <View style={styles.courseTableRow}>
        <View style={styles.courseTableLabelCell}>
          <Text style={styles.courseTableLabelText}>SI</Text>
        </View>

        {holes.map((hole) => (
          <View
            key={`si-${hole.hole}`}
            style={styles.courseDistanceCell}
          >
            <TextInput
              style={styles.courseDistanceInput}
              value={String(hole.strokeIndex || '')}
              onChangeText={(value) =>
                updateCourseHoleStrokeIndex(hole.hole, value)
              }
              keyboardType="number-pad"
              maxLength={2}
              placeholder="â€”"
              placeholderTextColor="#666666"
              selectTextOnFocus
            />
          </View>
        ))}
      </View>
    </View>
  </ScrollView>
</View>
);

const renderGroupNine = (startHole, endHole, title) => {
  const holes = [];

  for (let hole = startHole; hole <= endHole; hole += 1) {
    holes.push(hole);
  }

  return (
    <View style={styles.groupNineCard}>
      <Text style={styles.groupNineTitle}>{title}</Text>

      <View style={[styles.groupScoreRow, styles.groupScoreHeader]}>
        <Text style={[styles.groupMetaCell, styles.groupHeaderText]}>
          HOLE
        </Text>

        <Text style={[styles.groupParCell, styles.groupHeaderText]}>
          PAR
        </Text>

        <Text style={[styles.groupDistanceCell, styles.groupHeaderText]}>
          DIST
        </Text>

        <Text style={[styles.groupSiCell, styles.groupHeaderText]}>
          SI
        </Text>

        {groupPlayers.map((player, index) => (
          <Text
            key={`group-header-${player.id}`}
            numberOfLines={1}
            style={[styles.groupPlayerCell, styles.groupHeaderText]}
          >
            {index === 0 ? 'P1' : `P${index + 1}`}
          </Text>
        ))}
      </View>

      {holes.map((holeNumber) => {
        const courseHole =
          courseHoles[holeNumber - 1] || createCourseHole(holeNumber);

        return (
          <View
            key={`group-hole-${holeNumber}`}
            style={styles.groupScoreRow}
          >
            <Text style={[styles.groupMetaCell, styles.groupHoleText]}>
              {holeNumber}
            </Text>

            <Text style={styles.groupParCell}>
              {courseHole.par || 'â€”'}
            </Text>

            <Text style={styles.groupDistanceCell}>
              {courseHole.distance || 'â€”'}
            </Text>

            <Text style={styles.groupSiCell}>
              {courseHole.strokeIndex || 'â€”'}
            </Text>

            {groupPlayers.map((player, playerIndex) => (
              <View
                key={`group-score-${holeNumber}-${player.id}`}
                style={styles.groupPlayerCellWrap}
              >
                <TextInput
                  style={[
                    styles.groupScoreInput,
                    playerIndex === 0 && styles.groupOwnerScoreInput,
                  ]}
                  value={groupScoreForHole(holeNumber, playerIndex)}
                  onChangeText={(value) =>
                    updateGroupScore(holeNumber, playerIndex, value)
                  }
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="â€”"
                  placeholderTextColor="#5D6870"
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>
        );
      })}

      <View style={[styles.groupScoreRow, styles.groupTotalRow]}>
        <Text style={[styles.groupMetaCell, styles.groupTotalLabel]}>
          {startHole === 1 ? 'OUT' : 'IN'}
        </Text>

        <Text style={styles.groupParCell}>
          {courseHoles
            .slice(startHole - 1, endHole)
            .reduce((total, hole) => total + Number(hole.par || 0), 0)}
        </Text>

        <Text style={styles.groupDistanceCell}>
          {courseHoles
            .slice(startHole - 1, endHole)
            .reduce(
              (total, hole) => total + Number(hole.distance || 0),
              0
            ) || 'â€”'}
        </Text>

        <Text style={styles.groupSiCell}>â€”</Text>

        {groupPlayers.map((player, playerIndex) => {
          const total = groupNineTotal(
            startHole,
            endHole,
            playerIndex
          );

          return (
            <Text
              key={`nine-total-${title}-${player.id}`}
              style={[
                styles.groupPlayerCell,
                styles.groupTotalValue,
                styles.groupGoldText,
              ]}
            >
              {total === null ? 'â€”' : total}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const renderGroupScorecard = () => (
  <View style={styles.groupScorePage}>
    <View style={styles.groupScoreTitleRow}>
      <TouchableOpacity
        style={styles.groupBackButton}
        onPress={() => changePage('SCORE')}
      >
        <Text style={styles.groupBackText}>â€¹</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={styles.groupScoreTitle}>SCORECARD</Text>
        <Text style={styles.groupScoreSubtitle}>
          FOUR PLAYER GROUP
        </Text>
      </View>
    </View>

    <View style={styles.groupRoundHero}>
      <View style={{ flex: 1 }}>
        <Text style={styles.groupRoundLabel}>
          {courseName || 'CURRENT ROUND'}
        </Text>

        <Text style={styles.groupRoundName}>
          {teeColour
            ? `${teeColour.toUpperCase()} TEES`
            : 'TEE NOT SET'}
          {teeType ? ` Â· ${teeType.toUpperCase()}` : ''}
        </Text>

        <Text style={styles.groupRoundDate}>
          {roundDate || getTodayDate()}
        </Text>
      </View>

      <View style={styles.groupRoundParBox}>
        <Text style={styles.groupRoundParLabel}>PAR</Text>
        <Text style={styles.groupRoundParValue}>
          {courseParTotal || 'â€”'}
        </Text>
      </View>
    </View>

    <View style={styles.groupPlayersGrid}>
      {groupPlayers.map((player, index) => (
        <View key={player.id} style={styles.groupPlayerSetup}>
          <Text style={styles.groupPlayerRole}>
            {index === 0 ? 'TPE OWNER' : `PLAYER ${index + 1}`}
          </Text>

          <TextInput
            style={styles.groupPlayerNameInput}
            value={player.name}
            onChangeText={(value) =>
              updateGroupPlayer(index, 'name', value)
            }
            placeholder={`P${index + 1}`}
            placeholderTextColor="#68727A"
            selectTextOnFocus
          />

          <TextInput
            style={styles.groupHandicapInput}
            value={player.handicap}
            onChangeText={(value) =>
              updateGroupPlayer(index, 'handicap', value)
            }
            keyboardType="numbers-and-punctuation"
            placeholder="HCP"
            placeholderTextColor="#8B7A42"
            maxLength={5}
            selectTextOnFocus
          />
        </View>
      ))}
    </View>

    <Text style={styles.groupManualNote}>
      MANUAL SCORE ENTRY Â· TPE OWNER SCORES THE FOUR-PLAYER GROUP
    </Text>

    {renderGroupNine(1, 9, 'FRONT NINE')}

    {renderGroupNine(10, 18, 'BACK NINE')}

    <View style={styles.groupTotalsCard}>
      <View style={styles.groupFinalRow}>
        <Text style={styles.groupFinalLabel}>PLAYER</Text>

        {groupPlayers.map((player, index) => (
          <Text
            key={`final-name-${player.id}`}
            numberOfLines={1}
            style={[
              styles.groupFinalValue,
              index === 0 && styles.groupGoldText,
            ]}
          >
            {player.name || `P${index + 1}`}
          </Text>
        ))}
      </View>

      <View style={styles.groupFinalRow}>
        <Text style={styles.groupFinalLabel}>OUT</Text>

        {groupPlayers.map((player, index) => {
          const value = groupNineTotal(1, 9, index);

          return (
            <Text key={`out-${player.id}`} style={styles.groupFinalValue}>
              {value === null ? 'â€”' : value}
            </Text>
          );
        })}
      </View>

      <View style={styles.groupFinalRow}>
        <Text style={styles.groupFinalLabel}>IN</Text>

        {groupPlayers.map((player, index) => {
          const value = groupNineTotal(10, 18, index);

          return (
            <Text key={`in-${player.id}`} style={styles.groupFinalValue}>
              {value === null ? 'â€”' : value}
            </Text>
          );
        })}
      </View>

      <View style={styles.groupFinalRow}>
        <Text style={styles.groupFinalLabel}>GROSS</Text>

        {groupPlayers.map((player, index) => {
          const value = groupGrossTotal(index);

          return (
            <Text
              key={`gross-${player.id}`}
              style={styles.groupFinalValue}
            >
              {value === null ? 'â€”' : value}
            </Text>
          );
        })}
      </View>

      <View style={styles.groupFinalRow}>
        <Text style={styles.groupFinalLabel}>HANDICAP</Text>

        {groupPlayers.map((player) => (
          <Text
            key={`hcp-${player.id}`}
            style={styles.groupFinalValue}
          >
            {player.handicap === '' ? 'â€”' : player.handicap}
          </Text>
        ))}
      </View>

      <View style={styles.groupFinalRow}>
        <Text style={[styles.groupFinalLabel, styles.groupGoldText]}>
          NET
        </Text>

        {groupPlayers.map((player, index) => {
          const value = groupNetTotal(index);

          return (
            <Text
              key={`net-${player.id}`}
              style={[
                styles.groupFinalValue,
                styles.groupNetValue,
              ]}
            >
              {value === null ? 'â€”' : value}
            </Text>
          );
        })}
      </View>
    </View>

    <Text style={styles.groupScoreFootnote}>
      DISTANCE AND STROKE INDEX FOLLOW THE SELECTED COURSE AND TEE.
      SCORES ARE MANUAL â€” VOICE CADDIE DOES NOT ENTER GROUP SCORES.
    </Text>

    <View style={{ height: 120 }} />
  </View>
);

if (entryStage === 'SPLASH') {
  return (
    <View style={styles.splash}>
      <View style={styles.logoMark}>
        <View style={styles.logoLine} />
        <View style={styles.logoDot} />
      </View>

      <Text style={styles.splashTitle}>TOUR PRO</Text>
      <Text style={styles.splashElite}>ELITE</Text>
      <Text style={styles.splashSub}>VOICE CADDIE</Text>
    </View>
  );
}

if (entryStage === 'ONBOARDING') {
  const slide = ONBOARDING[onboardingIndex];

  return (
    <View style={styles.entryScreen}>
      <View style={styles.entryTop}>
        <Text style={styles.entryBrand}>TOUR PRO ELITE</Text>
        <Text style={styles.entryStep}>
          {onboardingIndex + 1} / {ONBOARDING.length}
        </Text>
      </View>

      <View style={styles.onboardingCard}>
        <Text style={styles.onboardingTitle}>{slide.title}</Text>

        <Text style={styles.onboardingText}>{slide.text}</Text>
      </View>

      <View style={styles.onboardingDots}>
        {ONBOARDING.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.onboardingDot,
              index === onboardingIndex &&
                styles.onboardingDotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.entryPrimaryButton}
        onPress={nextOnboarding}
      >
        <Text style={styles.entryPrimaryButtonText}>
          {onboardingIndex === ONBOARDING.length - 1
            ? 'GET STARTED'
            : 'NEXT'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

if (entryStage === 'AUTH') {
  return (
    <ScrollView
      style={styles.authScroll}
      contentContainerStyle={styles.authContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.authBrandBox}>
        <Text style={styles.authTour}>TOUR PRO</Text>
        <Text style={styles.authElite}>ELITE</Text>
      </View>

      {authMode === 'RESET' ? (
        <>
          <Text style={styles.authTitle}>RESET PASSWORD</Text>

          <Text style={styles.authSub}>
            Enter your email address.
          </Text>

          <TextInput
            style={styles.textInput}
            value={resetEmail}
            onChangeText={setResetEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#777777"
          />

          <TouchableOpacity
            style={styles.entryPrimaryButton}
            onPress={submitReset}
          >
            <Text style={styles.entryPrimaryButtonText}>
              SEND RESET
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.authTextButton}
            onPress={() => switchAuthMode('LOGIN')}
          >
            <Text style={styles.authTextButtonText}>
              BACK TO SIGN IN
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.authTitle}>
            {authMode === 'CREATE'
              ? 'CREATE ACCOUNT'
              : 'SIGN IN'}
          </Text>

          {authMode === 'CREATE' ? (
            <TextInput
              style={styles.textInput}
              value={authFirstName}
              onChangeText={setAuthFirstName}
              placeholder="First name"
              placeholderTextColor="#777777"
            />
          ) : null}

          <TextInput
            ref={authEmailRef}
            style={styles.textInput}
            value={authEmail}
            onChangeText={setAuthEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#777777"
            returnKeyType="next"
            onSubmitEditing={() => authPasswordRef.current?.focus()}
            blurOnSubmit={false}
          />

          <PasswordBox
            value={authPassword}
            onChangeText={setAuthPassword}
            placeholder="Password"
            returnKeyType={
              authMode === 'CREATE' ? 'next' : 'done'
            }
            inputRef={authPasswordRef}
            onSubmitEditing={() => {
              if (authMode === 'CREATE') {
                authConfirmPasswordRef.current?.focus();
              } else {
                Keyboard.dismiss();
              }
            }}
          />

          {authMode === 'CREATE' ? (
            <PasswordBox
              value={authConfirmPassword}
              onChangeText={setAuthConfirmPassword}
              placeholder="Confirm password"
              returnKeyType="done"
              inputRef={authConfirmPasswordRef}
              onSubmitEditing={Keyboard.dismiss}
            />
          ) : null}

          <TouchableOpacity
            style={styles.entryPrimaryButton}
            onPress={submitAuth}
          >
            <Text style={styles.entryPrimaryButtonText}>
              {authMode === 'CREATE'
                ? 'CREATE ACCOUNT'
                : 'SIGN IN'}
            </Text>
          </TouchableOpacity>

          {authMode === 'LOGIN' ? (
            <TouchableOpacity
              style={styles.authTextButton}
              onPress={() => switchAuthMode('RESET')}
            >
              <Text style={styles.authTextButtonText}>
                FORGOT PASSWORD?
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.authTextButton}
            onPress={() =>
              switchAuthMode(
                authMode === 'CREATE' ? 'LOGIN' : 'CREATE'
              )
            }
          >
            <Text style={styles.authTextButtonText}>
              {authMode === 'CREATE'
                ? 'ALREADY HAVE AN ACCOUNT? SIGN IN'
                : 'CREATE ACCOUNT'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const renderHome = () => (
  <>
    <ActiveRoundStrip />

    <View style={styles.heroCard}>
      <Text style={styles.heroSmall}>TOUR PRO ELITE</Text>

      <Text style={styles.heroTitle}>
        {profileName ? `READY, ${profileName.toUpperCase()}` : 'READY TO PLAY'}
      </Text>

      <Text style={styles.heroText}>
        Course setup, voice caddie, scoring, practice and preparation.
      </Text>
    </View>

    <HomeButton
      title={activeRound ? 'CONTINUE ROUND' : 'START ROUND'}
      subtitle={
        activeRound
          ? `${courseName} Â· Hole ${currentHole}`
          : 'Course Â· tees Â· scorecard'
      }
      target={activeRound ? 'SCORE' : 'COURSE'}
      onPress={activeRound ? resumeRound : undefined}
    />

    <HomeButton
      title="CADDIE"
      subtitle="Voice-first club and plays-like call"
      target="CADDIE"
    />

    <HomeButton
      title="MY BAG"
      subtitle="Set your real carry numbers"
      target="BAG"
    />

    <HomeButton
      title="PRACTICE"
      subtitle="Professional practice sessions"
      target="PRACTICE"
    />

    <HomeButton
      title="WARM-UP"
      subtitle="Eight-step pre-round preparation"
      target="WARMUP"
    />

    <HomeButton
      title="ROUTINES"
      subtitle="Pre-shot and post-shot discipline"
      target="ROUTINES"
    />

    <HomeButton
      title="SETTINGS"
      subtitle={`Player mode Â· ${infoMode}`}
      target="SETTINGS"
    />
  </>
);

const renderCourse = () => (
  <>
    <Text style={styles.pageTitle}>COURSE</Text>
    <Text style={styles.pageSub}>
      Set the course and tee once. Tour Pro Elite remembers it.
    </Text>

    <Text style={styles.fieldLabel}>COURSE NAME</Text>

    <TextInput
      style={styles.textInput}
      value={courseName}
      onChangeText={(value) => {
        setCourseName(value);
        setCourseCardStatus('');
      }}
      placeholder="Course name"
      placeholderTextColor="#777777"
    />

    <Text style={styles.fieldLabel}>TEE TYPE</Text>

    <Selector
      options={TEE_TYPES}
      value={teeType}
      onChange={(value) => {
        setTeeType(value);
        setCourseCardStatus('');
      }}
    />

    <Text style={styles.fieldLabel}>TEE COLOUR</Text>

    <Selector
      options={TEE_COLOURS}
      value={teeColour}
      onChange={(value) => {
        setTeeColour(value);
        setCourseCardStatus('');
      }}
    />

    <View style={styles.courseActionRow}>
      <TouchableOpacity
        style={styles.courseSmallButton}
        onPress={loadSavedCourseProfile}
      >
        <Text style={styles.courseSmallButtonText}>LOAD SAVED</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.courseSmallButton}
        onPress={() => saveCourseProfile(false)}
      >
        <Text style={styles.courseSmallButtonText}>SAVE COURSE</Text>
      </TouchableOpacity>
    </View>

    {courseCardStatus ? (
      <Text style={styles.courseStatus}>{courseCardStatus}</Text>
    ) : null}

    <View style={styles.courseCardProfessional}>
      <View style={styles.courseCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.courseCardTitle}>COURSE CARD</Text>

          <Text style={styles.courseCardSubtitle}>
            TAP PAR TO CHANGE Â· ENTER DISTANCE + SI
          </Text>
        </View>

        <View style={styles.courseTotalsBox}>
          <Text style={styles.courseTotalsLabel}>PAR</Text>
          <Text style={styles.courseTotalsValue}>{courseParTotal}</Text>
        </View>
      </View>

      {renderCompactCourseNine(courseHoles.slice(0, 9), 'FRONT NINE')}

      {renderCompactCourseNine(courseHoles.slice(9, 18), 'BACK NINE')}

      <View style={styles.courseCardFooter}>
        <View>
          <Text style={styles.courseFooterLabel}>TOTAL DISTANCE</Text>
          <Text style={styles.courseFooterValue}>
            {courseDistanceTotal || 'â€”'} {primaryLabel()}
          </Text>
        </View>

        <View style={styles.courseFooterRight}>
          <Text style={styles.courseFooterLabel}>TEE</Text>
          <Text style={styles.courseFooterValue}>
            {teeColour ? teeColour.toUpperCase() : 'â€”'}
          </Text>
        </View>
      </View>
    </View>

    <TouchableOpacity
      style={styles.primaryButton}
      onPress={beginRound}
    >
      <Text style={styles.primaryButtonText}>START ROUND</Text>
    </TouchableOpacity>

    <View style={{ height: 100 }} />
  </>
);

const renderCaddie = () => (
  <>
    <ActiveRoundStrip />

    <Text style={styles.pageTitle}>CADDIE</Text>
    <Text style={styles.pageSub}>
      Voice first. Manual controls are backup if the microphone is unavailable.
    </Text>

    {ballLie === 'greensideBunker' ? (
<View style={styles.bunkerPinCard}>
<Text style={styles.fieldLabel}>DISTANCE TO PIN</Text>
<TextInput
style={styles.bunkerPinInput}
keyboardType="number-pad"
value={bunkerPinDistance}
onChangeText={(value) => setBunkerPinDistance(value.replace(/[^0-9]/g, '').slice(0, 3))}
placeholder={unitMode === 'metres' ? 'Metres to pin' : 'Yards to pin'}
placeholderTextColor="#777777"
/>
<Text style={styles.smallGrey}>
Greenside bunker calls use pin distance, not full-swing club carry.
</Text>
</View>
) : null}

<VoicePanel mode="ROUND" />

    <View style={styles.caddieHero}>
      <Text style={styles.caddieTiny}>PLAYS LIKE</Text>

      <Text style={styles.caddieDistance}>
        {primaryDistance(playsLikeYards)}
      </Text>

      <Text style={styles.caddieUnit}>{primaryLabel()}</Text>

      <Text style={styles.caddieClub}>{recommendedClub.name}</Text>
    </View>

    <Text style={styles.fieldLabel}>DISTANCE</Text>

    <View style={styles.stepperRow}>
      <TouchableOpacity
        style={styles.stepperButton}
        onPress={() => adjustDistance(-5)}
      >
        <Text style={styles.stepperButtonText}>âˆ’</Text>
      </TouchableOpacity>

      <View style={styles.stepperValueBox}>
        <Text style={styles.stepperValue}>
          {primaryDistance(distanceYards)}
        </Text>
        <Text style={styles.stepperUnit}>{primaryLabel()}</Text>
      </View>

      <TouchableOpacity
        style={styles.stepperButton}
        onPress={() => adjustDistance(5)}
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.fieldLabel}>WIND</Text>

    <View style={styles.stepperRow}>
      <TouchableOpacity
        style={styles.stepperButton}
        onPress={() => adjustWind(-1)}
      >
        <Text style={styles.stepperButtonText}>âˆ’</Text>
      </TouchableOpacity>

      <View style={styles.stepperValueBox}>
        <Text style={styles.stepperValue}>
          {unitMode === 'metres' ? windKmh : roundedWindMph}
        </Text>

        <Text style={styles.stepperUnit}>
          {unitMode === 'metres' ? 'KM/H' : 'MPH'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.stepperButton}
        onPress={() => adjustWind(1)}
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>

    <Selector
      options={[
        ['headwind', 'HEADWIND'],
        ['tailwind', 'TAILWIND'],
        ['leftToRight', 'LEFT > RIGHT'],
        ['rightToLeft', 'RIGHT > LEFT'],
      ]}
      value={windDirection}
      onChange={(value) => {
        setWindDirection(value);
        setChosenClubId(null);
      }}
    />

    <Text style={styles.fieldLabel}>LIE</Text>

    <Selector
      options={LIE_OPTIONS}
      value={ballLie}
      onChange={(value) => {
        setBallLie(value);
        setChosenClubId(null);
      }}
    />

    <View style={styles.callCard}>
      <Text style={styles.callLabel}>CADDIE ADVICE</Text>

      <Text style={styles.callClub}>{actualClub.name}</Text>

      <Text style={styles.callText}>
        {infoMode === 'PRO'
          ? `${formatDistance(playsLikeYards)} Â· ${getWindLabel()} Â· ${getLieLabel()}`
          : `${primaryDistance(playsLikeYards)} ${primaryLabel()} Â· ${actualClub.name}`}
      </Text>
    </View>

    <Text style={styles.fieldLabel}>USE ANOTHER CLUB</Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {clubs
        .filter((club) => club.id !== 'putter')
        .map((club) => (
          <TouchableOpacity
            key={club.id}
            style={[
              styles.horizontalClub,
              chosenClubId === club.id &&
                styles.horizontalClubActive,
            ]}
            onPress={() =>
              setChosenClubId(
                chosenClubId === club.id ? null : club.id
              )
            }
          >
            <Text style={styles.horizontalClubText}>
              {club.shortName || club.name}
            </Text>
          </TouchableOpacity>
))}
      </ScrollView>
</>
      
    
  );

  const renderBag = () => (
    <>
      <Text style={styles.pageTitle}>
        MY BAG
      </Text>

<ActiveRoundStrip />

<Selector
options={[
['metres', 'METRES'],
['yards', 'YARDS'],
]}
value={unitMode}
onChange={setUnitMode}
/>

<View style={styles.bagCard}>
{clubs.map((club) => (
<View
key={club.id}
style={styles.bagCompactRow}
>
<View style={styles.bagCompactTop}>
<Text style={styles.bagClubCompact}>
{club.shortName || club.name}
</Text>

{club.id !== 'putter' ? (
<Text style={styles.bagCarryCompact}>
{formatDistance(
club.carryYards
)}
</Text>
) : (
<Text style={styles.smallGrey}>
No carry needed
</Text>
)}
</View>

{club.id !== 'putter' ? (
<View style={styles.bagCompactBottom}>
<TextInput
style={styles.numberInputCompact}
keyboardType="number-pad"
value={
carryDrafts[
club.id
 ] !== undefined
? carryDrafts[
club.id
 ]
: String(
unitMode === 'metres'
? Math.round(
club.carryYards *
METRES_PER_YARD
)
: Math.round(
club.carryYards
)
)
}
onFocus={() =>
setCarryDrafts(
(previous) => ({
...previous,
[club.id]:
String(
unitMode === 'metres'
? Math.round(
club.carryYards *
METRES_PER_YARD
)
: Math.round(
club.carryYards
)
),
})
)
}
onChangeText={(text) =>
setCarryDrafts(
(previous) => ({
...previous,
[club.id]:
text.replace(
/[^0-9]/g,
''
),
})
)
}
maxLength={3}
selectTextOnFocus
/>

<TouchableOpacity
style={styles.smallSaveButtonCompact}
onPress={() =>
saveClubCarry(
club
)
}
>
<Text style={styles.smallSaveText}>
{clubSavedId === club.id
? 'âœ“'
: 'SAVE'}
</Text>
</TouchableOpacity>
</View>
) : null}
</View>
))}
</View>
</>
);

const renderHoleNavigation = () => (
<>
<Text style={styles.fieldLabel}>
FRONT 9
</Text>

<View style={styles.holeGrid}>
{scorecard
.slice(0, 9)
.map((hole) => (
<TouchableOpacity
key={hole.hole}
style={[
styles.holeButton,
currentHole === hole.hole &&
styles.holeButtonActive,
 ]}
onPress={() =>
setLiveHole(
hole.hole
)
}
>
<Text
style={[
styles.holeNumber,
currentHole === hole.hole &&
styles.holeNumberActive,
 ]}
>
{hole.hole}
</Text>

<Text
style={[
styles.holeScore,
currentHole === hole.hole &&
styles.holeNumberActive,
 ]}
>
{hole.score || '-'}
</Text>
</TouchableOpacity>
))}
</View>

<Text style={styles.fieldLabel}>
BACK 9
</Text>

<View style={styles.holeGrid}>
{scorecard
.slice(9, 18)
.map((hole) => (
<TouchableOpacity
key={hole.hole}
style={[
styles.holeButton,
currentHole === hole.hole &&
styles.holeButtonActive,
 ]}
onPress={() =>
setLiveHole(
hole.hole
)
}
>
<Text
style={[
styles.holeNumber,
currentHole === hole.hole &&
styles.holeNumberActive,
 ]}
>
{hole.hole}
</Text>

<Text
style={[
styles.holeScore,
currentHole === hole.hole &&
styles.holeNumberActive,
 ]}
>
{hole.score || '-'}
</Text>
</TouchableOpacity>
))}
</View>
  </>
);
const renderScore = () => (

<>
<Text style={styles.pageTitle}>
LIVE HOLE
</Text>

<Text style={styles.pageSub}>
{courseName ||
'Round tracker'}
</Text>

<TouchableOpacity
style={styles.groupOpenButton}
onPress={() =>
changePage('SCORECARD')
}
>
<Text style={styles.groupOpenButtonText}>
OPEN FOUR PLAYER SCORECARD
</Text>
</TouchableOpacity>

{activeRound ? (
<View style={styles.liveRoundHero}>
<View style={{ flex: 1 }}>
<Text style={styles.liveRoundTiny}>
LIVE ROUND
</Text>

<Text style={styles.liveRoundName}>
{courseName}
</Text>

<Text style={styles.liveHoleCourseInfo}>
PAR {currentCourseHole.par}
{currentCourseHole.distance
? ` Â· ${currentCourseHole.distance} ${primaryLabel()}`
: ''}
</Text>
</View>

<View style={styles.liveRoundHoleBox}>
<Text style={styles.liveRoundHoleLabel}>
HOLE
</Text>

<Text style={styles.liveRoundHoleBig}>
{currentHole}
</Text>
</View>
</View>
) : (
<View style={styles.noRoundCard}>
<Text style={styles.noRoundText}>
No live round started.
</Text>

<TouchableOpacity
style={styles.secondaryButton}
onPress={() =>
changePage('COURSE')
}
>
<Text style={styles.secondaryButtonText}>
START A ROUND
</Text>
</TouchableOpacity>
</View>
)}

{activeRound
? <VoicePanel mode="ROUND" />
: null}

<View style={styles.scoreSummary}>
<View style={styles.scoreSummaryBox}>
<Text style={styles.smallGrey}>
HOLES
</Text>

<Text style={styles.bigWhite}>
{completedHoles.length}
</Text>
</View>

<View style={styles.scoreSummaryBox}>
<Text style={styles.smallGrey}>
TOTAL
</Text>

<Text style={styles.greenBigSmall}>
{totalScore || '-'}
</Text>
</View>

<View style={styles.scoreSummaryBox}>
<Text style={styles.smallGrey}>
TO PAR
</Text>

<Text style={styles.greenBigSmall}>
{toParText()}
</Text>
</View>

<View style={styles.scoreSummaryBox}>
<Text style={styles.smallGrey}>
PUTTS
</Text>

<Text style={styles.bigWhite}>
{totalPutts}
</Text>
</View>
</View>

{renderHoleNavigation()}

<View style={styles.roundToolRow}>
<TouchableOpacity
style={styles.roundToolButton}
onPress={() =>
changePage('CADDIE')
}
>
<Text style={styles.roundToolText}>
CADDIE
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.roundToolButton}
onPress={() =>
changePage('RECOVERY')
}
>
<Text style={styles.roundToolText}>
RECOVERY
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.roundToolButton}
onPress={() =>
setShowShotDetail(
(previous) =>
!previous
)
}
>
<Text style={styles.roundToolText}>
{showShotDetail
? 'HIDE SHOTS'
: 'SHOT DETAIL'}
</Text>
</TouchableOpacity>
</View>

<View style={styles.liveHoleCard}>
<Text style={styles.holeHero}>
HOLE {currentHole}
</Text>

<View style={styles.liveHoleCompactInfo}>
<Text style={styles.liveHoleCompactPar}>
PAR {currentHoleData.par}
</Text>

<Text style={styles.liveHoleCompactDistance}>
{currentCourseHole.distance
? `${currentCourseHole.distance} ${primaryLabel()}`
: 'DISTANCE NOT SET'}
</Text>
</View>

<View style={styles.twoColumn}>
<View style={styles.column}>
<Text style={styles.fieldLabel}>
SCORE
</Text>

<TextInput
style={styles.scoreInput}
value={currentHoleData.score}
onChangeText={(text) =>
updateHole(
'score',
text.replace(
/[^0-9]/g,
''
)
)
}
keyboardType="number-pad"
maxLength={2}
/>
</View>

<View style={styles.column}>
<Text style={styles.fieldLabel}>
PUTTS
</Text>

<TextInput
style={styles.scoreInput}
value={currentHoleData.putts}
onChangeText={(text) =>
updateHole(
'putts',
text.replace(
/[^0-9]/g,
''
)
)
}
keyboardType="number-pad"
maxLength={1}
/>
</View>
</View>

<Text style={styles.fieldLabel}>
G.I.R.
</Text>

<Selector
options={[
'YES',
'NO',
]}
value={currentHoleData.gir}
onChange={(value) =>
updateHole(
'gir',
value
)
}
/>

<Text style={styles.fieldLabel}>
FAIRWAY
</Text>

<Selector
options={[
'HIT',
'LEFT',
'RIGHT',
'N/A',
]}
value={currentHoleData.fairway}
onChange={(value) =>
updateHole(
'fairway',
value
)
}
/>

<View style={styles.quickEntryCard}>
<Text style={styles.quickEntryTitle}>
MANUAL FALLBACK
</Text>

<Text style={styles.quickEntryHint}>
Optional manual hole-detail entry.
Group scores stay manual on the four-player scorecard.
</Text>

<TextInput
style={styles.quickEntryInput}
value={quickEntry}
onChangeText={setQuickEntry}
placeholder="Driver 7 iron 2 putts score 5..."
placeholderTextColor="#777777"
returnKeyType="done"
onSubmitEditing={parseQuickEntry}
/>

<TouchableOpacity
style={styles.quickApplyButton}
onPress={parseQuickEntry}
>
<Text style={styles.quickApplyText}>
APPLY
</Text>
</TouchableOpacity>
</View>

<Text style={styles.fieldLabel}>
CLUBS / SHOTS USED
</Text>

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
>
{clubs.map((club) => (
<TouchableOpacity
key={club.id}
style={styles.horizontalClub}
onPress={() =>
addClubToCurrentHole(
club.name
)
}
>
<Text style={styles.horizontalClubText}>
{club.shortName || club.name}
</Text>
</TouchableOpacity>
))}
</ScrollView>

{(currentHoleData.clubsUsed || []).length > 0 ? (
<View style={styles.sequenceCard}>
<Text style={styles.sequenceTitle}>
SHOT SEQUENCE
</Text>

<View style={styles.sequenceWrap}>
{(currentHoleData.clubsUsed || []).map(
(clubName, index) => (
<TouchableOpacity
key={`${clubName}-${index}`}
style={styles.sequenceChip}
onPress={() =>
removeClubFromCurrentHole(
index
)
}
>
<Text style={styles.sequenceChipText}>
{index + 1}. {clubName}
</Text>
</TouchableOpacity>
)
)}
</View>
</View>
) : null}

{showShotDetail ? (
<View style={styles.shotDetailCard}>
<Text style={styles.sectionTitle}>
OPTIONAL SHOT DETAIL
</Text>

<Text style={styles.fieldLabel}>
CLUB
</Text>

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
>
{clubs
.filter(
(club) =>
club.id !==
'putter'
)
.map((club) => (
<TouchableOpacity
key={club.id}
style={[
styles.horizontalClub,
shotClub === club.name &&
styles.horizontalClubActive,
]}
onPress={() =>
setShotClub(
club.name
)
}
>
<Text
style={[
styles.horizontalClubText,
shotClub === club.name &&
styles.greenText,
]}
>
{club.shortName || club.name}
</Text>
</TouchableOpacity>
))}
</ScrollView>

<Text style={styles.fieldLabel}>
DISTANCE
</Text>

<TextInput
style={styles.shotDistanceInput}
keyboardType="number-pad"
value={shotDistance}
onChangeText={(text) =>
setShotDistance(
text.replace(
/[^0-9]/g,
''
)
)
}
placeholder="Optional"
placeholderTextColor="#666666"
maxLength={3}
/>

<Text style={styles.fieldLabel}>
LIE
</Text>

<Selector
options={LIE_OPTIONS}
value={shotLie}
onChange={setShotLie}
/>

<Text style={styles.fieldLabel}>
RESULT
</Text>

<Selector
options={SHOT_RESULTS}
value={shotResult}
onChange={setShotResult}
/>

<TouchableOpacity
style={styles.primaryButton}
onPress={addDetailedShot}
>
<Text style={styles.primaryButtonText}>
ADD SHOT
</Text>
</TouchableOpacity>

{(currentHoleData.shots || []).length > 0 ? (
<View style={styles.shotHistory}>
{(currentHoleData.shots || []).map(
(shot, index) => (
<TouchableOpacity
key={shot.id}
style={styles.shotHistoryRow}
onPress={() =>
removeDetailedShot(
shot.id
)
}
>
<View>
<Text style={styles.greenText}>
{index + 1}. {shot.club}
</Text>

<Text style={styles.smallGrey}>
{shot.distance
? `${shot.distance} ${primaryLabel()} Â· `
: ''}
{getShotLieLabel(
shot.lie
)} Â· {shot.result}
</Text>
</View>

<Text style={styles.removeText}>
REMOVE
</Text>
</TouchableOpacity>
)
)}
</View>
) : null}
</View>
) : null}

<Text style={styles.fieldLabel}>
NOTES
</Text>

<TextInput
style={styles.notesInput}
multiline
value={currentHoleData.notes}
onChangeText={(text) =>
updateHole(
'notes',
text
)
}
placeholder="Optional..."
placeholderTextColor="#777777"
/>

<View style={styles.moveRow}>
<TouchableOpacity
style={styles.secondaryHalf}
onPress={() =>
setLiveHole(
currentHole - 1
)
}
>
<Text style={styles.secondaryButtonText}>
PREVIOUS
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.primaryHalf}
onPress={() =>
setLiveHole(
currentHole + 1
)
}
>
<Text style={styles.primaryButtonText}>
NEXT HOLE
</Text>
</TouchableOpacity>
</View>
</View>

<TouchableOpacity
style={styles.primaryButton}
onPress={() =>
saveRound(false)
}
>
<Text style={styles.primaryButtonText}>
SAVE ROUND
</Text>
</TouchableOpacity>

{activeRound ? (
<TouchableOpacity
style={styles.finishRoundButton}
onPress={confirmFinishRound}
>
<Text style={styles.finishRoundText}>
FINISH ROUND
</Text>
</TouchableOpacity>
) : null}

{savedRounds.length > 0 ? (
<View style={styles.darkCard}>
<Text style={styles.sectionTitle}>
SAVED ROUNDS
</Text>

{savedRounds
.slice(0, 8)
.map((round) => (
<View
key={round.id}
style={styles.historyItem}
>
<Text style={styles.greenText}>
{round.courseName}
</Text>

<Text style={styles.smallGrey}>
{round.roundDate} Â·{' '}
{round.totalScore} shots Â·{' '}
{round.holesPlayed} holes
</Text>
</View>
))}
</View>
) : null}

<View style={{ height: 120 }} />
</>
);

const renderRecovery = () => (
<>
<ActiveRoundStrip />

<Text style={styles.pageTitle}>RECOVERY</Text>
<Text style={styles.pageSub}>
Make the safest professional decision from the lie in front of you.
</Text>

<View style={styles.callCard}>
<Text style={styles.callLabel}>CURRENT RECOVERY CALL</Text>
<Text style={styles.callClub}>{actualClub.name}</Text>
<Text style={styles.callText}>
{formatDistance(playsLikeYards)} Â· {getLieLabel()}
</Text>
</View>

<Text style={styles.fieldLabel}>LIE</Text>
<Selector
options={LIE_OPTIONS}
value={ballLie}
onChange={(value) => {
setBallLie(value);
setChosenClubId(null);
}}
/>

<View style={styles.shotDetailCard}>
<Text style={styles.sectionTitle}>DECISION</Text>
<Text style={styles.smallGrey}>
{ballLie === 'water'
? 'Take the appropriate relief or drop first. Then reassess the new distance and lie.'
: ballLie === 'greensideBunker'
? 'Use loft, commit to the splash and get the ball safely onto the green.'
: ballLie === 'fairwayBunker'
? 'Ball first. Clear the lip and choose the club that keeps the strike controlled.'
: ballLie === 'deepRough'
? 'Solid contact first. Accept the safer recovery and leave the next shot playable.'
: ballLie === 'rough'
? 'Allow for the lie. Prioritise solid contact and the next position.'
: ballLie === 'tee'
? 'Reset the decision. Pick the target, choose the shot and commit.'
: 'Use the normal shot when it is there. If trouble changes the percentage, choose the safer play.'}
</Text>
</View>

<Text style={styles.fieldLabel}>USE ANOTHER CLUB</Text>
<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
>
{clubs
.filter((club) => club.id !== 'putter')
.map((club) => (
<TouchableOpacity
key={club.id}
style={[
styles.horizontalClub,
chosenClubId === club.id && styles.horizontalClubActive,
]}
onPress={() =>
setChosenClubId(
chosenClubId === club.id ? null : club.id
)
}
>
<Text
style={[
styles.horizontalClubText,
chosenClubId === club.id && styles.greenText,
]}
>
{club.shortName || club.name}
</Text>
</TouchableOpacity>
))}
</ScrollView>

<TouchableOpacity
style={styles.primaryButton}
onPress={() => changePage('CADDIE')}
>
<Text style={styles.primaryButtonText}>OPEN CADDIE</Text>
</TouchableOpacity>

<View style={{ height: 100 }} />
</>
);

const renderTrack = () => (
<>
<Text style={styles.pageTitle}>TRACK SHOT</Text>
<Text style={styles.pageSub}>
Record a shot for your long-term club and miss history.
</Text>

<Text style={styles.fieldLabel}>CLUB</Text>
<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
>
{clubs
.filter((club) => club.id !== 'putter')
.map((club) => (
<TouchableOpacity
key={club.id}
style={[
styles.horizontalClub,
trackClub === club.name && styles.horizontalClubActive,
]}
onPress={() => setTrackClub(club.name)}
>
<Text
style={[
styles.horizontalClubText,
trackClub === club.name && styles.greenText,
]}
>
{club.shortName || club.name}
</Text>
</TouchableOpacity>
))}
</ScrollView>

<Text style={styles.fieldLabel}>DISTANCE</Text>
<TextInput
style={styles.shotDistanceInput}
keyboardType="number-pad"
value={trackDistance}
onChangeText={(value) =>
setTrackDistance(value.replace(/[^0-9]/g, '').slice(0, 3))
}
placeholder={`Distance ${primaryLabel()}`}
placeholderTextColor="#666666"
maxLength={3}
/>

<Text style={styles.fieldLabel}>LIE</Text>
<Selector
options={LIE_OPTIONS}
value={trackLie}
onChange={setTrackLie}
/>

<Text style={styles.fieldLabel}>RESULT</Text>
<Selector
options={SHOT_RESULTS}
value={trackResult}
onChange={setTrackResult}
/>

<TouchableOpacity
style={styles.primaryButton}
onPress={saveTrackedShot}
>
<Text style={styles.primaryButtonText}>SAVE SHOT</Text>
</TouchableOpacity>

{trackedShots.length > 0 ? (
<View style={styles.shotDetailCard}>
<Text style={styles.sectionTitle}>RECENT SHOTS</Text>
{trackedShots.slice(0, 20).map((shot) => (
<View key={shot.id} style={styles.shotHistoryRow}>
<View>
<Text style={styles.greenText}>{shot.club}</Text>
<Text style={styles.smallGrey}>
{shot.date} Â· {shot.distance} {primaryLabel()} Â· {getShotLieLabel(shot.lie)} Â· {shot.result}
</Text>
</View>
</View>
))}
</View>
) : null}

<View style={{ height: 100 }} />
</>
);

const renderPractice = () => (
<>
<Text style={styles.pageTitle}>
PRACTICE
</Text>

<Text style={styles.pageSub}>
Choose your club and number of balls. Then tell the caddie your shot results.
</Text>

{practiceActive ? (
<>
<VoicePanel mode="PRACTICE" />

<View style={styles.practiceLiveCard}>
<View style={styles.practiceLiveHeader}>
<View style={{ flex: 1 }}>
<Text style={styles.practiceStageTitle}>
{practiceType}
</Text>

<Text style={styles.practiceLiveSub}>
{practiceClub}
{practiceTargetDistance
? ` Â· ${practiceTargetDistance} ${primaryLabel()}`
: ''}
{practiceShotShape
? ` Â· ${practiceShotShape}`
: ''}
</Text>
</View>

<View style={styles.practiceRecordedBox}>
<Text style={styles.practiceRecordedLabel}>
RECORDED
</Text>

<Text style={styles.practiceRecordedValue}>
{practiceShotsRecorded}
</Text>
</View>
</View>

<View style={styles.practiceCounterGrid}>
<View style={styles.practiceCounterHalf}>
<PracticeCounter
label="GOOD"
value={practiceGoodShots}
setter={setPracticeGoodShots}
positive
/>
</View>

<View style={styles.practiceCounterHalf}>
<PracticeCounter
label="LEFT"
value={practiceLeftMisses}
setter={setPracticeLeftMisses}
/>
</View>

<View style={styles.practiceCounterHalf}>
<PracticeCounter
label="RIGHT"
value={practiceRightMisses}
setter={setPracticeRightMisses}
/>
</View>

<View style={styles.practiceCounterHalf}>
<PracticeCounter
label="SHORT"
value={practiceShortMisses}
setter={setPracticeShortMisses}
/>
</View>

<View style={styles.practiceCounterHalf}>
<PracticeCounter
label="LONG"
value={practiceLongMisses}
setter={setPracticeLongMisses}
/>
</View>
</View>

{infoMode === 'PRO' ? (
<View style={styles.practiceStrikeRow}>
  <Text style={styles.practiceStrikeText}>THIN {practiceThinStrikes}</Text>
  <Text style={styles.practiceStrikeText}>TOPPED {practiceToppedStrikes}</Text>
  <Text style={styles.practiceStrikeText}>HEAVY {practiceHeavyStrikes}</Text>
</View>
) : null}

<View style={styles.practiceStatsRow}>
<View style={styles.practiceStatBox}>
<Text style={styles.practiceStatLabel}>
SHOTS
</Text>

<Text style={styles.practiceStatValue}>
{practiceShotsRecorded}
</Text>
</View>

<View style={styles.practiceStatBox}>
<Text style={styles.practiceStatLabel}>
MISSES
</Text>

<Text style={styles.practiceStatValue}>
{practiceMisses}
</Text>
</View>

<View style={styles.practiceStatBox}>
<Text style={styles.practiceStatLabel}>
SUCCESS
</Text>

<Text style={styles.practiceStatGreen}>
{practiceSuccess}%
</Text>
</View>
</View>

<View style={styles.practiceSuccessCard}>
<Text style={styles.practiceSuccessLabel}>
SESSION SUCCESS
</Text>

<Text style={styles.practiceSuccessBig}>
{practiceSuccess}%
</Text>

<Text style={styles.practiceSuccessSub}>
GOOD SHOTS / RECORDED SHOTS
</Text>
</View>

<Text style={styles.fieldLabel}>
QUALITY
</Text>

<Selector
options={[
'GREAT',
'GOOD',
'AVERAGE',
'POOR',
]}
value={practiceQuality}
onChange={setPracticeQuality}
/>

<Text style={styles.fieldLabel}>
SESSION NOTE
</Text>

<TextInput
style={styles.notesInput}
multiline
value={practiceNote}
onChangeText={setPracticeNote}
placeholder="What did you learn?"
placeholderTextColor="#777777"
/>

<TouchableOpacity
style={styles.primaryButton}
onPress={savePractice}
>
<Text style={styles.primaryButtonText}>
SAVE PRACTICE
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.practiceResetCounters}
onPress={resetPracticeCounters}
>
<Text style={styles.practiceResetCountersText}>
RESET COUNTERS
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.secondaryButton}
onPress={() => {
stopVoiceMode();
setPracticeActive(false);
}}
>
<Text style={styles.secondaryButtonText}>
END WITHOUT SAVING
</Text>
</TouchableOpacity>
</View>
</>
) : (
<View style={styles.practiceSetupCard}>
<Text style={styles.practiceStageTitle}>
SESSION SETUP
</Text>

<Text style={styles.fieldLabel}>
PRACTICE TYPE
</Text>

<Selector
options={PRACTICE_TYPES}
value={practiceType}
onChange={setPracticeType}
/>

<Text style={styles.fieldLabel}>
CLUB
</Text>

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
>
{clubs.map((club) => (
<TouchableOpacity
key={club.id}
style={[
styles.horizontalClub,
practiceClub === club.name &&
styles.horizontalClubActive,
]}
onPress={() =>
setPracticeClub(
club.name
)
}
>
<Text
style={[
styles.horizontalClubText,
practiceClub === club.name &&
styles.greenText,
]}
>
{club.shortName || club.name}
</Text>
</TouchableOpacity>
))}
</ScrollView>

<Text style={styles.fieldLabel}>
TARGET DISTANCE
</Text>

<View style={styles.practiceDistanceRow}>
<TextInput
style={styles.practiceDistanceInput}
value={practiceTargetDistance}
onChangeText={(text) =>
setPracticeTargetDistance(
text.replace(
/[^0-9]/g,
''
)
)
}
keyboardType="number-pad"
placeholder="Optional"
placeholderTextColor="#666666"
maxLength={3}
/>

<View style={styles.practiceUnitBox}>
<Text style={styles.practiceUnitText}>
{primaryLabel()}
</Text>
</View>
</View>

<Text style={styles.fieldLabel}>
SHOT SHAPE
</Text>

<Selector
options={PRACTICE_SHAPES}
value={practiceShotShape}
onChange={setPracticeShotShape}
/>

<Text style={styles.fieldLabel}>
BALLS
</Text>

<Selector
options={[
'10',
'20',
'30',
'40',
'50',
]}
value={practiceBalls}
onChange={setPracticeBalls}
/>

<TouchableOpacity
style={styles.primaryButton}
onPress={() => {
resetPracticeCounters();
setPracticeActive(true);
startVoiceMode('PRACTICE');
}}
>
<Text style={styles.primaryButtonText}>
START PRACTICE
</Text>
</TouchableOpacity>
</View>
)}

{practiceHistory.length > 0 ? (
<View style={styles.practiceReviewCard}>
<Text style={styles.sectionTitle}>
PRACTICE HISTORY
</Text>

{practiceHistory
.slice(0, 10)
.map((item) => (
<View
key={item.id}
style={styles.practiceHistoryItem}
>
<View style={styles.practiceHistoryTop}>
<View style={{ flex: 1 }}>
<Text style={styles.greenText}>
{item.type}
</Text>

<Text style={styles.practiceHistoryClub}>
{item.club}
</Text>
</View>

<View style={styles.practiceHistoryPercentBox}>
<Text style={styles.practiceHistoryPercent}>
{item.successPercentage}%
</Text>
</View>
</View>

<Text style={styles.practiceHistoryDetail}>
{item.date} Â· {item.shotsRecorded} shots Â·{' '}
{item.goodShots} good Â· {item.misses} misses
</Text>

{item.note ? (
<Text style={styles.practiceHistoryNote}>
{item.note}
</Text>
) : null}
</View>
))}
</View>
) : null}

<View style={{ height: 100 }} />
</>
);

const renderWarmup = () => {
const item =
WARMUP_STEPS[warmupStep];

const progress =
((warmupStep + 1) /
WARMUP_STEPS.length) *
100;

return (
<>
<Text style={styles.pageTitle}>
WARM-UP
</Text>

<Text style={styles.pageSub}>
Prepare the body and the golf swing. Do not rebuild it.
</Text>

<View style={styles.warmupProgress}>
<Text style={styles.smallGrey}>
STEP {warmupStep + 1} OF {WARMUP_STEPS.length}
</Text>

<View style={styles.progressTrack}>
<View
style={[
styles.progressFill,
{
width:
`${progress}%`,
},
]}
/>
</View>
</View>

<View style={styles.warmupCard}>
<Text style={styles.warmupTitle}>
{item.title}
</Text>

<Text style={styles.warmupText}>
{item.text}
</Text>
</View>

<View style={styles.moveRow}>
<TouchableOpacity
style={styles.secondaryHalf}
onPress={() =>
setWarmupStep(
(previous) =>
Math.max(
0,
previous - 1
)
)
}
>
<Text style={styles.secondaryButtonText}>
PREVIOUS
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.primaryHalf}
onPress={() =>
setWarmupStep(
(previous) =>
Math.min(
WARMUP_STEPS.length - 1,
previous + 1
)
)
}
>
<Text style={styles.primaryButtonText}>
NEXT
</Text>
</TouchableOpacity>
</View>

<TouchableOpacity
style={styles.secondaryButton}
onPress={() =>
setWarmupStep(0)
}
>
<Text style={styles.secondaryButtonText}>
RESET WARM-UP
</Text>
</TouchableOpacity>

<View style={{ height: 100 }} />
</>
);
};

const renderRoutines = () => (
<>
<Text style={styles.pageTitle}>YOUR ROUTINE</Text>
<Text style={styles.pageSub}>Build the routine that works for you.</Text>
<View style={styles.routineEditCard}>
{routineSteps.map((step, index) => (
  <View key={`routine-step-${index}`} style={styles.routineEditRow}>
    <Text style={styles.routineEditNumber}>{index + 1}</Text>
    <TextInput
      style={styles.routineEditInput}
      value={step}
      onChangeText={(value) => setRoutineSteps((previous) => previous.map((item, itemIndex) => itemIndex === index ? value : item))}
      placeholder="Your step"
      placeholderTextColor="#6F7C74"
      maxLength={60}
    />
  </View>
))}
</View>
<TouchableOpacity style={styles.primaryButton} onPress={saveRoutineSteps}>
  <Text style={styles.primaryButtonText}>SAVE MY ROUTINE</Text>
</TouchableOpacity>
<View style={styles.routineHabitCard}>
  <Text style={styles.routineHabitTop}>PRACTICE LIKE YOUâ€™RE PLAYING</Text>
  <Text style={styles.routineHabitBottom}>MAKE IT A HABIT</Text>
</View>
<View style={{ height: 100 }} />
</>
);
const renderSettings = () => (
<>
<Text style={styles.pageTitle}>SETTINGS</Text>
<Text style={styles.pageSub}>Choose how much information you want to see. The Caddie stays available in both modes.</Text>
<Text style={styles.fieldLabel}>PLAYER MODE</Text>
<Selector options={[[ 'AMATEUR', 'AMATEUR' ],[ 'PRO', 'PRO' ]]} value={infoMode} onChange={setInfoMode} />
<View style={styles.settingsInfoCard}>
<Text style={styles.settingsInfoTitle}>{infoMode === 'PRO' ? 'PRO' : 'AMATEUR'}</Text>
<Text style={styles.settingsInfoText}>
{infoMode === 'PRO'
? 'Full caddie detail, plays-like reasoning, conditions, lie detail and deeper practice information.'
: 'Simple advice you can follow quickly. Tour Pro Elite still does the full calculation in the background.'}
</Text>
</View>
<View style={{ height: 100 }} />
</>
);
const renderCurrentPage = () => {
  if (page === 'HOME') {
    return renderHome();
  }

  if (page === 'RECOVERY') {
    return renderRecovery();
  }

  if (page === 'CADDIE') {
    return renderCaddie();
  }

  if (page === 'BAG') {
    return renderBag();
  }

  if (page === 'COURSE') {
    return renderCourse();
  }

  if (page === 'SCORE') {
    return renderScore();
  }

  if (page === 'SCORECARD') {
    return renderGroupScorecard();
  }

  if (page === 'TRACK') {
    return renderTrack();
  }

  if (page === 'PRACTICE') {
    return renderPractice();
  }

  if (page === 'WARMUP') {
    return renderWarmup();
  }

  if (page === 'ROUTINES') {
    return renderRoutines();
  }

  if (page === 'SETTINGS') {
    return renderSettings();
  }

  return renderHome();
};

return (
  <View style={styles.screen}>
    <View style={styles.header}>
      <Text style={styles.appName}>
        TOUR PRO ELITE
      </Text>

      <Text style={styles.versionText}>
        PRO CADDIE SUITE
      </Text>

      {page !== 'HOME' ? (
        <TouchableOpacity
          style={styles.homeHeaderButton}
          onPress={() => changePage('HOME')}
        >
          <Text style={styles.homeHeaderText}>
            HOME
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>

    <ScrollView
      key={page}
      style={styles.mainScroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentInsetAdjustmentBehavior="automatic"
    >
      {renderCurrentPage()}
    </ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07130D',
  },

  mainScroll: {
    flex: 1,
    backgroundColor: '#07130D',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 140,
  },

  header: {
    minHeight: 82,
    backgroundColor: '#07130D',
    borderBottomWidth: 1,
    borderBottomColor: '#1D3A2A',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    justifyContent: 'center',
  },

  appName: {
    color: '#D8B64D',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  versionText: {
    color: '#6E7A73',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },

  homeHeaderButton: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  homeHeaderText: {
    color: '#D8B64D',
    fontSize: 10,
    fontWeight: '900',
  },

  pageTitle: {
    color: '#D8B64D',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  pageSub: {
    color: '#A6B0AA',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 16,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },


  fieldLabel: {
    color: '#AAB4AE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 7,
  },

  greenText: {
    color: '#00FF00',
    fontSize: 12,
    fontWeight: '900',
  },

  smallGrey: {
    color: '#7E8A84',
    fontSize: 10,
    fontWeight: '700',
  },

  bigWhite: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  greenBigSmall: {
    color: '#00FF00',
    fontSize: 20,
    fontWeight: '900',
  },

  heroCard: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },

  heroSmall: {
    color: '#D8B64D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },

  heroText: {
    color: '#98A49D',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  homeButton: {
    width: '100%',
    minHeight: 70,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 11,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  homeButtonCentered: {
    alignItems: 'center',
  },

  homeButtonTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  homeButtonSub: {
    color: '#78867F',
    fontSize: 10,
    marginTop: 4,
  },

  activeRoundStrip: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeRoundLeft: {
    flex: 1,
  },

  activeRoundRight: {
    alignItems: 'flex-end',
  },

  activeRoundLabel: {
    color: '#D8B64D',
    fontSize: 8,
    fontWeight: '900',
  },

  activeRoundCourse: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },

  activeRoundHole: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  activeRoundTap: {
    color: '#78867F',
    fontSize: 8,
    marginTop: 3,
  },

  primaryButton: {
    width: '100%',
    minHeight: 50,
    backgroundColor: '#00FF00',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  primaryButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },

  secondaryButton: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#35513F',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  darkCard: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 10,
    padding: 14,
    marginTop: 15,
  },

  selectorWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  selectorButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 7,
    backgroundColor: '#0B1A12',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectorButtonActive: {
    backgroundColor: '#163822',
    borderColor: '#00FF00',
  },

  selectorText: {
    color: '#98A49D',
    fontSize: 9,
    fontWeight: '900',
  },

  selectorTextActive: {
    color: '#00FF00',
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  stepperButton: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#36503E',
    backgroundColor: '#102218',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepperButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },

  stepperValueBox: {
    flex: 1,
    height: 64,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepperValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },

  stepperUnit: {
    color: '#00FF00',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },

  caddieHero: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },

  caddieTiny: {
    color: '#7E8A84',
    fontSize: 9,
    fontWeight: '900',
  },

  caddieDistance: {
    color: '#FFFFFF',
    fontSize: 45,
    fontWeight: '900',
    lineHeight: 50,
  },

  caddieUnit: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '900',
  },

  caddieClub: {
    color: '#D8B64D',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },

  callCard: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 10,
    padding: 15,
    marginTop: 16,
  },

  callLabel: {
    color: '#D8B64D',
    fontSize: 9,
    fontWeight: '900',
  },

  callClub: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },

  callText: {
    color: '#95A198',
    fontSize: 11,
    marginTop: 5,
  },

  voiceCard: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  voiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  voiceTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  voiceStatus: {
    color: '#77847C',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
  },

  voiceDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#4D5B52',
  },

  voiceDotLive: {
    backgroundColor: '#00FF00',
  },

  voiceResponse: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },

  voiceTranscript: {
    color: '#758078',
    fontSize: 9,
    marginTop: 8,
  },

  voiceButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  voiceButton: {
    flex: 1,
    minHeight: 43,
    backgroundColor: '#00FF00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceButtonStop: {
    backgroundColor: '#3D4741',
  },

  voiceButtonText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },

  voiceSpeakButton: {
    flex: 1,
    minHeight: 43,
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceSpeakButtonText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '900',
  },

  entryScreen: {
    flex: 1,
    backgroundColor: '#07130D',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },

  entryBrand: {
    color: '#D8B64D',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  entryStep: {
    color: '#78867F',
    fontSize: 10,
    fontWeight: '800',
  },

  onboardingCard: {
    backgroundColor: '#102218',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D3A2A',
    padding: 24,
  },

  onboardingTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },

  onboardingText: {
    color: '#9BA69F',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 11,
  },

  onboardingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginVertical: 25,
  },

  onboardingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#324038',
  },

  onboardingDotActive: {
    backgroundColor: '#D8B64D',
  },

  entryPrimaryButton: {
    width: '100%',
    minHeight: 52,
    backgroundColor: '#1677FF',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  entryPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  authScroll: {
    flex: 1,
    backgroundColor: '#07130D',
  },

  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  authBrandBox: {
    alignItems: 'center',
    marginBottom: 30,
  },

  authTour: {
    color: '#D8B64D',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  authElite: {
    color: '#1677FF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 3,
  },

  authTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  authSub: {
    color: '#7C8981',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 18,
  },

  authTextButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  authTextButtonText: {
    color: '#AEB8B1',
    fontSize: 10,
    fontWeight: '900',
  },

  passwordInputWrap: {
    position: 'relative',
    marginTop: 10,
  },

  passwordTextInput: {
    paddingRight: 50,
    marginTop: 0,
  },

  passwordEyeButton: {
    position: 'absolute',
    right: 0,
    width: 48,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  passwordEyeText: {
    fontSize: 18,
  },

  textInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 10,
  },  courseActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  courseSmallButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#102218',
  },

  courseSmallButtonText: {
    color: '#D8B64D',
    fontSize: 10,
    fontWeight: '900',
  },

  courseStatus: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },

  courseCardProfessional: {
    width: '100%',
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 11,
    padding: 12,
    marginTop: 15,
  },

  courseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  courseCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  courseCardSubtitle: {
    color: '#758078',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 4,
  },

  courseTotalsBox: {
    minWidth: 58,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  courseTotalsLabel: {
    color: '#8C967F',
    fontSize: 8,
    fontWeight: '900',
  },

  courseTotalsValue: {
    color: '#D8B64D',
    fontSize: 21,
    fontWeight: '900',
  },

  courseNineBlock: {
    width: '100%',
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 8,
    padding: 7,
    marginTop: 10,
  },

  courseNineTitle: {
    color: '#D8B64D',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
  },
  courseSwipeHint: { color: '#7E8A84', fontSize: 9, fontWeight: '900', marginBottom: 6 },

  courseTableRow: {
    flexDirection: 'row',
    minHeight: 39,
  },

  courseTableLabelCell: {
    width: 52,
    minHeight: 39,
    backgroundColor: '#122119',
    borderWidth: 0.5,
    borderColor: '#294133',
    justifyContent: 'center',
    alignItems: 'center',
  },

  courseTableLabelText: {
    color: '#8A968E',
    fontSize: 9,
    fontWeight: '900',
  },

  courseTableCell: {
    width: 43,
    minHeight: 39,
    backgroundColor: '#122119',
    borderWidth: 0.5,
    borderColor: '#294133',
    justifyContent: 'center',
    alignItems: 'center',
  },

  courseTableHole: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  courseTableParCell: {
    backgroundColor: '#14281A',
  },

  courseTableParText: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: '900',
  },

  courseDistanceCell: {
    width: 43,
    minHeight: 39,
    backgroundColor: '#122119',
    borderWidth: 0.5,
    borderColor: '#294133',
    justifyContent: 'center',
    alignItems: 'center',
  },

  courseDistanceInput: {
    width: 42,
    height: 38,
    paddingHorizontal: 1,
    paddingVertical: 0,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },

  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#294133',
  },

  courseFooterRight: {
    alignItems: 'flex-end',
  },

  courseFooterLabel: {
    color: '#758078',
    fontSize: 8,
    fontWeight: '900',
  },

  courseFooterValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },

  bagCard: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },

  bagCompactRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#1D3A2A',
    paddingVertical: 4,
  },

  bagCompactTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bagCompactBottom: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },

  bagClubCompact: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  bagCarryCompact: {
    color: '#00FF00',
    fontSize: 11,
    fontWeight: '900',
  },

  numberInputCompact: {
    flex: 1,
    height: 30,
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 7,
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },

  smallSaveButtonCompact: {
    width: 54,
    height: 30,
    backgroundColor: '#D8B64D',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallSaveText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  scoreSummary: {
    flexDirection: 'row',
    backgroundColor: '#102218',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 16,
  },

  scoreSummaryBox: {
    flex: 1,
    alignItems: 'center',
  },

  holeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  holeButton: {
    width: '10%',
    minHeight: 52,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  holeButtonActive: {
    backgroundColor: '#D8B64D',
    borderColor: '#D8B64D',
  },

  holeNumber: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  holeScore: {
    color: '#7E8A84',
    fontSize: 10,
    marginTop: 3,
  },

  holeNumberActive: {
    color: '#000000',
  },  roundToolRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
    marginBottom: 4,
  },

  roundToolButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#102218',
  },

  roundToolText: {
    color: '#D8B64D',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  liveHoleCard: {
    width: '100%',
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#1D3A2A',
    borderRadius: 10,
    padding: 15,
    marginTop: 16,
  },

  holeHero: {
    color: '#D8B64D',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  liveHoleCompactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    marginBottom: 2,
  },

  liveHoleCompactPar: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  liveHoleCompactDistance: {
    color: '#00FF00',
    fontSize: 13,
    fontWeight: '900',
  },  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },

  column: {
    flex: 1,
  },

  scoreInput: {
    width: '100%',
    height: 58,
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  quickEntryCard: {
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 9,
    padding: 12,
    marginTop: 18,
  },

  quickEntryTitle: {
    color: '#D8B64D',
    fontSize: 13,
    fontWeight: '900',
  },

  quickEntryHint: {
    color: '#7E8A84',
    fontSize: 10,
    marginTop: 4,
    marginBottom: 9,
  },  quickEntryInput: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
  },

  quickApplyButton: {
    minHeight: 44,
    backgroundColor: '#D8B64D',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
  },

  quickApplyText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
  },

  horizontalClub: {
    minHeight: 43,
    paddingHorizontal: 14,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    justifyContent: 'center',
    marginRight: 8,
  },

  horizontalClubActive: {
    borderColor: '#00FF00',
    backgroundColor: '#163822',
  },

  horizontalClubText: {
    color: '#C3CBC6',
    fontSize: 12,
    fontWeight: '900',
  },  sequenceCard: {
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    padding: 11,
    marginTop: 10,
  },

  sequenceTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  sequenceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },

  sequenceChip: {
    backgroundColor: '#163822',
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  sequenceChipText: {
    color: '#00FF00',
    fontSize: 11,
    fontWeight: '900',
  },  shotDetailCard: {
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 9,
    padding: 12,
    marginTop: 14,
  },

  shotDistanceInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 8,
    color: '#00FF00',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },

  shotHistory: {
    marginTop: 14,
  },

  shotHistoryRow: {
    minHeight: 54,
    borderTopWidth: 1,
    borderTopColor: '#294133',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },

  removeText: {
    color: '#FF7777',
    fontSize: 9,
    fontWeight: '900',
  },  notesInput: {
    width: '100%',
    minHeight: 80,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    color: '#FFFFFF',
    padding: 12,
    textAlignVertical: 'top',
  },

  moveRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  secondaryHalf: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#35513F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryHalf: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#00FF00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },  finishRoundButton: {
    width: '100%',
    minHeight: 50,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF7777',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  finishRoundText: {
    color: '#FF7777',
    fontWeight: '900',
    fontSize: 12,
  },

  historyItem: {
    borderTopWidth: 1,
    borderTopColor: '#294133',
    paddingVertical: 11,
  },  practiceTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },

  practiceTypeButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    backgroundColor: '#102218',
    justifyContent: 'center',
    alignItems: 'center',
  },

  practiceTypeButtonActive: {
    borderColor: '#D8B64D',
    backgroundColor: '#2A2617',
  },

  practiceTypeText: {
    color: '#C3CBC6',
    fontSize: 11,
    fontWeight: '900',
  },

  practiceTypeTextActive: {
    color: '#D8B64D',
  },  practiceShapeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  practiceShapeButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    backgroundColor: '#102218',
    justifyContent: 'center',
    alignItems: 'center',
  },

  practiceShapeButtonActive: {
    borderColor: '#00FF00',
    backgroundColor: '#163822',
  },

  practiceShapeText: {
    color: '#C3CBC6',
    fontSize: 11,
    fontWeight: '900',
  },

  practiceShapeTextActive: {
    color: '#00FF00',
  },  practiceResultRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },

  practiceResultButton: {
    minWidth: 74,
    minHeight: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    backgroundColor: '#102218',
    justifyContent: 'center',
    alignItems: 'center',
  },

  practiceResultButtonActive: {
    borderColor: '#D8B64D',
    backgroundColor: '#2A2617',
  },

  practiceResultText: {
    color: '#C3CBC6',
    fontSize: 10,
    fontWeight: '900',
  },

  practiceResultTextActive: {
    color: '#D8B64D',
  },  practiceStatsCard: {
    marginTop: 14,
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 9,
    padding: 12,
  },

  practiceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
  },

  practiceStatsLabel: {
    color: '#C3CBC6',
    fontSize: 11,
    fontWeight: '700',
  },

  practiceStatsValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  practiceGoodValue: {
    color: '#00FF00',
  },

  practiceBadValue: {
    color: '#FF7777',
  },  practiceHistoryItem: {
    borderTopWidth: 1,
    borderTopColor: '#294133',
    paddingVertical: 11,
  },

  practiceHistoryTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  practiceHistoryMeta: {
    color: '#7E8A84',
    fontSize: 10,
    marginTop: 3,
  },

  warmupStep: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    backgroundColor: '#102218',
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  warmupStepDone: {
    borderColor: '#00FF00',
    backgroundColor: '#163822',
  },  warmupStepText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },

  warmupStepTextDone: {
    color: '#00FF00',
  },

  warmupCheck: {
    color: '#00FF00',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },

  routineItem: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    backgroundColor: '#102218',
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  routineItemDone: {
    borderColor: '#D8B64D',
    backgroundColor: '#2A2617',
  },  routineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },

  routineTextDone: {
    color: '#D8B64D',
  },

  routineCheck: {
    color: '#D8B64D',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },

  settingsRow: {
    marginBottom: 14,
  },

  settingsLabel: {
    color: '#C3CBC6',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 7,
  },

  settingsOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  settingsButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 8,
    backgroundColor: '#102218',
    justifyContent: 'center',
    alignItems: 'center',
  },  settingsButtonActive: {
    borderColor: '#00FF00',
    backgroundColor: '#163822',
  },

  settingsButtonText: {
    color: '#C3CBC6',
    fontSize: 11,
    fontWeight: '900',
  },

  settingsButtonTextActive: {
    color: '#00FF00',
  },

  profileCard: {
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 9,
    padding: 12,
    marginBottom: 14,
  },

  profileTitle: {
    color: '#D8B64D',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },

  profileValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  warmupProgress: { marginTop: 8, marginBottom: 12 },
  progressTrack: { height: 5, backgroundColor: '#1D3A2A', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', backgroundColor: '#00FF00' },
  warmupCard: { minHeight: 170, backgroundColor: '#102218', borderWidth: 1, borderColor: '#294133', borderRadius: 10, padding: 16, justifyContent: 'center' },
  warmupTitle: { color: '#D8B64D', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  warmupText: { color: '#FFFFFF', fontSize: 14, lineHeight: 21, fontWeight: '600' },
  routineEditCard: { backgroundColor: '#102218', borderWidth: 1, borderColor: '#294133', borderRadius: 10, padding: 10, marginTop: 8 },
  routineEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  routineEditNumber: { width: 24, color: '#D8B64D', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  routineEditInput: { flex: 1, minHeight: 42, backgroundColor: '#0B1A12', borderWidth: 1, borderColor: '#294133', borderRadius: 8, color: '#FFFFFF', fontSize: 13, paddingHorizontal: 10 },
  routineHabitCard: { marginTop: 18, alignItems: 'center', paddingVertical: 18, borderTopWidth: 1, borderTopColor: '#294133' },
  routineHabitTop: { color: '#D8B64D', fontSize: 14, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  routineHabitBottom: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 5, letterSpacing: 1 },
  practiceStrikeRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#102218', borderRadius: 8, padding: 10, marginTop: 10 },
  practiceStrikeText: { color: '#D8B64D', fontSize: 10, fontWeight: '900' },

  settingsInfoCard: {
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 10,
    padding: 14,
    marginTop: 14,
  },
  settingsInfoTitle: {
    color: '#D8B64D',
    fontSize: 13,
    fontWeight: '900',
  },
  settingsInfoText: {
    color: '#C3CBC6',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  bunkerPinCard: {
    backgroundColor: '#0B1A12',
    borderWidth: 1,
    borderColor: '#294133',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  bunkerPinInput: {
    height: 46,
    backgroundColor: '#102218',
    borderWidth: 1,
    borderColor: '#D8B64D',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 7,
  },
});

 
  
