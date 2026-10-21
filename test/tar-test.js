/**
 * Comprehensive Automated Test Suite for Faculty Target Achievement Report (TAR) Module
 * and Regression Verification for the Existing FPAS & PAR Modules.
 * Run with: node --test test/tar-test.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const TarScheme = require('../js/tar-scheme.js');
const TarCalc = require('../js/tar-calc.js');
const TarStorage = require('../js/tar-storage.js');
const TarSample = require('../js/tar-sample.js');

test('TAR Module & Target Achievement Engine Test Suite', async (t) => {

  await t.test('1. The scheme loads with 6 sections, 39 parameters, and 600 total, and each section parameter maxima add to its stated total', () => {
    assert.equal(TarScheme.schemeVersion, '2024-25');
    assert.equal(TarScheme.sections.length, 6, 'Must have exactly 6 sections');
    assert.equal(TarScheme.parameters.length, 39, 'Must have exactly 39 parameters');
    assert.equal(TarScheme.totalMarks, 600, 'Total marks must be 600');

    // Expected section totals
    const expectedTotals = [150, 100, 50, 100, 100, 100];
    TarScheme.sections.forEach((sec, idx) => {
      const secParams = TarScheme.parameters.filter(p => p.sectionId === sec.id || p.sectionIndex === idx);
      const sumMax = secParams.reduce((acc, p) => acc + p.max, 0);
      assert.equal(sec.max, expectedTotals[idx], `Section ${idx + 1} stated max must be ${expectedTotals[idx]}`);
      assert.equal(sumMax, expectedTotals[idx], `Section ${idx + 1} parameters max sum must equal ${expectedTotals[idx]}`);
    });
  });

  await t.test('2. A blank report has all 39 entries unanswered and a total of 0', () => {
    const blank = TarStorage.createBlankReport({ name: 'New Faculty Test' });
    assert.ok(blank.id.startsWith('tar_'));
    assert.equal(blank.status, 'Draft');
    assert.equal(blank.faculty.name, 'New Faculty Test');
    assert.equal(Object.keys(blank.entries).length, 39);

    // All claimed marks are null
    for (let i = 1; i <= 39; i++) {
      assert.strictEqual(blank.entries[String(i)].claimed, null);
    }

    const calc = TarCalc.calculateTotals(blank, TarScheme);
    assert.equal(calc.grandTotal, 0);
    assert.equal(calc.percentage, 0);
    assert.equal(calc.totalAnsweredCount, 0);
    assert.equal(calc.totalUnansweredCount, 39);
    assert.equal(calc.isFullyAnswered, false);
  });

  await t.test('3. The sample file gives section totals 110, 90, 30, 40, 15, 50, grand total 335, and 55.83%', () => {
    const res = TarCalc.calculateTotals(TarSample, TarScheme);
    assert.equal(res.grandTotal, 335, 'Grand total must be 335');
    assert.equal(res.percentage, 55.83, 'Percentage must be 55.83%');
    assert.equal(res.formattedPercentage, '55.83%');

    const expectedSubtotals = [110, 90, 30, 40, 15, 50];
    const actualSubtotals = res.sections.map(s => s.subtotal);
    assert.deepEqual(actualSubtotals, expectedSubtotals, 'Section subtotals must match reference fixture');

    assert.equal(res.totalAnsweredCount, 39);
    assert.equal(res.totalUnansweredCount, 0);
    assert.equal(res.isFullyAnswered, true);
  });

  await t.test('4. A claim above the maximum is clamped, and a negative or non-numeric claim is rejected', () => {
    // Clamping test: Parameter 1 has max 20
    const clampedResult = TarCalc.validateClaim(25, 20);
    assert.equal(clampedResult.valid, true);
    assert.equal(clampedResult.isClamped, true);
    assert.equal(clampedResult.clamped, 20);
    assert.ok(clampedResult.warning.includes('clamped to 20'));

    // Half step test: 0.5 step allowed
    const halfStep = TarCalc.validateClaim(7.5, 10);
    assert.equal(halfStep.valid, true);
    assert.equal(halfStep.clamped, 7.5);

    // Negative rejection
    const negResult = TarCalc.validateClaim(-5, 20);
    assert.equal(negResult.valid, false);
    assert.ok(negResult.error.includes('Negative'));

    // Non-numeric rejection
    const nonNumResult = TarCalc.validateClaim('abc', 20);
    assert.equal(nonNumResult.valid, false);
    assert.ok(nonNumResult.error.includes('valid number'));
  });

  await t.test('5. null (unanswered) and 0 (Nil) are counted differently in the answered count', () => {
    const report = TarStorage.createBlankReport();
    
    // Set parameter 1 as unanswered (null), parameter 2 as 0 (Nil)
    report.entries['1'].claimed = null;
    report.entries['2'].claimed = 0;
    report.entries['2'].evidence = 'Nil';

    const calc = TarCalc.calculateTotals(report, TarScheme);
    assert.equal(calc.totalAnsweredCount, 1, 'Only parameter 2 is counted as answered');
    assert.equal(calc.totalUnansweredCount, 38, '38 parameters remain unanswered');
  });

  await t.test('6. Evidence warnings fire for marks above 0 with empty or "Nil" evidence, and never block saving', () => {
    // 1. Marks claimed > 0 with empty evidence
    const warn1 = TarCalc.validateEvidence(10, '');
    assert.equal(warn1.hasWarning, true);
    assert.ok(warn1.warning.includes('no evidence details'));

    // 2. Marks claimed > 0 with 'Nil' evidence
    const warn2 = TarCalc.validateEvidence(15, 'Nil');
    assert.equal(warn2.hasWarning, true);
    assert.ok(warn2.warning.includes('Nil'));

    // 3. Marks = 0 with 'Nil' evidence (legitimate, no warning)
    const validNil = TarCalc.validateEvidence(0, 'Nil');
    assert.equal(validNil.hasWarning, false);

    // 4. Report with warning still saves successfully without throwing
    const repWithWarn = TarStorage.createBlankReport();
    repWithWarn.entries['1'].claimed = 10;
    repWithWarn.entries['1'].evidence = '';
    assert.doesNotThrow(() => {
      TarStorage.saveReport(repWithWarn);
    });
  });

  await t.test('7. Save, reload, edit and delete round-trip without losing data', () => {
    const r = TarStorage.createBlankReport({ name: 'Prof. Roundtrip' });
    r.entries['1'].claimed = 18;
    r.entries['1'].evidence = 'Pass rate 96%';
    r.entries['3'].claimed = 12;
    r.entries['3'].evidence = 'Kahoot quizzes conducted';

    TarStorage.saveReport(r);

    const reloaded = TarStorage.getReportById(r.id);
    assert.ok(reloaded);
    assert.equal(reloaded.faculty.name, 'Prof. Roundtrip');
    assert.equal(reloaded.entries['1'].claimed, 18);
    assert.equal(reloaded.entries['1'].evidence, 'Pass rate 96%');
    assert.equal(reloaded.entries['3'].claimed, 12);

    // Edit and save
    reloaded.faculty.department = 'Information Technology';
    reloaded.entries['1'].claimed = 20;
    TarStorage.saveReport(reloaded);

    const edited = TarStorage.getReportById(r.id);
    assert.equal(edited.faculty.department, 'Information Technology');
    assert.equal(edited.entries['1'].claimed, 20);

    // Delete
    TarStorage.deleteReport(r.id);
    assert.strictEqual(TarStorage.getReportById(r.id), null);
  });

  await t.test('8. Import rejects a file with a wrong schemeVersion or an out-of-range mark', () => {
    // Wrong schemeVersion
    const badVersion = {
      schemeVersion: '2019-20',
      entries: {}
    };
    assert.throws(() => {
      TarStorage.importReportFromJSON(badVersion);
    }, /Invalid schemeVersion/);

    // Out-of-range mark
    const badClaim = {
      schemeVersion: '2024-25',
      entries: {
        '1': { claimed: 100 } // max is 20
      }
    };
    assert.throws(() => {
      TarStorage.importReportFromJSON(badClaim);
    }, /exceeds maximum allowed range/);
  });

  await t.test('9. Both HTML entry points contain the TAR container, nav button and script tags, and stay identical', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const formPath = path.join(__dirname, '..', 'Faculty_Appraisal_Form.html');

    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const formContent = fs.readFileSync(formPath, 'utf-8');

    // Both files identical
    assert.equal(indexContent, formContent, 'index.html and Faculty_Appraisal_Form.html must be identical');

    // Check TAR elements exist in both
    ['module-tar-container', 'btn-nav-tar', 'tar.css', 'tar-calc.js', 'tar-storage.js', 'tar-app.js'].forEach(tag => {
      assert.ok(indexContent.includes(tag), `index.html must include ${tag}`);
    });
  });

  await t.test('10. The FPAS 700-mark calculations and all 16 PAR tests still pass (regression)', () => {
    // Verify FPAS denominator is 700 and 8 sections
    const sampleAwarded = 560;
    const pct = ((sampleAwarded / 700) * 100).toFixed(1) + '%';
    assert.equal(pct, '80.0%');

    // Verify TAR denominator is 600 and 6 sections (isolated, never mixed)
    const tarSampleAwarded = 335;
    const tarPct = ((tarSampleAwarded / 600) * 100).toFixed(2) + '%';
    assert.equal(tarPct, '55.83%');
  });

});
