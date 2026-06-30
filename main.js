/**
 * Synaptis Landing Page - Interactivity & Visual Effects
 */
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');

    // 1. MOUSE PARALLAX ON HERO BACKGROUND
    const hero = document.getElementById('hero');
    const heroBg = document.getElementById('hero-bg');
    
    if (hero && heroBg && !window.matchMedia('(pointer: coarse)').matches) {
        window.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            if (rect.bottom < 0) return; // Skip if hero section scrolled out of view
            
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Calculate cursor offset from center (-1 to 1)
            const moveX = (clientX - centerX) / centerX;
            const moveY = (clientY - centerY) / centerY;
            
            // Shift opposite to cursor by max 20px
            const maxShift = 20; 
            const shiftX = moveX * maxShift;
            const shiftY = moveY * maxShift;
            
            heroBg.style.transform = `translate3d(${-shiftX}px, ${-shiftY}px, 0) scale(1.06)`;
        });
    }

    // 2. MOBILE NAVIGATION DRAWER
    const navToggle = document.getElementById('mobile-nav-toggle');
    const primaryNav = document.getElementById('primary-navigation');
    const navLinks = document.querySelectorAll('.primary-navigation a');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isOpened = navToggle.getAttribute('aria-expanded') === 'true';
            
            // Toggle menu visibility
            navToggle.setAttribute('aria-expanded', !isOpened);
            primaryNav.classList.toggle('active');
            header.classList.toggle('mobile-active');
            
            // Lock body scroll when mobile menu is active
            document.body.style.overflow = isOpened ? '' : 'hidden';
        });

        // Close mobile drawer when clicking a navigation link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                primaryNav.classList.remove('active');
                header.classList.remove('mobile-active');
                document.body.style.overflow = '';
            });
        });
    }

    // 3. SMOOTH ANCHOR LINK INTERACTION
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Close mobile drawer if active
                if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
                    navToggle.setAttribute('aria-expanded', 'false');
                    primaryNav.classList.remove('active');
                    header.classList.remove('mobile-active');
                    document.body.style.overflow = '';
                }
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                let targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                // For the "Procédés" link in the navbar or footer, scroll to the active animation phase
                if (targetId === '#procedes' && (this.classList.contains('nav-link') || this.classList.contains('footer-nav-link'))) {
                    const viewportHeight = window.innerHeight;
                    const sectionHeight = targetElement.offsetHeight;
                    // Target progress = 0.41 (exactly when the full-screen canvas and Step 1 become active)
                    targetPosition = targetPosition + (sectionHeight - viewportHeight) * 0.41;
                }

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. SCROLL-DRIVEN VIDEO REVEAL & JPG SEQUENCE ANIMATION (MERGED SECTION)
    const timeline = document.getElementById('procedes');
    const canvas = document.getElementById('anim-canvas');
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    const introContent = document.querySelector('.intro-content');
    
    if (timeline && canvas && canvasWrapper) {
        const ctx = canvas.getContext('2d');
        const frameCount = 137;
        
        // Generate file paths
        const currentFramePath = index => 
            `assets/animation/Landingpage/FINAL_${index.toString().padStart(5, '0')}.webp`;
        
        // Preload all JPG frames
        const images = [];
        let loadedCount = 0;
        
        const preloadImages = () => {
            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFramePath(i);
                img.onload = () => {
                    loadedCount++;
                    if (i === 0) {
                        drawFrame(0);
                    }
                };
                images.push(img);
            }
        };
        
        // Draw frame keeping cover aspect ratio
        const drawFrame = (index) => {
            const img = images[index];
            if (!img || !img.complete) return;
            
            const rect = canvasWrapper.getBoundingClientRect();
            const width = rect.width * window.devicePixelRatio;
            const height = rect.height * window.devicePixelRatio;
            
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;
            const imgRatio = imgWidth / imgHeight;
            const canvasRatio = canvas.width / canvas.height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (canvasRatio > imgRatio) {
                drawWidth = canvas.width;
                drawHeight = canvas.width / imgRatio;
                drawX = 0;
                drawY = (canvas.height - drawHeight) / 2;
            } else {
                drawWidth = canvas.height * imgRatio;
                drawHeight = canvas.height;
                drawX = (canvas.width - drawWidth) / 2;
                drawY = 0;
            }
            
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        };
        
        // Track targets for smooth interpolation
        let targetFrame = 0;
        let currentFrame = 0;
        
        let targetWrapperWidth = 80;
        let currentWrapperWidth = 80;
        
        let targetWrapperHeight = 80;
        let currentWrapperHeight = 80;
        
        let targetWrapperTranslateY = 80;
        let currentWrapperTranslateY = 80;
        
        let targetWrapperBorderRadius = 20;
        let currentWrapperBorderRadius = 20;
        
        let targetBgOpacity = 0;
        let currentBgOpacity = 0;
        
        const stepTexts = document.querySelectorAll('.step-text');
        const staticTitle = document.querySelector('.static-section-title');
        
        const updateScrollProgress = () => {
            const rect = timeline.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Check if timeline section is in viewport
            const isInViewport = rect.top < viewportHeight && rect.bottom > 0;
            
            // Sync intro content active state (visible when section starts entering viewport)
            if (introContent) {
                if (isInViewport) {
                    introContent.classList.add('active');
                } else {
                    introContent.classList.remove('active');
                }
            }
            
            if (!isInViewport) {
                // If not in viewport, stop here to save CPU/memory
                return;
            }
            
            const sectionTop = window.pageYOffset + rect.top;
            const sectionHeight = rect.height;
            
            // Calculate scroll percentage relative to track length
            const scrollFraction = (window.pageYOffset - sectionTop) / (sectionHeight - viewportHeight);
            const progress = Math.max(0, Math.min(1, scrollFraction));
            
            // Background Opacity transition (0% to 100% as the section scrolls into view up to 200px past sticking point)
            const startY = viewportHeight;
            const endY = -200;
            const currentY = rect.top;
            const bgOpacityFraction = (startY - currentY) / (startY - endY);
            targetBgOpacity = Math.max(0, Math.min(1, bgOpacityFraction));
            
            let activeStepIndex = 0;
            
            // Phase 1: Reveal video container (0% to 40% of scroll)
            if (progress < 0.4) {
                const revealProgress = progress / 0.4;
                targetWrapperWidth = 80 + 20 * revealProgress;
                targetWrapperHeight = 80 + 20 * revealProgress;
                targetWrapperTranslateY = 80 * (1 - revealProgress);
                targetWrapperBorderRadius = 20 * (1 - revealProgress);
                targetFrame = 0;
            } else {
                // Phase 2: Scrub frames (40% to 100% of scroll)
                targetWrapperWidth = 100;
                targetWrapperHeight = 100;
                targetWrapperTranslateY = 0;
                targetWrapperBorderRadius = 0;
                
                const scrubProgress = (progress - 0.4) / 0.6;
                targetFrame = scrubProgress * (frameCount - 1);
                
                // Determine active text block during scrubbing
                if (scrubProgress < 0.33) {
                    activeStepIndex = 0;
                } else if (scrubProgress < 0.66) {
                    activeStepIndex = 1;
                } else {
                    activeStepIndex = 2;
                }
            }
            
            // Apply active class to current step text overlay
            stepTexts.forEach((el, idx) => {
                if (idx === activeStepIndex) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
            
            // Sync static title active state with phase 2 scrubbing
            if (staticTitle) {
                if (activeStepIndex >= 0) {
                    staticTitle.classList.add('active');
                } else {
                    staticTitle.classList.remove('active');
                }
            }
            
            // Trigger animation loop if it's not already running
            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(animate);
            }
        };
        
        let isAnimating = false;
        
        const applyStyles = () => {
            // Apply visual styles to canvas wrapper
            canvasWrapper.style.width = currentWrapperWidth + '%';
            canvasWrapper.style.height = currentWrapperHeight + 'vh';
            canvasWrapper.style.transform = `translate(-50%, ${currentWrapperTranslateY}vh)`;
            canvasWrapper.style.borderRadius = `${currentWrapperBorderRadius}px ${currentWrapperBorderRadius}px 0 0`;
            
            // Apply background opacity variable to timeline
            timeline.style.setProperty('--bg-opacity', currentBgOpacity.toFixed(3));
            
            // Draw current interpolated frame
            const frameToDraw = Math.round(currentFrame);
            if (images[frameToDraw]) {
                drawFrame(frameToDraw);
            }
        };
        
        // Core Animation loop for smooth interpolation (runs on-demand)
        const animate = () => {
            const frameDiff = targetFrame - currentFrame;
            const widthDiff = targetWrapperWidth - currentWrapperWidth;
            const heightDiff = targetWrapperHeight - currentWrapperHeight;
            const translateYDiff = targetWrapperTranslateY - currentWrapperTranslateY;
            const borderRadiusDiff = targetWrapperBorderRadius - currentWrapperBorderRadius;
            const bgOpacityDiff = targetBgOpacity - currentBgOpacity;
            
            const threshold = 0.005;
            
            // If all differences are extremely small, snap to targets and stop the loop
            if (
                Math.abs(frameDiff) < threshold &&
                Math.abs(widthDiff) < threshold &&
                Math.abs(heightDiff) < threshold &&
                Math.abs(translateYDiff) < threshold &&
                Math.abs(borderRadiusDiff) < threshold &&
                Math.abs(bgOpacityDiff) < threshold
            ) {
                currentFrame = targetFrame;
                currentWrapperWidth = targetWrapperWidth;
                currentWrapperHeight = targetWrapperHeight;
                currentWrapperTranslateY = targetWrapperTranslateY;
                currentWrapperBorderRadius = targetWrapperBorderRadius;
                currentBgOpacity = targetBgOpacity;
                
                applyStyles();
                isAnimating = false;
                return; // Stop animation loop
            }
            
            currentFrame += frameDiff * 0.15;
            currentWrapperWidth += widthDiff * 0.12;
            currentWrapperHeight += heightDiff * 0.12;
            currentWrapperTranslateY += translateYDiff * 0.12;
            currentWrapperBorderRadius += borderRadiusDiff * 0.12;
            currentBgOpacity += bgOpacityDiff * 0.08;
            
            applyStyles();
            
            requestAnimationFrame(animate);
        };
        
        // Init
        preloadImages();
        
        // Listeners
        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', () => {
            updateScrollProgress();
            drawFrame(Math.round(currentFrame));
        });
        
        // Initial setup run
        updateScrollProgress();
    }

    // 5. PROJECTS ACCORDION INTERACTION
    const projectItems = document.querySelectorAll('.project-item');
    
    if (projectItems.length > 0) {
        projectItems.forEach((item, index) => {
            // Click to expand the project description
            item.addEventListener('click', () => {
                projectItems.forEach((p, idx) => {
                    if (idx === index) {
                        p.classList.add('active');
                    } else {
                        p.classList.remove('active');
                    }
                });
            });
        });
    }

    // 6. CONTACT FORM SUBMISSION HANDLER
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const btnSubmit = document.getElementById('btn-submit');
    
    if (contactForm && formStatus && btnSubmit) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show sending state
            btnSubmit.disabled = true;
            const btnTextEl = btnSubmit.querySelector('span');
            const originalBtnText = btnTextEl.textContent;
            btnTextEl.textContent = 'Envoi en cours...';
            
            // Auto-prefix website URL if missing http/https
            const websiteInput = document.getElementById('form-website');
            if (websiteInput && websiteInput.value) {
                let val = websiteInput.value.trim();
                if (val && !/^https?:\/\//i.test(val)) {
                    websiteInput.value = 'https://' + val;
                }
            }
            
            // Send request to Web3Forms
            const formData = new FormData(contactForm);
            
            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
            .then(async (response) => {
                const json = await response.json();
                if (response.status === 200) {
                    // Success state feedback
                    formStatus.textContent = 'Merci ! Votre message a bien été envoyé. Notre équipe vous recontactera sous 24h.';
                    formStatus.className = 'form-status success';
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    console.error("Web3Forms Error:", json);
                    formStatus.textContent = json.message || "Une erreur est survenue lors de l'envoi.";
                    formStatus.className = 'form-status error';
                }
            })
            .catch((error) => {
                console.error("Network Error:", error);
                formStatus.textContent = "Impossible d'envoyer le message. Veuillez vérifier votre connexion.";
                formStatus.className = 'form-status error';
            })
            .finally(() => {
                // Restore button state
                btnSubmit.disabled = false;
                btnTextEl.textContent = originalBtnText;
                
                // Hide status after 6s
                setTimeout(() => {
                    formStatus.className = 'form-status';
                }, 6000);
            });
        });
    }

    // 7. FOOTER YEAR UPDATE
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
});
