// Aguarda o documento carregar
document.addEventListener('DOMContentLoaded', () => {

    // 1. Menu Mobile (Hamburger)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Troca ícone do menu
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Fecha menu ao clicar num link
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            });
        });
    }

    // 2. Comportamento do Header ao rolar a página (Scroll) - Otimizado com requestAnimationFrame
    const navbar = document.getElementById('navbar');
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // 3. Sistema do FAQ (Accordion) - Otimizado para evitar reflow
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;

            // Fecha os outros
            accordionHeaders.forEach(otherHeader => {
                const otherContent = otherHeader.nextElementSibling;
                if (otherHeader !== header && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherContent.style.maxHeight = null;
                }
            });

            // Abre/Fecha o atual
            header.classList.toggle('active');
            if (header.classList.contains('active')) {
                // Remove o maxHeight primeiro para garantir que a leitura de scrollHeight seja precisa
                content.style.maxHeight = 'none';
                const height = content.scrollHeight;
                // Volta para zero antes de aplicar a altura real para permitir transição (se necessário) ou remove o tempo curto
                content.style.maxHeight = '0px';

                // Usa requestAnimationFrame para aplicar a altura DEPOIS que o DOM processou a mudança acima
                window.requestAnimationFrame(() => {
                    content.style.maxHeight = height + 'px';
                });
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // 4. Observador de Interseção para Animações ao Rolar (Scroll Reveal)
    const observeElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

    // Configurações do observador: dispara quando 15% do elemento estiver visível
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adiciona a classe 'visible' para disparar a animação CSS
                entry.target.classList.add('visible');
                // Deixa de observar depois que já animou uma vez
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observeElements.forEach(el => {
        observer.observe(el);
    });
});
