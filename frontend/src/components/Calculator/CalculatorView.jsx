import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { calculateBatchCarbon } from '../../utils/carbonCalculator';
import { 
  Bus, 
  Lightbulb, 
  Flame, 
  Apple, 
  ShoppingBag, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  TrendingDown,
  Save,
  Globe,
  Sparkles
} from 'lucide-react';

export default function CalculatorView() {
  const { user, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [inputs, setInputs] = useState({
    transport: { value: 200, subtype: 'twoWheeler' },
    electricity: { value: 120 },
    lpg: { value: 1 },
    food: { subtype: 'vegetarian' },
    shopping: { value: 3 },
    waste: { value: 10, subtype: 'landfill' }
  });

  const [results, setResults] = useState({
    daily: 0,
    monthly: 0,
    annual: 0
  });

  // Calculate live results whenever inputs modify
  useEffect(() => {
    const calc = calculateBatchCarbon(inputs);
    setResults({
      daily: calc.daily,
      monthly: calc.monthly,
      annual: calc.annual
    });
  }, [inputs]);

  const handleSliderChange = (category, value) => {
    setInputs(prev => ({
      ...prev,
      [category]: { ...prev[category], value: Number(value) }
    }));
  };

  const handleSubtypeChange = (category, subtype) => {
    setInputs(prev => ({
      ...prev,
      [category]: { ...prev[category], subtype }
    }));
  };

  const saveToProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    // Call user update profile on backend
    const res = await updateUserProfile({ carbonScore: results.annual });
    setSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const stepsList = [
    { title: 'Transport', icon: Bus },
    { title: 'Electricity', icon: Lightbulb },
    { title: 'LPG Gas', icon: Flame },
    { title: 'Dietary', icon: Apple },
    { title: 'Shopping', icon: ShoppingBag },
    { title: 'Waste', icon: Trash2 },
    { title: 'Results', icon: CheckCircle }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Column: Multistep Form */}
      <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl shadow-glass flex flex-col justify-between min-h-[500px] border border-white/60">
        
        {/* Step Indicator Header */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xs font-extrabold text-brand-600 uppercase tracking-widest bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
              Carbon Calculator • Step {step} of 7
            </span>
            <span className="text-sm font-semibold text-slate-500">{stepsList[step-1].title}</span>
          </div>

          {/* Graphical Step Bullets */}
          <div className="flex gap-1 mb-8">
            {stepsList.map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = idx + 1 === step;
              const isCompleted = idx + 1 < step;
              return (
                <div 
                  key={s.title} 
                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${isCurrent ? 'bg-brand-500 w-8' : isCompleted ? 'bg-brand-400' : 'bg-slate-200'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Step Contents */}
        <div className="flex-1 py-4">
          
          {/* STEP 1: TRANSPORT */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Bus className="w-6 h-6 text-brand-500" />
                  Your Transport Habits
                </h3>
                <p className="text-sm text-slate-500 mt-1">Estimate the mileage you cover in a typical month.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm text-slate-700">
                  <label htmlFor="transport-distance">Monthly Travel Distance:</label>
                  <span className="text-brand-600">{inputs.transport.value} km</span>
                </div>
                <input
                  id="transport-distance"
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={inputs.transport.value}
                  onChange={(e) => handleSliderChange('transport', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-3xs font-semibold text-slate-400">
                  <span>0 km</span>
                  <span>2,500 km</span>
                  <span>5,000 km</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Transit Mode</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'petrolCar', label: 'Petrol Car', desc: '0.18 kg CO₂/km' },
                    { key: 'dieselCar', label: 'Diesel Car', desc: '0.14 kg CO₂/km' },
                    { key: 'twoWheeler', label: 'Two-Wheeler', desc: '0.06 kg CO₂/km' },
                    { key: 'ev', label: 'Electric Vehicle', desc: '0.04 kg CO₂/km' },
                    { key: 'bus', label: 'Public Bus', desc: '0.03 kg CO₂/km' },
                    { key: 'metro', label: 'Metro / Rail', desc: '0.015 kg CO₂/km' }
                  ].map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => handleSubtypeChange('transport', mode.key)}
                      className={`
                        p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer text-xs
                        ${inputs.transport.subtype === mode.key 
                          ? 'border-brand-500 bg-brand-50/70 text-brand-900 ring-1 ring-brand-500' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}
                      `}
                    >
                      <span className="font-bold">{mode.label}</span>
                      <span className="text-3xs text-slate-400 mt-1">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ELECTRICITY */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-brand-500" />
                  Electricity Consumption
                </h3>
                <p className="text-sm text-slate-500 mt-1">Select your average monthly electricity usage in Kilowatt-hours (Units).</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm text-slate-700">
                  <label htmlFor="electricity-power">Monthly Electricity Power:</label>
                  <span className="text-brand-600">{inputs.electricity.value} Units (kWh)</span>
                </div>
                <input
                  id="electricity-power"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={inputs.electricity.value}
                  onChange={(e) => handleSliderChange('electricity', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-3xs font-semibold text-slate-400">
                  <span>0 kWh</span>
                  <span>500 kWh</span>
                  <span>1000 kWh</span>
                </div>
              </div>

              <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-xs text-brand-800 leading-relaxed leading-normal">
                <span className="font-bold">Indian Energy Grid Notice:</span> The Central Electricity Authority estimates that the average Indian power grid releases 0.82 kg of CO₂ per Unit consumed, because coal remains our primary thermal power generation source.
              </div>
            </div>
          )}

          {/* STEP 3: LPG GAS */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-brand-500" />
                  LPG Cooking Gas
                </h3>
                <p className="text-sm text-slate-500 mt-1">Specify how many domestic LPG Cylinders (14.2 kg) your household consumes per month.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm text-slate-700">
                  <label htmlFor="lpg-cylinders">Domestic LPG Cylinders:</label>
                  <span className="text-brand-600">{inputs.lpg.value} cylinder{inputs.lpg.value !== 1 ? 's' : ''}</span>
                </div>
                <input
                  id="lpg-cylinders"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={inputs.lpg.value}
                  onChange={(e) => handleSliderChange('lpg', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-3xs font-semibold text-slate-400">
                  <span>0 cylinders (No LPG)</span>
                  <span>2.5 cylinders</span>
                  <span>5 cylinders</span>
                </div>
              </div>

              <div className="p-4 bg-[#fcf9f2] border border-amber-200 rounded-2xl text-xs text-amber-800 leading-normal">
                <span className="font-bold">LPG Carbon Rate:</span> One 14.2kg domestic cylinder produces roughly 42.3 kg of carbon emissions upon combustion.
              </div>
            </div>
          )}

          {/* STEP 4: DIETARY */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Apple className="w-6 h-6 text-brand-500" />
                  Dietary Habits
                </h3>
                <p className="text-sm text-slate-500 mt-1">Select the option that matches your typical food preferences.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'highMeat', label: 'Regular Meat Eater', desc: 'Frequent meat/poultry in meals.', impact: 'Produces ~2.5 kg CO₂ per day.' },
                  { key: 'vegetarian', label: 'Vegetarian', desc: 'Dairy, pulses, vegetables. No meat or fish.', impact: 'Produces ~1.2 kg CO₂ per day.' },
                  { key: 'vegan', label: 'Vegan / Plant-Based', desc: 'Purely plant-derived meals. No dairy/eggs.', impact: 'Produces ~0.7 kg CO₂ per day.' }
                ].map(diet => (
                  <button
                    key={diet.key}
                    onClick={() => handleSubtypeChange('food', diet.key)}
                    className={`
                      w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer
                      ${inputs.food.subtype === diet.key
                        ? 'border-brand-500 bg-brand-50/70 text-brand-900 ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}
                    `}
                  >
                    <div>
                      <span className="font-bold text-sm block">{diet.label}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{diet.desc}</span>
                    </div>
                    <span className="text-3xs font-semibold px-2 py-1 bg-white border rounded border-slate-100 uppercase text-slate-400">
                      {diet.impact}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: SHOPPING */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-brand-500" />
                  Shopping & Consumption
                </h3>
                <p className="text-sm text-slate-500 mt-1">Estimate how many new items (clothes, footwear, gadgets, toys) you buy each month.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm text-slate-700">
                  <label htmlFor="shopping-items">New Purchases / Month:</label>
                  <span className="text-brand-600">{inputs.shopping.value} items</span>
                </div>
                <input
                  id="shopping-items"
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={inputs.shopping.value}
                  onChange={(e) => handleSliderChange('shopping', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-3xs font-semibold text-slate-400">
                  <span>0 items</span>
                  <span>15 items</span>
                  <span>30 items</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-normal leading-relaxed">
                Manufacturing, shipping, and packaging raw consumer items releases substantial greenhouse emissions. We assume a general footprint of 0.5 kg of CO₂ per purchased item.
              </p>
            </div>
          )}

          {/* STEP 6: WASTE */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-brand-500" />
                  Waste Generation
                </h3>
                <p className="text-sm text-slate-500 mt-1">Estimate the weight of dry and wet garbage your home disposes of weekly.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm text-slate-700">
                  <label htmlFor="waste-weight">Weekly Waste Weight:</label>
                  <span className="text-brand-600">{inputs.waste.value} kg</span>
                </div>
                <input
                  id="waste-weight"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={inputs.waste.value}
                  onChange={(e) => handleSliderChange('waste', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-3xs font-semibold text-slate-400">
                  <span>0 kg</span>
                  <span>25 kg</span>
                  <span>50 kg</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Disposal Treatment</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'landfill', label: 'Mixed Landfill', desc: 'No sorting. Placed in trash bins.' },
                    { key: 'organic', label: 'Wet Composting', desc: 'Food waste is composted locally.' },
                    { key: 'recyclable', label: 'Dry Recycling', desc: 'Plastics/papers are clean-recycled.' }
                  ].map(treatment => (
                    <button
                      key={treatment.key}
                      onClick={() => handleSubtypeChange('waste', treatment.key)}
                      className={`
                        p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer text-xs
                        ${inputs.waste.subtype === treatment.key
                          ? 'border-brand-500 bg-brand-50/70 text-brand-900 ring-1 ring-brand-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}
                      `}
                    >
                      <span className="font-bold">{treatment.label}</span>
                      <span className="text-3xs text-slate-400 mt-1.5 leading-relaxed">{treatment.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: RESULTS & PROFILE SAVE */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-brand-500" />
                  Your Carbon Footprint Results
                </h3>
                <p className="text-sm text-slate-500 mt-1">Awesome! We have aggregated your inputs against localized emission factors.</p>
              </div>

              <div className="grid grid-cols-3 gap-3.5 text-center">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Daily CO₂</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">{results.daily} kg</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Monthly CO₂</span>
                  <span className="block text-xl font-extrabold text-slate-800 mt-1">{results.monthly} kg</span>
                </div>
                <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl">
                  <span className="text-2xs font-bold text-brand-800 uppercase tracking-wider">Annual CO₂</span>
                  <span className="block text-2xl font-black text-brand-700 mt-0.5">{results.annual.toLocaleString()} kg</span>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Carbon Score successfully saved to your Citizen Profile!</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={saveToProfile}
                  disabled={saving}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4.5 h-4.5" />
                  {saving ? 'Syncing...' : 'Save to Profile'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Form Nav Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          {step < 7 ? (
            <button
              onClick={nextStep}
              className="px-4.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="px-4.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Start Over
            </button>
          )}
        </div>

      </div>

      {/* Right Column: Dynamic Side Dashboard Panel */}
      <div className="glass-panel p-6 rounded-3xl shadow-glass border border-white/60 space-y-6">
        <div>
          <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Live Emissions Summary</h4>
          <p className="text-2xs text-slate-400">Values update instantly as you adjust parameters.</p>
        </div>

        {/* Large Counter Display */}
        <div className="p-5 bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-2xl shadow-inner text-center">
          <span className="text-2xs font-extrabold uppercase tracking-widest text-brand-300">Total Annual CO₂</span>
          <span className="block text-4xl font-black mt-2 tracking-tight">{results.annual.toLocaleString()} <span className="text-xs font-semibold">kg</span></span>
        </div>

        {/* Real-time Comparison Bar */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indian Benchmark Match</h5>
          
          <div className="space-y-1">
            <div className="flex justify-between text-2xs font-bold text-slate-600">
              <span>National Target Limit:</span>
              <span>2,500 kg / year</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${results.annual <= 2500 ? 'bg-brand-500' : 'bg-red-500'}`} 
                style={{ width: `${Math.min(100, (results.annual / 2500) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-2xs font-bold text-slate-600">
              <span>Global Average Limit:</span>
              <span>4,700 kg / year</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (results.annual / 4700) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Contextual Recommendations based on current values */}
        <div className="p-4 bg-emerald-50 border border-brand-200 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-brand-900">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>AI Reduction Opportunities</span>
          </div>
          
          <ul className="space-y-1.5 text-brand-800 list-disc list-inside">
            {inputs.transport.value > 300 && inputs.transport.subtype !== 'metro' && (
              <li>Switching vehicle to Metro or EV cuts travel emissions by over 75%.</li>
            )}
            {inputs.electricity.value > 150 && (
              <li>Adding a 3kW Solar Rooftop offsets power bills and saves 1,200kg CO₂ annually.</li>
            )}
            {inputs.food.subtype === 'highMeat' && (
              <li>Shifting to vegetarian meals three days a week saves 200kg CO₂ per year.</li>
            )}
            {inputs.waste.subtype === 'landfill' && (
              <li>Composting and recycling cuts waste carbon output by 50%+.</li>
            )}
            <li className="list-none pt-1 text-slate-500 italic text-3xs">Recommendations tailored to your state of {user?.state || 'Delhi'}.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
