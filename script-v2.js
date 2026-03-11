// Aguarda o documento carregar
document.addEventListener('DOMContentLoaded', () => {

    // 1. Menu Mobile (Hamburger)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            
            navLinks.classList.toggle('active');
            mobileBtn.setAttribute('aria-expanded', !isExpanded);
            
            // Troca ícone do menu
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Fecha menu ao clicar num link
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.setAttribute('aria-expanded', 'false');
                
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 2. Comportamento do Header ao rolar a página (Scroll) - Otimizado com requestAnimationFrame
    const navbar = document.getElementById('navbar');
    let isScrolling = false;

    if (navbar) {
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
        }, { passive: true });
    }

    // 3. Sistema do FAQ (Accordion) - Com ARIA e animação suave
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');

        if (header && content) {
            header.addEventListener('click', () => {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';

                // Fecha outros itens
                accordionItems.forEach(otherItem => {
                    const otherHeader = otherItem.querySelector('.accordion-header');
                    const otherContent = otherItem.querySelector('.accordion-content');
                    if (otherHeader && otherHeader !== header) {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherContent.style.maxHeight = null;
                        otherItem.classList.remove('active');
                    }
                });

                // Alterna o atual
                header.setAttribute('aria-expanded', !isExpanded);
                item.classList.toggle('active');

                if (!isExpanded) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = null;
                }
            });
        }
    });

    // 4. Observador de Interseção para Animações ao Rolar (Scroll Reveal)
    const observeElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    let observer;

    if (observeElements.length > 0 && 'IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observeElements.forEach(el => observer.observe(el));
    }

    // 5. Integração Dinâmica com o Blog (Blogger JSONP)
    const blogContainer = document.getElementById('blog-posts-container');

    window.renderBloggerPosts = function (data) {
        if (!blogContainer) return;

        const posts = data.feed.entry || [];

        if (posts.length === 0) {
            blogContainer.innerHTML = '<p class="text-center">Nenhuma postagem encontrada no momento.</p>';
            return;
        }

        let html = '<ul class="blog-links-list">';
        posts.forEach(post => {
            try {
                const title = post.title.$t;
                const linkObj = post.link.find(l => l.rel === 'alternate');
                const link = linkObj ? linkObj.href : '#';

                html += `
                    <li class="blog-link-item fade-in">
                        <a href="${link}" target="_blank" rel="noopener noreferrer" class="blog-link-anchor">
                            <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
                            <span class="blog-link-title">${title}</span>
                            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                        </a>
                    </li>
                `;
            } catch (err) {
                console.error('Erro ao processar postagem:', err);
            }
        });
        html += '</ul>';

        blogContainer.innerHTML = html;

        // Anima os novos cards se o observer existir
        const newCards = blogContainer.querySelectorAll('.blog-card');
        if (observer) {
            newCards.forEach(card => observer.observe(card));
        }
    };

    function loadBloggerJSONP() {
        if (!blogContainer) return;
        
        const script = document.createElement('script');
        script.src = 'https://pesoti.blogspot.com/feeds/posts/default?alt=json-in-script&callback=renderBloggerPosts&max-results=3';
        script.async = true;
        
        script.onerror = () => {
            blogContainer.innerHTML = `
                <div class="text-center">
                    <p>Não foi possível carregar as postagens automaticamente.</p>
                    <a href="https://pesoti.blogspot.com/" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Ver Blog</a>
                </div>
            `;
        };
        
        document.body.appendChild(script);
    }

    // Inicialização do Blog com pequeno delay para priorizar LCP
    setTimeout(loadBloggerJSONP, 1000);
});
