export class StrokesGainedEngine {
  static getTourExpectancyMatrix(lieType, distanceYards) {
    const dist = Math.max(0, distanceYards);
    if (dist === 0) return 0;

    switch (lieType.toLowerCase()) {
      case 'tee':
        if (dist >= 450) return 4.25;
        if (dist >= 400) return 3.99;
        if (dist >= 350) return 3.82;
        return 3.45;
      case 'fairway':
        if (dist >= 250) return 3.65;
        if (dist >= 200) return 3.21;
        if (dist >= 150) return 2.91;
        if (dist >= 100) return 2.72;
        return 2.10;
      case 'rough':
        if (dist >= 200) return 3.52;
        if (dist >= 150) return 3.18;
        if (dist >= 100) return 2.98;
        return 2.35;
      case 'sand':
        return dist >= 30 ? 2.95 : 2.42;
      case 'green':
        if (dist > 30) return 2.05;
        if (dist > 15) return 1.78;
        if (dist > 3) return 1.15;
        return 1.01;
      default:
        return 3.00;
    }
  }

  static calculateShotStrokesGained(currentShot, nextShot) {
    if (!currentShot || typeof currentShot.distanceRemainingYards !== 'number') return 0;
    const beforeExpectancy = this.getTourExpectancyMatrix(currentShot.lieType, currentShot.distanceRemainingYards);
    
    if (!nextShot) {
      return Number((beforeExpectancy - 1).toFixed(3));
    }

    const afterExpectancy = this.getTourExpectancyMatrix(nextShot.lieType, nextShot.distanceRemainingYards);
    return Number((beforeExpectancy - afterExpectancy - 1).toFixed(3));
  }

  static calculateTrueCarryAdjustment(baseCarryMeters, tempCelsius, windKmH, windDirectionAngle) {
    let adjustedCarry = baseCarryMeters;
    const tempDelta = tempCelsius - 20;
    adjustedCarry += (tempDelta * 0.12);

    const radians = (windDirectionAngle * Math.PI) / 180;
    const windVector = windKmH * Math.cos(radians); 

    if (windVector > 0) {
      adjustedCarry -= (windVector * 0.85);
    } else {
      adjustedCarry += (Math.abs(windVector) * 0.45);
    }

    return Number(Math.max(0, adjustedCarry).toFixed(1));
  }
}

export class LaunchMonitorBridge {
  static processHardwareTelemetry(rawPayload) {
    try {
      if (!rawPayload || typeof rawPayload !== 'string') return null;
      const segments = rawPayload.toUpperCase().split(',');
      const telemetry = { ballSpeedMph: 0, launchAngleDeg: 0, spinRateRpm: 0, isValidRun: false };

      segments.forEach(segment => {
        const [key, value] = segment.split(':');
        if (!key || !value) return;
        const val = parseFloat(value);
        if (isNaN(val)) return;

        if (key === 'SPEED' && val > 0 && val < 250) telemetry.ballSpeedMph = val;
        if (key === 'LAUNCH' && val > -5 && val < 70) telemetry.launchAngleDeg = val;
        if (key === 'SPIN' && val > 0 && val < 15000) telemetry.spinRateRpm = val;
      });

      if (telemetry.ballSpeedMph > 0 && telemetry.spinRateRpm > 0) {
        telemetry.isValidRun = true;
        return telemetry;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
