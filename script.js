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

    // 5. Integração Dinâmica com o Blog (Blogger JSONP para contornar CORS)
    const blogContainer = document.getElementById('blog-posts-container');

    // Função de callback global para o JSONP
    window.renderBloggerPosts = function (data) {
        if (!blogContainer) return;

        const posts = data.feed.entry || [];

        if (posts.length === 0) {
            blogContainer.innerHTML = '<p>Nenhuma postagem encontrada no momento.</p>';
            return;
        }

        let html = '';
        posts.forEach(post => {
            const title = post.title.$t;
            const link = post.link.find(l => l.rel === 'alternate').href;

            // Tenta pegar a primeira imagem do post
            let imageUrl = 'logo.png';
            if (post.content && post.content.$t.includes('<img')) {
                const match = post.content.$t.match(/src="([^"]+)"/);
                if (match) {
                    imageUrl = match[1];
                }
            } else if (post.media$thumbnail) {
                imageUrl = post.media$thumbnail.url.replace('/s72-c/', '/s600/');
            }

            // Resumo do conteúdo
            const snippet = post.content ? post.content.$t.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : '';

            html += `
                <div class="blog-card fade-in">
                    <div class="blog-card-image">
                        <img src="${imageUrl}" alt="${title}" loading="lazy">
                    </div>
                    <div class="blog-card-content">
                        <h3>${title}</h3>
                        <p>${snippet}</p>
                        <a href="${link}" target="_blank" class="read-more">Leia mais <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
        });

        blogContainer.innerHTML = html;

        // Reinicializa o observer para os novos elementos
        const newCards = blogContainer.querySelectorAll('.blog-card');
        newCards.forEach(card => observer.observe(card));
    };

    function loadBloggerJSONP() {
        if (!blogContainer) return;
        const script = document.createElement('script');
        script.src = 'https://pesoti.blogspot.com/feeds/posts/default?alt=json-in-script&callback=renderBloggerPosts&max-results=3';
        script.onerror = () => {
            blogContainer.innerHTML = '<p>Não foi possível carregar as postagens. <a href="https://pesoti.blogspot.com/" target="_blank">Acesse o blog aqui.</a></p>';
        };
        document.body.appendChild(script);
    }

    loadBloggerJSONP();
});
