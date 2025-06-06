document.addEventListener("DOMContentLoaded", () => {
    // Get references to key elements
    const navbar = document.getElementById("navbar");
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

    // Navigation links
    const navLinks = {
        desktop: document.querySelectorAll('.hidden.md\\:block a'),
        mobile: document.querySelectorAll('#mobile-menu a'),
    };

    // Get current page path
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const isContactPage = currentPage === '../contact.html';
    const isAboutPage = currentPage === 'about.html';

    // Get hash if available
    const currentHash = window.location.hash;

    // Sections for tracking (only on pages with section navigation)
    const sections = {};
    if (!isContactPage) {
        [...navLinks.desktop].forEach((link) => {
            const href = link.getAttribute("href");
            if (href && href.includes('#') && !href.startsWith('http')) {
                const sectionId = href.split('#')[1];
                if (sectionId) {
                    const section = document.getElementById(sectionId);
                    if (section) sections[sectionId] = section;
                }
            }
        });
    }

    // Toggle mobile menu
    mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    // Create a header sentinel element to track scroll position for navbar animation
    const createHeaderSentinel = () => {
        const sentinel = document.createElement('div');
        sentinel.setAttribute('aria-hidden', 'true');
        sentinel.style.position = 'absolute';
        sentinel.style.top = '0';
        sentinel.style.height = '100px'; // Threshold for animation
        sentinel.style.width = '1px';
        sentinel.style.pointerEvents = 'none';
        sentinel.style.opacity = '0';
        document.body.prepend(sentinel);
        return sentinel;
    };

    // Set up Intersection Observer for navbar animation
    const setupNavbarObserver = () => {
        const headerSentinel = createHeaderSentinel();

        const navbarObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    // When sentinel is not visible (scrolled down past threshold)
                    if (!entry.isIntersecting) {
                        navbar.classList.add("navbar-compact");
                        navbar.classList.remove("navbar-expanded");
                    } else {
                        // When sentinel is visible (scrolled near top)
                        navbar.classList.remove("navbar-compact");
                        navbar.classList.add("navbar-expanded");
                    }
                });
            },
            {
                rootMargin: '-100px 0px 0px 0px', // Start transition at 100px down
                threshold: 0
            }
        );

        navbarObserver.observe(headerSentinel);
    };

    // Set up Intersection Observer for section highlighting
    const setupSectionObservers = () => {
        if (Object.keys(sections).length === 0) return;

        const sectionObserver = new IntersectionObserver(
            (entries) => {
                // Track sections currently in view
                entries.forEach(entry => {
                    const id = entry.target.id;

                    // Store sections visibility state to handle overlapping sections
                    if (entry.isIntersecting) {
                        // Add to visible sections with their intersection ratio
                        entry.target.dataset.visible = entry.intersectionRatio;
                    } else {
                        // Remove from visible sections
                        entry.target.dataset.visible = "0";
                    }

                    // Find the section with highest visibility ratio
                    let highestRatio = 0;
                    let mostVisibleSection = null;

                    Object.keys(sections).forEach(sectionId => {
                        const section = sections[sectionId];
                        const ratio = parseFloat(section.dataset.visible || "0");
                        if (ratio > highestRatio) {
                            highestRatio = ratio;
                            mostVisibleSection = sectionId;
                        }
                    });

                    // Update active link if we have a visible section
                    if (mostVisibleSection) {
                        updateActiveLink(mostVisibleSection);
                    }
                });
            },
            {
                rootMargin: '-80px 0px -20% 0px', // Adjust based on navbar height
                threshold: [0, 0.25, 0.5, 0.75, 1]  // Multiple thresholds for better accuracy
            }
        );

        // Observe all sections
        Object.values(sections).forEach(section => {
            // Initialize visibility dataset
            section.dataset.visible = "0";
            sectionObserver.observe(section);
        });
    };

    // Set active link based on current section or page
    const updateActiveLink = (sectionId = null) => {
        // Remove active class from all links
        [...navLinks.desktop, ...navLinks.mobile].forEach((link) => {
            link.classList.remove("text-primary-700", "border-primary-500");
            link.classList.add("text-gray-600", "border-transparent");
        });

        // First try to match by page path and section
        [...navLinks.desktop, ...navLinks.mobile].forEach((link) => {
            const href = link.getAttribute("href");

            // If we're matching a specific section
            if (sectionId) {
                // Check if this link points to the active section
                if (href === `#${sectionId}` || href.endsWith(`#${sectionId}`)) {
                    link.classList.remove("text-gray-600", "border-transparent");
                    link.classList.add("text-primary-700", "border-primary-500");
                }
            }
            // Otherwise match by page
            else {
                // On contact page, highlight contact links
                if (isContactPage && href.includes('../contact.html')) {
                    link.classList.remove("text-gray-600", "border-transparent");
                    link.classList.add("text-primary-700", "border-primary-500");
                }
                // On about page, highlight about links
                else if (isAboutPage && href.includes('about.html')) {
                    link.classList.remove("text-gray-600", "border-transparent");
                    link.classList.add("text-primary-700", "border-primary-500");
                }
                // On home page with no hash, highlight home links
                else if (currentPage === 'index.html' && (href === 'index.html' || href === './index.html' || href === '/')) {
                    link.classList.remove("text-gray-600", "border-transparent");
                    link.classList.add("text-primary-700", "border-primary-500");
                }
            }
        });
    };

    // Handle click on navigation links
    [...navLinks.desktop, ...navLinks.mobile].forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            // If it's an external link or different page, let it navigate normally
            if (!href || href.startsWith('http') || (href.includes('.html') && !href.includes('#'))) {
                return;
            }

            // For same-page section links
            if (href.includes('#')) {
                const parts = href.split('#');
                const pagePart = parts[0];
                const hashPart = parts[1];

                // If it's a link to a section on the current page
                if (!pagePart || pagePart === currentPage) {
                    e.preventDefault();
                    const targetSection = document.getElementById(hashPart);

                    if (targetSection) {
                        // Hide mobile menu if open
                        mobileMenu.classList.add("hidden");

                        // Scroll to section
                        window.scrollTo({
                            top: targetSection.offsetTop - 80, // Adjust for navbar height
                            behavior: "smooth",
                        });

                        // Update URL hash
                        history.pushState(null, null, `#${hashPart}`);

                        // Update active link
                        updateActiveLink(hashPart);
                    }
                }
            }
        });
    });

    // Initialize the navbar state
    const initNavbar = () => {
        // Add CSS for navbar animations
        const style = document.createElement("style");
        style.textContent = `
            .navbar-expanded {
                width: 100%;
                border-radius: 0;
            }

            .navbar-compact {
                width: 80%;
                max-width: 1200px;
                border-radius: 0.75rem;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 12px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }

            @media (max-width: 768px) {
                .navbar-compact {
                    width: 90%;
                }
            }
        `;
        document.head.appendChild(style);

        // Set initial state
        navbar.classList.add("navbar-expanded");

        // Set initial active state
        if (Object.keys(sections).length > 0 && currentHash) {
            // If we have sections and a hash, try to highlight that section
            const sectionId = currentHash.substring(1);
            if (sections[sectionId]) {
                updateActiveLink(sectionId);
            }
        } else {
            // Otherwise just highlight based on current page
            updateActiveLink();
        }

        // If there's a hash on page load, scroll to that section
        if (currentHash && !isContactPage) {
            const sectionId = currentHash.substring(1);
            const section = document.getElementById(sectionId);
            if (section) {
                setTimeout(() => {
                    window.scrollTo({
                        top: section.offsetTop - 80,
                        behavior: "smooth"
                    });
                }, 100);
            }
        }

        // Set up observers
        setupNavbarObserver();
        setupSectionObservers();
    };

    // Initialize
    initNavbar();
});