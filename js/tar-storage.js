/**
 * Faculty Target Achievement Report (TAR) - Data Access Layer & Storage
 * LocalStorage persistence, IndexedDB evidence attachment store,
 * JSON Export/Import validation, and In-Memory fallback for Node.js tests.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory(
      require('./tar-scheme.js'),
      require('./tar-calc.js'),
      require('./tar-sample.js')
    );
  } else if (typeof define === 'function' && define.amd) {
    define(['./tar-scheme.js', './tar-calc.js', './tar-sample.js'], factory);
  } else {
    root.TarStorage = factory(root.TarScheme, root.TarCalc, root.TarSample);
  }
})(typeof self !== 'undefined' ? self : this, function (TarScheme, TarCalc, TarSample) {
  'use strict';

  const STORAGE_KEYS = {
    REPORTS: 'tar_reports_v1',
    ACTIVE_ID: 'tar_active_report_id_v1',
    ROLE: 'tar_active_role_v1'
  };

  const DB_CONFIG = {
    NAME: 'tar_evidence_storage_v1',
    VERSION: 1,
    STORE: 'tar_evidence_files'
  };

  // In-memory fallback if localStorage is unavailable (e.g., in Node.js test runner)
  const memoryStore = {};

  function getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage getItem fallback', e);
    }
    return memoryStore[key] || null;
  }

  function setItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn('localStorage setItem fallback', e);
    }
    memoryStore[key] = value;
  }

  function removeItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn('localStorage removeItem fallback', e);
    }
    delete memoryStore[key];
  }

  // --- IndexedDB for Evidence Files ---
  let dbPromise = null;
  function getDB() {
    if (dbPromise) return dbPromise;
    if (typeof indexedDB === 'undefined') {
      dbPromise = Promise.resolve(null);
      return dbPromise;
    }

    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);
        req.onupgradeneeded = function (e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(DB_CONFIG.STORE)) {
            db.createObjectStore(DB_CONFIG.STORE, { keyPath: 'key' });
          }
        };
        req.onsuccess = function (e) {
          resolve(e.target.result);
        };
        req.onerror = function () {
          console.warn('Failed to open IndexedDB for TAR evidence');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB exception', err);
        resolve(null);
      }
    });
    return dbPromise;
  }

  async function saveEvidenceFile(fileObj) {
    const db = await getDB();
    if (!db) {
      // In-memory or fallback
      return fileObj.key;
    }
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(DB_CONFIG.STORE, 'readwrite');
        const store = tx.objectStore(DB_CONFIG.STORE);
        const req = store.put(fileObj);
        req.onsuccess = () => resolve(fileObj.key);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async function getEvidenceFile(key) {
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(DB_CONFIG.STORE, 'readonly');
        const store = tx.objectStore(DB_CONFIG.STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  async function deleteEvidenceFile(key) {
    const db = await getDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(DB_CONFIG.STORE, 'readwrite');
        const store = tx.objectStore(DB_CONFIG.STORE);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  // --- Report Management ---

  /**
   * Create a blank TAR report
   */
  function createBlankReport(facultyData = {}) {
    const now = new Date().toISOString();
    const id = 'tar_' + Date.now();
    const entries = {};

    // Initialize all 39 parameters with unanswered (claimed: null)
    if (TarScheme && TarScheme.parameters) {
      TarScheme.parameters.forEach(p => {
        entries[String(p.no)] = {
          evidence: '',
          claimed: null,
          files: []
        };
      });
    }

    const report = {
      id: id,
      schemeVersion: (TarScheme && TarScheme.schemeVersion) || '2024-25',
      status: 'Draft',
      faculty: {
        name: facultyData.name || '',
        employeeId: facultyData.employeeId || '',
        designation: facultyData.designation || 'Assistant Professor',
        department: facultyData.department || 'Computer Science and Engineering',
        academicYear: facultyData.academicYear || '2024-25'
      },
      entries: entries,
      signoff: {
        hodRemarks: '',
        hodDate: '',
        principalDate: ''
      },
      audit: [
        { at: now, action: 'created' }
      ],
      createdAt: now,
      updatedAt: now
    };

    return report;
  }

  /**
   * Get all saved reports
   */
  function getAllReports() {
    const raw = getItem(STORAGE_KEYS.REPORTS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse saved TAR reports', e);
      return [];
    }
  }

  /**
   * Get a report by its ID
   */
  function getReportById(id) {
    const list = getAllReports();
    return list.find(r => r.id === id) || null;
  }

  /**
   * Save or update a report
   */
  function saveReport(report) {
    if (!report || !report.id) {
      throw new Error('Invalid report object: id is required');
    }

    report.updatedAt = new Date().toISOString();
    const list = getAllReports();
    const idx = list.findIndex(r => r.id === report.id);

    if (idx >= 0) {
      list[idx] = report;
    } else {
      list.push(report);
    }

    setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    setItem(STORAGE_KEYS.ACTIVE_ID, report.id);
    return report;
  }

  /**
   * Delete a report
   */
  function deleteReport(id) {
    const list = getAllReports().filter(r => r.id !== id);
    setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    const active = getActiveReportId();
    if (active === id) {
      removeItem(STORAGE_KEYS.ACTIVE_ID);
    }
    return true;
  }

  function getActiveReportId() {
    return getItem(STORAGE_KEYS.ACTIVE_ID);
  }

  function setActiveReportId(id) {
    setItem(STORAGE_KEYS.ACTIVE_ID, id);
  }

  /**
   * Load Suganya's sample fixture report
   */
  function loadSampleReport() {
    if (!TarSample) {
      throw new Error('TarSample fixture not loaded');
    }
    const cloned = JSON.parse(JSON.stringify(TarSample));
    cloned.id = 'tar_sample_' + Date.now();
    cloned.updatedAt = new Date().toISOString();
    saveReport(cloned);
    return cloned;
  }

  /**
   * Export report as JSON string
   */
  function exportReportAsJSON(report) {
    if (!report) {
      throw new Error('Report is required for export');
    }
    return JSON.stringify(report, null, 2);
  }

  /**
   * Import and validate a report from a JSON string or parsed object
   */
  function importReportFromJSON(jsonInput) {
    let obj;
    if (typeof jsonInput === 'string') {
      try {
        obj = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error('Invalid JSON format: ' + e.message);
      }
    } else if (typeof jsonInput === 'object' && jsonInput !== null) {
      obj = JSON.parse(JSON.stringify(jsonInput));
    } else {
      throw new Error('Input must be a valid JSON string or object');
    }

    // 1. Validate schemeVersion
    const expectedVersion = (TarScheme && TarScheme.schemeVersion) || '2024-25';
    if (!obj.schemeVersion || obj.schemeVersion !== expectedVersion) {
      throw new Error(`Invalid schemeVersion "${obj.schemeVersion}". Expected "${expectedVersion}".`);
    }

    // 2. Validate entries and claimed marks
    if (!obj.entries || typeof obj.entries !== 'object') {
      throw new Error('Invalid report structure: entries object is missing');
    }

    // Check every claimed mark in entries
    const paramMap = {};
    if (TarScheme && TarScheme.parameters) {
      TarScheme.parameters.forEach(p => {
        paramMap[String(p.no)] = p;
      });
    }

    Object.keys(obj.entries).forEach(key => {
      const entry = obj.entries[key];
      const p = paramMap[key];
      if (p && entry && entry.claimed !== null && entry.claimed !== undefined && entry.claimed !== '') {
        const num = Number(entry.claimed);
        if (isNaN(num)) {
          throw new Error(`Parameter ${key} has non-numeric claimed marks: ${entry.claimed}`);
        }
        if (num < 0) {
          throw new Error(`Parameter ${key} has negative claimed marks: ${num}`);
        }
        if (num > p.max * 1.5) { // Reject absurdly out of range claims on import
          throw new Error(`Parameter ${key} claimed marks (${num}) exceeds maximum allowed range (${p.max})`);
        }
      }
    });

    // Ensure status, faculty, signoff, audit exist
    if (!obj.status) obj.status = 'Draft';
    if (!obj.faculty) obj.faculty = { name: '', employeeId: '', designation: '', department: '', academicYear: expectedVersion };
    if (!obj.signoff) obj.signoff = { hodRemarks: '', hodDate: '', principalDate: '' };
    if (!Array.isArray(obj.audit)) obj.audit = [{ at: new Date().toISOString(), action: 'imported' }];

    // Assign fresh ID if missing or colliding
    if (!obj.id) {
      obj.id = 'tar_' + Date.now();
    }
    obj.updatedAt = new Date().toISOString();

    saveReport(obj);
    return obj;
  }

  return {
    STORAGE_KEYS,
    DB_CONFIG,
    createBlankReport,
    getAllReports,
    getReportById,
    saveReport,
    deleteReport,
    getActiveReportId,
    setActiveReportId,
    loadSampleReport,
    exportReportAsJSON,
    importReportFromJSON,
    saveEvidenceFile,
    getEvidenceFile,
    deleteEvidenceFile
  };
});
