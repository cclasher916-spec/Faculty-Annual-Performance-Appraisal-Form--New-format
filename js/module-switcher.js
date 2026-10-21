/**
 * Global Module Switcher
 * Manages top-level navigation between:
 * 1. Faculty Annual Performance Appraisal Form (FPAS - Existing Module, 700 Marks)
 * 2. Faculty Performance Appraisal Report (PAR - New Module, FPI System)
 * 
 * Preserves full memory, DOM state, and calculations between module toggles.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.AppModuleSwitcher = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MODULE_KEYS = {
    FPAS: 'fpas',
    PAR: 'par',
    TAR: 'tar'
  };

  let activeModule = MODULE_KEYS.PAR; // Default to PAR module or allow URL hash / stored pref

  function initSwitcher() {
    // Check URL hash if specified (e.g. #fpas, #par, or #tar)
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('tar')) {
      activeModule = MODULE_KEYS.TAR;
    } else if (hash.includes('fpas')) {
      activeModule = MODULE_KEYS.FPAS;
    } else {
      activeModule = MODULE_KEYS.PAR;
    }

    applyActiveModule(activeModule);
  }

  function switchTo(moduleKey) {
    activeModule = moduleKey;
    applyActiveModule(moduleKey);
    // Update hash without triggering reload
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, '#' + moduleKey);
    }
  }

  function applyActiveModule(moduleKey) {
    const modules = [
      { key: MODULE_KEYS.FPAS, containerId: 'module-fpas-container', btnId: 'btn-nav-fpas', bodyClass: 'active-module-fpas' },
      { key: MODULE_KEYS.PAR, containerId: 'module-par-container', btnId: 'btn-nav-par', bodyClass: 'active-module-par' },
      { key: MODULE_KEYS.TAR, containerId: 'module-tar-container', btnId: 'btn-nav-tar', bodyClass: 'active-module-tar' }
    ];

    modules.forEach(m => {
      const container = document.getElementById(m.containerId);
      const btn = document.getElementById(m.btnId);
      const isActive = (m.key === moduleKey);

      if (container) {
        container.style.display = isActive ? 'block' : 'none';
      }
      if (btn) {
        if (isActive) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
      if (isActive) {
        document.body.classList.add(m.bodyClass);
      } else {
        document.body.classList.remove(m.bodyClass);
      }
    });

    if (moduleKey === MODULE_KEYS.PAR) {
      if (window.ParApp && typeof window.ParApp.renderDashboard === 'function') {
        window.ParApp.renderDashboard();
      }
    } else if (moduleKey === MODULE_KEYS.TAR) {
      if (window.TarApp && typeof window.TarApp.render === 'function') {
        window.TarApp.render();
      }
    }
  }

  function getActiveModule() {
    return activeModule;
  }

  return {
    MODULE_KEYS,
    initSwitcher,
    switchTo,
    getActiveModule
  };
});
