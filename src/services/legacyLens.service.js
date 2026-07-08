import {
  round2,
  generateBirthWeight,
  calculateFactorScores,
  normalizeFactors,
  calculateParentShare,
  splitFactors,
  calculateTotals,
  prepareCharts,
} from "../utils/legacyLens.util.js";

export const generateLegacyLensAnalysis = (user) => {
  const dob = new Date(user.dob);
  const day = dob.getUTCDate();
  const month = dob.getUTCMonth() + 1;
  const year = dob.getUTCFullYear();

  const birthWeight = generateBirthWeight(day, month, year);

  const factorScores = calculateFactorScores(birthWeight);
  const normalizedFactors = normalizeFactors(factorScores);

  const { dominantParent, motherShare, fatherShare } = calculateParentShare(day);

  const splitFactorsList = splitFactors(normalizedFactors, motherShare, fatherShare);

  const { motherTotal, fatherTotal, grandTotal } = calculateTotals(splitFactorsList);

  const higherLegacy = motherTotal > fatherTotal ? "Mother" : "Father";

  const factors = splitFactorsList.map((factor) => ({
    name: factor.name,
    mother: round2(factor.mother),
    father: round2(factor.father),
    total: round2(factor.total),
  }));

  const charts = prepareCharts(splitFactorsList, motherTotal, fatherTotal);

  return {
    user: {
      _id: user._id,
      name: user.username,
      email: user.email,
      dob: user.dob,
    },
    summary: {
      birthWeight: round2(birthWeight),
      motherTotal: round2(motherTotal),
      fatherTotal: round2(fatherTotal),
      grandTotal: round2(grandTotal),
      dominantParent,
      higherLegacy,
    },
    factors,
    charts,
  };
};
