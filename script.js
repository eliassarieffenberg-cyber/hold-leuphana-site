document.addEventListener('DOMContentLoaded', () => {
  // Password Protection
  const PASSWORD = 'yallaramallah';
  const passwordModal = document.getElementById('passwordModal');
  const mainContent = document.getElementById('mainContent');
  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
  const passwordError = document.getElementById('passwordError');

  // Check if password was already entered in this session
  const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
  
  if (isAuthenticated) {
    // Hide password modal and show content
    passwordModal.classList.add('hidden');
    mainContent.classList.remove('hidden');
  } else {
    // Show password modal and hide content
    passwordModal.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }

  // Handle password submission
  const handlePasswordSubmit = () => {
    const enteredPassword = passwordInput.value;
    if (enteredPassword === PASSWORD) {
      sessionStorage.setItem('authenticated', 'true');
      passwordModal.classList.add('hidden');
      mainContent.classList.remove('hidden');
      passwordError.classList.remove('show');
    } else {
      passwordError.textContent = 'Incorrect password. Please try again.';
      passwordError.classList.add('show');
      passwordInput.value = '';
      passwordInput.focus();
    }
  };

  passwordSubmitBtn.addEventListener('click', handlePasswordSubmit);
  
  // Allow Enter key to submit
  passwordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handlePasswordSubmit();
    }
  });

  // Focus on password input when modal loads
  if (!isAuthenticated) {
    passwordInput.focus();
  }

  const menuButton = document.getElementById('menuButton');
  const dropdownMenu = document.getElementById('dropdownMenu');

  menuButton.addEventListener('click', () => {
    const isOpen = dropdownMenu.classList.contains('open');
    dropdownMenu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', !isOpen);
  });

  // Close dropdown if user clicks outside of it
  document.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });

  // Close dropdown on pressing Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      dropdownMenu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });

  // PDF Viewer Implementation
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfUrl = 'V3-Complicity-Report-harmonized 1 conv.pdf';
    let pdfDoc = null;
    let currentPage = 1;

    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');

    const renderPage = async (pageNum) => {
      const page = await pdfDoc.getPage(pageNum);
      const containerWidth = document.querySelector('.pdf-canvas-wrapper').clientWidth - 40; // Account for padding
      const defaultViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / defaultViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport
      };

      await page.render(renderContext).promise;
      currentPageSpan.textContent = pageNum;
      currentPage = pageNum;

      // Update button states
      prevPageBtn.disabled = pageNum <= 1;
      nextPageBtn.disabled = pageNum >= pdfDoc.numPages;
    };

    const loadPdf = async () => {
      try {
        pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
        totalPagesSpan.textContent = pdfDoc.numPages;
        renderPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
        canvas.textContent = 'Error loading PDF. Please try downloading it directly.';
      }
    };

    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        renderPage(currentPage - 1);
      }
    });

    nextPageBtn.addEventListener('click', () => {
      if (pdfDoc && currentPage < pdfDoc.numPages) {
        renderPage(currentPage + 1);
      }
    });

    // Load PDF on page load
    loadPdf();
  }
});