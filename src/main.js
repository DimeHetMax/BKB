const menuButton = document.querySelector('.menu-btn');
const navigation = document.querySelector('.desktop-nav');
const mainContent = document.querySelector('main');

if (mainContent) {
  mainContent.id ||= 'main-content';

  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = `#${mainContent.id}`;
  skipLink.textContent = 'Skip to content';
  document.body.prepend(skipLink);
}

document.querySelector('.desktop-nav .active')?.setAttribute('aria-current', 'page');

const closeMenu = () => {
  if (!menuButton || !navigation) return;

  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
};

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');

    document.body.classList.toggle('menu-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

let toastTimer;

const showToast = message => {
  let toast = document.querySelector('.site-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'site-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
};

document.querySelectorAll('a[href="#"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    showToast(`${link.textContent.trim()} will be available soon.`);
  });
});

document.querySelectorAll('.button-primary, .button-secondary, .mini-button').forEach(button => {
  const previewInteraction = () => {
    showToast(`${button.textContent.trim()} interaction preview`);
  };

  if (button.tagName !== 'BUTTON') {
    button.tabIndex = 0;
    button.setAttribute('role', 'button');
    button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        previewInteraction();
      }
    });
  }

  button.addEventListener('click', previewInteraction);
});

document.querySelectorAll('.colour-card, .colour-row').forEach(card => {
  const value = card.querySelector('small')?.textContent.trim();

  if (!value?.startsWith('#')) return;

  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Copy colour ${value}`);

  const copyColour = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${value} copied to clipboard`);
    } catch {
      showToast(`Colour value: ${value}`);
    }
  };

  card.addEventListener('click', copyColour);
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      copyColour();
    }
  });
});

const galleryItems = [...document.querySelectorAll('.gallery-item')];
const galleryControls = document.querySelector('.slider-dots');

if (galleryItems.length && galleryControls) {
  const previousButton = galleryControls.querySelector('button:first-of-type');
  const nextButton = galleryControls.querySelector('button:last-of-type');
  let currentPage = 0;
  let pageCount = 0;

  const renderGallery = () => {
    const itemsPerPage = window.innerWidth <= 900 ? 1 : 4;
    pageCount = Math.ceil(galleryItems.length / itemsPerPage);
    currentPage = Math.min(currentPage, pageCount - 1);

    galleryItems.forEach((item, index) => {
      item.classList.toggle(
        'is-gallery-hidden',
        index < currentPage * itemsPerPage || index >= (currentPage + 1) * itemsPerPage
      );
    });

    galleryControls.querySelectorAll('.dot').forEach(dot => dot.remove());

    for (let index = 0; index < pageCount; index += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `dot${index === currentPage ? ' active-dot' : ''}`;
      dot.setAttribute('aria-label', `Show gallery page ${index + 1}`);
      dot.setAttribute('aria-current', index === currentPage ? 'true' : 'false');
      dot.addEventListener('click', () => {
        currentPage = index;
        renderGallery();
      });
      nextButton.before(dot);
    }
  };

  previousButton.addEventListener('click', () => {
    currentPage = (currentPage - 1 + pageCount) % pageCount;
    renderGallery();
  });

  nextButton.addEventListener('click', () => {
    currentPage = (currentPage + 1) % pageCount;
    renderGallery();
  });

  window.addEventListener('resize', renderGallery);
  renderGallery();
}
