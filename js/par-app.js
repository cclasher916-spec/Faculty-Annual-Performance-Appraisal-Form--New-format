/**
 * Faculty Performance Appraisal Report (PAR) - Main Application Controller
 * Handles Dashboard, Report Editor, Dynamic Form Repeaters, Live Calculations,
 * IndexedDB Evidence Management, HOD Verification Workflow, and Print Formatting.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(require('./par-calc.js'), require('./par-storage.js'));
  } else if (typeof define === 'function' && define.amd) {
    define(['./par-calc.js', './par-storage.js'], factory);
  } else {
    root.ParApp = factory(root.ParCalc, root.ParStorage);
  }
})(typeof self !== 'undefined' ? self : this, function (ParCalc, ParStorage) {
  'use strict';

  // Application State
  const state = {
    currentRole: 'faculty', // 'faculty' | 'hod' | 'admin'
    currentView: 'dashboard', // 'dashboard' | 'editor' | 'printable'
    currentReport: null,
    currentStep: 1,
    filters: {
      year: 'all',
      status: 'all',
      search: ''
    }
  };

  /**
   * Initialize PAR Module
   */
  function init() {
    ParStorage.initializeStorage();
    setupRoleSelector();
    renderDashboard();
    setupGlobalEvents();
  }

  function setupRoleSelector() {
    const roleSelect = document.getElementById('par-active-role-select');
    if (roleSelect) {
      roleSelect.value = state.currentRole;
      roleSelect.addEventListener('change', (e) => {
        state.currentRole = e.target.value;
        if (state.currentView === 'dashboard') {
          renderDashboard();
        } else if (state.currentView === 'editor' && state.currentReport) {
          renderEditor();
        }
      });
    }
  }

  function setupGlobalEvents() {
    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // =========================================================================
  // VIEW SWITCHING
  // =========================================================================

  function switchView(viewName) {
    state.currentView = viewName;
    const dashEl = document.getElementById('par-view-dashboard');
    const editorEl = document.getElementById('par-view-editor');
    const printEl = document.getElementById('par-view-printable');

    if (dashEl) dashEl.style.display = viewName === 'dashboard' ? 'block' : 'none';
    if (editorEl) editorEl.style.display = viewName === 'editor' ? 'block' : 'none';
    if (printEl) printEl.style.display = viewName === 'printable' ? 'block' : 'none';

    if (viewName === 'dashboard') {
      renderDashboard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // =========================================================================
  // DASHBOARD VIEW
  // =========================================================================

  function renderDashboard() {
    const reports = ParStorage.getAllReports();

    // 1. Calculate Stats
    const totalCount = reports.length;
    const draftCount = reports.filter(r => r.status === 'Draft').length;
    const submittedCount = reports.filter(r => r.status === 'Submitted for Verification' || r.status === 'Resubmitted').length;
    const returnedCount = reports.filter(r => r.status === 'Returned for Correction').length;
    const verifiedCount = reports.filter(r => r.status === 'Verified' || r.status === 'Completed').length;

    const elTotal = document.getElementById('par-stat-total');
    const elDraft = document.getElementById('par-stat-draft');
    const elSubmitted = document.getElementById('par-stat-submitted');
    const elReturned = document.getElementById('par-stat-returned');
    const elVerified = document.getElementById('par-stat-verified');

    if (elTotal) elTotal.textContent = totalCount;
    if (elDraft) elDraft.textContent = draftCount;
    if (elSubmitted) elSubmitted.textContent = submittedCount;
    if (elReturned) elReturned.textContent = returnedCount;
    if (elVerified) elVerified.textContent = verifiedCount;

    // 2. Filter Reports
    const filteredReports = reports.filter(r => {
      // Year filter
      if (state.filters.year !== 'all' && r.academicYear !== state.filters.year) {
        return false;
      }
      // Status filter
      if (state.filters.status !== 'all' && r.status !== state.filters.status) {
        return false;
      }
      // Search filter
      if (state.filters.search) {
        const q = state.filters.search.toLowerCase();
        const name = (r.facultyInfo && r.facultyInfo.name || '').toLowerCase();
        const empid = (r.facultyInfo && r.facultyInfo.employeeId || '').toLowerCase();
        const desig = (r.facultyInfo && r.facultyInfo.designation || '').toLowerCase();
        const dept = (r.facultyInfo && r.facultyInfo.department || '').toLowerCase();
        const id = (r.id || '').toLowerCase();
        return name.includes(q) || empid.includes(q) || desig.includes(q) || dept.includes(q) || id.includes(q);
      }
      return true;
    });

    // 3. Render Table
    const tbody = document.getElementById('par-reports-table-body');
    if (!tbody) return;

    if (filteredReports.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="par-empty-state">
            <div class="par-empty-icon">📂</div>
            <div style="font-weight:600; font-size:15px; margin-bottom:4px;">No appraisal reports found</div>
            <div style="font-size:13px;">Create a new appraisal report or clear your search filters.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredReports.map(r => {
      const fpiVal = r.fpiComputation && r.fpiComputation.fpi ? Number(r.fpiComputation.fpi).toFixed(3) : '—';
      const statusClass = getStatusBadgeClass(r.status);
      const isEditable = (r.status === 'Draft' || r.status === 'Returned for Correction' || state.currentRole === 'admin');
      const canVerify = (state.currentRole === 'hod' || state.currentRole === 'admin') && (r.status === 'Submitted for Verification' || r.status === 'Resubmitted');

      return `
        <tr>
          <td><strong style="color:var(--par-primary);">${escapeHtml(r.id)}</strong></td>
          <td>
            <strong>${escapeHtml(r.facultyInfo.name || 'Untitled')}</strong>
            ${r.facultyInfo.employeeId ? `<div style="font-size:11.5px; color:#718096;">ID: ${escapeHtml(r.facultyInfo.employeeId)}</div>` : ''}
          </td>
          <td>${escapeHtml(r.facultyInfo.designation || '—')}</td>
          <td>${escapeHtml(r.facultyInfo.department || '—')}</td>
          <td><strong>${escapeHtml(r.academicYear || '—')}</strong></td>
          <td><span style="font-size:14px; font-weight:700; color:var(--par-secondary);">${fpiVal}</span></td>
          <td><span class="par-badge ${statusClass}">${escapeHtml(r.status)}</span></td>
          <td style="white-space:nowrap;">
            <div style="display:flex; gap:6px;">
              ${isEditable ? `
                <button class="par-btn par-btn-sm par-btn-primary" onclick="ParApp.editReport('${r.id}')" title="Edit draft">
                  ✏️ Edit
                </button>
              ` : `
                <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.viewReport('${r.id}')" title="View details">
                  👁️ View
                </button>
              `}
              ${canVerify ? `
                <button class="par-btn par-btn-sm par-btn-warning" onclick="ParApp.openHodVerification('${r.id}')" title="HOD Review & Verify">
                  ✍️ Verify
                </button>
              ` : ''}
              <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.printReport('${r.id}')" title="Printable Report & PDF">
                🖨️ PDF
              </button>
              ${(r.status === 'Draft' || state.currentRole === 'admin') ? `
                <button class="par-btn par-btn-sm par-btn-secondary" style="color:var(--par-danger);" onclick="ParApp.deleteReportPrompt('${r.id}')" title="Delete draft">
                  🗑️
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Draft': return 'par-badge-draft';
      case 'Submitted for Verification': return 'par-badge-submitted';
      case 'Returned for Correction': return 'par-badge-returned';
      case 'Resubmitted': return 'par-badge-resubmitted';
      case 'Verified': return 'par-badge-verified';
      case 'Completed': return 'par-badge-completed';
      default: return 'par-badge-draft';
    }
  }

  // =========================================================================
  // REPORT EDITOR ACTIONS & CONTROLLER
  // =========================================================================

  function createNewReport() {
    const report = ParStorage.createBlankReport();
    state.currentReport = report;
    state.currentStep = 1;
    switchView('editor');
    renderEditor();
  }

  function loadSampleReport() {
    const sample = ParStorage.loadReferenceSampleReport();
    ParStorage.saveReport(sample);
    state.currentReport = sample;
    state.currentStep = 1;
    switchView('editor');
    renderEditor();
    showNotification('Reference Sample Data (Suganya - FPI 4.274) loaded successfully!');
  }

  function editReport(reportId) {
    const report = ParStorage.getReportById(reportId);
    if (!report) {
      alert('Report not found');
      return;
    }
    state.currentReport = report;
    state.currentStep = 1;
    switchView('editor');
    renderEditor();
  }

  function viewReport(reportId) {
    editReport(reportId);
  }

  function openHodVerification(reportId) {
    const report = ParStorage.getReportById(reportId);
    if (!report) return;
    state.currentReport = report;
    state.currentStep = 8; // Step 8 is HOD verification
    switchView('editor');
    renderEditor();
  }

  function deleteReportPrompt(reportId) {
    if (confirm(`Are you sure you want to delete report ${reportId}? This action cannot be undone.`)) {
      const res = ParStorage.deleteReport(reportId, state.currentRole);
      if (res.success) {
        renderDashboard();
        showNotification('Report deleted successfully');
      } else {
        alert(res.error || 'Failed to delete report');
      }
    }
  }

  // =========================================================================
  // STEPPER NAVIGATION
  // =========================================================================

  function setStep(stepNum) {
    // Save current inputs to memory before navigating step
    harvestEditorInputs();
    state.currentStep = stepNum;
    renderEditor();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  // =========================================================================
  // RENDER EDITOR
  // =========================================================================

  function renderEditor() {
    const r = state.currentReport;
    if (!r) return;

    // Recalculate deterministic scores
    ParStorage.recalculateReport(r);

    // Meta Header
    const metaTitle = document.getElementById('par-editor-title');
    const metaSub = document.getElementById('par-editor-subtitle');
    const statusBadge = document.getElementById('par-editor-status-badge');

    if (metaTitle) metaTitle.textContent = `${r.facultyInfo.name || 'New Appraisal Report'} (${r.academicYear || '2024-25'})`;
    if (metaSub) metaSub.textContent = `Report ID: ${r.id} • Designation: ${r.facultyInfo.designation || 'Not set'} • Department: ${r.facultyInfo.department || 'Not set'}`;
    if (statusBadge) {
      statusBadge.className = `par-badge ${getStatusBadgeClass(r.status)}`;
      statusBadge.textContent = r.status;
    }

    // Stepper Button States
    const stepButtons = document.querySelectorAll('.par-step-btn');
    stepButtons.forEach((btn, idx) => {
      const stepIdx = idx + 1;
      if (stepIdx === state.currentStep) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Render active step content container
    const contentContainer = document.getElementById('par-step-content');
    if (!contentContainer) return;

    let stepHtml = '';
    switch (state.currentStep) {
      case 1: stepHtml = renderStep1FacultyInfo(r); break;
      case 2: stepHtml = renderStep2AcademicActivities(r); break;
      case 3: stepHtml = renderStep3Research(r); break;
      case 4: stepHtml = renderStep4Extension(r); break;
      case 5: stepHtml = renderStep5Administration(r); break;
      case 6: stepHtml = renderStep6Fpi(r); break;
      case 7: stepHtml = renderStep7AdditionalAndDeclaration(r); break;
      case 8: stepHtml = renderStep8HodVerification(r); break;
      default: stepHtml = renderStep1FacultyInfo(r); break;
    }

    contentContainer.innerHTML = stepHtml;
    attachEditorFieldListeners();
  }

  // =========================================================================
  // STEP RENDERERS
  // =========================================================================

  // Step 1: Faculty Information
  function renderStep1FacultyInfo(r) {
    const info = r.facultyInfo || {};
    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>1. Faculty Information</span>
          <span style="font-size:12px; color:var(--par-neutral-600);">Reference: Word Document Header & Part A</span>
        </div>
        <div class="par-section-subtitle">Basic faculty identification, appointment details, and assessment period.</div>

        <div class="par-alert par-alert-info">
          <span>ℹ️</span>
          <div>
            <strong>Institutional Instructions:</strong><br>
            1. Before filling up read the “Guidelines for Annual Performance Assessment of the faculty members” available with your Dept. HoD in-charges.<br>
            2. Provide all relevant information to support your claim for your achievements and contributions / Faculty Target achievements report. Enclose copies of documents in support of the claim for points.<br>
            3. Submission deadline: <strong>${escapeHtml(r.submissionDeadline || '10th OCT 2024')}</strong>.
          </div>
        </div>

        <div class="par-form-grid">
          <div class="par-form-group">
            <label for="par_fi_acad_year">Academic Year <span style="color:red;">*</span></label>
            <input type="text" id="par_fi_acad_year" class="par-input" value="${escapeHtml(r.academicYear || '2024-25')}" placeholder="e.g. 2024-25">
          </div>
          <div class="par-form-group">
            <label for="par_fi_deadline">Configurable Submission Deadline</label>
            <input type="text" id="par_fi_deadline" class="par-input" value="${escapeHtml(r.submissionDeadline || '10th OCT 2024')}" placeholder="e.g. 10th OCT 2024">
          </div>
          <div class="par-form-group">
            <label for="par_fi_name">Faculty Name <span style="color:red;">*</span></label>
            <input type="text" id="par_fi_name" class="par-input" value="${escapeHtml(info.name || '')}" placeholder="e.g. P. Suganya">
          </div>
          <div class="par-form-group">
            <label for="par_fi_empid">Employee ID</label>
            <input type="text" id="par_fi_empid" class="par-input" value="${escapeHtml(info.employeeId || '')}" placeholder="e.g. EMP-1042">
          </div>
          <div class="par-form-group">
            <label for="par_fi_desig">Designation <span style="color:red;">*</span></label>
            <select id="par_fi_desig" class="par-select" onchange="ParApp.onDesignationChange(this.value)">
              <option value="ASSISTANT PROFESSOR" ${info.designation === 'ASSISTANT PROFESSOR' ? 'selected' : ''}>ASSISTANT PROFESSOR</option>
              <option value="ASSOCIATE PROFESSOR" ${info.designation === 'ASSOCIATE PROFESSOR' ? 'selected' : ''}>ASSOCIATE PROFESSOR</option>
              <option value="PROFESSOR" ${info.designation === 'PROFESSOR' ? 'selected' : ''}>PROFESSOR</option>
            </select>
          </div>
          <div class="par-form-group">
            <label for="par_fi_dept">Department</label>
            <input type="text" id="par_fi_dept" class="par-input" value="${escapeHtml(info.department || 'Computer Science & Engineering')}" placeholder="e.g. Computer Science & Engineering">
          </div>
          <div class="par-form-group">
            <label for="par_fi_pay">Scale of Pay / Present Pay</label>
            <input type="text" id="par_fi_pay" class="par-input" value="${escapeHtml(info.scaleOfPay || '')}" placeholder="e.g. Rs.26500">
          </div>
          <div class="par-form-group">
            <label for="par_fi_doj">Date of Appointment to Present Post</label>
            <input type="text" id="par_fi_doj" class="par-input" value="${escapeHtml(info.dateOfAppointment || '')}" placeholder="e.g. 19.06.2024">
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:20px;">
          <button class="par-btn par-btn-primary" onclick="ParApp.setStep(2)">Next: Academic Activities (I 1.0) →</button>
        </div>
      </div>
    `;
  }

  // Step 2: Academic Activities (I 1.0)
  function renderStep2AcademicActivities(r) {
    const ac = r.academicActivities || {};
    const courses = ac.courses111 || [];
    const feedbackRows = ac.feedback112 || [];
    const devRows = ac.relatedDev12 || [];
    const contRows = ac.continuingEd13 || [];

    const avgGpResult = ParCalc.calcAverageGradePoint(courses, 2);
    const avgFbResult = ParCalc.calcAverageFeedback(feedbackRows, 2);

    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>2. Section 1.0 — Academic Activities (I 1.0)</span>
          <span style="font-size:13px; font-weight:700; color:var(--par-primary);">I 1.0 = ${ac.index10 || 0}</span>
        </div>
        <div class="par-section-subtitle">Teaching performance, student feedback, related development, and continuing education.</div>

        <!-- 1.1 Teaching -->
        <h4 style="margin:16px 0 8px 0; color:var(--par-primary); border-bottom:1px solid #cbd5e0; padding-bottom:4px;">
          1.1 Teaching (I 1.1)
        </h4>

        <!-- 1.1.1 Semester Results -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:6px;">
            1.1.1 Semester Results of Students in Theory Course (I 1.1.1)
          </div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl. No.</th>
                  <th style="width:90px;">UG / PG</th>
                  <th style="width:120px;">Course Code</th>
                  <th>Course Title</th>
                  <th style="width:120px;">Result % Pass</th>
                  <th style="width:110px;">Grade Point (pp)</th>
                  <th style="width:60px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_courses111">
                ${courses.map((c, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td>
                      <select class="par-field-c111" data-field="ugPg">
                        <option value="UG" ${c.ugPg === 'UG' ? 'selected' : ''}>UG</option>
                        <option value="PG" ${c.ugPg === 'PG' ? 'selected' : ''}>PG</option>
                      </select>
                    </td>
                    <td><input type="text" class="par-field-c111" data-field="code" value="${escapeHtml(c.code || '')}" placeholder="e.g. AMPC303"></td>
                    <td><input type="text" class="par-field-c111" data-field="title" value="${escapeHtml(c.title || '')}" placeholder="Course title"></td>
                    <td><input type="text" class="par-field-c111" data-field="passPercent" value="${escapeHtml(c.passPercent || '')}" placeholder="e.g. 92.98%"></td>
                    <td><input type="number" step="0.01" min="0" max="10" class="par-field-c111" data-field="gradePoint" value="${c.gradePoint !== undefined ? c.gradePoint : ''}" placeholder="0-10" oninput="ParApp.recalculateLive()"></td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('courses111', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('courses111')">+ Add Course Row</button>
            <div style="font-size:13px; font-weight:600; color:var(--par-primary);">
              Calculated Arithmetic Average: <span id="par_calc_gp_val">${avgGpResult.formatted}</span>
              <span style="font-size:11.5px; color:#718096; font-weight:normal;">(${avgGpResult.details})</span>
            </div>
          </div>

          <!-- Optional Override for Grade Point -->
          <div style="background:#f8fafc; padding:8px 12px; border-radius:4px; font-size:12.5px; display:flex; align-items:center; gap:12px; margin-top:4px;">
            <label style="font-weight:600; color:#4a5568;">Manual Override (if institutional policy rounds):</label>
            <input type="number" step="0.01" id="par_override_gp" style="width:80px; padding:3px 6px;" value="${ac.avgGradePointOverride !== null && ac.avgGradePointOverride !== undefined ? ac.avgGradePointOverride : ''}" placeholder="Auto" oninput="ParApp.recalculateLive()">
            <input type="text" id="par_override_gp_reason" style="flex:1; padding:3px 6px;" value="${escapeHtml(ac.avgGradePointOverrideReason || '')}" placeholder="Mandatory reason for override (e.g. rounded per Dept BoS)">
          </div>
        </div>

        <!-- 1.1.2 Students Feedback -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:6px;">
            1.1.2 Students Feedback in Theory Course (I 1.1.2)
          </div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl. No.</th>
                  <th style="width:90px;">UG / PG</th>
                  <th style="width:120px;">Course Code</th>
                  <th>Course Title</th>
                  <th style="width:140px;">Student Feedback Score</th>
                  <th style="width:60px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_feedback112">
                ${feedbackRows.map((f, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td>
                      <select class="par-field-fb112" data-field="ugPg">
                        <option value="UG" ${f.ugPg === 'UG' ? 'selected' : ''}>UG</option>
                        <option value="PG" ${f.ugPg === 'PG' ? 'selected' : ''}>PG</option>
                      </select>
                    </td>
                    <td><input type="text" class="par-field-fb112" data-field="code" value="${escapeHtml(f.code || '')}" placeholder="e.g. AMPC303"></td>
                    <td><input type="text" class="par-field-fb112" data-field="title" value="${escapeHtml(f.title || '')}" placeholder="Course title"></td>
                    <td><input type="number" step="0.01" min="0" max="5" class="par-field-fb112" data-field="feedbackScore" value="${f.feedbackScore !== undefined ? f.feedbackScore : ''}" placeholder="0.00 - 5.00" oninput="ParApp.recalculateLive()"></td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('feedback112', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('feedback112')">+ Add Feedback Row</button>
            <div style="font-size:13px; font-weight:600; color:var(--par-primary);">
              Calculated Arithmetic Average: <span id="par_calc_fb_val">${avgFbResult.formatted}</span>
              <span style="font-size:11.5px; color:#718096; font-weight:normal;">(${avgFbResult.details})</span>
            </div>
          </div>

          <!-- Source Discrepancy Note & Override -->
          <div style="background:#fffaf0; border:1px solid #feebc8; padding:8px 12px; border-radius:4px; font-size:12px; color:#c05621; margin-bottom:6px;">
            ⚠️ <strong>Audit Note:</strong> In the reference Word document, feedback scores (4.44, 4.22, 4.60, 4.37) average to 4.41, but the author used 4.60 in their sample calculation. You can allow auto-calculation or enter an authorized override below.
          </div>
          <div style="background:#f8fafc; padding:8px 12px; border-radius:4px; font-size:12.5px; display:flex; align-items:center; gap:12px;">
            <label style="font-weight:600; color:#4a5568;">Manual Override (e.g. 4.60):</label>
            <input type="number" step="0.01" id="par_override_fb" style="width:80px; padding:3px 6px;" value="${ac.avgFeedbackOverride !== null && ac.avgFeedbackOverride !== undefined ? ac.avgFeedbackOverride : ''}" placeholder="Auto" oninput="ParApp.recalculateLive()">
            <input type="text" id="par_override_fb_reason" style="flex:1; padding:3px 6px;" value="${escapeHtml(ac.avgFeedbackOverrideReason || '')}" placeholder="Reason for manual override">
          </div>
        </div>

        <!-- Teaching Index Formula Box -->
        <div class="par-calc-box">
          <div class="par-calc-box-title">📐 Teaching Index (I 1.1) Calculation</div>
          <div>Formula: <code>I 1.1 = (0.7 × I 1.1.1) + (0.3 × I 1.1.2)</code></div>
          <div class="par-calc-formula" id="par_formula_i11">
            (0.7 × ${ac.index111 || 0}) + (0.3 × ${ac.index112 || 0}) = ${ac.index11 || 0}
          </div>
          <div class="par-calc-result">Teaching Index (I 1.1): <span id="par_val_i11">${ac.index11 || 0}</span></div>
        </div>

        <!-- 1.2 Related Development Activities -->
        <div style="margin-top:24px;">
          <h4 style="margin:16px 0 8px 0; color:var(--par-primary); border-bottom:1px solid #cbd5e0; padding-bottom:4px;">
            1.2 Related Development Activities (I 1.2)
          </h4>
          <div style="font-size:12px; color:#718096; margin-bottom:8px;">
            Examples: Blended learning, special lectures, industrial visits, mini-project guidance, external workshops, certifications, competitions, student mentoring.
          </div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl.</th>
                  <th style="width:180px;">Activity Name</th>
                  <th>Details of Activity / Contribution</th>
                  <th style="width:110px;">Date / Period</th>
                  <th style="width:80px;">Points</th>
                  <th style="width:140px;">Evidence</th>
                  <th style="width:50px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_related12">
                ${devRows.map((d, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td><input type="text" class="par-field-rd12" data-field="name" value="${escapeHtml(d.name || '')}" placeholder="e.g. Blended Learning"></td>
                    <td><textarea class="par-field-rd12" data-field="description" rows="2" placeholder="Details...">${escapeHtml(d.description || '')}</textarea></td>
                    <td><input type="text" class="par-field-rd12" data-field="date" value="${escapeHtml(d.date || '')}" placeholder="e.g. 2024-25"></td>
                    <td><input type="number" step="0.1" class="par-field-rd12" data-field="points" value="${d.points || 0}" style="width:70px;" oninput="ParApp.recalculateLive()"></td>
                    <td>
                      ${renderEvidenceControl('related12', i, d.evidenceName, d.evidenceId)}
                    </td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('relatedDev12', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('relatedDev12')">+ Add Development Activity</button>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-weight:600; font-size:13px;">Assigned Points (I 1.2):</label>
              <input type="number" step="0.1" id="par_points_12" style="width:80px; padding:4px 8px; font-weight:700;" value="${ac.assignedPoints12 !== undefined ? ac.assignedPoints12 : 5}" oninput="ParApp.recalculateLive()">
            </div>
          </div>
        </div>

        <!-- 1.3 Continuing Education -->
        <div style="margin-top:24px;">
          <h4 style="margin:16px 0 8px 0; color:var(--par-primary); border-bottom:1px solid #cbd5e0; padding-bottom:4px;">
            1.3 Continuing Education (I 1.3)
          </h4>
          <div style="font-size:12px; color:#718096; margin-bottom:8px;">
            Examples: NPTEL online certifications, Certiport, ATAL Academy FDPs, PDPs on ICT Tools, online/virtual FDPs, faculty industrial visits, IIC levels.
          </div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl.</th>
                  <th style="width:180px;">Name of Activity</th>
                  <th>Details of Continuing Education</th>
                  <th style="width:110px;">Date / Period</th>
                  <th style="width:100px;">Status</th>
                  <th style="width:80px;">Points</th>
                  <th style="width:140px;">Evidence</th>
                  <th style="width:50px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_cont13">
                ${contRows.map((c, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td><input type="text" class="par-field-ce13" data-field="name" value="${escapeHtml(c.name || '')}" placeholder="e.g. NPTEL Course"></td>
                    <td><textarea class="par-field-ce13" data-field="description" rows="2" placeholder="Details...">${escapeHtml(c.description || '')}</textarea></td>
                    <td><input type="text" class="par-field-ce13" data-field="date" value="${escapeHtml(c.date || '')}" placeholder="e.g. July-Dec 2024"></td>
                    <td><input type="text" class="par-field-ce13" data-field="status" value="${escapeHtml(c.status || '')}" placeholder="Completed/Attended"></td>
                    <td><input type="number" step="0.1" class="par-field-ce13" data-field="points" value="${c.points || 0}" style="width:70px;" oninput="ParApp.recalculateLive()"></td>
                    <td>
                      ${renderEvidenceControl('cont13', i, c.evidenceName, c.evidenceId)}
                    </td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('continuingEd13', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('continuingEd13')">+ Add Continuing Education Row</button>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-weight:600; font-size:13px;">Assigned Points (I 1.3):</label>
              <input type="number" step="0.1" id="par_points_13" style="width:80px; padding:4px 8px; font-weight:700;" value="${ac.assignedPoints13 !== undefined ? ac.assignedPoints13 : 5}" oninput="ParApp.recalculateLive()">
            </div>
          </div>
        </div>

        <!-- Academic Index Summary Box -->
        <div class="par-calc-box" style="border-left-color:var(--par-primary); background:#ebf3fa;">
          <div class="par-calc-box-title">⭐ Academic Index (I 1.0) Overall Calculation</div>
          <div>Formula: <code>I 1.0 = (0.5 × I 1.1) + (0.3 × I 1.2) + (0.2 × I 1.3)</code></div>
          <div class="par-calc-formula" id="par_formula_i10">
            ${ac.breakdownText || '(0.5 × 4.18) + (0.3 × 5) + (0.2 × 5) = 2.09 + 1.5 + 1 = 4.59'}
          </div>
          <div class="par-calc-result" style="font-size:17px;">Final Academic Index (I 1.0): <span id="par_val_i10">${ac.index10 || 0}</span></div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <button class="par-btn par-btn-secondary" onclick="ParApp.setStep(1)">← Back: Faculty Info</button>
          <button class="par-btn par-btn-primary" onclick="ParApp.setStep(3)">Next: Research (I 2.0) →</button>
        </div>
      </div>
    `;
  }

  // Step 3: Research Activities (I 2.0)
  function renderStep3Research(r) {
    const res = r.researchActivities || {};
    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>3. Section 2.0 — Research (I 2.0)</span>
          <span style="font-size:13px; font-weight:700; color:var(--par-primary);">I 2.0 = ${res.index20 || 0}</span>
        </div>
        <div class="par-section-subtitle">Project guidance, sponsored research, publications/certifications, patents, and sponsored seminars.</div>

        <!-- 2.1 Project Guidance -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:6px;">2.1 Project Guidance (I 2.1)</div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl.</th>
                  <th style="width:80px;">UG / PG</th>
                  <th>Name of the Project Guided</th>
                  <th style="width:200px;">Other Details</th>
                  <th style="width:50px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_proj21">
                ${(res.projects21 || []).map((p, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td>
                      <select class="par-field-p21" data-field="ugPg">
                        <option value="UG" ${p.ugPg === 'UG' ? 'selected' : ''}>UG</option>
                        <option value="PG" ${p.ugPg === 'PG' ? 'selected' : ''}>PG</option>
                      </select>
                    </td>
                    <td><input type="text" class="par-field-p21" data-field="title" value="${escapeHtml(p.title || '')}" placeholder="Project title"></td>
                    <td><input type="text" class="par-field-p21" data-field="otherDetails" value="${escapeHtml(p.otherDetails || '')}" placeholder="Mini Project / Major Project"></td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('projects21', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('projects21')">+ Add Project</button>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12.5px; color:#718096;">Total Guided: ${(res.projects21 || []).length}</span>
              <label style="font-weight:600; font-size:13px;">Assigned Score (I 2.1):</label>
              <input type="number" step="0.1" id="par_points_21" style="width:70px; padding:4px 8px; font-weight:700;" value="${res.points21 !== undefined ? res.points21 : 1}" oninput="ParApp.recalculateLive()">
            </div>
          </div>
        </div>

        <!-- 2.2 Sponsored Research -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:6px;">2.2 Sponsored Research / Programmes (I 2.2)</div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl.</th>
                  <th>Details of Sponsored Project / Programme</th>
                  <th style="width:160px;">Agency / Sponsoring Org</th>
                  <th style="width:110px;">Date</th>
                  <th style="width:140px;">Status</th>
                  <th style="width:120px;">Evidence</th>
                  <th style="width:50px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_spon22">
                ${(res.sponsored22 || []).map((s, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td><input type="text" class="par-field-sp22" data-field="title" value="${escapeHtml(s.title || '')}" placeholder="Title / details"></td>
                    <td><input type="text" class="par-field-sp22" data-field="agency" value="${escapeHtml(s.agency || '')}" placeholder="Funding agency"></td>
                    <td><input type="text" class="par-field-sp22" data-field="date" value="${escapeHtml(s.date || '')}" placeholder="Date"></td>
                    <td>
                      <select class="par-field-sp22" data-field="status">
                        <option value="Submitted" ${s.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                        <option value="Sanctioned" ${s.status === 'Sanctioned' ? 'selected' : ''}>Sanctioned</option>
                      </select>
                    </td>
                    <td>${renderEvidenceControl('spon22', i, s.evidenceName, s.evidenceId)}</td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('sponsored22', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('sponsored22')">+ Add Sponsored Research</button>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-weight:600; font-size:13px;">Assigned Score (I 2.2):</label>
              <input type="number" step="0.1" id="par_points_22" style="width:70px; padding:4px 8px; font-weight:700;" value="${res.points22 !== undefined ? res.points22 : 0}" oninput="ParApp.recalculateLive()">
            </div>
          </div>
        </div>

        <!-- 2.3 Publications / Certifications -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:6px;">2.3 Publication of Research Papers / International Certification (I 2.3)</div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl.</th>
                  <th>Paper / Certification Title</th>
                  <th>Conference / Journal / Certification Details</th>
                  <th style="width:130px;">Status</th>
                  <th style="width:110px;">Indexing</th>
                  <th style="width:120px;">Evidence</th>
                  <th style="width:50px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_pub23">
                ${(res.publications23 || []).map((p, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td><input type="text" class="par-field-pb23" data-field="title" value="${escapeHtml(p.title || '')}" placeholder="Title"></td>
                    <td><textarea class="par-field-pb23" data-field="publicationDetails" rows="2" placeholder="Details...">${escapeHtml(p.publicationDetails || '')}</textarea></td>
                    <td>
                      <select class="par-field-pb23" data-field="status">
                        <option value="Published" ${p.status === 'Published' ? 'selected' : ''}>Published</option>
                        <option value="Accepted" ${p.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                        <option value="Presented" ${p.status === 'Presented' ? 'selected' : ''}>Presented</option>
                        <option value="Communicated" ${p.status === 'Communicated' ? 'selected' : ''}>Communicated</option>
                      </select>
                    </td>
                    <td><input type="text" class="par-field-pb23" data-field="indexing" value="${escapeHtml(p.indexing || '')}" placeholder="Scopus/WoS/etc."></td>
                    <td>${renderEvidenceControl('pub23', i, p.evidenceName, p.evidenceId)}</td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('publications23', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('publications23')">+ Add Publication / Certification</button>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-weight:600; font-size:13px;">Assigned Score (I 2.3):</label>
              <input type="number" step="0.1" id="par_points_23" style="width:70px; padding:4px 8px; font-weight:700;" value="${res.points23 !== undefined ? res.points23 : 3}" oninput="ParApp.recalculateLive()">
            </div>
          </div>
        </div>

        <!-- 2.4 Innovative Products / Patents -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:6px;">2.4 Innovative Products Developed, Patents Granted, Published, Filed (I 2.4)</div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl.</th>
                  <th>Details of Products / Patents</th>
                  <th style="width:130px;">Status</th>
                  <th style="width:120px;">Ref / App No.</th>
                  <th style="width:120px;">Evidence</th>
                  <th style="width:50px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_pat24">
                ${(res.patents24 || []).map((pt, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td><textarea class="par-field-pt24" data-field="title" rows="2" placeholder="Patent title & description...">${escapeHtml(pt.title || '')}</textarea></td>
                    <td>
                      <select class="par-field-pt24" data-field="status">
                        <option value="Filed" ${pt.status === 'Filed' ? 'selected' : ''}>Filed</option>
                        <option value="Published" ${pt.status === 'Published' ? 'selected' : ''}>Published</option>
                        <option value="Granted" ${pt.status === 'Granted' ? 'selected' : ''}>Granted</option>
                      </select>
                    </td>
                    <td><input type="text" class="par-field-pt24" data-field="refNumber" value="${escapeHtml(pt.refNumber || '')}" placeholder="Ref No."></td>
                    <td>${renderEvidenceControl('pat24', i, pt.evidenceName, pt.evidenceId)}</td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('patents24', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('patents24')">+ Add Patent / Product</button>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-weight:600; font-size:13px;">Assigned Score (I 2.4):</label>
              <input type="number" step="0.1" id="par_points_24" style="width:70px; padding:4px 8px; font-weight:700;" value="${res.points24 !== undefined ? res.points24 : 2}" oninput="ParApp.recalculateLive()">
            </div>
          </div>
        </div>

        <!-- 2.5 Sponsored Seminars / FDPs -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:600; font-size:13.5px; margin-bottom:6px;">2.5 Sponsored Seminars / FDPs / Other Programmes (I 2.5)</div>
          <div class="par-edit-table-wrap">
            <table class="par-edit-table">
              <thead>
                <tr>
                  <th style="width:40px;">Sl.</th>
                  <th>Details of Sponsored Programmes</th>
                  <th style="width:160px;">Sponsoring Org</th>
                  <th style="width:110px;">Date</th>
                  <th style="width:130px;">Status</th>
                  <th style="width:120px;">Evidence</th>
                  <th style="width:50px;">Action</th>
                </tr>
              </thead>
              <tbody id="par_table_sem25">
                ${(res.sponsoredSeminars25 || []).map((sm, i) => `
                  <tr data-index="${i}">
                    <td style="text-align:center;">${i + 1}</td>
                    <td><textarea class="par-field-sm25" data-field="title" rows="2" placeholder="Programme title...">${escapeHtml(sm.title || '')}</textarea></td>
                    <td><input type="text" class="par-field-sm25" data-field="agency" value="${escapeHtml(sm.agency || '')}" placeholder="Agency"></td>
                    <td><input type="text" class="par-field-sm25" data-field="date" value="${escapeHtml(sm.date || '')}" placeholder="Date"></td>
                    <td>
                      <select class="par-field-sm25" data-field="status">
                        <option value="Sanctioned" ${sm.status === 'Sanctioned' ? 'selected' : ''}>Sanctioned</option>
                        <option value="Submitted" ${sm.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                      </select>
                    </td>
                    <td>${renderEvidenceControl('sem25', i, sm.evidenceName, sm.evidenceId)}</td>
                    <td style="text-align:center;">
                      <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('sponsoredSeminars25', ${i})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="par-table-actions-bar">
            <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('sponsoredSeminars25')">+ Add Sponsored Programme</button>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-weight:600; font-size:13px;">Assigned Score (I 2.5):</label>
              <input type="number" step="0.1" id="par_points_25" style="width:70px; padding:4px 8px; font-weight:700;" value="${res.points25 !== undefined ? res.points25 : 2}" oninput="ParApp.recalculateLive()">
            </div>
          </div>
        </div>

        <!-- Research Formula Breakdown -->
        <div class="par-calc-box">
          <div class="par-calc-box-title">📐 Research Index (I 2.0) Calculation (Engineering Faculty Formula)</div>
          <div>Formula: <code>I 2.0 = (0.1 × I 2.1) + (0.2 × I 2.2) + (0.3 × I 2.3) + (0.2 × I 2.4) + (0.2 × I 2.5)</code></div>
          <div class="par-calc-formula" id="par_formula_i20">
            ${res.breakdownText || '(0.1 × 1) + (0.2 × 0) + (0.3 × 3) + (0.2 × 2) + (0.2 × 2) = 0.1 + 0 + 0.9 + 0.4 + 0.4 = 1.8'}
          </div>
          <div class="par-calc-result">Research Index (I 2.0): <span id="par_val_i20">${res.index20 || 0}</span></div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <button class="par-btn par-btn-secondary" onclick="ParApp.setStep(2)">← Back: Academic Activities</button>
          <button class="par-btn par-btn-primary" onclick="ParApp.setStep(4)">Next: Extension Activities (I 3.0) →</button>
        </div>
      </div>
    `;
  }

  // Step 4: Extension Activities (I 3.0)
  function renderStep4Extension(r) {
    const ext = r.extensionActivities || {};
    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>4. Section 3.0 — Extension Activities (I 3.0)</span>
          <span style="font-size:13px; font-weight:700; color:var(--par-primary);">I 3.0 = ${ext.index30 || 0}</span>
        </div>
        <div class="par-section-subtitle">Student participation & motivation, industrial visits, event coordination, workshops, presentations, online video lectures.</div>

        <div class="par-edit-table-wrap">
          <table class="par-edit-table">
            <thead>
              <tr>
                <th style="width:40px;">Sl.</th>
                <th style="width:180px;">Name of Activity</th>
                <th>Details of the Activity / Contribution</th>
                <th style="width:110px;">Date / Period</th>
                <th>Contribution Made</th>
                <th style="width:130px;">Evidence</th>
                <th style="width:50px;">Action</th>
              </tr>
            </thead>
            <tbody id="par_table_ext30">
              ${(ext.activities30 || []).map((a, i) => `
                <tr data-index="${i}">
                  <td style="text-align:center;">${i + 1}</td>
                  <td><input type="text" class="par-field-ext30" data-field="name" value="${escapeHtml(a.name || '')}" placeholder="Activity name"></td>
                  <td><textarea class="par-field-ext30" data-field="description" rows="2" placeholder="Description...">${escapeHtml(a.description || '')}</textarea></td>
                  <td><input type="text" class="par-field-ext30" data-field="date" value="${escapeHtml(a.date || '')}" placeholder="Date / period"></td>
                  <td><input type="text" class="par-field-ext30" data-field="contribution" value="${escapeHtml(a.contribution || '')}" placeholder="Contribution"></td>
                  <td>${renderEvidenceControl('ext30', i, a.evidenceName, a.evidenceId)}</td>
                  <td style="text-align:center;">
                    <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('activities30', ${i})">✕</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="par-table-actions-bar">
          <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('activities30')">+ Add Extension Activity</button>
          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-weight:600; font-size:13px;">Assessed Extension Index (I 3.0):</label>
            <input type="number" step="0.1" id="par_points_30" style="width:70px; padding:4px 8px; font-weight:700;" value="${ext.index30 !== undefined ? ext.index30 : 5}" oninput="ParApp.recalculateLive()">
          </div>
        </div>

        <div class="par-form-group" style="margin-top:14px;">
          <label for="par_ext_basis">Assessment Basis / Notes</label>
          <input type="text" id="par_ext_basis" class="par-input" value="${escapeHtml(ext.assessmentBasis || 'Assessed under institutional extension guidelines')}" placeholder="Assessment basis note">
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <button class="par-btn par-btn-secondary" onclick="ParApp.setStep(3)">← Back: Research</button>
          <button class="par-btn par-btn-primary" onclick="ParApp.setStep(5)">Next: Administration (I 4.0) →</button>
        </div>
      </div>
    `;
  }

  // Step 5: Administration (I 4.0)
  function renderStep5Administration(r) {
    const adm = r.adminActivities || {};
    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>5. Section 4.0 — Administration (I 4.0)</span>
          <span style="font-size:13px; font-weight:700; color:var(--par-primary);">I 4.0 = ${adm.index40 || 0}</span>
        </div>
        <div class="par-section-subtitle">Departmental and institutional administrative duties (e.g. Class Advisor, Website Coordinator, BOS Member, NAAC Criteria 5, IIC Member).</div>

        <div class="par-edit-table-wrap">
          <table class="par-edit-table">
            <thead>
              <tr>
                <th style="width:40px;">Sl.</th>
                <th style="width:200px;">Administrative Role / Duty</th>
                <th>Details of Contribution</th>
                <th style="width:110px;">Period</th>
                <th style="width:130px;">Evidence</th>
                <th style="width:50px;">Action</th>
              </tr>
            </thead>
            <tbody id="par_table_adm40">
              ${(adm.activities40 || []).map((a, i) => `
                <tr data-index="${i}">
                  <td style="text-align:center;">${i + 1}</td>
                  <td><input type="text" class="par-field-adm40" data-field="role" value="${escapeHtml(a.role || '')}" placeholder="e.g. Class Advisor"></td>
                  <td><textarea class="par-field-adm40" data-field="description" rows="2" placeholder="Details of contribution...">${escapeHtml(a.description || '')}</textarea></td>
                  <td><input type="text" class="par-field-adm40" data-field="period" value="${escapeHtml(a.period || '')}" placeholder="e.g. 2024-25"></td>
                  <td>${renderEvidenceControl('adm40', i, a.evidenceName, a.evidenceId)}</td>
                  <td style="text-align:center;">
                    <button class="par-btn par-btn-sm par-btn-danger" onclick="ParApp.removeRow('activities40', ${i})">✕</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="par-table-actions-bar">
          <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.addRow('activities40')">+ Add Administrative Activity</button>
          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-weight:600; font-size:13px;">Assessed Administration Index (I 4.0):</label>
            <input type="number" step="0.1" id="par_points_40" style="width:70px; padding:4px 8px; font-weight:700;" value="${adm.index40 !== undefined ? adm.index40 : 5}" oninput="ParApp.recalculateLive()">
          </div>
        </div>

        <div class="par-form-group" style="margin-top:14px;">
          <label for="par_adm_basis">Assessment Basis / Notes</label>
          <input type="text" id="par_adm_basis" class="par-input" value="${escapeHtml(adm.assessmentBasis || 'Assessed under department administrative responsibilities')}" placeholder="Assessment basis note">
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <button class="par-btn par-btn-secondary" onclick="ParApp.setStep(4)">← Back: Extension</button>
          <button class="par-btn par-btn-primary" onclick="ParApp.setStep(6)">Next: Faculty Performance Index (FPI) →</button>
        </div>
      </div>
    `;
  }

  // Step 6: Faculty Performance Index (FPI)
  function renderStep6Fpi(r) {
    const fpi = r.fpiComputation || {};
    const wt = fpi.weights || { w10: 0.60, w20: 0.15, w30: 0.15, w40: 0.10 };
    const ac = r.academicActivities || {};
    const res = r.researchActivities || {};
    const ext = r.extensionActivities || {};
    const adm = r.adminActivities || {};

    const i10 = ac.index10 || 0;
    const i20 = res.index20 || 0;
    const i30 = ext.index30 || 0;
    const i40 = adm.index40 || 0;

    const t1 = (wt.w10 * i10).toFixed(3);
    const t2 = (wt.w20 * i20).toFixed(3);
    const t3 = (wt.w30 * i30).toFixed(3);
    const t4 = (wt.w40 * i40).toFixed(3);

    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>6. Section 5.0 — Computation of Faculty Performance Index (FPI)</span>
        </div>
        <div class="par-section-subtitle">Weighted synthesis of Academic, Research, Extension, and Administrative performance.</div>

        <!-- Grand FPI Hero Card -->
        <div class="par-fpi-hero">
          <div class="par-fpi-hero-title">Official Computed Faculty Performance Index</div>
          <div class="par-fpi-display">
            <div class="par-fpi-score" id="par_hero_fpi_score">${fpi.formattedFpi || '0.000'}</div>
            <div style="font-size:14px; color:#cbd5e0;">(Calculated using institutional formula)</div>
          </div>
          <div>Formula: <code>FPI = (W 1.0 × I 1.0) + (W 2.0 × I 2.0) + (W 3.0 × I 3.0) + (W 4.0 × I 4.0)</code></div>
          <div style="margin-top:6px; font-family:monospace; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px;" id="par_hero_fpi_formula">
            ${fpi.formulaText || '—'}
          </div>

          <div class="par-fpi-weights-breakdown">
            <div class="par-fpi-weight-item">
              Academic (W 1.0 = ${wt.w10}):
              <strong>${wt.w10} × ${i10} = ${t1}</strong>
            </div>
            <div class="par-fpi-weight-item">
              Research (W 2.0 = ${wt.w20}):
              <strong>${wt.w20} × ${i20} = ${t2}</strong>
            </div>
            <div class="par-fpi-weight-item">
              Extension (W 3.0 = ${wt.w30}):
              <strong>${wt.w30} × ${i30} = ${t3}</strong>
            </div>
            <div class="par-fpi-weight-item">
              Administration (W 4.0 = ${wt.w40}):
              <strong>${wt.w40} × ${i40} = ${t4}</strong>
            </div>
          </div>
        </div>

        <!-- Designation Specific Weights Configuration Form -->
        <div style="border:1px solid var(--par-neutral-300); border-radius:8px; padding:18px; margin-top:20px; background:#fff;">
          <div style="font-weight:700; font-size:15px; color:var(--par-primary); margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>⚖️ Applied Designation Weights</span>
            ${state.currentRole === 'admin' ? `
              <button class="par-btn par-btn-sm par-btn-secondary" onclick="ParApp.openWeightsManagerModal()">
                ⚙️ Manage System Presets
              </button>
            ` : ''}
          </div>

          <div class="par-alert par-alert-info" style="margin-bottom:14px;">
            Note: Weights correspond to designation (${escapeHtml(r.facultyInfo.designation || 'ASSISTANT PROFESSOR')}).
            Sum of weights must strictly equal 1.00.
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:12px;">
            <div class="par-form-group">
              <label for="par_wt_10">W 1.0 (Academic)</label>
              <input type="number" step="0.01" min="0" max="1" id="par_wt_10" class="par-input" value="${wt.w10}" oninput="ParApp.recalculateLive()" ${state.currentRole !== 'admin' ? 'readonly' : ''}>
            </div>
            <div class="par-form-group">
              <label for="par_wt_20">W 2.0 (Research)</label>
              <input type="number" step="0.01" min="0" max="1" id="par_wt_20" class="par-input" value="${wt.w20}" oninput="ParApp.recalculateLive()" ${state.currentRole !== 'admin' ? 'readonly' : ''}>
            </div>
            <div class="par-form-group">
              <label for="par_wt_30">W 3.0 (Extension)</label>
              <input type="number" step="0.01" min="0" max="1" id="par_wt_30" class="par-input" value="${wt.w30}" oninput="ParApp.recalculateLive()" ${state.currentRole !== 'admin' ? 'readonly' : ''}>
            </div>
            <div class="par-form-group">
              <label for="par_wt_40">W 4.0 (Administration)</label>
              <input type="number" step="0.01" min="0" max="1" id="par_wt_40" class="par-input" value="${wt.w40}" oninput="ParApp.recalculateLive()" ${state.currentRole !== 'admin' ? 'readonly' : ''}>
            </div>
          </div>
          <div id="par_weight_validation_msg" style="margin-top:8px; font-size:12.5px; font-weight:600; color:var(--par-success);">
            ✓ Weights sum to 1.00
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:20px;">
          <button class="par-btn par-btn-secondary" onclick="ParApp.setStep(5)">← Back: Administration</button>
          <button class="par-btn par-btn-primary" onclick="ParApp.setStep(7)">Next: Additional Info & Declaration →</button>
        </div>
      </div>
    `;
  }

  // Step 7: Additional Info & Declaration
  function renderStep7AdditionalAndDeclaration(r) {
    const dec = r.declaration || {};
    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>7. Additional Information & Faculty Declaration</span>
        </div>
        <div class="par-section-subtitle">Section 6.0 additional achievements and formal declaration of submitted claims.</div>

        <!-- 6.0 Additional Info -->
        <div class="par-form-group" style="margin-bottom:24px;">
          <label for="par_additional_info">6.0 Additional Information Not Covered Above, If Any:</label>
          <textarea id="par_additional_info" class="par-textarea" rows="4" placeholder="Enter any other achievements, awards, recognitions, or relevant contributions not captured in previous sections...">${escapeHtml(r.additionalInfo || '')}</textarea>
        </div>

        <!-- Declaration -->
        <div style="border-top:2px solid var(--par-neutral-200); padding-top:20px;">
          <h4 style="color:var(--par-primary); margin-bottom:10px;">Faculty Member Declaration</h4>
          <div class="par-alert par-alert-info">
            I hereby declare that the information provided in Part A, including the enclosed documentary evidence, is true and correct to the best of my knowledge and belief.
          </div>

          <div class="par-form-grid" style="margin-top:16px;">
            <div class="par-form-group">
              <label for="par_dec_date">Declaration Date <span style="color:red;">*</span></label>
              <input type="text" id="par_dec_date" class="par-input" value="${escapeHtml(dec.date || new Date().toLocaleDateString('en-GB'))}" placeholder="DD.MM.YYYY">
            </div>
            <div class="par-form-group">
              <label for="par_dec_sign">Faculty Name (Signature Confirmation) <span style="color:red;">*</span></label>
              <input type="text" id="par_dec_sign" class="par-input" value="${escapeHtml(dec.signatureName || r.facultyInfo.name || '')}" placeholder="Full Name as signature">
            </div>
            <div class="par-form-group" style="grid-column:1/-1;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="par_dec_confirm" ${dec.confirmed ? 'checked' : ''} style="width:18px; height:18px;">
                <span>I confirm that the above self-appraisal details are complete and ready for verification.</span>
              </label>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:24px;">
          <button class="par-btn par-btn-secondary" onclick="ParApp.setStep(6)">← Back: FPI Computation</button>
          <div style="display:flex; gap:10px;">
            <button class="par-btn par-btn-primary" onclick="ParApp.saveDraft()">💾 Save Draft</button>
            <button class="par-btn par-btn-success" onclick="ParApp.submitForVerification()">📤 Submit for Verification</button>
          </div>
        </div>
      </div>
    `;
  }

  // Step 8: HOD Verification & Remarks (Part B)
  function renderStep8HodVerification(r) {
    const hod = r.hodVerification || {};
    const isHodRole = state.currentRole === 'hod' || state.currentRole === 'admin';
    const history = r.history || [];

    return `
      <div class="par-section-card">
        <div class="par-section-title">
          <span>8. Part B — Remarks of Head of the Department</span>
          <span class="par-badge ${getStatusBadgeClass(r.status)}">${r.status}</span>
        </div>
        <div class="par-section-subtitle">Section 7.0 Verification of Information and Section 8.0 HOD remarks workflow.</div>

        ${!isHodRole ? `
          <div class="par-alert par-alert-warning">
            🔒 <strong>Viewer Mode:</strong> You are currently viewing as Faculty. Switch to the <strong>Head of Department (HOD)</strong> role using the top role selector to record verification remarks or approve/return reports.
          </div>
        ` : ''}

        <!-- Section 7.0 Verification question -->
        <div style="background:#f8fafc; border:1px solid #cbd5e0; border-radius:8px; padding:18px; margin-bottom:20px;">
          <h4 style="color:var(--par-primary); margin-bottom:8px;">7.0 VERIFICATION OF INFORMATION</h4>
          <p style="font-size:14px; line-height:1.6; margin-bottom:14px;">
            <em>"Verified the information provided in Part – A including the copies of the documents and found them correct to the best of my knowledge. The FPI computed also is correct."</em>
          </p>

          <div style="display:flex; gap:24px; align-items:center; margin-bottom:14px;">
            <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer;">
              <input type="radio" name="par_hod_verify_radio" value="Yes" ${hod.verified === 'Yes' ? 'checked' : ''} ${!isHodRole ? 'disabled' : ''} style="width:18px; height:18px;">
              <span style="color:var(--par-success); font-size:15px;">YES</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer;">
              <input type="radio" name="par_hod_verify_radio" value="No" ${hod.verified === 'No' ? 'checked' : ''} ${!isHodRole ? 'disabled' : ''} style="width:18px; height:18px;">
              <span style="color:var(--par-danger); font-size:15px;">NO</span>
            </label>
          </div>

          <div style="font-size:12px; color:#718096; margin-bottom:16px;">
            Note : If you have ticked the box “NO”, enclose another form with recomputed FPI and specify the reasons for returning below.
          </div>

          <div class="par-form-grid">
            <div class="par-form-group">
              <label for="par_hod_date">Verification Date</label>
              <input type="text" id="par_hod_date" class="par-input" value="${escapeHtml(hod.verificationDate || new Date().toLocaleDateString('en-GB'))}" ${!isHodRole ? 'disabled' : ''}>
            </div>
            <div class="par-form-group">
              <label for="par_hod_name">Head of Department Name</label>
              <input type="text" id="par_hod_name" class="par-input" value="${escapeHtml(hod.hodName || 'Dr. Head of Department')}" ${!isHodRole ? 'disabled' : ''}>
            </div>
          </div>
        </div>

        <!-- Section 8.0 Other Remarks -->
        <div style="margin-bottom:20px;">
          <h4 style="color:var(--par-primary); margin-bottom:6px;">8.0 OTHER REMARKS, IF ANY:</h4>
          <textarea id="par_hod_remarks" class="par-textarea" rows="3" placeholder="Enter HOD remarks, commendations, or recommendations..." ${!isHodRole ? 'disabled' : ''}>${escapeHtml(hod.remarks || '')}</textarea>
        </div>

        <!-- Mandatory reason for return if No is chosen -->
        <div id="par_hod_rejection_reason_box" style="margin-bottom:20px; display:${hod.verified === 'No' ? 'block' : 'none'};">
          <div class="par-form-group">
            <label for="par_hod_rejection_reason" style="color:var(--par-danger); font-weight:700;">
              Reason for Return / Correction (Mandatory when NO is selected) *
            </label>
            <textarea id="par_hod_rejection_reason" class="par-textarea" rows="3" placeholder="Explain which section needs recomputation or missing evidence..." ${!isHodRole ? 'disabled' : ''}>${escapeHtml(hod.rejectionReason || '')}</textarea>
          </div>
        </div>

        <!-- HOD Action Buttons -->
        ${isHodRole ? `
          <div style="display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap;">
            <button class="par-btn par-btn-success" onclick="ParApp.executeHodApproval()">
              ✓ Approve & Verify Report
            </button>
            <button class="par-btn par-btn-warning" onclick="ParApp.executeHodReturnForCorrection()">
              ↩️ Return for Correction
            </button>
          </div>
        ` : ''}

        <!-- Audit & Review History Timeline -->
        <div style="border-top:2px solid var(--par-neutral-200); padding-top:20px;">
          <h4 style="color:var(--par-primary); margin-bottom:8px;">📋 Audit & Review History</h4>
          <ul class="par-timeline">
            ${history.map(h => `
              <li class="par-timeline-item">
                <div class="par-timeline-date">${escapeHtml(new Date(h.timestamp).toLocaleString())} • By <strong>${escapeHtml(h.by)}</strong></div>
                <div class="par-timeline-action">${escapeHtml(h.action)} ${h.fpiSnapshot ? `(FPI: ${h.fpiSnapshot})` : ''}</div>
                ${h.remarks ? `<div class="par-timeline-remarks">${escapeHtml(h.remarks)}</div>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:24px;">
          <button class="par-btn par-btn-secondary" onclick="ParApp.setStep(7)">← Back: Additional Info & Declaration</button>
          <button class="par-btn par-btn-primary" onclick="ParApp.printReport('${r.id}')">🖨️ View Printable Official Document</button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // ROW MANAGEMENT IN REPEATABLE TABLES
  // =========================================================================

  function addRow(tableKey) {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    if (tableKey === 'courses111') {
      r.academicActivities.courses111.push({ id: 'c_' + Date.now(), ugPg: 'UG', code: '', title: '', passPercent: '', gradePoint: '' });
    } else if (tableKey === 'feedback112') {
      r.academicActivities.feedback112.push({ id: 'f_' + Date.now(), ugPg: 'UG', code: '', title: '', feedbackScore: '' });
    } else if (tableKey === 'relatedDev12') {
      r.academicActivities.relatedDev12.push({ id: 'rd_' + Date.now(), name: '', description: '', date: '', points: 0, evidenceId: null, evidenceName: '' });
    } else if (tableKey === 'continuingEd13') {
      r.academicActivities.continuingEd13.push({ id: 'ce_' + Date.now(), name: '', description: '', date: '', status: '', points: 0, evidenceId: null, evidenceName: '' });
    } else if (tableKey === 'projects21') {
      r.researchActivities.projects21.push({ id: 'p_' + Date.now(), ugPg: 'UG', title: '', otherDetails: '', points: 0 });
    } else if (tableKey === 'sponsored22') {
      r.researchActivities.sponsored22.push({ id: 'sp_' + Date.now(), title: '', agency: '', date: '', status: 'Submitted', points: 0, evidenceId: null, evidenceName: '' });
    } else if (tableKey === 'publications23') {
      r.researchActivities.publications23.push({ id: 'pb_' + Date.now(), title: '', publicationDetails: '', authors: '', date: '', status: 'Published', indexing: '', points: 0, evidenceId: null, evidenceName: '' });
    } else if (tableKey === 'patents24') {
      r.researchActivities.patents24.push({ id: 'pt_' + Date.now(), title: '', status: 'Filed', refNumber: '', points: 0, evidenceId: null, evidenceName: '' });
    } else if (tableKey === 'sponsoredSeminars25') {
      r.researchActivities.sponsoredSeminars25.push({ id: 'sm_' + Date.now(), title: '', agency: '', date: '', status: 'Sanctioned', points: 0, evidenceId: null, evidenceName: '' });
    } else if (tableKey === 'activities30') {
      r.extensionActivities.activities30.push({ id: 'ext_' + Date.now(), name: '', description: '', date: '', contribution: '', points: 0, evidenceId: null, evidenceName: '' });
    } else if (tableKey === 'activities40') {
      r.adminActivities.activities40.push({ id: 'adm_' + Date.now(), role: '', description: '', period: '', contribution: '', points: 0, evidenceId: null, evidenceName: '' });
    }

    renderEditor();
  }

  function removeRow(tableKey, index) {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    if (tableKey === 'courses111' && r.academicActivities.courses111) {
      r.academicActivities.courses111.splice(index, 1);
    } else if (tableKey === 'feedback112' && r.academicActivities.feedback112) {
      r.academicActivities.feedback112.splice(index, 1);
    } else if (tableKey === 'relatedDev12' && r.academicActivities.relatedDev12) {
      r.academicActivities.relatedDev12.splice(index, 1);
    } else if (tableKey === 'continuingEd13' && r.academicActivities.continuingEd13) {
      r.academicActivities.continuingEd13.splice(index, 1);
    } else if (tableKey === 'projects21' && r.researchActivities.projects21) {
      r.researchActivities.projects21.splice(index, 1);
    } else if (tableKey === 'sponsored22' && r.researchActivities.sponsored22) {
      r.researchActivities.sponsored22.splice(index, 1);
    } else if (tableKey === 'publications23' && r.researchActivities.publications23) {
      r.researchActivities.publications23.splice(index, 1);
    } else if (tableKey === 'patents24' && r.researchActivities.patents24) {
      r.researchActivities.patents24.splice(index, 1);
    } else if (tableKey === 'sponsoredSeminars25' && r.researchActivities.sponsoredSeminars25) {
      r.researchActivities.sponsoredSeminars25.splice(index, 1);
    } else if (tableKey === 'activities30' && r.extensionActivities.activities30) {
      r.extensionActivities.activities30.splice(index, 1);
    } else if (tableKey === 'activities40' && r.adminActivities.activities40) {
      r.adminActivities.activities40.splice(index, 1);
    }

    renderEditor();
  }

  // =========================================================================
  // INPUT HARVESTING & LIVE RECALCULATION
  // =========================================================================

  function harvestEditorInputs() {
    const r = state.currentReport;
    if (!r) return;

    // Faculty Info
    const elYear = document.getElementById('par_fi_acad_year');
    const elDeadline = document.getElementById('par_fi_deadline');
    const elName = document.getElementById('par_fi_name');
    const elEmpId = document.getElementById('par_fi_empid');
    const elDesig = document.getElementById('par_fi_desig');
    const elDept = document.getElementById('par_fi_dept');
    const elPay = document.getElementById('par_fi_pay');
    const elDoj = document.getElementById('par_fi_doj');

    if (elYear) r.academicYear = elYear.value;
    if (elDeadline) r.submissionDeadline = elDeadline.value;
    if (elName) r.facultyInfo.name = elName.value;
    if (elEmpId) r.facultyInfo.employeeId = elEmpId.value;
    if (elDesig) r.facultyInfo.designation = elDesig.value;
    if (elDept) r.facultyInfo.department = elDept.value;
    if (elPay) r.facultyInfo.scaleOfPay = elPay.value;
    if (elDoj) r.facultyInfo.dateOfAppointment = elDoj.value;

    // Step 2: Academic
    harvestTableInputs('courses111', 'par_table_courses111', 'par-field-c111', r.academicActivities.courses111);
    harvestTableInputs('feedback112', 'par_table_feedback112', 'par-field-fb112', r.academicActivities.feedback112);
    harvestTableInputs('relatedDev12', 'par_table_related12', 'par-field-rd12', r.academicActivities.relatedDev12);
    harvestTableInputs('continuingEd13', 'par_table_cont13', 'par-field-ce13', r.academicActivities.continuingEd13);

    const elGpOver = document.getElementById('par_override_gp');
    const elGpOverReason = document.getElementById('par_override_gp_reason');
    if (elGpOver) r.academicActivities.avgGradePointOverride = elGpOver.value !== '' ? Number(elGpOver.value) : null;
    if (elGpOverReason) r.academicActivities.avgGradePointOverrideReason = elGpOverReason.value;

    const elFbOver = document.getElementById('par_override_fb');
    const elFbOverReason = document.getElementById('par_override_fb_reason');
    if (elFbOver) r.academicActivities.avgFeedbackOverride = elFbOver.value !== '' ? Number(elFbOver.value) : null;
    if (elFbOverReason) r.academicActivities.avgFeedbackOverrideReason = elFbOverReason.value;

    const elPts12 = document.getElementById('par_points_12');
    if (elPts12) r.academicActivities.assignedPoints12 = Number(elPts12.value) || 0;

    const elPts13 = document.getElementById('par_points_13');
    if (elPts13) r.academicActivities.assignedPoints13 = Number(elPts13.value) || 0;

    // Step 3: Research
    harvestTableInputs('projects21', 'par_table_proj21', 'par-field-p21', r.researchActivities.projects21);
    harvestTableInputs('sponsored22', 'par_table_spon22', 'par-field-sp22', r.researchActivities.sponsored22);
    harvestTableInputs('publications23', 'par_table_pub23', 'par-field-pb23', r.researchActivities.publications23);
    harvestTableInputs('patents24', 'par_table_pat24', 'par-field-pt24', r.researchActivities.patents24);
    harvestTableInputs('sponsoredSeminars25', 'par_table_sem25', 'par-field-sm25', r.researchActivities.sponsoredSeminars25);

    const elPts21 = document.getElementById('par_points_21');
    if (elPts21) r.researchActivities.points21 = Number(elPts21.value) || 0;
    const elPts22 = document.getElementById('par_points_22');
    if (elPts22) r.researchActivities.points22 = Number(elPts22.value) || 0;
    const elPts23 = document.getElementById('par_points_23');
    if (elPts23) r.researchActivities.points23 = Number(elPts23.value) || 0;
    const elPts24 = document.getElementById('par_points_24');
    if (elPts24) r.researchActivities.points24 = Number(elPts24.value) || 0;
    const elPts25 = document.getElementById('par_points_25');
    if (elPts25) r.researchActivities.points25 = Number(elPts25.value) || 0;

    // Step 4: Extension
    harvestTableInputs('activities30', 'par_table_ext30', 'par-field-ext30', r.extensionActivities.activities30);
    const elPts30 = document.getElementById('par_points_30');
    if (elPts30) r.extensionActivities.index30 = Number(elPts30.value) || 0;
    const elExtBasis = document.getElementById('par_ext_basis');
    if (elExtBasis) r.extensionActivities.assessmentBasis = elExtBasis.value;

    // Step 5: Administration
    harvestTableInputs('activities40', 'par_table_adm40', 'par-field-adm40', r.adminActivities.activities40);
    const elPts40 = document.getElementById('par_points_40');
    if (elPts40) r.adminActivities.index40 = Number(elPts40.value) || 0;
    const elAdmBasis = document.getElementById('par_adm_basis');
    if (elAdmBasis) r.adminActivities.assessmentBasis = elAdmBasis.value;

    // Step 6: Weights
    const elW10 = document.getElementById('par_wt_10');
    const elW20 = document.getElementById('par_wt_20');
    const elW30 = document.getElementById('par_wt_30');
    const elW40 = document.getElementById('par_wt_40');
    if (elW10 && elW20 && elW30 && elW40) {
      r.fpiComputation.weights = {
        w10: Number(elW10.value),
        w20: Number(elW20.value),
        w30: Number(elW30.value),
        w40: Number(elW40.value)
      };
    }

    // Step 7: Additional Info & Declaration
    const elAddl = document.getElementById('par_additional_info');
    if (elAddl) r.additionalInfo = elAddl.value;

    const elDecDate = document.getElementById('par_dec_date');
    const elDecSign = document.getElementById('par_dec_sign');
    const elDecConfirm = document.getElementById('par_dec_confirm');
    if (elDecDate) r.declaration.date = elDecDate.value;
    if (elDecSign) r.declaration.signatureName = elDecSign.value;
    if (elDecConfirm) r.declaration.confirmed = elDecConfirm.checked;

    // Step 8: HOD Verification
    const elRadioYes = document.querySelector('input[name="par_hod_verify_radio"][value="Yes"]');
    const elRadioNo = document.querySelector('input[name="par_hod_verify_radio"][value="No"]');
    if (elRadioYes && elRadioYes.checked) r.hodVerification.verified = 'Yes';
    if (elRadioNo && elRadioNo.checked) r.hodVerification.verified = 'No';

    const elHodDate = document.getElementById('par_hod_date');
    const elHodName = document.getElementById('par_hod_name');
    const elHodRemarks = document.getElementById('par_hod_remarks');
    const elHodRejection = document.getElementById('par_hod_rejection_reason');
    if (elHodDate) r.hodVerification.verificationDate = elHodDate.value;
    if (elHodName) r.hodVerification.hodName = elHodName.value;
    if (elHodRemarks) r.hodVerification.remarks = elHodRemarks.value;
    if (elHodRejection) r.hodVerification.rejectionReason = elHodRejection.value;
  }

  function harvestTableInputs(key, tableBodyId, fieldClass, targetArray) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody || !targetArray) return;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, idx) => {
      if (!targetArray[idx]) targetArray[idx] = {};
      const inputs = row.querySelectorAll('.' + fieldClass);
      inputs.forEach(input => {
        const field = input.getAttribute('data-field');
        if (field) {
          targetArray[idx][field] = input.type === 'number' && input.value !== '' ? Number(input.value) : input.value;
        }
      });
    });
  }

  function recalculateLive() {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    ParStorage.recalculateReport(r);

    // Update Step 2 live fields if visible
    const avgGpEl = document.getElementById('par_calc_gp_val');
    const avgFbEl = document.getElementById('par_calc_fb_val');
    const i11Formula = document.getElementById('par_formula_i11');
    const i11Val = document.getElementById('par_val_i11');
    const i10Formula = document.getElementById('par_formula_i10');
    const i10Val = document.getElementById('par_val_i10');

    if (avgGpEl) {
      const gpRes = ParCalc.calcAverageGradePoint(r.academicActivities.courses111);
      avgGpEl.textContent = gpRes.formatted;
    }
    if (avgFbEl) {
      const fbRes = ParCalc.calcAverageFeedback(r.academicActivities.feedback112);
      avgFbEl.textContent = fbRes.formatted;
    }
    if (i11Formula) i11Formula.textContent = `(0.7 × ${r.academicActivities.index111}) + (0.3 × ${r.academicActivities.index112}) = ${r.academicActivities.index11}`;
    if (i11Val) i11Val.textContent = r.academicActivities.index11;
    if (i10Formula) i10Formula.textContent = r.academicActivities.breakdownText;
    if (i10Val) i10Val.textContent = r.academicActivities.index10;

    // Update Step 3 live fields if visible
    const i20Formula = document.getElementById('par_formula_i20');
    const i20Val = document.getElementById('par_val_i20');
    if (i20Formula) i20Formula.textContent = r.researchActivities.breakdownText;
    if (i20Val) i20Val.textContent = r.researchActivities.index20;

    // Update Step 6 live FPI fields if visible
    const heroScore = document.getElementById('par_hero_fpi_score');
    const heroFormula = document.getElementById('par_hero_fpi_formula');
    const wtValidation = document.getElementById('par_weight_validation_msg');

    if (heroScore) heroScore.textContent = r.fpiComputation.formattedFpi;
    if (heroFormula) heroFormula.textContent = r.fpiComputation.formulaText;

    if (wtValidation && r.fpiComputation.weights) {
      const val = ParCalc.validateWeights(r.fpiComputation.weights);
      if (val.valid) {
        wtValidation.textContent = '✓ Weights sum to 1.00';
        wtValidation.style.color = 'var(--par-success)';
      } else {
        wtValidation.textContent = `⚠️ Error: ${val.error}`;
        wtValidation.style.color = 'var(--par-danger)';
      }
    }
  }

  function attachEditorFieldListeners() {
    // Show/hide rejection reason on HOD radio change
    const radios = document.querySelectorAll('input[name="par_hod_verify_radio"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const rejectionBox = document.getElementById('par_hod_rejection_reason_box');
        if (rejectionBox) {
          rejectionBox.style.display = e.target.value === 'No' ? 'block' : 'none';
        }
      });
    });
  }

  function onDesignationChange(designation) {
    const r = state.currentReport;
    if (!r) return;
    r.facultyInfo.designation = designation;
    const wtConfig = ParStorage.getWeightConfigByDesignation(designation);
    r.fpiComputation.weightConfigId = wtConfig.id;
    r.fpiComputation.weights = {
      w10: wtConfig.w10,
      w20: wtConfig.w20,
      w30: wtConfig.w30,
      w40: wtConfig.w40
    };
    ParStorage.recalculateReport(r);
    renderEditor();
  }

  // =========================================================================
  // SAVE, SUBMIT & HOD WORKFLOW
  // =========================================================================

  function saveDraft() {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    ParStorage.recalculateReport(r);
    ParStorage.saveReport(r);
    showNotification('Draft saved successfully!');
    renderDashboard();
  }

  function submitForVerification() {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    // Validation
    if (!r.facultyInfo.name || !r.facultyInfo.name.trim()) {
      alert('Please enter the Faculty Name in Step 1 before submitting.');
      setStep(1);
      return;
    }
    if (!r.declaration.confirmed) {
      alert('Please confirm the faculty declaration checkbox in Step 7 before submitting.');
      setStep(7);
      return;
    }

    ParStorage.recalculateReport(r);
    const targetStatus = r.status === 'Returned for Correction' ? 'Resubmitted' : 'Submitted for Verification';

    const res = ParStorage.transitionStatus(r.id, targetStatus, {
      action: 'Submitted by Faculty',
      by: r.facultyInfo.name || 'Faculty Member',
      remarks: 'Self-appraisal submitted for HOD verification'
    });

    if (res.success) {
      state.currentReport = res.report;
      showNotification(`Appraisal report submitted for HOD verification! Status: ${targetStatus}`);
      switchView('dashboard');
    } else {
      alert(res.error || 'Failed to submit report');
    }
  }

  function executeHodApproval() {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    if (!r.hodVerification.verified) {
      alert('Please select "YES" or "NO" in Section 7.0 Verification of Information.');
      return;
    }

    if (r.hodVerification.verified !== 'Yes') {
      alert('To approve this report, select YES. If corrections are needed, use "Return for Correction".');
      return;
    }

    ParStorage.recalculateReport(r);
    const res = ParStorage.transitionStatus(r.id, 'Verified', {
      action: 'Verified & Approved by HOD',
      by: r.hodVerification.hodName || 'Head of Department',
      remarks: r.hodVerification.remarks || 'Approved and verified'
    });

    if (res.success) {
      state.currentReport = res.report;
      showNotification('Appraisal successfully verified and approved by HOD!');
      renderEditor();
    }
  }

  function executeHodReturnForCorrection() {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    const reason = r.hodVerification.rejectionReason;
    if (!reason || !reason.trim()) {
      alert('Please provide a mandatory Reason for Return in the text box so the faculty member knows what to correct.');
      const el = document.getElementById('par_hod_rejection_reason');
      if (el) el.focus();
      return;
    }

    r.hodVerification.verified = 'No';
    ParStorage.recalculateReport(r);

    const res = ParStorage.transitionStatus(r.id, 'Returned for Correction', {
      action: 'Returned for Correction by HOD',
      by: r.hodVerification.hodName || 'Head of Department',
      remarks: reason
    });

    if (res.success) {
      state.currentReport = res.report;
      showNotification('Report returned to faculty member for correction.');
      renderEditor();
    }
  }

  // =========================================================================
  // EVIDENCE FILE MANAGEMENT
  // =========================================================================

  function renderEvidenceControl(tableType, rowIdx, evidenceName, evidenceId) {
    if (evidenceName) {
      return `
        <span class="par-evidence-tag">
          <span title="${escapeHtml(evidenceName)}">📎 ${escapeHtml(truncate(evidenceName, 12))}</span>
          <span class="par-del-ev" onclick="ParApp.removeEvidence('${tableType}', ${rowIdx})">✕</span>
        </span>
      `;
    }
    return `
      <label class="par-btn par-btn-sm par-btn-secondary" style="cursor:pointer; padding:3px 6px; font-size:11.5px;">
        📎 Attach
        <input type="file" style="display:none;" onchange="ParApp.onEvidenceUpload(event, '${tableType}', ${rowIdx})">
      </label>
    `;
  }

  async function onEvidenceUpload(event, tableType, rowIdx) {
    const file = event.target.files[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const fileId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const fileData = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      uploadedAt: new Date().toISOString()
    };

    // Save to IndexedDB
    try {
      await ParStorage.saveEvidenceFile(fileData);
    } catch (e) {
      console.warn('Could not store full binary in IndexedDB:', e);
    }

    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    // Update target item
    const targetItem = getTargetRowItem(r, tableType, rowIdx);
    if (targetItem) {
      targetItem.evidenceId = fileId;
      targetItem.evidenceName = file.name;
    }

    renderEditor();
    showNotification(`Attached evidence: ${file.name}`);
  }

  function removeEvidence(tableType, rowIdx) {
    harvestEditorInputs();
    const r = state.currentReport;
    if (!r) return;

    const targetItem = getTargetRowItem(r, tableType, rowIdx);
    if (targetItem) {
      targetItem.evidenceId = null;
      targetItem.evidenceName = '';
    }

    renderEditor();
    showNotification('Evidence attachment removed.');
  }

  function getTargetRowItem(report, tableType, rowIdx) {
    if (tableType === 'related12') return report.academicActivities.relatedDev12[rowIdx];
    if (tableType === 'cont13') return report.academicActivities.continuingEd13[rowIdx];
    if (tableType === 'spon22') return report.researchActivities.sponsored22[rowIdx];
    if (tableType === 'pub23') return report.researchActivities.publications23[rowIdx];
    if (tableType === 'pat24') return report.researchActivities.patents24[rowIdx];
    if (tableType === 'sem25') return report.researchActivities.sponsoredSeminars25[rowIdx];
    if (tableType === 'ext30') return report.extensionActivities.activities30[rowIdx];
    if (tableType === 'adm40') return report.adminActivities.activities40[rowIdx];
    return null;
  }

  // =========================================================================
  // OFFICIAL PRINTABLE REPORT FORMAT (7 Pages Exact Reproduction)
  // =========================================================================

  function printReport(reportId) {
    const report = ParStorage.getReportById(reportId);
    if (!report) {
      alert('Report not found');
      return;
    }

    ParStorage.recalculateReport(report);
    renderPrintableDocument(report);
    switchView('printable');
  }

  function renderPrintableDocument(r) {
    const printContainer = document.getElementById('par-printable-content');
    if (!printContainer) return;

    const ac = r.academicActivities || {};
    const res = r.researchActivities || {};
    const ext = r.extensionActivities || {};
    const adm = r.adminActivities || {};
    const fpi = r.fpiComputation || {};
    const wt = fpi.weights || { w10: 0.60, w20: 0.15, w30: 0.15, w40: 0.10 };

    // Format all numbers cleanly
    const i111Display = ac.avgGradePointOverride !== null && ac.avgGradePointOverride !== undefined ? ac.avgGradePointOverride : ac.index111;
    const i112Display = ac.avgFeedbackOverride !== null && ac.avgFeedbackOverride !== undefined ? ac.avgFeedbackOverride : ac.index112;

    printContainer.innerHTML = `
      <div class="no-print" style="text-align:center; padding:16px 0; background:#fff; border-bottom:1px solid #cbd5e0; margin-bottom:20px; position:sticky; top:60px; z-index:999;">
        <button class="par-btn par-btn-primary" onclick="window.print()">🖨️ Print Document / Save as PDF</button>
        <button class="par-btn par-btn-secondary" onclick="ParApp.switchView('dashboard')">← Return to Dashboard</button>
        <button class="par-btn par-btn-secondary" onclick="ParApp.editReport('${r.id}')">✏️ Edit Report</button>
      </div>

      <div class="par-paper-document">
        <!-- ================= PAGE 1 ================= -->
        <div class="par-paper-page">
          <div class="par-inst-header">
            <div class="par-inst-name">MANAKULA VINAYAGAR INSTITUTE OF TECHNOLOGY</div>
            <div class="par-inst-sub">An Autonomous Institution</div>
            <div class="par-inst-affil">Affiliated to Pondicherry University, Approved by AICTE, New Delhi, Accredited by NAAC with 'A' Grade</div>
            <div class="par-inst-loc">Kalitheerthalkuppam, Puducherry - 605 107.</div>
            <div class="par-doc-title">PERFORMANCE APPRAISAL REPORT FOR THE FACULTY MEMBERS</div>
            <div class="par-doc-ay">ACADEMIC YEAR: ${escapeHtml(r.academicYear || '2024-25')}</div>
          </div>

          <div style="font-weight:bold; font-size:13pt; text-align:center; margin:14px 0 16px 0;">PART A: SELF APPRAISAL</div>

          <table style="width:100%; border:none; margin-bottom:16px; font-size:11pt; border-collapse:collapse;">
            <tr>
              <td style="border:none; width:260px; padding:4px 0;"><strong>Name</strong></td>
              <td style="border:none; padding:4px 0;">: &nbsp;<strong>${escapeHtml(r.facultyInfo.name || '—')}</strong></td>
            </tr>
            <tr>
              <td style="border:none; padding:4px 0;"><strong>Designation</strong></td>
              <td style="border:none; padding:4px 0;">: &nbsp;<strong>${escapeHtml(r.facultyInfo.designation || '—')}</strong></td>
            </tr>
            <tr>
              <td style="border:none; padding:4px 0;"><strong>Scale of pay / Present pay</strong></td>
              <td style="border:none; padding:4px 0;">: &nbsp;${escapeHtml(r.facultyInfo.scaleOfPay || '—')}</td>
            </tr>
            <tr>
              <td style="border:none; padding:4px 0;"><strong>Date of appointment to the present post</strong></td>
              <td style="border:none; padding:4px 0;">: &nbsp;${escapeHtml(r.facultyInfo.dateOfAppointment || '—')}</td>
            </tr>
          </table>

          <div style="font-size:10pt; line-height:1.45; margin-bottom:14px; font-style:italic;">
            <strong>Note:</strong><br>
            1. Before filling up read the “Guidelines for Annual Performance Assessment of the faculty members” available with your Dept. HoD in-charges.<br>
            2. Provide all relevant information to support your claim for your achievements and contributions / Faculty Target achievements report. Enclose also copies of documents in support of the claim for points.<br>
            3. Please submit the report on or before ${escapeHtml(r.submissionDeadline || '10th OCT 2024')}.
          </div>

          <div style="font-weight:bold; font-size:11pt; margin-top:14px;">ACTIVITIES AND CONTRIBUTIONS MADE:</div>
          <div class="par-paper-sec-head">1.0 &nbsp;ACADEMIC ACTIVITIES (I <sub>1.0</sub>)</div>
          <div style="font-weight:bold; font-size:11pt; margin:6px 0;">1.1 &nbsp;Teaching (I <sub>1.1</sub>)</div>
          <div style="font-weight:bold; font-size:10.5pt; margin:4px 0;">1.1.1 Semester Results of Students in Theory Course (I <sub>1.1.1</sub>)</div>

          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:40px;">Sl. No.</th>
                <th style="width:60px;">U.G./ P.G</th>
                <th colspan="2">Theory Courses Taught</th>
                <th style="width:90px;">Result % pass</th>
                <th style="width:70px;">Grade Point (pp)</th>
              </tr>
              <tr>
                <th></th>
                <th></th>
                <th style="width:90px;">Code</th>
                <th>Title</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${(ac.courses111 || []).map((c, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td class="center">${escapeHtml(c.ugPg || 'UG')}</td>
                  <td class="center">${escapeHtml(c.code || '')}</td>
                  <td>${escapeHtml(c.title || '')}</td>
                  <td class="center">${escapeHtml(c.passPercent || '')}</td>
                  <td class="center">${c.gradePoint !== undefined ? c.gradePoint : ''}</td>
                </tr>
              `).join('')}
              <tr style="font-weight:bold; background:#fafafa;">
                <td colspan="5" class="right">Average Grade Point</td>
                <td class="center">${i111Display}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-weight:bold; font-size:10.5pt; margin:10px 0 4px 0;">1.1.2 &nbsp;Students Feedback in Theory Course (I <sub>1.1.2</sub>)</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:40px;">Sl. No.</th>
                <th style="width:60px;">U.G./ P.G</th>
                <th style="width:90px;">Code</th>
                <th>Title</th>
                <th style="width:90px;">Feedback Score</th>
              </tr>
            </thead>
            <tbody>
              ${(ac.feedback112 || []).map((f, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td class="center">${escapeHtml(f.ugPg || 'UG')}</td>
                  <td class="center">${escapeHtml(f.code || '')}</td>
                  <td>${escapeHtml(f.title || '')}</td>
                  <td class="center">${f.feedbackScore !== undefined ? f.feedbackScore : ''}</td>
                </tr>
              `).join('')}
              <tr style="font-weight:bold; background:#fafafa;">
                <td colspan="4" class="right">Average Grade Point</td>
                <td class="center">${i112Display}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ================= PAGE 2 ================= -->
        <div class="par-paper-page">
          <div class="par-formula-display" style="border:1px solid #000; padding:10px 14px; margin-bottom:16px;">
            <div><strong>I <sub>1.1</sub> = (0.7 * I <sub>1.1.1</sub>) + (0.3 * I <sub>1.1.2</sub>)</strong></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {0.7 * ${i111Display}} + {0.3 * ${i112Display}}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${(0.7 * Number(i111Display)).toFixed(2)} + ${(0.3 * Number(i112Display)).toFixed(2)}</div>
            <div style="font-weight:bold; margin-top:4px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${ac.index11}</div>
          </div>

          <div class="par-paper-sec-head">1.2 &nbsp;Related Development Activities (I <sub>1.2</sub>)</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">Sl.No.</th>
                <th>Details of the Activity / Contribution</th>
                <th style="width:90px;">Assigned Points</th>
              </tr>
            </thead>
            <tbody>
              ${(ac.relatedDev12 || []).map((d, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>
                    <strong>${escapeHtml(d.name || '')}</strong>: ${escapeHtml(d.description || '')}
                    ${d.date ? `<div style="font-size:9.5pt; color:#444;">Period: ${escapeHtml(d.date)}</div>` : ''}
                    ${d.evidenceName ? `<div style="font-size:9pt; font-style:italic;">[Evidence: ${escapeHtml(d.evidenceName)}]</div>` : ''}
                  </td>
                  <td class="center">${d.points || '—'}</td>
                </tr>
              `).join('')}
              <tr style="font-weight:bold; background:#fafafa;">
                <td colspan="2" class="right">Total points</td>
                <td class="center">${ac.assignedPoints12 || 5}</td>
              </tr>
            </tbody>
          </table>
          <div style="font-size:9.5pt; font-style:italic;">* If you have more activities, use a separate sheet and annex the same.</div>
          <div style="font-weight:bold; font-size:12pt; text-align:right; margin:10px 0;">I <sub>1.2</sub> = ${ac.assignedPoints12 || 5}</div>
        </div>

        <!-- ================= PAGE 3 ================= -->
        <div class="par-paper-page">
          <div class="par-paper-sec-head">1.3 &nbsp;Continuing Education (I <sub>1.3</sub>)</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">Sl.No.</th>
                <th>Details of the Continuing Education</th>
                <th style="width:90px;">Assigned Points</th>
              </tr>
            </thead>
            <tbody>
              ${(ac.continuingEd13 || []).map((c, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>
                    <strong>${escapeHtml(c.name || '')}</strong>: ${escapeHtml(c.description || '')}
                    ${c.date ? `<div style="font-size:9.5pt; color:#444;">Period: ${escapeHtml(c.date)} | Status: ${escapeHtml(c.status || 'Completed')}</div>` : ''}
                    ${c.evidenceName ? `<div style="font-size:9pt; font-style:italic;">[Evidence: ${escapeHtml(c.evidenceName)}]</div>` : ''}
                  </td>
                  <td class="center">${c.points || '—'}</td>
                </tr>
              `).join('')}
              <tr style="font-weight:bold; background:#fafafa;">
                <td colspan="2" class="right">Total points</td>
                <td class="center">${ac.assignedPoints13 || 5}</td>
              </tr>
            </tbody>
          </table>
          <div style="font-weight:bold; font-size:12pt; text-align:right; margin:10px 0;">I <sub>1.3</sub> = ${ac.assignedPoints13 || 5}</div>
        </div>

        <!-- ================= PAGE 4 ================= -->
        <div class="par-paper-page">
          <div class="par-formula-display" style="border:1px solid #000; padding:10px 14px; margin-bottom:16px;">
            <div><strong>I <sub>1.0</sub> = (0.5 * I <sub>1.1</sub>) + (0.3 * I <sub>1.2</sub>) + (0.2 * I <sub>1.3</sub>)</strong></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = (0.5 × ${ac.index11}) + (0.3 × ${ac.assignedPoints12 || 5}) + (0.2 × ${ac.assignedPoints13 || 5})</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${(0.5 * Number(ac.index11)).toFixed(2)} + ${(0.3 * Number(ac.assignedPoints12 || 5)).toFixed(2)} + ${(0.2 * Number(ac.assignedPoints13 || 5)).toFixed(2)}</div>
            <div style="font-weight:bold; margin-top:4px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${ac.index10}</div>
          </div>

          <div class="par-paper-sec-head">2.0 &nbsp;RESEARCH (I <sub>2.0</sub>)</div>
          <div style="font-weight:bold; font-size:10.5pt; margin:6px 0;">2.1. Project Guidance:</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">Sl.No.</th>
                <th style="width:60px;">UG/PG</th>
                <th>Name of the Project guided</th>
                <th style="width:160px;">Other details</th>
              </tr>
            </thead>
            <tbody>
              ${(res.projects21 || []).map((p, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td class="center">${escapeHtml(p.ugPg || 'UG')}</td>
                  <td>${escapeHtml(p.title || '')}</td>
                  <td>${escapeHtml(p.otherDetails || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; font-weight:bold; margin:6px 0 16px 0;">
            <span>Projects Guided: ${(res.projects21 || []).length}</span>
            <span>I <sub>2.1</sub> = ${res.points21 || 1}</span>
          </div>

          <div style="font-weight:bold; font-size:10.5pt; margin:10px 0 4px 0;">2.2. Sponsored Research / Programmes</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">Sl.No.</th>
                <th>Details of Sponsored Project / Programmes</th>
                <th style="width:160px;">Status (Submitted/Sanctioned)</th>
              </tr>
            </thead>
            <tbody>
              ${(res.sponsored22 || []).length === 0 ? `
                <tr><td colspan="3" class="center">Nil</td></tr>
              ` : (res.sponsored22 || []).map((s, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>${escapeHtml(s.title || '')}</td>
                  <td class="center">${escapeHtml(s.status || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-weight:bold; text-align:right; margin-bottom:14px;">I <sub>2.2</sub> = ${res.points22 || 0}</div>

          <div style="font-weight:bold; font-size:10.5pt; margin:10px 0 4px 0;">2.3. Publication of Research Papers / International certification</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">Sl.No.</th>
                <th>Details</th>
                <th style="width:160px;">Status / Score obtained</th>
              </tr>
            </thead>
            <tbody>
              ${(res.publications23 || []).map((p, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>
                    <strong>${escapeHtml(p.title || '')}</strong><br>
                    ${escapeHtml(p.publicationDetails || '')}
                  </td>
                  <td class="center">${escapeHtml(p.status || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-weight:bold; text-align:right; margin-bottom:14px;">I <sub>2.3</sub> = ${res.points23 || 3}</div>
        </div>

        <!-- ================= PAGE 5 ================= -->
        <div class="par-paper-page">
          <div style="font-weight:bold; font-size:10.5pt; margin:6px 0;">2.4. Innovative Products developed, Patents granted, Published, filed</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">Sl.No.</th>
                <th>Details of Products, Patents</th>
                <th style="width:160px;">Status (Filed, Published, Granted)</th>
              </tr>
            </thead>
            <tbody>
              ${(res.patents24 || []).map((pt, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>${escapeHtml(pt.title || '')}</td>
                  <td class="center">${escapeHtml(pt.status || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-weight:bold; text-align:right; margin-bottom:16px;">I <sub>2.4</sub> = ${res.points24 || 2}</div>

          <div style="font-weight:bold; font-size:10.5pt; margin:10px 0 4px 0;">2.5. Sponsored seminars / FDPs / other Programmes</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">Sl.No.</th>
                <th>Details of Sponsored Programmes</th>
                <th style="width:160px;">Status (Submitted/Sanctioned)</th>
              </tr>
            </thead>
            <tbody>
              ${(res.sponsoredSeminars25 || []).map((sm, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>${escapeHtml(sm.title || '')}</td>
                  <td class="center">${escapeHtml(sm.status || '')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-weight:bold; text-align:right; margin-bottom:20px;">I <sub>2.5</sub> = ${res.points25 || 2}</div>

          <div class="par-formula-display" style="border:1px solid #000; padding:10px 14px; margin-top:20px;">
            <div><strong>I <sub>2.0</sub> (Engg. Faculty) = (0.1 * I <sub>2.1</sub>) + (0.2 * I <sub>2.2</sub>) + (0.3 * I <sub>2.3</sub>) + (0.2 * I <sub>2.4</sub>) + (0.2 * I <sub>2.5</sub>)</strong></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = (0.1 × ${res.points21 || 1}) + (0.2 × ${res.points22 || 0}) + (0.3 × ${res.points23 || 3}) + (0.2 × ${res.points24 || 2}) + (0.2 × ${res.points25 || 2})</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${(0.1 * (res.points21 || 1)).toFixed(2)} + ${(0.2 * (res.points22 || 0)).toFixed(2)} + ${(0.3 * (res.points23 || 3)).toFixed(2)} + ${(0.2 * (res.points24 || 2)).toFixed(2)} + ${(0.2 * (res.points25 || 2)).toFixed(2)}</div>
            <div style="font-weight:bold; margin-top:4px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${res.index20}</div>
          </div>
        </div>

        <!-- ================= PAGE 6 ================= -->
        <div class="par-paper-page">
          <div class="par-paper-sec-head">3.0 &nbsp;EXTENSION (I <sub>3.0</sub>)</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">S.No.</th>
                <th>Details of the Activity / Contribution</th>
              </tr>
            </thead>
            <tbody>
              ${(ext.activities30 || []).map((a, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>
                    <strong>${escapeHtml(a.name || '')}</strong>: ${escapeHtml(a.description || '')}
                    ${a.contribution ? `— <em>${escapeHtml(a.contribution)}</em>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-weight:bold; font-size:12pt; text-align:right; margin-bottom:24px;">I <sub>3.0</sub> = ${ext.index30 || 5}</div>

          <div class="par-paper-sec-head">4.0 &nbsp;ADMINISTRATION (I <sub>4.0</sub>)</div>
          <table class="par-paper-table">
            <thead>
              <tr>
                <th style="width:45px;">S.No.</th>
                <th>Details of the Administrative Activity / Contribution</th>
              </tr>
            </thead>
            <tbody>
              ${(adm.activities40 || []).map((ad, i) => `
                <tr>
                  <td class="center">${i + 1}.</td>
                  <td>
                    <strong>${escapeHtml(ad.role || '')}</strong>: ${escapeHtml(ad.description || '')}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="font-weight:bold; font-size:12pt; text-align:right; margin-bottom:24px;">I <sub>4.0</sub> = ${adm.index40 || 5}</div>

          <div class="par-paper-sec-head">5.0 &nbsp;COMPUTATION OF FACULTY PERFORMANCE INDEX : (FPI)</div>
          <div class="par-formula-display" style="border:1.5px solid #000; padding:12px 16px; margin:14px 0;">
            <div><strong>FPI = (W<sub>1.0</sub> * I<sub>1.0</sub>) + (W<sub>2.0</sub> * I<sub>2.0</sub>) + (W<sub>3.0</sub> * I<sub>3.0</sub>) + (W<sub>4.0</sub> * I<sub>4.0</sub>)</strong></div>
            <div style="margin-top:4px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = (${wt.w10.toFixed(2)} × ${ac.index10}) + (${wt.w20.toFixed(2)} × ${res.index20}) + (${wt.w30.toFixed(2)} × ${ext.index30 || 5}) + (${wt.w40.toFixed(2)} × ${adm.index40 || 5})</div>
            <div style="margin-top:4px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${(wt.w10 * ac.index10).toFixed(3)} + ${(wt.w20 * res.index20).toFixed(3)} + ${(wt.w30 * (ext.index30 || 5)).toFixed(3)} + ${(wt.w40 * (adm.index40 || 5)).toFixed(3)}</div>
            <div style="font-size:14pt; font-weight:bold; margin-top:8px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = ${fpi.formattedFpi || '0.000'}</div>
          </div>
        </div>

        <!-- ================= PAGE 7 ================= -->
        <div class="par-paper-page">
          <div style="font-size:10.5pt; font-style:italic; margin-bottom:20px;">
            Note : Refer “Guidelines” and choose the weights corresponding to your Designation
          </div>

          <div class="par-paper-sec-head">6.0. &nbsp;ADDITIONAL INFORMATION NOT COVERED ABOVE, IF ANY:</div>
          <div style="min-height:80px; border-bottom:1px solid #777; padding:6px 0; margin-bottom:30px; font-size:11pt;">
            ${r.additionalInfo ? escapeHtml(r.additionalInfo) : '<span style="color:#777; font-style:italic;">None reported</span>'}
          </div>

          <div class="par-sig-grid" style="margin-bottom:40px;">
            <div>Date : <strong>${escapeHtml(r.declaration.date || '18.11.2025')}</strong></div>
            <div style="text-align:right;">
              <div>____________________________________</div>
              <div>Signature of the Faculty Member</div>
              <div>(<strong>${escapeHtml(r.declaration.signatureName || r.facultyInfo.name || '')}</strong>)</div>
            </div>
          </div>

          <div style="font-weight:bold; font-size:13pt; text-align:center; margin:30px 0 16px 0; border-top:1.5px solid #000; padding-top:16px;">
            PART B – REMARKS OF HEAD OF THE DEPARTMENT
          </div>

          <div style="font-weight:bold; font-size:11pt; margin-bottom:8px;">7.0 &nbsp;VERIFICATION OF INFORMATION:</div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div style="flex:1; padding-right:20px; font-size:11pt; line-height:1.4;">
              Verified the information provided in Part – A including the copies of the documents and found them correct to the best of my knowledge. The FPI computed also is correct.
            </div>
            <div style="display:flex; gap:20px; font-weight:bold; font-size:12pt; white-space:nowrap;">
              <span>Yes &nbsp;[ ${r.hodVerification.verified === 'Yes' ? '✔' : ' '} ]</span>
              <span>No &nbsp;[ ${r.hodVerification.verified === 'No' ? '✔' : ' '} ]</span>
            </div>
          </div>
          <div style="font-size:9.5pt; font-style:italic; margin-bottom:20px;">
            Note : If you have ticked the box “NO”, enclose another form with recomputed FPI.
          </div>

          <div class="par-paper-sec-head">8.0 &nbsp;OTHER REMARKS, IF ANY:</div>
          <div style="min-height:70px; border-bottom:1px solid #777; padding:6px 0; margin-bottom:40px; font-size:11pt;">
            ${r.hodVerification.remarks ? escapeHtml(r.hodVerification.remarks) : '<span style="color:#777; font-style:italic;">Verified and recommended.</span>'}
          </div>

          <div class="par-sig-grid">
            <div>Date : <strong>${escapeHtml(r.hodVerification.verificationDate || '18.11.2025')}</strong></div>
            <div style="text-align:right;">
              <div>____________________________________</div>
              <div>Signature and Name of the HOD</div>
              <div>(<strong>${escapeHtml(r.hodVerification.hodName || 'Dr. Head of Department')}</strong>)</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // DESIGNATION WEIGHTS MANAGEMENT MODAL (ADMIN)
  // =========================================================================

  function openWeightsManagerModal() {
    const modalEl = document.getElementById('par-modal-container');
    if (!modalEl) return;

    const configs = ParStorage.getWeightConfigs();

    modalEl.innerHTML = `
      <div class="par-modal-overlay" onclick="if(event.target === this) ParApp.closeModal()">
        <div class="par-modal">
          <div class="par-modal-header">
            <h3>⚙️ Designation Weights Configuration</h3>
            <button class="par-modal-close" onclick="ParApp.closeModal()">✕</button>
          </div>

          <div class="par-alert par-alert-info">
            Administrators can define and maintain official FPI weights for each designation.
            Rule: <code>W1.0 + W2.0 + W3.0 + W4.0 = 1.00</code>.
          </div>

          <table class="par-data-table" style="margin-bottom:16px;">
            <thead>
              <tr>
                <th>Designation</th>
                <th>W 1.0 (Acad)</th>
                <th>W 2.0 (Res)</th>
                <th>W 3.0 (Ext)</th>
                <th>W 4.0 (Adm)</th>
                <th>Sum</th>
              </tr>
            </thead>
            <tbody>
              ${configs.map(c => `
                <tr>
                  <td><strong>${escapeHtml(c.designation)}</strong></td>
                  <td>${c.w10}</td>
                  <td>${c.w20}</td>
                  <td>${c.w30}</td>
                  <td>${c.w40}</td>
                  <td><span class="par-badge par-badge-verified">1.00</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="border-top:1px solid #e2e8f0; padding-top:14px;">
            <h4 style="margin-bottom:8px; color:var(--par-primary);">Update / Add Weight Configuration</h4>
            <div class="par-form-grid">
              <div class="par-form-group">
                <label for="par_modal_desig">Designation</label>
                <input type="text" id="par_modal_desig" class="par-input" placeholder="e.g. SENIOR PROFESSOR">
              </div>
              <div class="par-form-group">
                <label for="par_modal_w10">W 1.0 (Academic)</label>
                <input type="number" step="0.01" id="par_modal_w10" class="par-input" value="0.50">
              </div>
              <div class="par-form-group">
                <label for="par_modal_w20">W 2.0 (Research)</label>
                <input type="number" step="0.01" id="par_modal_w20" class="par-input" value="0.20">
              </div>
              <div class="par-form-group">
                <label for="par_modal_w30">W 3.0 (Extension)</label>
                <input type="number" step="0.01" id="par_modal_w30" class="par-input" value="0.15">
              </div>
              <div class="par-form-group">
                <label for="par_modal_w40">W 4.0 (Administration)</label>
                <input type="number" step="0.01" id="par_modal_w40" class="par-input" value="0.15">
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
              <button class="par-btn par-btn-secondary" onclick="ParApp.closeModal()">Cancel</button>
              <button class="par-btn par-btn-primary" onclick="ParApp.saveWeightConfigFromModal()">Save Preset</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function saveWeightConfigFromModal() {
    const desig = document.getElementById('par_modal_desig').value;
    const w10 = document.getElementById('par_modal_w10').value;
    const w20 = document.getElementById('par_modal_w20').value;
    const w30 = document.getElementById('par_modal_w30').value;
    const w40 = document.getElementById('par_modal_w40').value;

    if (!desig.trim()) {
      alert('Please enter a designation name.');
      return;
    }

    const res = ParStorage.updateWeightConfig({
      designation: desig,
      w10,
      w20,
      w30,
      w40
    });

    if (res.success) {
      closeModal();
      showNotification(`Weights configuration for ${desig} saved successfully!`);
    } else {
      alert(res.error || 'Failed to save weights');
    }
  }

  function closeModal() {
    const modalEl = document.getElementById('par-modal-container');
    if (modalEl) modalEl.innerHTML = '';
  }

  // =========================================================================
  // UTILITIES
  // =========================================================================

  function showNotification(msg) {
    let notif = document.getElementById('par-toast-notif');
    if (!notif) {
      notif = document.createElement('div');
      notif.id = 'par-toast-notif';
      notif.style.cssText = 'position:fixed; bottom:24px; left:24px; background:#102a43; color:#fff; padding:12px 20px; border-radius:6px; font-size:13.5px; font-weight:600; box-shadow:0 4px 16px rgba(0,0,0,0.3); z-index:99999; transition:opacity 0.25s ease; opacity:0; pointer-events:none; font-family:var(--par-font-sans); border-left:4px solid #63b3ed;';
      document.body.appendChild(notif);
    }
    notif.textContent = msg;
    notif.style.opacity = '1';
    setTimeout(() => { notif.style.opacity = '0'; }, 3000);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function truncate(str, maxLen) {
    if (!str || str.length <= maxLen) return str;
    return str.substr(0, maxLen - 3) + '...';
  }

  // Filter Event Handlers
  function onFilterChange() {
    const yearSelect = document.getElementById('par-filter-year');
    const statusSelect = document.getElementById('par-filter-status');
    const searchInput = document.getElementById('par-filter-search');

    if (yearSelect) state.filters.year = yearSelect.value;
    if (statusSelect) state.filters.status = statusSelect.value;
    if (searchInput) state.filters.search = searchInput.value;

    renderDashboard();
  }

  return {
    init,
    switchView,
    renderDashboard,
    createNewReport,
    loadSampleReport,
    editReport,
    viewReport,
    openHodVerification,
    deleteReportPrompt,
    setStep,
    addRow,
    removeRow,
    recalculateLive,
    onDesignationChange,
    saveDraft,
    submitForVerification,
    executeHodApproval,
    executeHodReturnForCorrection,
    onEvidenceUpload,
    removeEvidence,
    printReport,
    openWeightsManagerModal,
    saveWeightConfigFromModal,
    closeModal,
    onFilterChange
  };
});
