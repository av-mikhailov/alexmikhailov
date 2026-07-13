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

})();