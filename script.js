// LUNA - Vakantiehuisje Aagtekerke
// Smooth interactions and animations

// ===== Beschikbaarheidskalender =====

(function() {
    const MONTH_NAMES = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
    const DAY_HEADERS = ['Ma','Di','Wo','Do','Vr','Za','Zo'];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let bookedRanges = [];
    let selectionStart = null;
    let selectionEnd = null;
    let useMockData = true;

    // Generate mock bookings (same logic as API fallback, so calendar works without server)
    function generateMockBookings() {
        const now = new Date();
        const ranges = [
            { offsetDays: 3, duration: 4 },
            { offsetDays: 14, duration: 7 },
            { offsetDays: 30, duration: 3 },
            { offsetDays: 42, duration: 5 },
            { offsetDays: 58, duration: 7 },
            { offsetDays: 75, duration: 4 },
            { offsetDays: 90, duration: 6 },
            { offsetDays: 105, duration: 3 },
        ];
        return ranges.map(r => {
            const start = new Date(now);
            start.setDate(start.getDate() + r.offsetDays);
            const end = new Date(start);
            end.setDate(end.getDate() + r.duration);
            return {
                start: formatDateStr(start),
                end: formatDateStr(end)
            };
        });
    }

    function formatDateStr(d) {
        return d.toISOString().split('T')[0];
    }

    function isDateBooked(dateStr) {
        return bookedRanges.some(r => dateStr >= r.start && dateStr < r.end);
    }

    function isDateInSelection(dateStr) {
        if (!selectionStart || !selectionEnd) return false;
        return dateStr >= selectionStart && dateStr <= selectionEnd;
    }

    function buildMonth(year, month, container) {
        const frag = document.createDocumentFragment();

        const title = document.createElement('div');
        title.className = 'calendar-month-name';
        title.textContent = MONTH_NAMES[month] + ' ' + year;
        frag.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // Day headers
        DAY_HEADERS.forEach(d => {
            const hdr = document.createElement('div');
            hdr.className = 'calendar-day-header';
            hdr.textContent = d;
            grid.appendChild(hdr);
        });

        const firstDay = new Date(year, month, 1);
        // Monday = 0, Sunday = 6
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayStr = formatDateStr(today);

        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day day-empty';
            grid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = formatDateStr(date);
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.textContent = d;
            cell.dataset.date = dateStr;

            if (date < today) {
                cell.classList.add('day-past');
            } else if (isDateBooked(dateStr)) {
                cell.classList.add('day-booked');
            } else {
                cell.classList.add('day-available');
                cell.addEventListener('click', () => handleDateClick(dateStr));
            }

            if (dateStr === todayStr) {
                cell.classList.add('day-today');
            }

            // Selection highlighting
            if (selectionStart === dateStr || selectionEnd === dateStr) {
                cell.classList.add('day-selected');
                if (selectionStart === dateStr && selectionEnd) cell.classList.add('day-range-start');
                if (selectionEnd === dateStr && selectionStart) cell.classList.add('day-range-end');
            } else if (isDateInSelection(dateStr) && !isDateBooked(dateStr)) {
                cell.classList.add('day-in-range');
            }

            grid.appendChild(cell);
        }

        frag.appendChild(grid);
        container.appendChild(frag);
    }

    function render() {
        const container = document.getElementById('calendarMonths');
        if (!container) return;
        container.innerHTML = '';

        // Month 1
        const m1 = document.createElement('div');
        m1.className = 'calendar-month';
        buildMonth(currentYear, currentMonth, m1);
        container.appendChild(m1);

        // Month 2
        let m2Year = currentYear;
        let m2Month = currentMonth + 1;
        if (m2Month > 11) { m2Month = 0; m2Year++; }
        const m2 = document.createElement('div');
        m2.className = 'calendar-month';
        buildMonth(m2Year, m2Month, m2);
        container.appendChild(m2);
    }

    function handleDateClick(dateStr) {
        if (!selectionStart || (selectionStart && selectionEnd)) {
            // Start new selection
            selectionStart = dateStr;
            selectionEnd = null;
            updateFormDates(dateStr, null);
        } else {
            // Complete selection
            if (dateStr < selectionStart) {
                selectionEnd = selectionStart;
                selectionStart = dateStr;
            } else if (dateStr === selectionStart) {
                // Clicking same date deselects
                selectionStart = null;
                selectionEnd = null;
                updateFormDates(null, null);
                render();
                return;
            } else {
                selectionEnd = dateStr;
            }

            // Check if any booked date falls within selection
            const hasBookedInRange = bookedRanges.some(r => {
                return r.start < selectionEnd && r.end > selectionStart;
            });

            if (hasBookedInRange) {
                // Reset: can't select range with booked dates
                selectionStart = dateStr;
                selectionEnd = null;
                updateFormDates(dateStr, null);
            } else {
                updateFormDates(selectionStart, selectionEnd);
            }
        }
        render();
    }

    function updateFormDates(start, end) {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        if (checkinInput && start) {
            checkinInput.value = start;
            checkinInput.dispatchEvent(new Event('change'));
        } else if (checkinInput && !start) {
            checkinInput.value = '';
        }
        if (checkoutInput && end) {
            checkoutInput.value = end;
            checkoutInput.dispatchEvent(new Event('change'));
        } else if (checkoutInput && !end) {
            checkoutInput.value = '';
        }

        // Scroll to form if both dates selected
        if (start && end) {
            setTimeout(() => {
                const form = document.querySelector('.contact-content');
                if (form) {
                    const top = form.getBoundingClientRect().top + window.pageYOffset - 100;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }, 300);
        }
    }

    function navigateMonth(delta) {
        currentMonth += delta;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }

        // Don't go before current month
        const now = new Date();
        if (currentYear < now.getFullYear() || (currentYear === now.getFullYear() && currentMonth < now.getMonth())) {
            currentMonth = now.getMonth();
            currentYear = now.getFullYear();
        }
        render();
    }

    async function fetchBookings() {
        try {
            const res = await fetch('/api/calendar');
            if (res.ok) {
                const data = await res.json();
                bookedRanges = data.booked || [];
                useMockData = data.mock || false;
                render();
                return;
            }
        } catch (e) {
            // API not available (e.g. local dev without Vercel), use mock data
        }
        bookedRanges = generateMockBookings();
        useMockData = true;
        render();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const prevBtn = document.getElementById('calPrev');
        const nextBtn = document.getElementById('calNext');
        if (prevBtn) prevBtn.addEventListener('click', () => navigateMonth(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigateMonth(1));

        fetchBookings();
    });
})();

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
