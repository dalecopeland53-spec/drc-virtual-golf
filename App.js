import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

// ==========================================
// 1. GOLF COURSE DATA (CAPRICORN RESORT PRO)
// ==========================================
const COURSE_NAME = "Capricorn Resort";
const FALLBACK_MAP = "https://unsplash.com";

const HOLE_DATA = [
  {
    holeNumber: 1, par: 5, si: 5, distanceToCentre: 498, distanceFront: 480, distanceBack: 512,
    elevationChange: 4, 
    safeMissZone: "Right side of fairway or short of the green. Left is dense bush.",
    caddieText: "498 metres to the centre. With a slight headwind, I'd suggest driver. Aim just right of centre.",
    recommendedClub: "Driver", estCarry: 230, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '10%', left: '50%' }, tee: { top: '80%', left: '50%' } }
  },
  {
    holeNumber: 2, par: 4, si: 11, distanceToCentre: 365, distanceFront: 350, distanceBack: 380,
    elevationChange: -3, 
    safeMissZone: "Short-left of the green avoids the deep greenside bunker on the right.",
    caddieText: "365 metres. Watch out for the fairway bunker on the left. A smooth 3-wood is perfect here.",
    recommendedClub: "3-Wood", estCarry: 210, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '15%', left: '45%' }, tee: { top: '78%', left: '52%' } }
  },
  {
    holeNumber: 3, par: 3, si: 17, distanceToCentre: 145, distanceFront: 135, distanceBack: 155,
    elevationChange: 1, 
    safeMissZone: "Center of the green is best. Long is dead, short leaves an easy chip.",
    caddieText: "Short par 3. Wind is brushing off the right. Trust a standard 7-iron to find the dance floor.",
    recommendedClub: "7-Iron", estCarry: 140, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '20%', left: '50%' }, tee: { top: '70%', left: '50%' } }
  },
  {
    holeNumber: 4, par: 4, si: 1, distanceToCentre: 410, distanceFront: 390, distanceBack: 425,
    elevationChange: 6, 
    safeMissZone: "Right-center off the tee. Left side blocks your second shot completely.",
    caddieText: "Stroke Index 1. Long par 4. Keep your tee shot right of the center line to avoid a total block out.",
    recommendedClub: "Driver", estCarry: 230, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '12%', left: '48%' }, tee: { top: '82%', left: '50%' } }
  },
  {
    holeNumber: 5, par: 4, si: 7, distanceToCentre: 385, distanceFront: 370, distanceBack: 398,
    elevationChange: -2,
    safeMissZone: "Short is fine. Over the green is a severe drop-off into deep trouble.",
    caddieText: "Welcome to Hole 5. Aim straight down the narrow neck. A controlled hybrid keeps you safe.",
    recommendedClub: "Hybrid", estCarry: 195, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '14%', left: '52%' }, tee: { top: '80%', left: '48%' } }
  },
  {
    holeNumber: 6, par: 4, si: 13, distanceToCentre: 340, distanceFront: 325, distanceBack: 355,
    elevationChange: 0,
    safeMissZone: "Left fairway leaves a great angle. Avoid the right bunkers at all costs.",
    caddieText: "A shorter par 4 with a slight dogleg. Avoid the fairway bunkers on the right. A smooth hybrid or 5-wood off the tee sets up a wedge into the green.",
    recommendedClub: "5-Wood", estCarry: 200, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '15%', left: '38%' }, tee: { top: '85%', left: '60%' } }
  },
  {
    holeNumber: 7, par: 3, si: 15, distanceToCentre: 165, distanceFront: 150, distanceBack: 175,
    elevationChange: 2,
    safeMissZone: "Long-right is safe. Short-left drops straight into a swampy hazard.",
    caddieText: "Mid-length par 3 with a well-guarded green. Wind usually cross-breezes from the ocean here. Take an extra club to ensure you clear the front hazard.",
    recommendedClub: "6-Iron", estCarry: 160, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '18%', left: '50%' }, tee: { top: '75%', left: '50%' } }
  },
  {
    holeNumber: 8, par: 5, si: 3, distanceToCentre: 515, distanceFront: 495, distanceBack: 530,
    elevationChange: -1,
    safeMissZone: "Always favor the right side. The entire left edge is water boundary.",
    caddieText: "Monster par 5 into the prevailing wind. Keep your layup shot down the right side to avoid the water hazard winding along the left fairway.",
    recommendedClub: "Driver", estCarry: 230, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '10%', left: '45%' }, tee: { top: '88%', left: '55%' } }
  },
  {
    holeNumber: 9, par: 4, si: 9, distanceToCentre: 390, distanceFront: 375, distanceBack: 405,
    elevationChange: 5,
    safeMissZone: "Aim right. The green slants heavily from right to left.",
    caddieText: "Tough finishing hole for the front nine. Aim just left of the fairway tree line. The green is elevated, so hitting an extra club on your approach is smart.",
    recommendedClub: "Driver", estCarry: 225, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '12%', left: '50%' }, tee: { top: '80%', left: '50%' } }
  },
  {
    holeNumber: 10, par: 4, si: 10, distanceToCentre: 375, distanceFront: 360, distanceBack: 390,
    elevationChange: 1,
    safeMissZone: "Left side gives the best view. Right side gets tight near trees.",
    caddieText: "Starting the back nine fresh. Fairway opens up nicely here, so let the driver rip right down the center line to setup an easy short iron.",
    recommendedClub: "Driver", estCarry: 230, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '14%', left: '48%' }, tee: { top: '82%', left: '52%' } }
  },
  {
    holeNumber: 11, par: 4, si: 4, distanceToCentre: 415, distanceFront: 395, distanceBack: 430,
    elevationChange: 3,
    safeMissZone: "Right-center off the tee. Deep sand trap waits on the left landing path.",
    caddieText: "Long par 4 that requires accuracy. A deep bunker guards the left landing area. Favor the right-center side off the tee to leave an open angle.",
    recommendedClub: "Driver", estCarry: 230, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '11%', left: '46%' }, tee: { top: '84%', left: '54%' } }
  },
  {
    holeNumber: 12, par: 3, si: 18, distanceToCentre: 135, distanceFront: 125, distanceBack: 142,
    elevationChange: -4, 
    safeMissZone: "Long is fine. Anything short drops into deep sand or false front rolls.",
    caddieText: "The shortest par 3 on the course, but highly technical. Club down and focus entirely on target accuracy—falling short drops you straight into sand.",
    recommendedClub: "9-Iron", estCarry: 130, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '22%', left: '50%' }, tee: { top: '68%', left: '50%' } }
  },
  {
    holeNumber: 13, par: 5, si: 8, distanceToCentre: 490, distanceFront: 475, distanceBack: 505,
    elevationChange: -2,
    safeMissZone: "Short-left of the green is completely safe for a standard approach.",
    caddieText: "Reach-in-two opportunity if you hit a big drive! Aim for the crest of the hill. If laying up, stay short of the cross-bunkers at 100 meters out.",
    recommendedClub: "Driver", estCarry: 235, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '10%', left: '52%' }, tee: { top: '86%', left: '48%' } }
  },
  {
    holeNumber: 14, par: 4, si: 12, distanceToCentre: 355, distanceFront: 340, distanceBack: 368,
    elevationChange: 0,
    safeMissZone: "Aim out right toward the corner. Trying to cut the trees left is risky.",
    caddieText: "Sharp dogleg left. Big hitters can try to cut the corner over the trees, but a controlled 3-wood to the corner is the textbook professional play.",
    recommendedClub: "3-Wood", estCarry: 215, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '20%', left: '35%' }, tee: { top: '80%', left: '65%' } }
  },
  {
    holeNumber: 15, par: 4, si: 2, distanceToCentre: 425, distanceFront: 405, distanceBack: 440,
    elevationChange: 5, 
    safeMissZone: "Short-right chip is manageable. Left is completely blocked by hazard walls.",
    caddieText: "Ranked as the hardest par 4 on the back nine. It demands a long, straight tee shot. If you cannot reach in two, play safe and try to scramble for par.",
    recommendedClub: "Driver", estCarry: 230, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '12%', left: '49%' }, tee: { top: '83%', left: '51%' } }
  },
  {
    holeNumber: 16, par: 3, si: 16, distanceToCentre: 155, distanceFront: 142, distanceBack: 165,
    elevationChange: -1,
    safeMissZone: "Aim exactly for the heart of the green fabric. Left and right are deep ravines.",
    caddieText: "Beautiful par 3 over a native vegetation dip. The green is wide but shallow. Trust your carry distance and aim directly for the center of the green structure.",
    recommendedClub: "7-Iron", estCarry: 150, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '16%', left: '50%' }, tee: { top: '72%', left: '50%' } }
  },
  {
    holeNumber: 17, par: 4, si: 6, distanceToCentre: 400, distanceFront: 385, distanceBack: 412,
    elevationChange: 2,
    safeMissZone: "Safe zone is anywhere right of center. Left is dense bush boundaries.",
    caddieText: "Tee shot requires threading a narrow gap. Thick bush lines both sides of the fairway. Keep your swing smooth and prioritize placement over absolute power.",
    recommendedClub: "Driver", estCarry: 220, aerialImageUrl: FALLBACK_MAP,
    markers: { green: { top: '13%', left: '51%' }, tee: { top: '79%', left: '49%' } }
  },
  {
    holeNumber: 18, par: 5, si: 14, distanceToCentre: 480, distanceFront: 460, distanceBack: 495,
    elevationChange: -2,
