# Faculty Performance Appraisal Portal

A unified, institutional web application hosting three distinct Faculty Performance Appraisal systems for **Manakula Vinayagar Institute of Technology**:

1. **Faculty Annual Performance Appraisal Form (FPAS — 700 Marks)** (Base Module)
2. **Faculty Performance Appraisal Report (PAR — FPI System)** (Module 2)
3. **Faculty Target Achievement Report (TAR — 600 Marks)** (Module 3)

---

## 🏛️ System Overview

The application features a seamless top-level module switcher allowing authorized faculty, department heads, and administrators to access all three appraisal frameworks without losing in-memory data, entered values, or calculations.

### Module 1: Faculty Annual Performance Appraisal Form (FPAS)
- **Scoring Framework**: 700 marks total across 8 institutional contribution areas (Academic, Student Centric, Faculty Self Development, R&D, Extension, Department Centric, Institution Centric, and Awards/Achievements).
- **Core Functions**: Real-time score validation, maximum score capping, automatic section tallying (`calcTotals()`), percentage calculation (`calcPct()`), and print-exact paper layout.

### Module 2: Faculty Performance Appraisal Report (PAR)
- **Scoring Framework**: Faculty Performance Index (FPI) based on the official Manakula Vinayagar Institute of Technology multi-part self-appraisal document.
- **Part A: Self Appraisal**:
  - **1.0 Academic Activities (I 1.0)**:
    - 1.1 Teaching: Theory Course Semester Results (`I 1.1.1`) & Student Feedback (`I 1.1.2`).
    - Teaching Index: `I 1.1 = (0.7 × I 1.1.1) + (0.3 × I 1.1.2)`.
    - 1.2 Related Development Activities (`I 1.2`): Blended learning, special lectures, industrial visits, mini-projects, workshops, mentoring.
    - 1.3 Continuing Education (`I 1.3`): NPTEL, certifications, ATAL Academy FDPs, PDPs.
    - Academic Index: `I 1.0 = (0.5 × I 1.1) + (0.3 × I 1.2) + (0.2 × I 1.3)`.
  - **2.0 Research (I 2.0)**:
    - 2.1 Project Guidance (`I 2.1`), 2.2 Sponsored Research (`I 2.2`), 2.3 Publications & Certifications (`I 2.3`), 2.4 Innovative Products & Patents (`I 2.4`), 2.5 Sponsored Seminars (`I 2.5`).
    - Research Index (Engineering Faculty): `I 2.0 = (0.1 × I 2.1) + (0.2 × I 2.2) + (0.3 × I 2.3) + (0.2 × I 2.4) + (0.2 × I 2.5)`.
  - **3.0 Extension Activities (I 3.0)**: Repeatable activities table and rubric-based index.
  - **4.0 Administration (I 4.0)**: Department and institutional responsibilities (Class Advisor, Website Coordinator, QC Feedback Coordinator, BOS Member, NAAC Criteria 5, IIC Member).
  - **5.0 Faculty Performance Index (FPI)**:
    - Formula: `FPI = (W 1.0 × I 1.0) + (W 2.0 × I 2.0) + (W 3.0 × I 3.0) + (W 4.0 × I 4.0)`.
    - Assistant Professor Weights: `W1.0 = 0.60, W2.0 = 0.15, W3.0 = 0.15, W4.0 = 0.10`.
    - Reference validation: `I1.0 = 4.59, I2.0 = 1.80, I3.0 = 5.00, I4.0 = 5.00` yields **FPI = 4.274**.
  - **6.0 Additional Information & Faculty Declaration**: Supporting claims and formal declaration.
- **Part B: Head of Department (HOD) Verification**:
  - Section 7.0 Verification of Information (Yes / No).
  - Section 8.0 HOD Remarks, signature, and date.
  - Approval moves status to `Verified`.
  - Rejection requires mandatory remarks, moving status to `Returned for Correction`.
- **Print & PDF Export**: Exact reproduction of the official 7-page institutional paper format with clean typography, bordered tables, mathematical formula breakdowns, and signature lines.

