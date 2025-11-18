(function () {
  var root = document.documentElement;
  var storageKey = 'mdweb-color-scheme';
  var toggle;
  var toggleMobile;
  var labelNode;

  function readStored () {
    try {
      return localStorage.getItem(storageKey) || 'light';
    } catch (error) {
      return 'light';
    }
  }

  function writeStored (value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch (error) { }
  }

  function applyTheme (theme) {
    root.dataset.themeChoice = theme;
    root.dataset.theme = theme;

    // 更新切换按钮状态
    if (toggle) {
      toggle.checked = theme === 'dark';
      toggle.setAttribute('aria-label', '切换主题，当前：' + (theme === 'light' ? '浅色模式' : '深色模式'));
    }
    if (toggleMobile) {
      toggleMobile.checked = theme === 'dark';
      toggleMobile.setAttribute('aria-label', '切换主题，当前：' + (theme === 'light' ? '浅色模式' : '深色模式'));
    }
    if (labelNode) {
      labelNode.textContent = theme === 'light' ? '浅色模式' : '深色模式';
    }

    // 强制更新所有主题切换按钮的状态
    var allToggles = document.querySelectorAll('[data-theme-toggle], [data-theme-toggle-mobile]');
    allToggles.forEach(function (toggleElement) {
      toggleElement.checked = theme === 'dark';
    });
  }

  function toggleTheme () {
    var currentTheme = root.dataset.theme || readStored();
    var newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    writeStored(newTheme);
  }

  // 将toggleTheme函数暴露到全局作用域，供onclick使用
  window.toggleTheme = toggleTheme;

  // 返回顶部功能
  function initBackToTop () {
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
      // 滚动检测
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTopButton.classList.add('visible');
        } else {
          backToTopButton.classList.remove('visible');
        }
      });

      // 返回顶部点击事件
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // 移动端抽屉菜单功能
  function initMobileDrawer () {
    var menuButton = document.getElementById('mobile-menu-button');
    var drawer = document.getElementById('mobile-drawer');
    var overlay = document.getElementById('mobile-drawer-overlay');
    var closeButton = document.getElementById('mobile-drawer-close');

    // 动态调整抽屉高度，解决移动端浏览器地址栏问题
    function adjustDrawerHeight () {
      if (drawer) {
        // 使用window.innerHeight获取实际可视区域高度
        var actualHeight = window.innerHeight;
        drawer.style.height = actualHeight + 'px';
        drawer.style.maxHeight = actualHeight + 'px';
      }
    }

    function openDrawer () {
      // 打开抽屉前先调整高度
      adjustDrawerHeight();

      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      // 抽屉打开时重新绑定主题切换事件
      setTimeout(function () {
        bindThemeEvents();
      }, 50);
    }

    function closeDrawer () {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (menuButton) {
      menuButton.addEventListener('click', openDrawer);
    }

    if (closeButton) {
      closeButton.addEventListener('click', closeDrawer);
    }

    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }

    // 点击抽屉内的链接时关闭抽屉
    var drawerLinks = drawer.querySelectorAll('.nav-link, .tag-chip');
    drawerLinks.forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    // 监听窗口大小变化，动态调整抽屉高度
    window.addEventListener('resize', function () {
      if (drawer && drawer.classList.contains('open')) {
        adjustDrawerHeight();
      }
    });

    // 页面加载时初始化抽屉高度
    setTimeout(function () {
      adjustDrawerHeight();
    }, 100);
  }

  function bindThemeEvents () {
    // 重新查找元素（防止动态创建的元素）
    toggle = document.querySelector('[data-theme-toggle]');
    toggleMobile = document.querySelector('[data-theme-toggle-mobile]');
    labelNode = document.querySelector('[data-theme-label]');

    // 绑定切换事件 - 只绑定change事件，避免重复触发
    if (toggle && !toggle.hasAttribute('data-event-bound')) {
      toggle.addEventListener('change', function () {
        toggleTheme();
      });
      toggle.setAttribute('data-event-bound', 'true');
    }

    if (toggleMobile && !toggleMobile.hasAttribute('data-event-bound')) {
      toggleMobile.addEventListener('change', function () {
        toggleTheme();
      });
      toggleMobile.setAttribute('data-event-bound', 'true');
    }
  }

  // 简单的导航区域显示控制（用于服务器端渲染的导航）
  function initPostNavigation () {
    const navigation = document.querySelector('.post-navigation');
    if (!navigation) return;

    const hasPrev = navigation.querySelector('.prev-link');
    const hasNext = navigation.querySelector('.next-link');
    // 如果只有一个导航链接，设置整行显示
    if ((hasPrev && !hasNext) || (!hasPrev && hasNext)) {
      navigation.style.gridTemplateColumns = '1fr';
    }
  }

  // 智能文章卡片点击事件处理 
  function initPostCardClick () {
    var postCards = document.querySelectorAll('.post-card');

    // 检测是否为移动设备
    var isMobile = window.innerWidth <= 768;
    var touchStartTime = 0;
    var touchStartX = 0;
    var touchStartY = 0;

    postCards.forEach(function (card) {
      // PC端点击事件
      card.addEventListener('click', function (e) {
        // 检查点击的是否是链接或其他可点击元素
        var target = e.target;
        var isClickableElement = target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.closest('a') ||
          target.closest('button');

        // 如果点击的是可点击元素，不执行跳转
        if (isClickableElement) {
          return;
        }

        // 获取文章slug并跳转
        var slug = this.getAttribute('data-post-slug');
        if (slug) {
          window.location.href = '/' + slug + '.html';
        }
      });

      // 移动端触摸事件
      if (isMobile) {
        card.addEventListener('touchstart', function (e) {
          touchStartTime = Date.now();
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          this.classList.add('touch-active');
        }, { passive: true });

        card.addEventListener('touchend', function (e) {
          var touchEndTime = Date.now();
          var touchEndX = e.changedTouches[0].clientX;
          var touchEndY = e.changedTouches[0].clientY;

          // 计算触摸距离和时间差
          var deltaX = Math.abs(touchEndX - touchStartX);
          var deltaY = Math.abs(touchEndY - touchStartY);
          var deltaTime = touchEndTime - touchStartTime;

          // 检查触摸的是否是链接或其他可点击元素
          var target = e.target;
          var isClickableElement = target.tagName === 'A' ||
            target.tagName === 'BUTTON' ||
            target.closest('a') ||
            target.closest('button');

          // 如果触摸的是可点击元素，不执行跳转
          if (isClickableElement) {
            this.classList.remove('touch-active');
            return;
          }

          // 如果是快速点击且移动距离小，则跳转
          if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
            var slug = this.getAttribute('data-post-slug');
            if (slug) {
              window.location.href = '/' + slug + '.html';
            }
          }

          this.classList.remove('touch-active');
        });

        card.addEventListener('touchcancel', function () {
          this.classList.remove('touch-active');
        });
      }
    });

    // 监听窗口大小变化，动态调整事件处理
    window.addEventListener('resize', function () {
      var newIsMobile = window.innerWidth <= 768;
      if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        // 重新初始化卡片事件
        initPostCardClick();
      }
    });
  }

  // 监听窗口大小变化，重新绑定事件
  function handleResize () {
    initPostCardClick();
  }

  // 页面加载完成后初始化
  function init () {
    // 应用存储的主题
    applyTheme(readStored());

    // 绑定主题切换事件
    bindThemeEvents();

    // 初始化返回顶部功能
    initBackToTop();

    // 初始化移动端抽屉菜单
    initMobileDrawer();

    // 初始化文章导航
    initPostNavigation();

    // 初始化文章卡片点击事件
    initPostCardClick();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  }

  // DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);

  try {
    const viewer = new Viewer(document.getElementById("post-content"), {
      toolbar: true, // 显示工具栏
      title: true,   // 显示标题
      navbar: true,  // 显示缩略图导航
      movable: true, // 允许拖拽
      zoomable: true,// 允许缩放
      rotatable: true,// 允许旋转
      scalable: true, // 允许翻转
      transition: true,
    });
  } catch (error) { }

}());
