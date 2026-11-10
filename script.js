(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      menuButton.textContent = isOpen ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      menuButton.textContent = '☰';
    }));
  }

  // Fade text and blocks in as they enter the viewport and out as they leave.
  document.documentElement.classList.add('js-ready');
  const selector = '.hero-copy > *, .stats, .heading > *, .card, .about-visual, .about-grid > div:not(.about-visual) > *, .ind-list > *, .member, .cta-inner > *, .contact-grid > div > *, .contact-form, .foot-top > *';
  document.querySelectorAll('.reveal').forEach(el => el.classList.remove('reveal'));
  const targets = [...document.querySelectorAll(selector)];
  targets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0, rootMargin: '-6% 0px -6% 0px' });
    targets.forEach(item => observer.observe(item));
  } else {
    targets.forEach(item => item.classList.add('is-visible'));
  }

  // Home hero: rotating headline text and image frame, fading in and out together
  const slides = [...document.querySelectorAll('.hero-rot .slide')];
  const frames = [...document.querySelectorAll('.hero-bg img')];
  const dotsBox = document.querySelector('.hero-dots');
  if (slides.length > 1) {
    let current = 0, timer;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Show message ' + (i + 1));
      b.addEventListener('click', () => { show(i); restart(); });
      dotsBox && dotsBox.appendChild(b);
      return b;
    });
    const show = i => {
      current = i;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
      frames.forEach((f, n) => f.classList.toggle('is-active', n === i));
      dots.forEach((d, n) => d.classList.toggle('is-active', n === i));
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => show((current + 1) % slides.length), 5500); };
    show(0); restart();
  }

  // Submit through FormSubmit's AJAX endpoint without leaving this page.
  const contactForm = document.getElementById('contact-form');
  const successMessage = document.getElementById('form-success');
  if (contactForm && successMessage) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : '';
      const formNote = contactForm.querySelector('.form-note');

      successMessage.hidden = true;
      successMessage.classList.remove('form-error');
      if (formNote) formNote.hidden = true;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());

        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let result = {};
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (_) {
          throw new Error('The form service returned an unreadable response.');
        }

        const submitted = result.success === true || result.success === 'true';
        if (!response.ok || !submitted) {
          throw new Error(result.message || 'Submission failed. Please try again.');
        }

        contactForm.reset();
        successMessage.textContent = 'Thanks! Your inquiry was submitted successfully.';
        successMessage.hidden = false;
      } catch (error) {
        successMessage.textContent = 'Sorry, your inquiry could not be sent. Please try again or contact us directly.';
        successMessage.classList.add('form-error');
        successMessage.hidden = false;
        if (formNote) formNote.hidden = false;
        console.error('Contact form submission error:', error);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

})();
