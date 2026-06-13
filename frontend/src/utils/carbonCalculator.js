// Indian Emission Factors (kg CO2 per unit)
export const EMISSION_FACTORS = {
  electricity: 0.82, // per kWh
  lpg: 2.98, // per kg (1 cylinder = 14.2 kg)
  transport: {
    petrolCar: 0.18, // per km
    dieselCar: 0.14, // per km
    twoWheeler: 0.06, // per km
    ev: 0.04, // per km
    bus: 0.03, // per km
    metro: 0.015 // per km
  },
  food: {
    highMeat: 2.5, // per day
    vegetarian: 1.2, // per day
    vegan: 0.7 // per day
  },
  shopping: 0.5, // per new item
  waste: {
    organic: 0.4, // per kg
    recyclable: 0.1, // per kg
    landfill: 0.6 // per kg
  }
};

export function calculateActivityCarbon(category, value, subtype = 'default') {
  const numVal = Number(value) || 0;
  
  if (category === 'electricity') {
    return numVal * EMISSION_FACTORS.electricity;
  }
  if (category === 'lpg') {
    return numVal * EMISSION_FACTORS.lpg;
  }
  if (category === 'transport') {
    const factor = EMISSION_FACTORS.transport[subtype] || EMISSION_FACTORS.transport.petrolCar;
    return numVal * factor;
  }
  if (category === 'food') {
    const factor = EMISSION_FACTORS.food[subtype] || EMISSION_FACTORS.food.vegetarian;
    return numVal * factor;
  }
  if (category === 'shopping') {
    return numVal * EMISSION_FACTORS.shopping;
  }
  if (category === 'waste') {
    const factor = EMISSION_FACTORS.waste[subtype] || EMISSION_FACTORS.waste.landfill;
    return numVal * factor;
  }
  return 0;
}

export function calculateBatchCarbon(inputs) {
  const { transport, electricity, lpg, food, shopping, waste } = inputs;
  let annualCO2 = 0;

  // 1. Electricity
  if (electricity && electricity.value) {
    annualCO2 += calculateActivityCarbon('electricity', electricity.value) * 12;
  }

  // 2. LPG
  if (lpg && lpg.value) {
    const kgLpg = Number(lpg.value) * 14.2;
    annualCO2 += calculateActivityCarbon('lpg', kgLpg) * 12;
  }

  // 3. Transport
  if (transport && transport.value) {
    annualCO2 += calculateActivityCarbon('transport', transport.value, transport.subtype) * 12;
  }

  // 4. Food
  if (food && food.subtype) {
    annualCO2 += calculateActivityCarbon('food', 1, food.subtype) * 365;
  } else {
    annualCO2 += calculateActivityCarbon('food', 1, 'vegetarian') * 365;
  }

  // 5. Shopping
  if (shopping && shopping.value) {
    annualCO2 += calculateActivityCarbon('shopping', shopping.value) * 12;
  }

  // 6. Waste
  if (waste && waste.value) {
    annualCO2 += calculateActivityCarbon('waste', waste.value, waste.subtype) * 52;
  }

  return {
    annual: Number(annualCO2.toFixed(2)),
    monthly: Number((annualCO2 / 12).toFixed(2)),
    daily: Number((annualCO2 / 365).toFixed(2))
  };
}
