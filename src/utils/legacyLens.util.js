import { FACTORS } from "../constants/factors.constants.js";

export const round2 = (value) => Math.round(value * 100) / 100;

export const generateBirthWeight = (day, month, year) => {
  const birthSeed = day * month + (year % 100);
  return (birthSeed % 100) / 100;
};

export const calculateFactorScores = (birthWeight) => {
  return FACTORS.map((factor) => {
    const difference = factor.max - factor.min;
    const score = factor.min + difference * birthWeight;
    return { name: factor.name, score };
  });
};

export const normalizeFactors = (factorScores) => {
  const factorScoreSum = factorScores.reduce((sum, factor) => sum + factor.score, 0);

  return factorScores.map((factor) => ({
    name: factor.name,
    normalized: (factor.score / factorScoreSum) * 100,
  }));
};

export const calculateParentShare = (day) => {
  const isMotherDominant = day % 2 !== 0;

  let motherShare;
  let fatherShare;

  if (isMotherDominant) {
    motherShare = 0.55 + (day / 31) * 0.05;
    fatherShare = 1 - motherShare;
  } else {
    fatherShare = 0.55 + (day / 31) * 0.05;
    motherShare = 1 - fatherShare;
  }

  return {
    dominantParent: isMotherDominant ? "Mother" : "Father",
    motherShare,
    fatherShare,
  };
};

export const splitFactors = (normalizedFactors, motherShare, fatherShare) => {
  return normalizedFactors.map((factor) => {
    const mother = factor.normalized * motherShare;
    const father = factor.normalized * fatherShare;

    return {
      name: factor.name,
      mother,
      father,
      total: mother + father,
    };
  });
};

export const calculateTotals = (splitFactorsList) => {
  const motherTotal = splitFactorsList.reduce((sum, factor) => sum + factor.mother, 0);
  const fatherTotal = splitFactorsList.reduce((sum, factor) => sum + factor.father, 0);
  const grandTotal = motherTotal + fatherTotal;

  return { motherTotal, fatherTotal, grandTotal };
};

export const prepareCharts = (splitFactorsList, motherTotal, fatherTotal) => {
  const barChart = splitFactorsList.map((factor) => ({
    factor: factor.name,
    mother: round2(factor.mother),
    father: round2(factor.father),
  }));

  const pieChart = [
    { name: "Mother", value: round2(motherTotal) },
    { name: "Father", value: round2(fatherTotal) },
  ];

  const radarChart = splitFactorsList.map((factor) => ({
    factor: factor.name,
    value: round2(factor.total),
  }));

  return { barChart, pieChart, radarChart };
};
