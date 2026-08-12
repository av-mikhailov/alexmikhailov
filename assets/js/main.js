(function() {
  "use strict";

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

  /**
   * Поведение шапки и кнопки "Вверх" при прокрутке страницы
   */
  const selectHeader = select('#header');
  const backToTopBtn = select('#back-to-top');

  if (selectHeader || backToTopBtn) {
    const handleWindowScroll = () => {
      const scrollPos = window.scrollY;

      // 1. Поведение шапки (класс scrolled добавляется при скролле > 50px)
      if (selectHeader) {
        if (scrollPos > 50) {
          selectHeader.classList.add('header-scrolled');
        } else {
          selectHeader.classList.remove('header-scrolled');
        }
      }

      // 2. Поведение кнопки "Вверх" (появляется при скролле > 300px)
      if (backToTopBtn) {
        if (scrollPos > 300) {
          backToTopBtn.classList.add('active');
        } else {
          backToTopBtn.classList.remove('active');
        }
      }
    };

    // Запускаем проверку при загрузке страницы и при каждом событии скролла
    window.addEventListener('load', handleWindowScroll);
    document.addEventListener('scroll', handleWindowScroll);
  }

  /**
   * Плавный скролл наверх при клике на кнопку "Вверх" (без добавления '#' в URL)
   */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Предотвращает стандартный переход по ссылке и появление '#' в URL

      // Запускаем плавную прокрутку окна браузера в самый верх (координаты 0, 0)
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Плавный скролл
      });
    });
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile');
    this.classList.toggle('bx-menu');
    this.classList.toggle('bx-x');
  });

  /**
   * Закрытие при клике на пункт меню
   */
  on('click', '.navbar .scrollto', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      select('#navbar').classList.remove('navbar-mobile');
      let navbarToggle = select('.mobile-nav-toggle');
      navbarToggle.classList.toggle('bx-menu');
      navbarToggle.classList.toggle('bx-x');
    }
  }, true);

  /**
   * Инициализация Swiper Слайдера Галереи
   */
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

    // Связываем миниатюры со слайдером
    const thumbs = select('.gallery-thumbnails .thumb-box', true);
    if (thumbs.length > 0) {
      // Изначально подсвечиваем первую миниатюру
      thumbs[0].classList.add('thumb-active');

      thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
          swiper.slideToLoop(index); // Переключаем слайдер на нужный индекс
        });
      });

      // При перелистывании слайдера вручную — меняем активную превьюшку снизу
      swiper.on('slideChange', () => {
        thumbs.forEach(t => t.classList.remove('thumb-active'));
        const activeIndex = swiper.realIndex; // Получаем реальный индекс слайда
        if (thumbs[activeIndex]) {
          thumbs[activeIndex].classList.add('thumb-active');
        }
      });
    }
  }

  /**
   * Инициализация GLightbox (Всплывающее окно картинок при клике)
   */
  const lightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Интерактивная фильтрация проектов в Портфолио
   */
  const filterButtons = select('.btn-filter', true);
  const portfolioCards = select('#portfolio-grid .portfolio-card', true);

  if (filterButtons.length > 0 && portfolioCards.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Меняем активную кнопку
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        portfolioCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');

          // Сначала запускаем плавное затухание (fade-out) для всех карточек
          card.classList.add('fade-out');
          card.classList.remove('fade-in');

          // Ждем окончания анимации затухания (350мс), затем перестраиваем сетку
          setTimeout(() => {
            if (filterValue === 'all' || cardCategory === filterValue) {
              card.classList.remove('d-none-filter');
              card.classList.add('fade-in');
              card.classList.remove('fade-out');
            } else {
              card.classList.add('d-none-filter');
            }
            
            // Переинициализируем анимации AOS, чтобы карточки не пропадали при фильтрации
            if (typeof AOS !== 'undefined') {
              AOS.refresh();
            }
          }, 350);
        });
      });
    });
  }


  /**
   * Переключатель тем оформления (Синхронизированный для десктопа и мобилок)
   */
  const themeCheckboxes = select('.theme-checkbox', true);

  if (themeCheckboxes.length > 0) {
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    // Синхронизируем положение всех чекбоксов при загрузке страницы
    themeCheckboxes.forEach(checkbox => {
      checkbox.checked = (currentTheme === 'light');
    });

    // Навешиваем слушатель изменений на каждый чекбокс
    themeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const newTheme = this.checked ? 'light' : 'dark';

        // Меняем тему на корневом уровне
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Мгновенно синхронизируем положение остальных переключателей на странице
        themeCheckboxes.forEach(cb => {
          cb.checked = (newTheme === 'light');
        });
      });
    });
  }

  /**
   * Интерактивная физическая сетка точек на Canvas в Hero секции (Оптимизированная версия)
   */
  const canvas = select('#hero-canvas');
  const heroSection = select('#hero');

  if (canvas && heroSection) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const gap = 32;
    const mouse = { x: null, y: null, radius: 90 };

    // Функция обновления размеров холста под экран
    const resizeCanvas = () => {
      canvas.width = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
      initGrid();
    };

    // Класс частицы (точки)
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x; 
        this.baseY = y; 
        this.vx = 0;    
        this.vy = 0;    
        this.size = 1.05;  //  this.size = 0.5 + (x / canvas.width) * 1.3; 
      }

      // Отрисовка точки
      draw(color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      // Физика поведения и плавного скольжения
      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.hypot(dx, dy);
        let force = (mouse.radius - distance) / mouse.radius; 

        let targetX = this.baseX;
        let targetY = this.baseY;

        if (distance < mouse.radius) {
          let angle = Math.atan2(dy, dx);
          // ИСПРАВЛЕНО: Уменьшили силу толчка до 12 (точки отклоняются очень деликатно)
          targetX = this.x - Math.cos(angle) * force * 6; 
          targetY = this.y - Math.sin(angle) * force * 6;
        }

        // ИСПРАВЛЕНО: Коэффициенты пружины настроены для создания "эффекта геля"
        let spring = 0.02;   // Возврат стал мягким и неспешным
        let friction = 0.90; // Высокое сопротивление делает движение текучим и вязким

        let ax = (targetX - this.x) * spring;
        let ay = (targetY - this.y) * spring;

        this.vx = (this.vx + ax) * friction;
        this.vy = (this.vy + ay) * friction;

        this.x += this.vx;
        this.y += this.vy;
      }
    }

    // Инициализация сетки точек
    const initGrid = () => {
      particles = [];
      for (let y = gap / 2; y < canvas.height; y += gap) {
        for (let x = gap / 2; x < canvas.width; x += gap) {
          particles.push(new Particle(x, y));
        }
      }
    };

    // Анимационный цикл
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

    // Отслеживаем движение мыши над секцией Hero
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    // Убираем координаты мыши при выходе из Hero
    heroSection.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Адаптив при изменении размеров окна
    window.addEventListener('resize', resizeCanvas);

    // Старт
    resizeCanvas();
    animate();
  }

  /**
   * Инициализация эффекта печатающегося текста (Typed.js)
   */
  const typedElement = select('.typed');
  if (typedElement) {
    let typed_strings = typedElement.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(','); // Разделяем строки через запятую
    
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 80,      // Скорость печати (чем меньше, тем быстрее)
      backSpeed: 40,      // Скорость стирания
      backDelay: 2000,    // Пауза перед началом стирания (2 секунды)
      fadeOut: false      // Можно включить true для эффекта затухания вместо стирания
    });
  }


  /**
   * Бесшовная AJAX-отправка формы обратной связи (через Fetch API)
   */
  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  const submitBtn = document.querySelector('#form-submit-btn');

  if (contactForm && formStatus && submitBtn) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Блокируем перезагрузку страницы

      // Меняем текст кнопки на состояние отправки
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;

      // Скрываем прошлый статус
      formStatus.style.display = 'none';

      // Собираем данные формы
      const formData = new FormData(contactForm);

      // Отправляем асинхронный запрос на сервер к файлу sendmail.php
      fetch('sendmail.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Выводим сообщение ответа
        formStatus.textContent = data.message;
        formStatus.style.display = 'block';

        if (data.status === 'success') {
          // Если отправлено успешно — красим статус в зеленый/акцентный и очищаем форму
          formStatus.style.color = 'var(--color-accent)'; 
          contactForm.reset();
        } else {
          // Если ошибка — красим в красный
          formStatus.style.color = '#ff4d4d'; 
        }
      })
      .catch(error => {
        // Обработка системной ошибки соединения
        formStatus.textContent = 'Произошла системная ошибка соединения. Попробуйте еще раз.';
        formStatus.style.color = '#ff4d4d';
        formStatus.style.display = 'block';
      })
      .finally(() => {
        // Возвращаем кнопку в исходное состояние
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      });
    });
  }

})();