// LUNA - Vakantiehuisje Aagtekerke
// Smooth interactions and animations

document.addEventListener('DOMContentLoaded', () => {

    // Navigation scroll effect + Hero parallax
    const nav = document.getElementById('nav');
    const heroContent = document.querySelector('.hero-content');
    const handleScroll = () => {
        const scrollY = window.scrollY;
        nav.classList.toggle('scrolled', scrollY > 50);

        // Parallax effect on hero
        if (heroContent && scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrollY / window.innerHeight) * 0.8;
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Scroll animations (fade-in)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add varied animation classes for visual interest
    // Features: alternate slide-left and slide-right
    document.querySelectorAll('.feature').forEach((el, i) => {
        el.classList.add(i % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
        el.style.transitionDelay = `${i * 0.1}s`;
        observer.observe(el);
    });

    // Amenity cards: scale in
    document.querySelectorAll('.amenity-card').forEach((el, i) => {
        el.classList.add('scale-in');
        el.style.transitionDelay = `${i * 0.08}s`;
        observer.observe(el);
    });

    // Surrounding cards: alternate sides
    document.querySelectorAll('.surrounding-card').forEach((el, i) => {
        el.classList.add(i % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
        el.style.transitionDelay = `${i * 0.12}s`;
        observer.observe(el);
    });

    // Gallery items: fade in
    document.querySelectorAll('.gallery-item').forEach((el, i) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${i * 0.08}s`;
        observer.observe(el);
    });

    // Testimonial cards: scale in
    document.querySelectorAll('.testimonial-card').forEach((el, i) => {
        el.classList.add('scale-in');
        el.style.transitionDelay = `${i * 0.15}s`;
        observer.observe(el);
    });

    // Contact sections: slide in from sides
    const contactInfo = document.querySelector('.contact-info');
    const contactForm = document.querySelector('.contact-form-wrapper');
    if (contactInfo) { contactInfo.classList.add('slide-in-left'); observer.observe(contactInfo); }
    if (contactForm) { contactForm.classList.add('slide-in-right'); observer.observe(contactForm); }

    // Section headers: fade in
    document.querySelectorAll('.section-header').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
});

// ===== Form Validation & Submission =====

// Attach form handler after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', handleBookingSubmit);

        // Set min date for check-in to today
        const today = new Date().toISOString().split('T')[0];
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        if (checkinInput) checkinInput.setAttribute('min', today);
        if (checkoutInput) checkoutInput.setAttribute('min', today);

        // Update checkout min when checkin changes
        if (checkinInput && checkoutInput) {
            checkinInput.addEventListener('change', () => {
                if (checkinInput.value) {
                    const nextDay = new Date(checkinInput.value);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkoutInput.setAttribute('min', nextDay.toISOString().split('T')[0]);
                    if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
                        checkoutInput.value = '';
                    }
                }
            });
        }

        // Clear errors on input
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => clearFieldError(field.id));
            field.addEventListener('change', () => clearFieldError(field.id));
        });
    }
});

function showFieldError(fieldId, message) {
    const group = document.getElementById(fieldId)?.closest('.form-group');
    const errorEl = document.getElementById(fieldId + '-error');
    if (group) group.classList.add('has-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function clearFieldError(fieldId) {
    const group = document.getElementById(fieldId)?.closest('.form-group');
    const errorEl = document.getElementById(fieldId + '-error');
    if (group) group.classList.remove('has-error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
}

function validateBookingForm() {
    let isValid = true;
    const fields = ['name', 'email', 'phone', 'checkin', 'checkout'];
    fields.forEach(id => clearFieldError(id));

    // Name
    const name = document.getElementById('name').value.trim();
    if (!name) {
        showFieldError('name', 'Vul uw naam in.');
        isValid = false;
    } else if (name.length < 2) {
        showFieldError('name', 'Uw naam moet minimaal 2 tekens bevatten.');
        isValid = false;
    }

    // Email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showFieldError('email', 'Vul uw e-mailadres in.');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showFieldError('email', 'Vul een geldig e-mailadres in.');
        isValid = false;
    }

    // Phone (optional, but validate format if filled)
    const phone = document.getElementById('phone').value.trim();
    if (phone) {
        const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
        if (!phoneRegex.test(phone)) {
            showFieldError('phone', 'Vul een geldig telefoonnummer in.');
            isValid = false;
        }
    }

    // Check-in date
    const checkin = document.getElementById('checkin').value;
    const today = new Date().toISOString().split('T')[0];
    if (!checkin) {
        showFieldError('checkin', 'Selecteer een aankomstdatum.');
        isValid = false;
    } else if (checkin < today) {
        showFieldError('checkin', 'De aankomstdatum moet vandaag of later zijn.');
        isValid = false;
    }

    // Check-out date
    const checkout = document.getElementById('checkout').value;
    if (!checkout) {
        showFieldError('checkout', 'Selecteer een vertrekdatum.');
        isValid = false;
    } else if (checkin && checkout <= checkin) {
        showFieldError('checkout', 'De vertrekdatum moet na de aankomstdatum liggen.');
        isValid = false;
    }

    return isValid;
}

function handleBookingSubmit(event) {
    event.preventDefault();

    if (!validateBookingForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.form-group.has-error');
        if (firstError) {
            const offset = 100;
            const top = firstError.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        return;
    }

    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';

    // Set reply-to field so you can reply directly to the guest
    const replyTo = document.getElementById('replyto');
    if (replyTo) replyTo.value = document.getElementById('email').value;

    // Send via Formspree (JSON format)
    const formData = new FormData(form);
    const jsonData = {};
    formData.forEach((value, key) => { jsonData[key] = value; });

    console.log('Formspree: versturen naar', form.action, jsonData);

    fetch(form.action, {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Formspree response status:', response.status);
        if (response.ok) {
            console.log('Formspree: succesvol verzonden!');
            form.style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        } else {
            return response.json().then(data => {
                console.error('Formspree error:', data);
                throw new Error(data.error || 'Er is iets misgegaan bij het verzenden.');
            });
        }
    })
    .catch(error => {
        // Show error message
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';

        let errorDiv = document.getElementById('formError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'formError';
            errorDiv.className = 'form-submit-error';
            submitBtn.parentNode.insertBefore(errorDiv, submitBtn.nextSibling);
        }
        console.error('Formspree fetch error:', error);
        errorDiv.textContent = 'Er is iets misgegaan bij het verzenden. Probeer het opnieuw of neem contact op via info@luna-aagtekerke.nl.';
        errorDiv.style.display = 'block';

        setTimeout(() => { errorDiv.style.display = 'none'; }, 8000);
    });
}

function resetBookingForm() {
    const form = document.getElementById('bookingForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    form.reset();
    form.style.display = 'block';
    document.getElementById('formSuccess').style.display = 'none';
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';

    // Clear all errors
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
    form.querySelectorAll('.form-error-msg').forEach(e => { e.textContent = ''; e.style.display = 'none'; });

    // Scroll to form
    const section = document.getElementById('contact');
    if (section) {
        const top = section.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}
