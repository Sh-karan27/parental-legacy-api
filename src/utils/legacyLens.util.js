import { FACTORS } from "../constants/factors.constants.js";

export const round2 = (value) => Math.round(value * 100) / 100;

const MIN_SUM = FACTORS.reduce((sum, factor) => sum + factor.min, 0);
const MAX_SUM = FACTORS.reduce((sum, factor) => sum + factor.max, 0);
const RANGE_SUM = MAX_SUM - MIN_SUM;

// The combined fill fraction (mother's + father's) that, applied to every
// factor's own Min-Max range, makes sum(Mother) + sum(Father) equal exactly
// 100 while keeping each individual Mother/Father value inside its own
// factor range.
const TOTAL_FILL_FRACTION = (100 - 2 * MIN_SUM) / RANGE_SUM;

export const calculateFillFractions = (day) => {
  const isMotherDominant = day % 2 !== 0;
  const half = TOTAL_FILL_FRACTION / 2;
  // Keep the dominant parent's gap clearly visible (never near a 50/50 tie)
  // while staying below `half`, so the non-dominant parent's fill never
  // reaches 0 and every value stays strictly a valid in-range value.
  const MIN_SPREAD = half * 0.3;
  const MAX_SPREAD = half * 0.9;
  const spread = MIN_SPREAD + (day / 31) * (MAX_SPREAD - MIN_SPREAD);

  const motherFill = isMotherDominant ? half + spread : half - spread;
  const fatherFill = TOTAL_FILL_FRACTION - motherFill;

  return {
    dominantParent: isMotherDominant ? "Mother" : "Father",
    motherFill,
    fatherFill,
  };
};

export const calculateFactorValues = (motherFill, fatherFill) => {
  return FACTORS.map((factor) => {
    const range = factor.max - factor.min;
    const mother = factor.min + range * motherFill;
    const father = factor.min + range * fatherFill;

    return { name: factor.name, mother, father, total: mother + father };
  });
};

export const calculateTotals = (factorValues) => {
  const motherTotal = factorValues.reduce((sum, factor) => sum + factor.mother, 0);
  const fatherTotal = factorValues.reduce((sum, factor) => sum + factor.father, 0);
  const grandTotal = motherTotal + fatherTotal;

  return { motherTotal, fatherTotal, grandTotal };
};

export const prepareCharts = (factorValues, motherTotal, fatherTotal) => {
  const barChart = factorValues.map((factor) => ({
    factor: factor.name,
    mother: round2(factor.mother),
    father: round2(factor.father),
  }));

  const pieChart = [
    { name: "Mother", value: round2(motherTotal) },
    { name: "Father", value: round2(fatherTotal) },
  ];

  const radarChart = factorValues.map((factor) => ({
    factor: factor.name,
    value: round2(factor.total),
  }));

  return { barChart, pieChart, radarChart };
};
