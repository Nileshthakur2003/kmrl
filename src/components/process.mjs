// index.js
import pkg from 'highs';
const { highs } = pkg;

// --- Data Representation ---
const NUM_TRAINSETS = 25;
const trainsets = Array.from({ length: NUM_TRAINSETS }, (_, i) => `train_${i + 1}`);

// Fitness Certificates: 1 = Valid, 0 = Invalid
const fitCert = {
  rollingStock: { ...Object.fromEntries(trainsets.map(t => [t, 1])), train_5: 0 },
  signaling: { ...Object.fromEntries(trainsets.map(t => [t, 1])), train_5: 0 },
  telecom: { ...Object.fromEntries(trainsets.map(t => [t, 1])), train_5: 0 },
};

// Job-Card Status (Maximo): 1 = Open, 0 = Closed
const jobCard = { ...Object.fromEntries(trainsets.map(t => [t, 0])), train_10: 1 };

// Branding Priorities: 1 = High, 2 = Medium, 3 = Low
const brandPriority = Object.fromEntries(trainsets.map((t, i) => [t, (i % 3) + 1]));
const brandHoursNeeded = { 1: 8, 2: 6, 3: 4 };
const brandPenalty = { 1: 1000, 2: 500, 3: 100 };

// Mileage Balancing
const mileage = Object.fromEntries(trainsets.map((t, i) => [t, (i + 1) * 1000]));
const targetMileage = mileage.train_5; // Example target
const mileagePenaltyFactor = 0.01;

// Cleaning & Detailing Slots
const cleaningSlotsAvailable = 3;
const cleaningCost = { ...Object.fromEntries(trainsets.map(t => [t, 500])), train_7: 1500 };

// Stabling Geometry: simplified to a shunting penalty per bay
const depotBays = Array.from({ length: NUM_TRAINSETS }, (_, i) => `bay_${i + 1}`);
const shuntingCost = Object.fromEntries(
  trainsets.flatMap((t, tIndex) =>
    depotBays.map((b, bIndex) => [[t, b], 10 * Math.abs(tIndex - bIndex)])
  )
);

// General Parameters
const SERVICE_REQ = 18;
const IBL_CAPACITY = 4;

