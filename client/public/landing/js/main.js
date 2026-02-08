(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function(e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function(e) {
      select('.search-bar').classList.toggle('search-bar-show')
    })
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  /**
   * Initiate quill editors
   */
  if (select('.quill-editor-default')) {
    new Quill('.quill-editor-default', {
      theme: 'snow'
    });
  }

  if (select('.quill-editor-bubble')) {
    new Quill('.quill-editor-bubble', {
      theme: 'bubble'
    });
  }

  if (select('.quill-editor-full')) {
    new Quill(".quill-editor-full", {
      modules: {
        toolbar: [
          [{
            font: []
          }, {
            size: []
          }],
          ["bold", "italic", "underline", "strike"],
          [{
              color: []
            },
            {
              background: []
            }
          ],
          [{
              script: "super"
            },
            {
              script: "sub"
            }
          ],
          [{
              list: "ordered"
            },
            {
              list: "bullet"
            },
            {
              indent: "-1"
            },
            {
              indent: "+1"
            }
          ],
          ["direction", {
            align: []
          }],
          ["link", "image", "video"],
          ["clean"]
        ]
      },
      theme: "snow"
    });
  }

  /**
   * Initiate TinyMCE Editor
   */
  const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

  tinymce.init({
    selector: 'textarea.tinymce-editor',
    plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
    editimage_cors_hosts: ['picsum.photos'],
    menubar: 'file edit view insert format tools table help',
    toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
    toolbar_sticky: true,
    toolbar_sticky_offset: isSmallScreen ? 102 : 108,
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    link_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_class_list: [{
        title: 'None',
        value: ''
      },
      {
        title: 'Some class',
        value: 'class-name'
      }
    ],
    importcss_append: true,
    file_picker_callback: (callback, value, meta) => {
      /* Provide file and text for the link dialog */
      if (meta.filetype === 'file') {
        callback('https://www.google.com/logos/google.jpg', {
          text: 'My text'
        });
      }

      /* Provide image and alt text for the image dialog */
      if (meta.filetype === 'image') {
        callback('https://www.google.com/logos/google.jpg', {
          alt: 'My alt text'
        });
      }

      /* Provide alternative source and posted for the media dialog */
      if (meta.filetype === 'media') {
        callback('movie.mp4', {
          source2: 'alt.ogg',
          poster: 'https://www.google.com/logos/google.jpg'
        });
      }
    },
    templates: [{
        title: 'New Table',
        description: 'creates a new table',
        content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>'
      },
      {
        title: 'Starting my story',
        description: 'A cure for writers block',
        content: 'Once upon a time...'
      },
      {
        title: 'New list with dates',
        description: 'New List with dates',
        content: '<div class="mceTmpl"><span class="cdate">cdate</span><br><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>'
      }
    ],
    template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image table',
    skin: useDarkMode ? 'oxide-dark' : 'oxide',
    content_css: useDarkMode ? 'dark' : 'default',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
  });

  /**
   * Initiate Bootstrap validation check
   */
  var needsValidation = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(needsValidation)
    .forEach(function(form) {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })

  /**
   * Initiate Datatables
   */
  const datatables = select('.datatable', true)
  datatables.forEach(datatable => {
    new simpleDatatables.DataTable(datatable);
  })

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function() {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }

})();


/**
 * Professional Language Switcher with Google Translate API
 */
