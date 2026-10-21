/**
 * Faculty Target Achievement Report (TAR) 2024-25 - Calculation Engine
 * Pure deterministic mathematical calculation & validation functions.
 * Compatible with Browser (window.TarCalc) and Node.js environments.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.TarCalc = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Accurate decimal rounding
   * @param {number} num 
   * @param {number} decimals 
   * @returns {number}
   */
  function round(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  /**
   * Format number with fixed decimals
   */
  function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return '0.00';
    return num.toFixed(decimals);
  }

  /**
   * Validate and clamp claimed marks against parameter maximum.
   * Rules:
   * - null/empty string/undefined: unanswered (not rejected, returns null raw)
   * - non-numeric: rejected (valid: false)
   * - negative: rejected (valid: false)
   * - > max: clamped to max, with warning
   * - allows 0.5 steps
   * @param {any} claimed 
   * @param {number} maxMarks 
   * @returns {Object}
   */
  function validateClaim(claimed, maxMarks) {
    const maxVal = typeof maxMarks === 'number' && !isNaN(maxMarks) ? maxMarks : 0;

    // Check empty/unanswered
    if (claimed === null || claimed === undefined || claimed === '') {
      return {
        valid: true,
        clamped: 0,
        raw: null,
        isClamped: false,
        isUnanswered: true,
        warning: null,
        error: null
      };
    }

    // Check string numeric conversion
    const num = typeof claimed === 'number' ? claimed : Number(claimed);

    if (isNaN(num)) {
      return {
        valid: false,
        clamped: 0,
        raw: claimed,
        isClamped: false,
        isUnanswered: false,
        warning: null,
        error: 'Marks claimed must be a valid number'
      };
    }

    if (num < 0) {
      return {
        valid: false,
        clamped: 0,
        raw: num,
        isClamped: false,
        isUnanswered: false,
        warning: null,
        error: 'Negative marks are not allowed'
      };
    }

    if (num > maxVal) {
      return {
        valid: true,
        clamped: maxVal,
        raw: num,
        isClamped: true,
        isUnanswered: false,
        warning: `Marks claimed (${num}) exceeds maximum (${maxVal}); clamped to ${maxVal}`,
        error: null
      };
    }

    return {
      valid: true,
      clamped: num,
      raw: num,
      isClamped: false,
      isUnanswered: false,
      warning: null,
      error: null
    };
  }

  /**
   * Evidence validation rules:
   * Marks > 0 with empty or 'Nil' evidence generates a warning.
   * Warnings never block saving.
   * @param {number|null} claimed 
   * @param {string} evidence 
   * @returns {Object}
   */
  function validateEvidence(claimed, evidence) {
    const num = Number(claimed) || 0;
    const evText = (evidence || '').trim();

    if (num > 0) {
      if (!evText) {
        return {
          hasWarning: true,
          warning: 'Marks claimed > 0 but no evidence details provided'
        };
      }
      if (evText.toLowerCase() === 'nil') {
        return {
          hasWarning: true,
          warning: 'Marks claimed > 0 but evidence is stated as "Nil"'
        };
      }
    }

    return {
      hasWarning: false,
      warning: null
    };
  }

  /**
   * Calculate all section subtotals, grand total, percentage, answered counts, and warnings.
   * Formula:
   * T = sum(S_s) for s = 1..6
   * S_s = sum(min(c_p, m_p)) for p in s
   * Percentage = (T / 600) * 100
   * @param {Object} report 
   * @param {Object} scheme 
   * @returns {Object}
   */
  function calculateTotals(report, scheme) {
    if (!scheme || !Array.isArray(scheme.sections) || !Array.isArray(scheme.parameters)) {
      throw new Error('Valid scheme definition with sections and parameters is required');
    }

    const entries = (report && report.entries) || {};
    const sectionResults = [];
    const allWarnings = [];
    let grandTotal = 0;
    let totalAnsweredCount = 0;
    let totalUnansweredCount = 0;

    scheme.sections.forEach((sec, sIdx) => {
      const secParams = scheme.parameters.filter(p => p.sectionId === sec.id || p.sectionIndex === sIdx);
      let secSubtotal = 0;
      let secAnsweredCount = 0;
      const paramResults = [];

      secParams.forEach(p => {
        const entry = entries[p.no] || entries[String(p.no)] || { evidence: '', claimed: null, files: [] };
        const claimVal = validateClaim(entry.claimed, p.max);
        const evidenceVal = validateEvidence(claimVal.clamped, entry.evidence);

        if (claimVal.isUnanswered) {
          totalUnansweredCount++;
        } else {
          secAnsweredCount++;
          totalAnsweredCount++;
        }

        const effectiveMarks = claimVal.valid ? claimVal.clamped : 0;
        secSubtotal += effectiveMarks;

        if (claimVal.warning) {
          allWarnings.push({ paramNo: p.no, type: 'clamp', message: claimVal.warning });
        }
        if (claimVal.error) {
          allWarnings.push({ paramNo: p.no, type: 'error', message: claimVal.error });
        }
        if (evidenceVal.hasWarning) {
          allWarnings.push({ paramNo: p.no, type: 'evidence', message: evidenceVal.warning });
        }

        paramResults.push({
          no: p.no,
          code: p.code,
          parameter: p.parameter,
          remarks: p.remarks,
          max: p.max,
          claimedRaw: entry.claimed,
          claimedClamped: effectiveMarks,
          isClamped: claimVal.isClamped,
          isUnanswered: claimVal.isUnanswered,
          evidence: entry.evidence || '',
          files: entry.files || [],
          warning: claimVal.warning || evidenceVal.warning || null,
          error: claimVal.error || null
        });
      });

      const roundedSubtotal = round(secSubtotal, 2);
      grandTotal += roundedSubtotal;

      sectionResults.push({
        id: sec.id,
        index: sIdx,
        title: sec.title,
        shortTitle: sec.shortTitle || sec.title,
        max: sec.max,
        subtotal: roundedSubtotal,
        formattedSubtotal: formatNumber(roundedSubtotal, 2),
        answeredCount: secAnsweredCount,
        totalParams: secParams.length,
        parameters: paramResults
      });
    });

    const roundedGrandTotal = round(grandTotal, 2);
    const maxTotal = scheme.totalMarks || 600;
    const rawPct = (roundedGrandTotal / maxTotal) * 100;
    const roundedPct = round(rawPct, 2);

    return {
      sections: sectionResults,
      grandTotal: roundedGrandTotal,
      formattedGrandTotal: formatNumber(roundedGrandTotal, 2),
      maxTotal: maxTotal,
      percentage: roundedPct,
      formattedPercentage: formatNumber(roundedPct, 2) + '%',
      totalAnsweredCount: totalAnsweredCount,
      totalUnansweredCount: totalUnansweredCount,
      totalParameters: scheme.parameters.length,
      isFullyAnswered: totalUnansweredCount === 0,
      allWarnings: allWarnings,
      hasWarnings: allWarnings.length > 0
    };
  }

  return {
    round,
    formatNumber,
    validateClaim,
    validateEvidence,
    calculateTotals
  };
});
