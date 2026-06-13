const express = require('express');
const router = express.Router();
const activitiesRouter = require('./activities');
const calculateCarbon = activitiesRouter.calculateCarbon;

// @route   POST /api/v1/carbon/calculate
// @desc    Calculate carbon footprint from a batch of inputs
// @access  Public
router.post('/calculate', (req, res) => {
  const { transport, electricity, lpg, food, shopping, waste } = req.body;

  let annualCO2 = 0;

  // 1. Electricity calculation
  // input: monthly usage in kWh
  if (electricity && electricity.value) {
    const monthlyCO2 = calculateCarbon('electricity', Number(electricity.value));
    annualCO2 += monthlyCO2 * 12; // monthly * 12 months
  }

  // 2. LPG calculation
  // input: number of domestic cylinders (14.2kg each) per month
  if (lpg && lpg.value) {
    const cylinders = Number(lpg.value);
    const kgLpg = cylinders * 14.2;
    const monthlyCO2 = calculateCarbon('lpg', kgLpg);
    annualCO2 += monthlyCO2 * 12;
  }

  // 3. Transport calculation
  // input: monthly distance in km, vehicle type (petrolCar, dieselCar, twoWheeler, ev, bus, metro)
  if (transport && transport.value) {
    const monthlyDistance = Number(transport.value);
    const vehicleType = transport.subtype || 'petrolCar';
    const monthlyCO2 = calculateCarbon('transport', monthlyDistance, vehicleType);
    annualCO2 += monthlyCO2 * 12;
  }

  // 4. Food calculation
  // input: food habit type (highMeat, vegetarian, vegan)
  if (food && food.subtype) {
    // food calculator based on daily dietary habits
    const dailyCO2 = calculateCarbon('food', 1, food.subtype);
    annualCO2 += dailyCO2 * 365;
  } else {
    // default vegetarian
    annualCO2 += calculateCarbon('food', 1, 'vegetarian') * 365;
  }

  // 5. Shopping calculation
  // input: monthly new items purchased (clothes, gadgets, appliances, etc.)
  if (shopping && shopping.value) {
    const monthlyItems = Number(shopping.value);
    const monthlyCO2 = calculateCarbon('shopping', monthlyItems);
    annualCO2 += monthlyCO2 * 12;
  }

  // 6. Waste calculation
  // input: weekly waste generated in kg, sorting type (landfill, organic, recyclable)
  if (waste && waste.value) {
    const weeklyWaste = Number(waste.value);
    const wasteType = waste.subtype || 'landfill';
    const weeklyCO2 = calculateCarbon('waste', weeklyWaste, wasteType);
    annualCO2 += weeklyCO2 * 52; // 52 weeks in a year
  }

  // Round values
  const annual = Number(annualCO2.toFixed(2));
  const monthly = Number((annualCO2 / 12).toFixed(2));
  const daily = Number((annualCO2 / 365).toFixed(2));

  res.json({
    dailyCO2: daily,
    monthlyCO2: monthly,
    annualCO2: annual,
    units: 'kg CO2'
  });
});

module.exports = router;
