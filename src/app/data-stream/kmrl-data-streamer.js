import IoTStream from "../models/iotstream";

// --- Simulation constants ---
const AVG_METRO_SPEED_KMH = 54;
const CRUISING_SPEED_MPS = (AVG_METRO_SPEED_KMH * 1000) / 3600;
const ACCELERATION_MPS2 = 1.0;
const BRAKING_MPS2 = -1.2;
const STATION_STOP_DURATION_S = 25;
const ACCELERATION_DURATION_S = CRUISING_SPEED_MPS / ACCELERATION_MPS2;
const MIN_CRUISING_S = 60;
const MAX_CRUISING_S = 120;
const BRAKING_DURATION_S = -CRUISING_SPEED_MPS / BRAKING_MPS2;
const WHEEL_WEAR_PER_KM = 0.0025;
const BRAKE_WEAR_PER_KM = 0.0015;
const BRAKING_EVENT_WEAR_MULTIPLIER = 15;
const HVAC_TARGET_TEMP = 22.5;
const HVAC_TARGET_HUMIDITY = 55;
const HVAC_ADJUSTMENT_RATE = 0.05;

// --- State ---
let cars = [];
let trainsets = [];
let dataBuffer = {};
let highFrequencyIntervalId = null;
let aggregationIntervalId = null;
let lastUpdateTime = 0;

// --- Initialize streamer with DB trainsets ---
export function initializeStreamer(fetchedTrainsets) {
  cars = [];
  trainsets = [];
  dataBuffer = {};

  if (!Array.isArray(fetchedTrainsets)) {
    console.warn("Streamer init failed: fetchedTrainsets is not an array.");
    return;
  }

  const inServiceTrains = fetchedTrainsets.filter(
    (t) => t.currentStatus === "Ready"
  );

  if (!inServiceTrains.length) {
    console.warn("No 'In Service' trains found.");
    return;
  }

  inServiceTrains.forEach((train) => {
    const trainId = train._id || train.id;

    trainsets.push({
      trainsetId: trainId,
      status: "IDLE",
      statusTimer: Math.random() * STATION_STOP_DURATION_S,
      currentSpeedMps: 0,
    });

    dataBuffer[trainId] = [];

    const carsArray = Array.isArray(train.composition?.cars)
      ? train.composition.cars
      : [];

    carsArray.forEach((car, idx) => {
      cars.push({
        trainsetId: trainId,
        carId: car.carId ?? idx,
        hvac: {
          temperature: train.health?.hvac?.averageTemp ?? 23,
          humidity: 50 + Math.random() * 10,
        },
        wearAndTear: {
          brakeCondition: train.health?.componentWear?.brakes ?? 0,
          wheelCondition: train.health?.componentWear?.wheels ?? 0,
        },
        kmRun: train.health?.odometerKm ?? 0,
        status: "idle",
        timestamp: new Date().toISOString(),
      });
    });
  });

  console.log(
    `Streamer initialized with ${inServiceTrains.length} trainsets and ${cars.length} cars.`
  );
}

// --- Aggregate and save to MongoDB ---
async function aggregateAndSave() {
  for (const trainsetId in dataBuffer) {
    const buffer = dataBuffer[trainsetId];
    if (!buffer.length) continue;

    const avgTemp =
      buffer.reduce((sum, d) => sum + d.hvac.temperature, 0) / buffer.length;
    const avgHumidity =
      buffer.reduce((sum, d) => sum + d.hvac.humidity, 0) / buffer.length;
    const latestKmRun = buffer[buffer.length - 1].kmRun;
    const latestBrake = buffer[buffer.length - 1].wearAndTear.brakeCondition;
    const latestWheel = buffer[buffer.length - 1].wearAndTear.wheelCondition;

    const aggregatedDoc = {
      trainsetId,
      timestamp: new Date(),
      aggregated: true,
      health: {
        componentWear: { brakes: latestBrake, wheels: latestWheel },
        hvac: { averageTemp: avgTemp, status: "Nominal" },
        odometerKm: latestKmRun,
      },
    };

    try {
      await fetch("/api/iot-stream/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(aggregatedDoc), // ✅ stringify
  });
      //console.log(aggregatedDoc);
      console.log(`✅ Saved aggregated IoT data for ${trainsetId}`);
    } catch (err) {
      console.error(`❌ Failed to save IoT data for ${trainsetId}:`, err);
    }

    dataBuffer[trainsetId] = [];
  }
}

