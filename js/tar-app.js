/**
 * Faculty Target Achievement Report (TAR) - UI Application Controller
 * Manages reactive UI rendering, live calculation recalculations,
 * collapsible section states, sample loading, export/import, and printing.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(
      require('./tar-scheme.js'),
      require('./tar-calc.js'),
      require('./tar-storage.js')
    );
  } else if (typeof define === 'function' && define.amd) {
    define(['./tar-scheme.js', './tar-calc.js', './tar-storage.js'], factory);
  } else {
    root.TarApp = factory(root.TarScheme, root.TarCalc, root.TarStorage);
  }
})(typeof self !== 'undefined' ? self : this, function (TarScheme, TarCalc, TarStorage) {
  'use strict';

  let currentReport = null;
  let collapsedSections = {}; // { sec_1: false, ... }
  let isInitialized = false;

  function init() {
    if (isInitialized) return;
    isInitialized = true;

    // Load active report from storage or create blank
    const activeId = TarStorage.getActiveReportId();
    if (activeId) {
      currentReport = TarStorage.getReportById(activeId);
    }
    if (!currentReport) {
      currentReport = TarStorage.createBlankReport();
      TarStorage.saveReport(currentReport);
    }

    render();
  }

  function render() {
    const container = document.getElementById('module-tar-container');
    if (!container) return;

    if (!currentReport) {
      currentReport = TarStorage.createBlankReport();
    }

    const calcResult = TarCalc.calculateTotals(currentReport, TarScheme);

    container.innerHTML = buildAppHTML(currentReport, calcResult);
    attachEventListeners();
  }

  function buildAppHTML(report, calc) {
    return `
      <!-- Print Header for Paper Report -->
      <div class="tar-print-header">
        <h2 style="margin:0; font-size:16pt; text-transform:uppercase;">MANAKULA VINAYAGAR INSTITUTE OF TECHNOLOGY</h2>
        <p style="margin:2px 0; font-size:10pt;">Kalitheerthalkuppam, Madagadipet, Puducherry - 605 107</p>
        <h3 style="margin:10px 0 0 0; font-size:13pt; text-decoration:underline;">
          Faculty Target Achievement Report during ${escapeHTML(report.faculty.academicYear || '2024-25')} with Marks assigned for each parameter
        </h3>
      </div>

      <!-- Sticky Live Summary Bar -->
      <div class="tar-sticky-summary">
        <div class="tar-container">
          <div class="tar-summary-inner">
            <div class="tar-summary-score-group">
              <div class="tar-grand-score-box">
                <span class="label">Grand Total</span>
                <span class="value" id="tar-summary-grand-total">${calc.formattedGrandTotal} / 600</span>
              </div>
              <div class="tar-pct-badge" id="tar-summary-percentage">
                ${calc.formattedPercentage}
              </div>
              <div class="tar-answered-badge" id="tar-summary-answered">
                ${calc.totalAnsweredCount} of ${calc.totalParameters} answered
              </div>
            </div>

            <div class="tar-section-chips" id="tar-summary-chips">
              ${calc.sections.map((sec, idx) => `
                <div class="tar-chip" onclick="TarApp.scrollToSection('${sec.id}')" title="Click to scroll to ${escapeHTML(sec.title)}">
                  <span class="chip-name">Sec ${idx + 1}:</span>
                  <span class="chip-score" id="tar-chip-${sec.id}">${sec.formattedSubtotal} / ${sec.max}</span>
                </div>
              `).join('')}
            </div>

            <div class="tar-summary-actions">
              <button type="button" class="tar-btn tar-btn-primary" onclick="TarApp.saveDraft()">
                💾 Save Draft
              </button>
              <button type="button" class="tar-btn tar-btn-secondary" onclick="TarApp.loadSample()">
                📑 Load Sample (P. Suganya)
              </button>
              <button type="button" class="tar-btn tar-btn-secondary" onclick="TarApp.exportJSON()">
                📤 Export JSON
              </button>
              <button type="button" class="tar-btn tar-btn-secondary" onclick="document.getElementById('tar-import-file-input').click()">
                📥 Import JSON
              </button>
              <button type="button" class="tar-btn tar-btn-secondary" onclick="window.print()">
                🖨️ Print / PDF
              </button>
              <button type="button" class="tar-btn tar-btn-secondary" onclick="TarApp.resetForm()" title="Create new blank report">
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Form Container -->
      <div class="tar-container">
        <!-- Faculty Information Card -->
        <div class="tar-faculty-card">
          <div class="tar-card-header">
            <div>
              <h2 class="tar-card-title">Faculty Information & Appraisal Details</h2>
              <div class="tar-card-subtitle">Enter faculty credentials for Target Achievement Report (2024-25)</div>
            </div>
            <div>
              <span class="tar-status-badge tar-status-${report.status}">${report.status}</span>
            </div>
          </div>

          <div class="tar-form-grid">
            <div class="tar-field-group">
              <label for="tar-fac-name">Faculty Name:</label>
              <input type="text" id="tar-fac-name" class="tar-input-text" value="${escapeHTML(report.faculty.name)}" placeholder="e.g. Dr. P. Suganya" />
            </div>
            <div class="tar-field-group">
              <label for="tar-fac-empid">Employee ID:</label>
              <input type="text" id="tar-fac-empid" class="tar-input-text" value="${escapeHTML(report.faculty.employeeId)}" placeholder="e.g. EMP0142" />
            </div>
            <div class="tar-field-group">
              <label for="tar-fac-desig">Designation:</label>
              <input type="text" id="tar-fac-desig" class="tar-input-text" value="${escapeHTML(report.faculty.designation)}" placeholder="e.g. Assistant Professor" />
            </div>
            <div class="tar-field-group">
              <label for="tar-fac-dept">Department:</label>
              <input type="text" id="tar-fac-dept" class="tar-input-text" value="${escapeHTML(report.faculty.department)}" placeholder="e.g. Computer Science & Engg." />
            </div>
            <div class="tar-field-group">
              <label for="tar-fac-year">Academic Year:</label>
              <input type="text" id="tar-fac-year" class="tar-input-text" value="${escapeHTML(report.faculty.academicYear)}" readonly />
            </div>
          </div>
        </div>

        <!-- Six Parameter Sections -->
        ${calc.sections.map((sec, sIdx) => `
          <div class="tar-section-card ${collapsedSections[sec.id] ? 'collapsed' : ''}" id="tar-sec-card-${sec.id}">
            <div class="tar-section-header" onclick="TarApp.toggleSection('${sec.id}')">
              <div class="tar-sec-left">
                <span class="tar-sec-toggle-icon">▼</span>
                <h3 class="tar-sec-title">${escapeHTML(sec.title)}</h3>
              </div>
              <div class="tar-sec-right">
                <span class="tar-sec-max-label">TOTAL : ${sec.max}</span>
                <span class="tar-sec-subtotal-badge" id="tar-sec-badge-${sec.id}">
                  Claimed: ${sec.formattedSubtotal} / ${sec.max}
                </span>
              </div>
            </div>

            <div class="tar-section-body">
              <div class="tar-table-wrapper">
                <table class="tar-table">
                  <thead>
                    <tr>
                      <th class="tar-col-no">No.</th>
                      <th class="tar-col-param">Target Parameter</th>
                      <th class="tar-col-remarks">Remarks (Expected Minimum)</th>
                      <th class="tar-col-max">Max</th>
                      <th class="tar-col-evidence">Evidence / Details</th>
                      <th class="tar-col-claimed">Marks Claimed</th>
                      <th class="tar-col-actions no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sec.parameters.map(p => `
                      <tr id="tar-row-${p.no}">
                        <td class="tar-col-no">${p.no}.</td>
                        <td class="tar-col-param">
                          ${p.code ? `<span class="tar-pa-tag">${escapeHTML(p.code)}</span>` : ''}
                          <strong>${escapeHTML(p.parameter)}</strong>
                        </td>
                        <td class="tar-col-remarks">${escapeHTML(p.remarks || '—')}</td>
                        <td class="tar-col-max">${p.max}</td>
                        <td class="tar-col-evidence">
                          <textarea 
                            class="tar-textarea-evidence" 
                            id="tar-ev-${p.no}" 
                            placeholder="Enter details, documentary evidence or Nil..."
                            rows="2"
                            oninput="TarApp.onEvidenceChanged(${p.no}, this)"
                          >${escapeHTML(p.evidence)}</textarea>
                          ${p.files && p.files.length > 0 ? `
                            <div class="tar-attached-files-list">
                              ${p.files.map((f, fIdx) => `
                                <span class="tar-file-chip">
                                  📎 ${escapeHTML(f.name)} (${Math.round(f.size / 1024)}KB)
                                  <span class="tar-file-delete no-print" onclick="TarApp.deleteFile(${p.no}, ${fIdx})" title="Remove file">×</span>
                                </span>
                              `).join('')}
                            </div>
                          ` : ''}
                        </td>
                        <td class="tar-col-claimed">
                          <input 
                            type="number" 
                            id="tar-claim-${p.no}"
                            class="tar-input-claimed" 
                            min="0" 
                            max="${p.max}" 
                            step="0.5" 
                            value="${p.claimedRaw !== null && p.claimedRaw !== undefined ? p.claimedRaw : ''}"
                            placeholder="—"
                            oninput="TarApp.onClaimChanged(${p.no}, this)"
                          />
                          <div id="tar-warning-${p.no}">
                            ${p.warning ? `<div class="tar-row-warning">⚠️ ${escapeHTML(p.warning)}</div>` : ''}
                            ${p.error ? `<div class="tar-row-error">⛔ ${escapeHTML(p.error)}</div>` : ''}
                          </div>
                        </td>
                        <td class="tar-col-actions no-print">
                          <button type="button" class="tar-file-btn" onclick="TarApp.promptFileAttach(${p.no})" title="Attach evidence document">
                            📎 File
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `).join('')}

        <!-- Sign-off Block -->
        <div class="tar-signoff-card">
          <h3 style="margin-top:0; font-size:16px;">Verification and Approval Sign-off</h3>
          <div class="tar-signoff-grid">
            <div class="tar-field-group">
              <label for="tar-hod-remarks">HOD Remarks & Verification Notes:</label>
              <textarea id="tar-hod-remarks" class="tar-input-text" rows="3" placeholder="Enter HOD remarks...">${escapeHTML(report.signoff.hodRemarks || '')}</textarea>
            </div>
            <div class="tar-field-group">
              <label for="tar-hod-date">HOD Verification Date:</label>
              <input type="date" id="tar-hod-date" class="tar-input-text" value="${escapeHTML(report.signoff.hodDate || '')}" />
            </div>
            <div class="tar-field-group">
              <label for="tar-principal-date">Principal Approval Date:</label>
              <input type="date" id="tar-principal-date" class="tar-input-text" value="${escapeHTML(report.signoff.principalDate || '')}" />
            </div>
          </div>
        </div>

        <!-- Print Signatures Section (Visible in Print only) -->
        <div class="tar-print-signatures">
          <div class="tar-print-sig-col">
            <div class="tar-print-sig-line">Signature of Faculty</div>
          </div>
          <div class="tar-print-sig-col">
            <div class="tar-print-sig-line">Signature of HOD</div>
          </div>
          <div class="tar-print-sig-col">
            <div class="tar-print-sig-line">Principal</div>
          </div>
        </div>
      </div>

      <!-- Hidden inputs for file operations -->
      <input type="file" id="tar-import-file-input" accept=".json" style="display:none;" onchange="TarApp.handleFileImport(event)" />
      <input type="file" id="tar-evidence-file-input" style="display:none;" onchange="TarApp.handleEvidenceFileUpload(event)" />
    `;
  }

  function attachEventListeners() {
    ['tar-fac-name', 'tar-fac-empid', 'tar-fac-desig', 'tar-fac-dept'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (!currentReport) return;
          currentReport.faculty.name = document.getElementById('tar-fac-name').value;
          currentReport.faculty.employeeId = document.getElementById('tar-fac-empid').value;
          currentReport.faculty.designation = document.getElementById('tar-fac-desig').value;
          currentReport.faculty.department = document.getElementById('tar-fac-dept').value;
        });
      }
    });

    ['tar-hod-remarks', 'tar-hod-date', 'tar-principal-date'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (!currentReport) return;
          currentReport.signoff.hodRemarks = document.getElementById('tar-hod-remarks').value;
          currentReport.signoff.hodDate = document.getElementById('tar-hod-date').value;
          currentReport.signoff.principalDate = document.getElementById('tar-principal-date').value;
        });
      }
    });
  }

  function toggleSection(secId) {
    collapsedSections[secId] = !collapsedSections[secId];
    const card = document.getElementById(`tar-sec-card-${secId}`);
    if (card) {
      if (collapsedSections[secId]) {
        card.classList.add('collapsed');
      } else {
        card.classList.remove('collapsed');
      }
    }
  }

  function scrollToSection(secId) {
    // Expand section if collapsed
    if (collapsedSections[secId]) {
      toggleSection(secId);
    }
    const card = document.getElementById(`tar-sec-card-${secId}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function onClaimChanged(paramNo, inputElem) {
    if (!currentReport) return;
    const valStr = inputElem.value.trim();
    const paramKey = String(paramNo);

    if (!currentReport.entries[paramKey]) {
      currentReport.entries[paramKey] = { evidence: '', claimed: null, files: [] };
    }

    if (valStr === '') {
      currentReport.entries[paramKey].claimed = null;
    } else {
      const num = parseFloat(valStr);
      currentReport.entries[paramKey].claimed = isNaN(num) ? valStr : num;
    }

    recalculateUI();
  }

  function onEvidenceChanged(paramNo, textareaElem) {
    if (!currentReport) return;
    const paramKey = String(paramNo);
    if (!currentReport.entries[paramKey]) {
      currentReport.entries[paramKey] = { evidence: '', claimed: null, files: [] };
    }
    currentReport.entries[paramKey].evidence = textareaElem.value;
    recalculateUI();
  }

  function recalculateUI() {
    const calc = TarCalc.calculateTotals(currentReport, TarScheme);

    // Update sticky summary bar
    const grandTotalEl = document.getElementById('tar-summary-grand-total');
    if (grandTotalEl) grandTotalEl.textContent = `${calc.formattedGrandTotal} / 600`;

    const pctEl = document.getElementById('tar-summary-percentage');
    if (pctEl) pctEl.textContent = calc.formattedPercentage;

    const ansEl = document.getElementById('tar-summary-answered');
    if (ansEl) ansEl.textContent = `${calc.totalAnsweredCount} of ${calc.totalParameters} answered`;

    // Update chips & section badges
    calc.sections.forEach(sec => {
      const chipEl = document.getElementById(`tar-chip-${sec.id}`);
      if (chipEl) chipEl.textContent = `${sec.formattedSubtotal} / ${sec.max}`;

      const secBadgeEl = document.getElementById(`tar-sec-badge-${sec.id}`);
      if (secBadgeEl) secBadgeEl.textContent = `Claimed: ${sec.formattedSubtotal} / ${sec.max}`;

      // Update row warnings
      sec.parameters.forEach(p => {
        const warnEl = document.getElementById(`tar-warning-${p.no}`);
        if (warnEl) {
          let html = '';
          if (p.warning) html += `<div class="tar-row-warning">⚠️ ${escapeHTML(p.warning)}</div>`;
          if (p.error) html += `<div class="tar-row-error">⛔ ${escapeHTML(p.error)}</div>`;
          warnEl.innerHTML = html;
        }
      });
    });
  }

  function saveDraft() {
    if (!currentReport) return;
    TarStorage.saveReport(currentReport);
    showToast('Target Achievement Report draft saved successfully!');
  }

  function loadSample() {
    if (confirm('Load sample data for faculty P. Suganya (2024-25)? This will populate all 39 parameters.')) {
      currentReport = TarStorage.loadSampleReport();
      render();
      showToast('Sample report (P. Suganya) loaded successfully (335 / 600, 55.83%)!');
    }
  }

  function resetForm() {
    if (confirm('Create a fresh blank Target Achievement Report? Unsaved edits on current report will be replaced.')) {
      currentReport = TarStorage.createBlankReport();
      TarStorage.saveReport(currentReport);
      render();
      showToast('New blank report created.');
    }
  }

  function exportJSON() {
    if (!currentReport) return;
    const jsonStr = TarStorage.exportReportAsJSON(currentReport);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TAR_${(currentReport.faculty.name || 'faculty').replace(/\s+/g, '_')}_${currentReport.schemeVersion}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSON report exported successfully!');
  }

  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = TarStorage.importReportFromJSON(e.target.result);
        currentReport = imported;
        render();
        showToast('Target Achievement Report imported successfully!');
      } catch (err) {
        alert('Import Error: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // --- Evidence File Attachment handling ---
  let pendingAttachParamNo = null;

  function promptFileAttach(paramNo) {
    pendingAttachParamNo = paramNo;
    const fileInput = document.getElementById('tar-evidence-file-input');
    if (fileInput) fileInput.click();
  }

  async function handleEvidenceFileUpload(event) {
    const file = event.target.files[0];
    if (!file || pendingAttachParamNo === null) return;

    const paramKey = String(pendingAttachParamNo);
    const fileKey = `ev_${currentReport.id}_p${paramKey}_${Date.now()}_${file.name}`;

    try {
      // Save file metadata to report
      if (!currentReport.entries[paramKey]) {
        currentReport.entries[paramKey] = { evidence: '', claimed: null, files: [] };
      }
      if (!Array.isArray(currentReport.entries[paramKey].files)) {
        currentReport.entries[paramKey].files = [];
      }

      currentReport.entries[paramKey].files.push({
        key: fileKey,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      });

      // Save blob to IndexedDB
      await TarStorage.saveEvidenceFile({
        key: fileKey,
        reportId: currentReport.id,
        paramNo: pendingAttachParamNo,
        name: file.name,
        blob: file
      });

      TarStorage.saveReport(currentReport);
      render();
      showToast(`Attached "${file.name}" to Parameter ${pendingAttachParamNo}`);
    } catch (err) {
      console.error(err);
      alert('Failed to attach evidence file: ' + err.message);
    } finally {
      pendingAttachParamNo = null;
      event.target.value = '';
    }
  }

  async function deleteFile(paramNo, fileIndex) {
    const paramKey = String(paramNo);
    const entry = currentReport.entries[paramKey];
    if (entry && Array.isArray(entry.files) && entry.files[fileIndex]) {
      const fileKey = entry.files[fileIndex].key;
      await TarStorage.deleteEvidenceFile(fileKey);
      entry.files.splice(fileIndex, 1);
      TarStorage.saveReport(currentReport);
      render();
      showToast('File attachment removed.');
    }
  }

  function showToast(message) {
    let toast = document.getElementById('score-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'score-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'show';
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
    }, 3500);
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    init,
    render,
    toggleSection,
    scrollToSection,
    onClaimChanged,
    onEvidenceChanged,
    saveDraft,
    loadSample,
    resetForm,
    exportJSON,
    handleFileImport,
    promptFileAttach,
    handleEvidenceFileUpload,
    deleteFile
  };
});
