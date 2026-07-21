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
   * Активация шапки при скролле (Добавление класса header-scrolled)
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 50) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    // Запускаем проверку при загрузке страницы и при каждом событии прокрутки
    window.addEventListener('load', headerScrolled)
    document.addEventListener('scroll', headerScrolled)
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

})();