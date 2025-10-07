import mongoose from "mongoose";

// Subschemas
const hvacSchema = new mongoose.Schema({
  temperature: { type: Number, required: false },
  humidity: { type: Number, required: false },
}, { _id: false });

const wearAndTearSchema = new mongoose.Schema({
  brakeCondition: { type: Number, required: false },
  wheelCondition: { type: Number, required: false },
}, { _id: false });

// Main schema
const carStreamSchema = new mongoose.Schema({
  trainsetId: { type: String, required: false }, // Optional string
  carId: { type: String, required: false },
  hvac: { type: hvacSchema, required: false },
  wearAndTear: { type: wearAndTearSchema, required: false },
  kmRun: { type: Number, required: false },
  status: { type: String, enum: ["idle", "running", "maintenance"], required: false },
  timestamp: { type: Date, default: Date.now, index: true },
}, {
  collection: "iot_car_streams",
  timeseries: {
    timeField: "timestamp",
    metaField: "trainsetId",
    granularity: "seconds",
  },
});

// Robust model creation for Next.js hot reload
let CarStream;
try {
  CarStream = mongoose.model("CarStream");
} catch {
  CarStream = mongoose.model("CarStream", carStreamSchema);
}

export default CarStream;
