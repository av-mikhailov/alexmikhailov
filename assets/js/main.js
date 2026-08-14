(function() {
  "use strict";

  // ==========================================================================
  // 1. ВСПОМОГАТЕЛЬНЫЕ ХЕЛПЕРЫ (Для выбора элементов и событий)
  // ==========================================================================
  const select = (el, all = false) => {
    el = el.trim()
    if (all) { return [...document.querySelectorAll(el)] }
    else { return document.querySelector(el) }
  }

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  // ==========================================================================
  // 2. ПОВЕДЕНИЕ ШАПКИ И КНОПКИ "ВВЕРХ" ПРИ СКРОЛЛЕ
  // ==========================================================================
  const selectHeader = select('#header');
  const backToTopBtn = select('#back-to-top');

  if (selectHeader || backToTopBtn) {
    const handleWindowScroll = () => {
      const scrollPos = window.scrollY;

      // Скролл шапки (добавляем класс header-scrolled)
      if (selectHeader) {
        if (scrollPos > 50) {
          selectHeader.classList.add('header-scrolled');
        } else {
          selectHeader.classList.remove('header-scrolled');
        }
      }

      // Появление кнопки "Вверх" (после 300px скролла)
      if (backToTopBtn) {
        if (scrollPos > 300) {
          backToTopBtn.classList.add('active');
        } else {
          backToTopBtn.classList.remove('active');
        }
      }
    };

    window.addEventListener('load', handleWindowScroll);
    document.addEventListener('scroll', handleWindowScroll);
  }

  // ==========================================================================
  // 3. КНОПКА "ВВЕРХ" (ПЛАВНЫЙ ВОЗВРАТ НАВЕРХ БЕЗ '#' В URL)
  // ==========================================================================
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function(e) {
      e.preventDefault(); 
      window.scrollTo({
        top: 0,
        behavior: 'smooth' 
      });
    });
  }

  // ==========================================================================
  // 4. МОБИЛЬНОЕ МЕНЮ (ОТКРЫТИЕ / ЗАКРЫТИЕ И СБРОС ПРИ КЛИКЕ НА ССЫЛКУ)
  // ==========================================================================
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile');
    this.classList.toggle('bx-menu');
    this.classList.toggle('bx-x');
  });

  on('click', '.navbar .scrollto', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      select('#navbar').classList.remove('navbar-mobile');
      let navbarToggle = select('.mobile-nav-toggle');
      navbarToggle.classList.toggle('bx-menu');
      navbarToggle.classList.toggle('bx-x');
    }
  }, true);

  // ==========================================================================
  // 5. СЛАЙДЕР ГАЛЕРЕИ (SWIPER С СИНХРОНИЗАЦИЕЙ МИНИАТЮР)
  // ==========================================================================
  const gallerySlider = select('.project-gallery-slider');
  if (gallerySlider) {
    const swiper = new Swiper('.project-gallery-slider', {
      speed: 800,
      loop: true,
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    const thumbs = select('.gallery-thumbnails .thumb-box', true);
    if (thumbs.length > 0) {
      thumbs[0].classList.add('thumb-active');

      thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
          swiper.slideToLoop(index); 
        });
      });

      swiper.on('slideChange', () => {
        thumbs.forEach(t => t.classList.remove('thumb-active'));
        const activeIndex = swiper.realIndex; 
        if (thumbs[activeIndex]) {
          thumbs[activeIndex].classList.add('thumb-active');
        }
      });
    }
  }

  // ==========================================================================
  // 6. ВСПЛЫВАЮЩИЕ ОКНА КАРТИНOК (GLIGHTBOX)
  // ==========================================================================
  const lightbox = GLightbox({
    selector: '.glightbox'
  });

  // ==========================================================================
  // 7. ИНТЕРАКТИВНАЯ ФИЛЬТРАЦИЯ ПРОЕКТОВ В ПОРТФОЛИО (С CSS-АНИМАЦИЕЙ)
  // ==========================================================================
  const filterButtons = select('.btn-filter', true);
  const portfolioCards = select('#portfolio-grid .portfolio-card', true);

  if (filterButtons.length > 0 && portfolioCards.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        portfolioCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');

          card.classList.add('fade-out');
          card.classList.remove('fade-in');

          setTimeout(() => {
            if (filterValue === 'all' || cardCategory === filterValue) {
              card.classList.remove('d-none-filter');
              card.classList.add('fade-in');
              card.classList.remove('fade-out');
            } else {
              card.classList.add('d-none-filter');
            }
            if (typeof AOS !== 'undefined') {
              AOS.refresh();
            }
          }, 350);
        });
      });
    });
  }

  // ==========================================================================
  // 8. СИНХРОНИЗИРОВАННЫЙ ПЕРЕКЛЮЧАТЕЛЬ ТЕМ (ДЛЯ ДЕСКТОПА И МОБИЛОК)
  // ==========================================================================
  const themeCheckboxes = select('.theme-checkbox', true);

  if (themeCheckboxes.length > 0) {
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    themeCheckboxes.forEach(checkbox => {
      checkbox.checked = (currentTheme === 'light');
    });

    themeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const newTheme = this.checked ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        themeCheckboxes.forEach(cb => {
          cb.checked = (newTheme === 'light');
        });
      });
    });
  }

  // ==========================================================================
  // 9. ИНТЕРАКТИВНАЯ ФИЗИЧЕСКАЯ СЕТКА ТОЧЕК НА CANVAS (В HERO СЕКЦИИ)
  // ==========================================================================
  const canvas = select('#hero-canvas');
  const heroSection = select('#hero');

  if (canvas && heroSection) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const gap = 32;
    const mouse = { x: null, y: null, radius: 90 };

    const resizeCanvas = () => {
      canvas.width = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
      initGrid();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x; 
        this.baseY = y; 
        this.vx = 0;    
        this.vy = 0;    
        this.size = 1.05;  
      }

      draw(color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.hypot(dx, dy);
        let force = (mouse.radius - distance) / mouse.radius; 

        let targetX = this.baseX;
        let targetY = this.baseY;

        if (distance < mouse.radius) {
          let angle = Math.atan2(dy, dx);
          targetX = this.x - Math.cos(angle) * force * 6; 
          targetY = this.y - Math.sin(angle) * force * 6;
        }

        let spring = 0.02;   
        let friction = 0.90; 

        let ax = (targetX - this.x) * spring;
        let ay = (targetY - this.y) * spring;

        this.vx = (this.vx + ax) * friction;
        this.vy = (this.vy + ay) * friction;

        this.x += this.vx;
        this.y += this.vy;
      }
    }

    const initGrid = () => {
      particles = [];
      for (let y = gap / 2; y < canvas.height; y += gap) {
        for (let x = gap / 2; x < canvas.width; x += gap) {
          particles.push(new Particle(x, y));
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const dotColor = theme === 'light' ? 'rgba(42, 57, 73, 0.25)' : 'rgba(221, 221, 221, 0.15)';

      particles.forEach(p => {
        p.update();
        p.draw(dotColor);
      });
      requestAnimationFrame(animate);
    };

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    animate();
  }

  // ==========================================================================
  // 10. ЭФФЕКТ ПЕЧАТАЮЩЕГОСЯ ТЕКСТА (TYPED.JS)
  // ==========================================================================
  const typedElement = select('.typed');
  if (typedElement) {
    let typed_strings = typedElement.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(','); 
    
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 80,      
      backSpeed: 40,      
      backDelay: 2000,    
      fadeOut: false      
    });
  }

  // ==========================================================================
  // 11. УНИВЕРСАЛЬНАЯ AJAX-ОТПРАВКА ФОРМ (КОНТАКТЫ И САЙДБАР)
  // ==========================================================================
  const ajaxForms = document.querySelectorAll('.contact-form, .sidebar-form');

  if (ajaxForms.length > 0) {
    ajaxForms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault(); 

        const submitBtn = this.querySelector('button[type="submit"]');
        
        let formStatus = this.querySelector('.form-status');
        if (!formStatus) {
          formStatus = document.createElement('div');
          formStatus.className = 'form-status mt-3 text-center';
          formStatus.style.cssText = 'display: none; font-size: 14px; font-weight: 500;';
          this.appendChild(formStatus); 
        }

        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        formStatus.style.display = 'none';

        const formData = new FormData(this);

        fetch('sendmail.php', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          formStatus.textContent = data.message;
          formStatus.style.display = 'block';

          if (data.status === 'success') {
            formStatus.style.color = 'var(--color-accent)'; 
            this.reset(); 
          } else {
            formStatus.style.color = '#ff4d4d'; 
          }
        })
        .catch(error => {
          formStatus.textContent = 'Произошла ошибка соединения. Попробуйте еще раз.';
          formStatus.style.color = '#ff4d4d';
          formStatus.style.display = 'block';
        })
        .finally(() => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        });
      });
    });
  }

})();