### Module 3: Faculty Target Achievement Report (TAR — 2024-25)
- **Scoring Framework**: 600 marks total across 6 sections with 39 parameters.
  - Section I. Academic contribution (Params 1–10, Max 150)
  - Section II. Students centric (Params 11–17, Max 100)
  - Section III. Faculty self development (Params 18–21, Max 50)
  - Section IV. Research and development (Params 22–28, Max 100)
  - Section V. Department centric (Params 29–34, Max 100)
  - Section VI. Institution centric (Params 35–39, Max 100)
- **Calculation Rules**:
  - Pure deterministic math engine in `js/tar-calc.js`.
  - Clamping: Claimed marks capped at parameter maximum ($\min(c_p, m_p)$) with live warning.
  - Evidence checks: Flags marks claimed > 0 without evidence or marked as "Nil".
  - Total & Percentage: $T = \sum S_s$, $\text{Percentage} = \frac{T}{600} \times 100$.
  - Reference fixture (P. Suganya): Yields section totals `110, 90, 30, 40, 15, 50 = 335 / 600 (55.83%)`.
- **Key Features**:
  - Sticky live summary bar with grand score box, percentage, answered count, and clickable section jump chips.
  - Collapsible section cards with responsive tables and expanding evidence textareas.
  - LocalStorage report persistence (`tar_reports_v1`) + IndexedDB evidence attachment store (`tar_evidence_storage_v1`).
  - JSON Export & Import with schema validation.
  - Paper A4 print layout with college header, signature lines, and `@media print` rules.

---

## 📁 Project Architecture

```
anual_form/
├── Faculty_Appraisal_Form.html     # Unified portal & FPAS module entry point (synced)
├── index.html                      # Standard web entry point (synced)
├── css/
│   ├── par.css                     # Responsive design system & print styles for PAR
│   └── tar.css                     # Scoped design system & print styles for TAR
├── js/
│   ├── module-switcher.js          # Top navbar & seamless module switcher (FPAS / PAR / TAR)
│   ├── par-calc.js                 # Pure calculation engine for PAR (FPI)
│   ├── par-storage.js              # Persistence (LocalStorage & IndexedDB for PAR)
│   ├── par-app.js                  # PAR dashboard, editor, repeater, and HOD controller
│   ├── tar-scheme.js               # 2024-25 TAR Scheme Definition (39 params, 600 marks)
│   ├── tar-sample.js               # Reference test fixture (P. Suganya, 335 marks, 55.83%)
│   ├── tar-calc.js                 # Pure calculation & validation engine for TAR
│   ├── tar-storage.js              # Persistence (LocalStorage & IndexedDB for TAR)
│   └── tar-app.js                  # TAR reactive form, live recalculations & print controller
├── test/
│   ├── par-test.js                 # Automated PAR test suite (16 tests)
│   └── tar-test.js                 # Automated TAR test suite (11 tests)
└── README.md                       # Documentation
```

---

## 🧪 Automated Testing

Run the built-in Node.js automated test suites:

```bash
# Run both test suites:
node --test test/par-test.js test/tar-test.js
```

### Verified TAR Test Cases:
1. The scheme loads with 6 sections, 39 parameters, and 600 total, and each section parameter maxima add to its stated total.
2. A blank report has all 39 entries unanswered and a total of 0.
3. The sample file gives section totals `110, 90, 30, 40, 15, 50`, grand total `335`, and `55.83%`.
4. A claim above the maximum is clamped, and a negative or non-numeric claim is rejected.
5. `null` (unanswered) and `0` (Nil) are counted differently in the answered count.
6. Evidence warnings fire for marks above 0 with empty or "Nil" evidence, and never block saving.
7. Save, reload, edit and delete round-trip without losing data.
8. Import rejects a file with a wrong schemeVersion or an out-of-range mark.
9. Both HTML entry points contain the TAR container, nav button and script tags, and stay identical.
10. The FPAS 700-mark calculations and all 16 PAR tests still pass (regression).

---

## 🚀 Running the Application

Simply open `index.html` or `Faculty_Appraisal_Form.html` in any modern web browser, or serve locally:

```bash
python -m http.server 8085
```
Then navigate to: `http://localhost:8085/#tar` or click the **🎯 TAR Report (600 Marks)** tab in the top navigation bar.
