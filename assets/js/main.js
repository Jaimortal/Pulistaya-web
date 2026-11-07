/**
 * Pulistaya - Official Web UI Interactions & Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const hamburgerSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
  const closeSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? closeSvg : hamburgerSvg;
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.innerHTML = hamburgerSvg;
      });
    });
  }

  // 3. Controls Tabs Switcher (PC vs Mobile Android)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.controls-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`panel-${targetTab}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // 4. Download Modal
  const downloadModal = document.getElementById('download-modal');
  const openModalBtns = document.querySelectorAll('.js-open-download');
  const closeModalBtns = document.querySelectorAll('.js-close-modal');

  openModalBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (downloadModal) {
        downloadModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (downloadModal) {
        downloadModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) {
        downloadModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // 5. Gallery Lightbox
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const closeLightbox = document.getElementById('close-lightbox');

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // 6. Escape Key Listener for Modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (downloadModal && downloadModal.classList.contains('open')) {
        downloadModal.classList.remove('open');
        document.body.style.overflow = '';
      }
      if (lightbox && lightbox.classList.contains('open')) {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
});