// --- Trainset simulation logic ---
function updateTrainsetState(trainset, timeDelta) {
  trainset.statusTimer -= timeDelta;
  if (trainset.statusTimer <= 0) {
    switch (trainset.status) {
      case "IDLE":
        trainset.status = "ACCELERATING";
        trainset.statusTimer = ACCELERATION_DURATION_S;
        break;
      case "ACCELERATING":
        trainset.status = "CRUISING";
        trainset.statusTimer =
          MIN_CRUISING_S + Math.random() * (MAX_CRUISING_S - MIN_CRUISING_S);
        break;
      case "CRUISING":
        trainset.status = "BRAKING";
        trainset.statusTimer = BRAKING_DURATION_S;
        break;
      case "BRAKING":
        trainset.status = "IDLE";
        trainset.statusTimer = STATION_STOP_DURATION_S;
        break;
    }
  }

  switch (trainset.status) {
    case "ACCELERATING":
      trainset.currentSpeedMps = Math.min(
        CRUISING_SPEED_MPS,
        trainset.currentSpeedMps + ACCELERATION_MPS2 * timeDelta
      );
      break;
    case "BRAKING":
      trainset.currentSpeedMps = Math.max(
        0,
        trainset.currentSpeedMps + BRAKING_MPS2 * timeDelta
      );
      break;
    case "IDLE":
      trainset.currentSpeedMps = 0;
      break;
    case "CRUISING":
      trainset.currentSpeedMps = CRUISING_SPEED_MPS;
      break;
  }
}

function updateCarState(car, trainsetState, timeDelta) {
  const newCar = { ...car, hvac: { ...car.hvac }, wearAndTear: { ...car.wearAndTear } };
  newCar.timestamp = new Date().toISOString();

  const distanceCoveredKm = (trainsetState.currentSpeedMps * timeDelta) / 1000;
  newCar.kmRun += distanceCoveredKm;

  newCar.wearAndTear.wheelCondition = Math.min(
    100,
    newCar.wearAndTear.wheelCondition + distanceCoveredKm * WHEEL_WEAR_PER_KM
  );

  let brakeWear = distanceCoveredKm * BRAKE_WEAR_PER_KM;
  if (trainsetState.status === "BRAKING") brakeWear *= BRAKING_EVENT_WEAR_MULTIPLIER;
  newCar.wearAndTear.brakeCondition = Math.min(
    100,
    newCar.wearAndTear.brakeCondition + brakeWear
  );

  // HVAC adjustment
  const tempDiff = HVAC_TARGET_TEMP - newCar.hvac.temperature;
  newCar.hvac.temperature += tempDiff * HVAC_ADJUSTMENT_RATE + (Math.random() - 0.5) * 0.1;
  const humidityDiff = HVAC_TARGET_HUMIDITY - newCar.hvac.humidity;
  newCar.hvac.humidity += humidityDiff * HVAC_ADJUSTMENT_RATE + (Math.random() - 0.5) * 0.2;

  newCar.hvac.temperature = Math.max(18, Math.min(35, newCar.hvac.temperature));
  newCar.hvac.humidity = Math.max(30, Math.min(80, newCar.hvac.humidity));

  newCar.status = trainsetState.currentSpeedMps > 0 ? "running" : "idle";
  return newCar;
}

// --- Start streaming ---
export const kmrlDataStreamer = {
  startStreaming: (onUpdate, freqMs = 1000, saveIntervalMs = 60000) => {
    if (highFrequencyIntervalId) clearInterval(highFrequencyIntervalId);
    if (aggregationIntervalId) clearInterval(aggregationIntervalId);

    lastUpdateTime = Date.now();

    highFrequencyIntervalId = setInterval(() => {
      const now = Date.now();
      const timeDelta = (now - lastUpdateTime) / 1000; // seconds
      lastUpdateTime = now;

      cars = cars.map((car) => {
        const trainsetState = trainsets.find((t) => t.trainsetId === car.trainsetId);
        if (!trainsetState) return car;
        const updatedCar = updateCarState(car, trainsetState, timeDelta);
        dataBuffer[car.trainsetId]?.push(updatedCar);
        return updatedCar;
      });

      trainsets.forEach((ts) => updateTrainsetState(ts, timeDelta));

      if (typeof onUpdate === "function") onUpdate([...cars]);
    }, freqMs);

    aggregationIntervalId = setInterval(() => {
      aggregateAndSave();
    }, saveIntervalMs);
  },

  stopStreaming: () => {
    clearInterval(highFrequencyIntervalId);
    clearInterval(aggregationIntervalId);
  },
};
