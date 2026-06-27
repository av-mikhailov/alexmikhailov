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