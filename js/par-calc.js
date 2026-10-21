/**
 * Faculty Performance Appraisal Report (PAR) - Calculation Engine
 * Pure deterministic mathematical calculation functions.
 * Compatible with both Browser (window.ParCalc) and Node.js environments.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.ParCalc = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Accurate decimal rounding
   * @param {number} num 
   * @param {number} decimals 
   * @returns {number}
   */
  function round(num, decimals = 3) {
    if (typeof num !== 'number' || isNaN(num)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  /**
   * Format a number with fixed decimal places
   */
  function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return '—';
    return num.toFixed(decimals);
  }

  /**
   * Calculate Average Grade Point for Section 1.1.1
   * @param {Array<{gradePoint: number|string}>} courses 
   * @param {number} decimals - Precision (default 2, sample displayed as 4 or 3.75)
   * @returns {Object}
   */
  function calcAverageGradePoint(courses = [], decimals = 2) {
    const validRows = courses.filter(r => r && r.gradePoint !== '' && r.gradePoint !== null && !isNaN(Number(r.gradePoint)));
    if (validRows.length === 0) {
      return { count: 0, sum: 0, average: 0, formatted: '0.00', details: 'No valid course records' };
    }
    const sum = validRows.reduce((acc, r) => acc + Number(r.gradePoint), 0);
    const rawAvg = sum / validRows.length;
    const avg = round(rawAvg, decimals);
    return {
      count: validRows.length,
      sum: round(sum, 2),
      rawAverage: rawAvg,
      average: avg,
      formatted: formatNumber(avg, decimals),
      details: `${round(sum, 2)} / ${validRows.length} = ${avg}`
    };
  }

  /**
   * Calculate Average Feedback Score for Section 1.1.2
   * @param {Array<{feedbackScore: number|string}>} feedbackRows 
   * @param {number} decimals 
   * @returns {Object}
   */
  function calcAverageFeedback(feedbackRows = [], decimals = 2) {
    const validRows = feedbackRows.filter(r => r && r.feedbackScore !== '' && r.feedbackScore !== null && !isNaN(Number(r.feedbackScore)));
    if (validRows.length === 0) {
      return { count: 0, sum: 0, average: 0, formatted: '0.00', details: 'No valid feedback records' };
    }
    const sum = validRows.reduce((acc, r) => acc + Number(r.feedbackScore), 0);
    const rawAvg = sum / validRows.length;
    const avg = round(rawAvg, decimals);
    return {
      count: validRows.length,
      sum: round(sum, 2),
      rawAverage: rawAvg,
      average: avg,
      formatted: formatNumber(avg, decimals),
      details: `${round(sum, 2)} / ${validRows.length} = ${avg}`
    };
  }

  /**
   * Section 1.1: Teaching Index
   * Formula: I 1.1 = (0.7 * I 1.1.1) + (0.3 * I 1.1.2)
   */
  function calcTeachingIndex(i111, i112, precision = 2) {
    const v111 = Number(i111) || 0;
    const v112 = Number(i112) || 0;
    const term1 = round(0.7 * v111, 3);
    const term2 = round(0.3 * v112, 3);
    const rawTotal = term1 + term2;
    const total = round(rawTotal, precision);

    return {
      i111: v111,
      i112: v112,
      term1,
      term2,
      value: total,
      formatted: formatNumber(total, precision),
      formulaText: `(0.7 × ${v111}) + (0.3 × ${v112}) = ${term1} + ${term2} = ${total}`
    };
  }

  /**
   * Section 1.0: Academic Activities Index
   * Formula: I 1.0 = (0.5 * I 1.1) + (0.3 * I 1.2) + (0.2 * I 1.3)
   */
  function calcAcademicIndex(i11, i12, i13, precision = 2) {
    const v11 = Number(i11) || 0;
    const v12 = Number(i12) || 0;
    const v13 = Number(i13) || 0;
    const term1 = round(0.5 * v11, 3);
    const term2 = round(0.3 * v12, 3);
    const term3 = round(0.2 * v13, 3);
    const rawTotal = term1 + term2 + term3;
    const total = round(rawTotal, precision);

    return {
      i11: v11,
      i12: v12,
      i13: v13,
      term1,
      term2,
      term3,
      value: total,
      formatted: formatNumber(total, precision),
      formulaText: `(0.5 × ${v11}) + (0.3 × ${v12}) + (0.2 × ${v13}) = ${term1} + ${term2} + ${term3} = ${total}`
    };
  }

  /**
   * Section 2.0: Research Index
   * Formula (Engineering Faculty default):
   * I 2.0 = (W2.1 * I 2.1) + (W2.2 * I 2.2) + (W2.3 * I 2.3) + (W2.4 * I 2.4) + (W2.5 * I 2.5)
   * Default weights: 0.1, 0.2, 0.3, 0.2, 0.2
   */
  function calcResearchIndex(components = {}, customWeights = null, precision = 2) {
    const weights = customWeights || {
      w21: 0.1,
      w22: 0.2,
      w23: 0.3,
      w24: 0.2,
      w25: 0.2
    };

    const i21 = Number(components.i21) || 0;
    const i22 = Number(components.i22) || 0;
    const i23 = Number(components.i23) || 0;
    const i24 = Number(components.i24) || 0;
    const i25 = Number(components.i25) || 0;

    const term1 = round(weights.w21 * i21, 3);
    const term2 = round(weights.w22 * i22, 3);
    const term3 = round(weights.w23 * i23, 3);
    const term4 = round(weights.w24 * i24, 3);
    const term5 = round(weights.w25 * i25, 3);

    const rawTotal = term1 + term2 + term3 + term4 + term5;
    const total = round(rawTotal, precision);

    return {
      components: { i21, i22, i23, i24, i25 },
      weights,
      terms: { term1, term2, term3, term4, term5 },
      value: total,
      formatted: formatNumber(total, precision),
      formulaText: `(${weights.w21} × ${i21}) + (${weights.w22} × ${i22}) + (${weights.w23} × ${i23}) + (${weights.w24} × ${i24}) + (${weights.w25} × ${i25}) = ${term1} + ${term2} + ${term3} + ${term4} + ${term5} = ${total}`
    };
  }

  /**
   * Validate Designation Weights
   * Must sum to 1.0 (with small floating point epsilon)
   */
  function validateWeights(weights = {}) {
    const w10 = Number(weights.w10);
    const w20 = Number(weights.w20);
    const w30 = Number(weights.w30);
    const w40 = Number(weights.w40);

    if (isNaN(w10) || isNaN(w20) || isNaN(w30) || isNaN(w40)) {
      return { valid: false, sum: 0, error: 'All 4 weights (W1.0, W2.0, W3.0, W4.0) must be valid numbers.' };
    }
    if (w10 < 0 || w20 < 0 || w30 < 0 || w40 < 0) {
      return { valid: false, sum: 0, error: 'Weights cannot be negative.' };
    }

    const sum = round(w10 + w20 + w30 + w40, 4);
    // Allow small epsilon tolerance of 0.001
    if (Math.abs(sum - 1.0) > 0.001) {
      return {
        valid: false,
        sum,
        error: `Sum of weights must equal 1.00 (Current sum: ${sum}).`
      };
    }

    return { valid: true, sum: 1.0, error: null };
  }

  /**
   * Section 5.0: Faculty Performance Index (FPI)
   * Formula: FPI = (W1.0 * I 1.0) + (W2.0 * I 2.0) + (W3.0 * I 3.0) + (W4.0 * I 4.0)
   * @param {Object} indices { i10, i20, i30, i40 }
   * @param {Object} weights { w10, w20, w30, w40 }
   * @param {number} precision (default 3, as in sample 4.274)
   * @returns {Object}
   */
  function calcFpi(indices = {}, weights = {}, precision = 3) {
    const weightValidation = validateWeights(weights);
    if (!weightValidation.valid) {
      return {
        valid: false,
        error: weightValidation.error,
        terms: {},
        total: 0,
        formatted: '0.000',
        formulaText: ''
      };
    }

    const i10 = Number(indices.i10) || 0;
    const i20 = Number(indices.i20) || 0;
    const i30 = Number(indices.i30) || 0;
    const i40 = Number(indices.i40) || 0;

    const w10 = Number(weights.w10);
    const w20 = Number(weights.w20);
    const w30 = Number(weights.w30);
    const w40 = Number(weights.w40);

    // Calculate individual terms with full precision
    const term1 = round(w10 * i10, 4);
    const term2 = round(w20 * i20, 4);
    const term3 = round(w30 * i30, 4);
    const term4 = round(w40 * i40, 4);

    const rawTotal = term1 + term2 + term3 + term4;
    const total = round(rawTotal, precision);

    const formulaText = `(${w10.toFixed(2)} × ${i10}) + (${w20.toFixed(2)} × ${i20}) + (${w30.toFixed(2)} × ${i30}) + (${w40.toFixed(2)} × ${i40}) = ${term1} + ${term2} + ${term3} + ${term4} = ${total}`;

    return {
      valid: true,
      error: null,
      indices: { i10, i20, i30, i40 },
      weights: { w10, w20, w30, w40 },
      terms: { term1, term2, term3, term4 },
      rawTotal,
      total,
      formatted: formatNumber(total, precision),
      formulaText
    };
  }

  return {
    round,
    formatNumber,
    calcAverageGradePoint,
    calcAverageFeedback,
    calcTeachingIndex,
    calcAcademicIndex,
    calcResearchIndex,
    validateWeights,
    calcFpi
  };
});
