/**
 * Resume Print / PDF Helper
 * Enhances print experience for PDF generation.
 */
(function () {
  'use strict';

  const printBtn = document.querySelector('.btn-primary');

  // Confirms before printing (mobile-friendly)
  if (printBtn) {
    printBtn.addEventListener('click', function (e) {
      if (window.innerWidth < 768 && !confirm('Abrir diálogo de impressão para salvar como PDF?')) {
        e.preventDefault();
        return;
      }
    });
  }

  // Adds PDF-friendly filename when using "Save as PDF"
  // (only works in some browsers)
  if (window.matchMedia) {
    const mq = window.matchMedia('print');
    mq.addListener(function (mql) {
      if (mql.matches) {
        document.title = 'Gladson_Simplicio_CV';
      }
    });
  }

  // Removes hover effects during print
  window.addEventListener('beforeprint', function () {
    document.body.classList.add('is-printing');
  });

  window.addEventListener('afterprint', function () {
    document.body.classList.remove('is-printing');
  });
})();