document.addEventListener('DOMContentLoaded', function() {
  const langOptions = document.querySelectorAll('.lang-option');
  const currentFlag = document.getElementById('currentFlag');
  const currentLangText = document.getElementById('currentLangText');
  
  // Static translations for navbar (no API needed)
  const navbarTranslations = {
    'uz': {
      'Bosh sahifa': 'Bosh sahifa',
      'Yangiliklar': 'Yangiliklar',
      'Natijalar': 'Natijalar',
      'Biz haqimizda': 'Biz haqimizda',
      'Qabulga yozilish': 'Qabulga yozilish'
    },
    'ru': {
      'Bosh sahifa': 'Главная',
      'Yangiliklar': 'Новости',
      'Natijalar': 'Результаты',
      'Biz haqimizda': 'О нас',
      'Qabulga yozilish': 'Записаться'
    },
    'en': {
      'Bosh sahifa': 'Home',
      'Yangiliklar': 'News',
      'Natijalar': 'Results',
      'Biz haqimizda': 'About us',
      'Qabulga yozilish': 'Enroll'
    }
  };
  
  // Elements to translate (excluding logo, brand names, navbar, and language switcher)
  const translatableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, .hero-title, .hero-subtitle, .section-title, .section-subtitle');
  
  // Store original texts
  const originalTexts = new Map();
  translatableElements.forEach((el, index) => {
    const text = el.textContent.trim();
    // Skip logo, brand names, language switcher, navbar elements, and icon elements
    if (text && 
        !el.querySelector('img') && 
        !el.classList.contains('flag-icon') && 
        !el.classList.contains('bi') &&
        !el.closest('.logo') && 
        !el.closest('.language-switcher') &&
        !el.closest('.navbar')) {
      originalTexts.set(index, text);
    }
  });
  
  // Load saved language from localStorage
  const savedLang = localStorage.getItem('selectedLanguage') || 'uz';
  const savedOption = document.querySelector(`.lang-option[data-lang="${savedLang}"]`);
  
  if (savedOption) {
    updateLanguage(savedOption);
    if (savedLang !== 'uz') {
      translateNavbar(savedLang);
      translatePage(savedLang);
    }
  }
  
  langOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all options
      langOptions.forEach(opt => {
        opt.classList.remove('active');
        opt.querySelector('.active-check').style.display = 'none';
      });
      
      // Add active class to clicked option
      this.classList.add('active');
      this.querySelector('.active-check').style.display = 'block';
      
      // Update button display
      updateLanguage(this);
      
      // Save to localStorage
      const lang = this.getAttribute('data-lang');
      localStorage.setItem('selectedLanguage', lang);
      
      // Translate navbar and page
      if (lang === 'uz') {
        restoreNavbar();
        restoreOriginalTexts();
      } else {
        translateNavbar(lang);
        translatePage(lang);
      }
      
      // Close dropdown
      const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('currentLang'));
      if (dropdown) {
        dropdown.hide();
      }
    });
  });
  
  function updateLanguage(option) {
    const flag = option.getAttribute('data-flag');
    const text = option.getAttribute('data-text');
    
    currentFlag.src = `https://flagcdn.com/w20/${flag}.png`;
    currentFlag.alt = flag.toUpperCase();
    currentLangText.textContent = text;
  }
  
  function translateNavbar(targetLang) {
    const translations = navbarTranslations[targetLang];
    
    // Get current language by checking which translation matches
    let currentLang = 'uz';
    const firstNavLink = document.querySelector('.nav-link span');
    if (firstNavLink) {
      const currentText = firstNavLink.textContent.trim();
      // Detect current language
      if (currentText === 'Home' || currentText === 'News' || currentText === 'Results' || currentText === 'About us' || currentText === 'Enroll') {
        currentLang = 'en';
      } else if (currentText === 'Главная' || currentText === 'Новости' || currentText === 'Результаты' || currentText === 'О нас' || currentText === 'Записаться') {
        currentLang = 'ru';
      }
    }
    
    const currentTranslations = navbarTranslations[currentLang];
    
    // Translate nav links
    document.querySelectorAll('.nav-link span').forEach(span => {
      const currentText = span.textContent.trim();
      
      // Find the Uzbek key for current text
      let uzbekKey = null;
      for (const [uzText, translation] of Object.entries(currentTranslations)) {
        if (translation === currentText) {
          uzbekKey = uzText;
          break;
        }
      }
      
      // If found, translate to target language
      if (uzbekKey && translations[uzbekKey]) {
        span.textContent = translations[uzbekKey];
      }
    });
    
    // Translate CTA button
    const ctaSpan = document.querySelector('.btn-cta span');
    if (ctaSpan) {
      const currentText = ctaSpan.textContent.trim();
      
      // Find the Uzbek key for current text
      let uzbekKey = null;
      for (const [uzText, translation] of Object.entries(currentTranslations)) {
        if (translation === currentText) {
          uzbekKey = uzText;
          break;
        }
      }
      
      // If found, translate to target language
      if (uzbekKey && translations[uzbekKey]) {
        ctaSpan.textContent = translations[uzbekKey];
      }
    }
    
    // Restore icons
    restoreIcons();
  }
  
  function restoreNavbar() {
    const translations = navbarTranslations['uz'];
    
    // Restore nav links
    document.querySelectorAll('.nav-link span').forEach(span => {
      const currentText = span.textContent.trim();
      // Find original Uzbek text
      for (const [uzText, translation] of Object.entries(translations)) {
        if (currentText === navbarTranslations['ru'][uzText] || 
            currentText === navbarTranslations['en'][uzText] ||
            currentText === uzText) {
          span.textContent = uzText;
          break;
        }
      }
    });
    
    // Restore CTA button
    const ctaSpan = document.querySelector('.btn-cta span');
    if (ctaSpan) {
      ctaSpan.textContent = 'Qabulga yozilish';
    }
    
    // Restore icons
    restoreIcons();
  }
  
  function restoreOriginalTexts() {
    translatableElements.forEach((el, index) => {
      if (originalTexts.has(index)) {
        el.textContent = originalTexts.get(index);
      }
    });
    
    // Restore icons after text restoration
    restoreIcons();
  }
  
  function restoreIcons() {
    // Restore navbar icons
    document.querySelectorAll('.nav-link').forEach(link => {
      const span = link.querySelector('span');
      if (span && !link.querySelector('i')) {
        const icon = document.createElement('i');
        if (link.getAttribute('href') === './') {
          icon.className = 'bi bi-house-door';
        } else if (link.getAttribute('href') === '#news') {
          icon.className = 'bi bi-newspaper';
        } else if (link.getAttribute('href') === '#results') {
          icon.className = 'bi bi-trophy';
        } else if (link.getAttribute('href') === '#about') {
          icon.className = 'bi bi-info-circle';
        }
        link.insertBefore(icon, span);
      }
    });
    
    // Restore CTA button icon
    const ctaBtn = document.querySelector('.btn-cta');
    if (ctaBtn && !ctaBtn.querySelector('i')) {
      const icon = document.createElement('i');
      icon.className = 'bi bi-pencil-square';
      const span = ctaBtn.querySelector('span');
      if (span) {
        ctaBtn.insertBefore(icon, span);
      }
    }
  }
  
  async function translatePage(targetLang) {
    // Show loading indicator
    document.body.style.cursor = 'wait';
    
    const textsToTranslate = [];
    const elementIndexes = [];
    
    translatableElements.forEach((el, index) => {
      if (originalTexts.has(index)) {
        textsToTranslate.push(originalTexts.get(index));
        elementIndexes.push(index);
      }
    });
    
    // Translate in batches using API
    const batchSize = 10;
    for (let i = 0; i < textsToTranslate.length; i += batchSize) {
      const batch = textsToTranslate.slice(i, i + batchSize);
      const batchIndexes = elementIndexes.slice(i, i + batchSize);
      
      const translations = await Promise.all(
        batch.map(text => translateText(text, targetLang))
      );
      
      translations.forEach((translatedText, idx) => {
        const elementIndex = batchIndexes[idx];
        const element = Array.from(translatableElements)[elementIndex];
        if (element && translatedText) {
          element.textContent = translatedText;
        }
      });
      
      // Small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Restore icons after translation
    restoreIcons();
    
    document.body.style.cursor = 'default';
  }
  
  async function translateText(text, targetLang) {
    try {
      // Don't translate brand names only (allow "xususiy maktabi" to be translated)
      const skipTerms = ['math academy', 'mathacademy'];
      const lowerText = text.toLowerCase();
      
      if (skipTerms.some(term => lowerText.includes(term))) {
        return text;
      }
      
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        let translatedText = data[0][0][0];
        
        // Preserve brand names in the translated text
        if (text.includes('Math Academy')) {
          translatedText = translatedText.replace(/математическая академия|math academy|мат академия/gi, 'Math Academy');
        }
        if (text.includes('mathacademy')) {
          translatedText = translatedText.replace(/mathacademy/gi, 'mathacademy');
        }
        
        return translatedText;
      }
      
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
});



/**
 * Enhanced Navbar Scroll Effect - Throttled
 */
let scrollTimeout;
window.addEventListener('scroll', function() {
  if (scrollTimeout) return;
  
  scrollTimeout = setTimeout(() => {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    
    scrollTimeout = null;
  }, 100);
}, { passive: true });

/**
 * Active Nav Link on Scroll - Throttled
 */
let navScrollTimeout;
window.addEventListener('scroll', function() {
  if (navScrollTimeout) return;
  
  navScrollTimeout = setTimeout(() => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.menu-link .nav-link');
    
    if (!sections.length || !navLinks.length) {
      navScrollTimeout = null;
      return;
    }
    
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
      if (current === '' && link.getAttribute('href') === './') {
        link.classList.add('active');
      }
    });
    
    navScrollTimeout = null;
  }, 100);
}, { passive: true });

/**
 * Close mobile menu on link click
 */
document.querySelectorAll('.menu-link .nav-link').forEach(link => {
  link.addEventListener('click', function() {
    const navbarCollapse = document.getElementById('navbarCollapse');
    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
    
    if (bsCollapse && window.innerWidth < 992) {
      bsCollapse.hide();
    }
  });
});
