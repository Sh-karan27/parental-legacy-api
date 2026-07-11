import {
  round2,
  calculateFillFractions,
  calculateFactorValues,
  calculateTotals,
  prepareCharts,
} from "../utils/legacyLens.util.js";

export const generateLegacyLensAnalysis = (user) => {
  const dob = new Date(user.dob);
  const day = dob.getUTCDate();

  const { dominantParent, motherFill, fatherFill } = calculateFillFractions(day);

  const factorValues = calculateFactorValues(motherFill, fatherFill);

  const { motherTotal, fatherTotal, grandTotal } = calculateTotals(factorValues);

  const higherLegacy = motherTotal > fatherTotal ? "Mother" : "Father";

  const factors = factorValues.map((factor) => {
    const mother = round2(factor.mother);
    const total = round2(factor.total);
    // Round father as the remainder of the rounded total so mother + father
    // always equals total exactly at display precision.
    const father = round2(total - mother);

    return { name: factor.name, mother, father, total };
  });

  const charts = prepareCharts(factorValues, motherTotal, fatherTotal);

  const roundedGrandTotal = round2(grandTotal);
  const roundedMotherTotal = round2(motherTotal);
  // Round fatherTotal as the remainder of the grand total so mother + father
  // always equals exactly 100 at display precision.
  const roundedFatherTotal = round2(roundedGrandTotal - roundedMotherTotal);

  return {
    user: {
      _id: user._id,
      name: user.username,
      email: user.email,
      dob: user.dob,
    },
    summary: {
      motherTotal: roundedMotherTotal,
      fatherTotal: roundedFatherTotal,
      grandTotal: roundedGrandTotal,
      dominantParent,
      higherLegacy,
    },
    factors,
    charts,
  };
};