// --- MILP Model Formulation with highs-js ---
async function solveKochiMetro() {
  const model = new highs();
  model.options.output_flag = false;

  // --- Variables ---
  const states = ['SERVICE', 'STANDBY', 'IBL'];
  const vars = {};

  // Binary variables for state and bay assignments
  for (const t of trainsets) {
    for (const s of states) {
      vars[`x_${t}_${s}`] = model.addVar(0, 1, 0, 'B'); // `B` for Binary
    }
    for (const b of depotBays) {
      vars[`y_${t}_${b}`] = model.addVar(0, 1, 0, 'B');
    }
  }

  // Continuous variables for penalties
  for (const t of trainsets) {
    vars[`unmet_mileage_${t}`] = model.addVar(0, Infinity, 0, 'C'); // `C` for Continuous
    vars[`unmet_branding_${t}`] = model.addVar(0, Infinity, 0, 'C');
  }

  // Cleaning assignment variables (binary)
  for (const t of trainsets) {
    for (const b of depotBays) {
      vars[`clean_${t}_${b}`] = model.addVar(0, 1, 0, 'B');
    }
  }

  // --- Objective Function ---
  const [alpha1, alpha2, alpha3, alpha4, alpha5] = [1.0, 1.0, 1.0, 1.0, 10.0];
  model.addObjective(
    'min',
    Object.keys(vars).reduce((acc, varName) => {
      // Mileage Penalty Term
      if (varName.startsWith('unmet_mileage_')) {
        return acc + `+ ${alpha1} * ${varName}`;
      }
      // Branding Penalty Term
      if (varName.startsWith('unmet_branding_')) {
        const t = varName.split('_')[2];
        return acc + `+ ${alpha2 * brandPenalty[brandPriority[t]]} * ${varName}`;
      }
      // Shunting Cost Term
      if (varName.startsWith('y_')) {
        const [t, b] = varName.split('_').slice(1);
        return acc + `+ ${alpha3 * shuntingCost[[t, b]]} * ${varName}`;
      }
      // Cleaning Cost Term
      if (varName.startsWith('clean_')) {
        const [t, b] = varName.split('_').slice(1);
        return acc + `+ ${alpha4 * cleaningCost[t]} * ${varName}`;
      }
      // Service Readiness Term
      if (varName.startsWith('x_') && varName.endsWith('_SERVICE')) {
        return acc + `+ ${-alpha5} * ${varName}`;
      }
      return acc;
    }, '')
  );

  // --- Constraints ---
  // Each train in one state
  for (const t of trainsets) {
    model.addConstraint(`x_${t}_SERVICE + x_${t}_STANDBY + x_${t}_IBL`, 1, 1);
  }
  // Each train in one bay
  for (const t of trainsets) {
    model.addConstraint(depotBays.map(b => `y_${t}_${b}`).join(' + '), 1, 1);
  }

  // Capacity constraints
  model.addConstraint(trainsets.map(t => `x_${t}_SERVICE`).join(' + '), SERVICE_REQ, SERVICE_REQ);
  model.addConstraint(trainsets.map(t => `x_${t}_IBL`).join(' + '), 0, IBL_CAPACITY);

  // Fitness and job card constraints
  for (const t of trainsets) {
    if (fitCert.rollingStock[t] === 0 || fitCert.signaling[t] === 0 || fitCert.telecom[t] === 0) {
      model.addConstraint(`x_${t}_SERVICE`, 0, 0);
    }
    if (jobCard[t] === 1) {
      model.addConstraint(`x_${t}_IBL`, 1, 1);
    }
  }

  // Mileage penalty constraints
  for (const t of trainsets) {
    model.addConstraint(`unmet_mileage_${t} >= ${mileagePenaltyFactor * (mileage[t] - targetMileage)}`);
    model.addConstraint(`unmet_mileage_${t} >= ${mileagePenaltyFactor * (targetMileage - mileage[t])}`);
  }

  // Branding penalty constraints
  for (const t of trainsets) {
    const penalty = brandHoursNeeded[brandPriority[t]];
    model.addConstraint(`unmet_branding_${t} >= ${penalty} * (1 - x_${t}_SERVICE)`);
  }

  // Cleaning assignment constraints
  model.addConstraint(Object.keys(vars).filter(v => v.startsWith('clean_')).join(' + '), 0, cleaningSlotsAvailable);
  for (const t of trainsets) {
    model.addConstraint(depotBays.map(b => `clean_${t}_${b}`).join(' + '), 0, 1);
    for (const b of depotBays) {
      model.addConstraint(`clean_${t}_${b} - x_${t}_IBL`, 0, 0); // Must be in IBL to be cleaned
      model.addConstraint(`clean_${t}_${b} - y_${t}_${b}`, 0, 0); // Must be in cleaning bay
    }
  }

  // Link bay assignments to states
  for (const t of trainsets) {
    for (const b of depotBays) {
      model.addConstraint(`x_${t}_SERVICE + x_${t}_STANDBY + x_${t}_IBL - y_${t}_${b}`, 0, 2);
    }
  }

  // --- Solving the model ---
  const result = await model.solve();
  
  if (result.status === 'Optimal') {
    console.log("Solution Found!");
    console.log("Total Cost:", result.obj_val);

    console.log("\n--- Trainset Assignments ---");
    trainsets.forEach(t => {
      let state = 'unknown';
      if (result.vars[`x_${t}_SERVICE`] === 1) state = 'SERVICE';
      else if (result.vars[`x_${t}_STANDBY`] === 1) state = 'STANDBY';
      else if (result.vars[`x_${t}_IBL`] === 1) state = 'IBL';
      
      let bay = 'unknown';
      for(const b of depotBays) {
        if (result.vars[`y_${t}_${b}`] === 1) bay = b;
      }
      
      const cleaned = Object.keys(vars).some(v => v.startsWith(`clean_${t}_`) && result.vars[v] === 1) ? 'CLEANED' : 'NOT CLEANED';

      console.log(`${t}: State=${state}, Bay=${bay}, Cleaned=${cleaned}`);
    });
  } else {
    console.log("No optimal solution found. Status:", result.status);
  }
}

solveKochiMetro();
