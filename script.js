document.addEventListener('DOMContentLoaded', function() {
    // -----------------------------
    // 1) Текущий год в футере
    // -----------------------------
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // -----------------------------
    // 2) Мобильное меню
    // -----------------------------
    var menuBtn = document.getElementById('menuBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- ФИЛЬТРЫ (замени текущий анонимный модуль фильтра этим блоком) ---
(function() {
    try {
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn') || []);
        var extinguisherSelect = document.getElementById('extinguisherSelect');
        var searchInput = document.getElementById('search') || document.querySelector('.search');
        var products = Array.prototype.slice.call(document.querySelectorAll('.product') || []);
        var noResultsEl = document.getElementById('noResults') || null;

        var mode = 'select';
        var activeFilter = (extinguisherSelect && extinguisherSelect.value) ?
            extinguisherSelect.value.toString().trim().toLowerCase() : 'extinguisher';

        function readProductCategory(p) {
            if (!p || !p.getAttribute) return '';
            return ((p.getAttribute('data-category') || p.getAttribute('data-filter') || '') + '').toString().trim().toLowerCase();
        }

        function readButtonCategory(btn) {
            if (!btn || !btn.getAttribute) return '';
            return (btn.getAttribute('data-filter') || btn.getAttribute('data-category') || '') .toString().trim().toLowerCase();
        }

        function resetButtonsVisual() {
            filterButtons.forEach(function(b) {
                b.classList.remove('active', 'bg-white', 'text-dark', 'font-bold', 'bg-brand-600');
                b.classList.add('bg-white/10', 'border', 'border-white/10');
            });
        }

        function activateButtonVisual(btn) {
            resetButtonsVisual();
            if (!btn) return;
            btn.classList.remove('bg-white/10', 'border', 'border-white/10');
            btn.classList.add('active', 'bg-white', 'text-dark', 'font-bold');
        }

        function setSelectActiveVisual(isActive) {
    if (!extinguisherSelect) return;
    extinguisherSelect.classList.remove(
        'bg-white', 'text-dark', 'font-bold',
        'bg-white/10', 'border', 'border-white/10'
    );

    if (isActive) {
        extinguisherSelect.classList.add('bg-white', 'text-dark', 'font-bold');
    } else {
        extinguisherSelect.classList.add('bg-white/10', 'border', 'border-white/10');
    }
}


        function optionExists(select, val) {
            if (!select) return false;
            val = (val + '');
            var opts = select.options || [];
            for (var i = 0; i < opts.length; i++) {
                if ((opts[i].value + '') === val) return true;
            }
            return false;
        }

        function findButtonByCategory(cat) {
            if (!cat) return null;
            for (var i = 0; i < filterButtons.length; i++) {
                var b = filterButtons[i];
                if (readButtonCategory(b) === cat) return b;
            }
            return null;
        }

        function applyFilter() {
            var q = (searchInput && (searchInput.value || '')).toString().trim().toLowerCase();
            var anyVisible = false;

            for (var i = 0; i < products.length; i++) {
                var p = products[i];
                var cat = readProductCategory(p);

                var name = (p.getAttribute && (p.getAttribute('data-name') || '') || '').toString().trim();
                if (!name && p.querySelector) {
                    var hh = p.querySelector('h3');
                    if (hh) name = hh.textContent || '';
                }
                name = (name || '').toString().trim().toLowerCase();

                var matchCat = false;
                if (activeFilter === 'all') {
                    // показать всё
                    matchCat = true;
                } else if (activeFilter === 'extinguisher') {
                    // "все огнетушители" -> показываем все подтипы огнетушителей
                    matchCat = ['powder', 'carbon', 'foam', 'extinguisher'].indexOf(cat) !== -1;
                } else {
                    matchCat = (cat === activeFilter);
                }

                var matchText = !q || name.indexOf(q) !== -1;
                var show = matchCat && matchText;

                if (show) {
                    p.classList.remove('hidden');
                    anyVisible = true;
                } else {
                    p.classList.add('hidden');
                }
            }

            if (noResultsEl) noResultsEl.style.display = anyVisible ? 'none' : 'block';
        }

        // Инициализация визуала
        (function initVisual() {
            var activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) {
                var btnCat = readButtonCategory(activeBtn) || activeFilter;
                // если кнопка помечена, синхронизируем activeFilter
                activeFilter = btnCat || activeFilter;
                activateButtonVisual(activeBtn);
            } else {
                // если нет активной кнопки — попробуем синхронизировать с селектом (если он есть)
                if (extinguisherSelect && extinguisherSelect.value) {
                    activeFilter = extinguisherSelect.value.toString().trim().toLowerCase();
                    var btn = findButtonByCategory(activeFilter);
                    if (btn) activateButtonVisual(btn);
                }
            }
            setSelectActiveVisual(true);
        })();

        // Клики по кнопкам
        filterButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var cat = readButtonCategory(btn) || 'all';
                mode = 'button';
                activeFilter = cat;

                activateButtonVisual(btn);

                // НЕ гасим селект — просто синхронизируем значение, только если такая опция есть.
                if (extinguisherSelect) {
                    if (optionExists(extinguisherSelect, cat)) {
                        extinguisherSelect.value = cat;
                    } else {
                        // если в селекте нет такой опции — не пишем любой "посторонний" value,
                        // чтобы селект не становился пустым:
                        // убедимся, что текущий value валиден, иначе вернём дефолт 'extinguisher' (если есть)
                        if (!optionExists(extinguisherSelect, extinguisherSelect.value)) {
                            if (optionExists(extinguisherSelect, 'extinguisher')) {
                                extinguisherSelect.value = 'extinguisher';
                            }
                        }
                    }
                }

                setSelectActiveVisual(false); // всегда активный вид
                applyFilter();
            });
        });

        // Поиск (debounce)
        if (searchInput) {
            var dbTimer = null;
            searchInput.addEventListener('input', function() {
                clearTimeout(dbTimer);
                dbTimer = setTimeout(applyFilter, 160);
            });
        }

        // События селекта
        if (extinguisherSelect) {
    extinguisherSelect.addEventListener('change', function() {
        mode = 'select';
        activeFilter = (extinguisherSelect.value || 'extinguisher').toString().trim().toLowerCase();
        var btn = findButtonByCategory(activeFilter);
        if (btn) activateButtonVisual(btn);
        else resetButtonsVisual();
        setSelectActiveVisual(true);
        applyFilter();
    });

    // дополнительный фикс: при клике на "Все огнетушители", даже если оно уже выбрано
    extinguisherSelect.addEventListener('click', function() {
        if (extinguisherSelect.value === 'extinguisher') {
            activeFilter = 'extinguisher';
            resetButtonsVisual();
            setSelectActiveVisual(true);
            applyFilter();
        }
    });

    extinguisherSelect.addEventListener('pointerdown', function() {
        mode = 'select';
        resetButtonsVisual();
        setSelectActiveVisual(true);
    });
}


        // Запускаем начальную фильтрацию
        applyFilter();
    } catch (err) {
        // чтобы один модуль не ломал остальные скрипты на странице
        console.error('Filter module error:', err);
    }
})();



    // -----------------------------
    // 4) МОДАЛКА 
    // -----------------------------
    (function() {
        var modal = document.getElementById('productModal');
        var modalContent = document.getElementById('productModalContent');
        var modalTitle = document.getElementById('modalTitle');
        var modalImage = document.getElementById('modalImage');
        var modalText = document.getElementById('modalText');
        var closeModal = document.getElementById('closeModal');

        if (!modal || !modalContent) {
            
            return;
        }

        function showModal(data) {
            modalTitle && (modalTitle.textContent = data.title || '');
            modalText && (modalText.textContent = data.text || '');
            if (modalImage) modalImage.src = data.img || '';

            modal.classList.remove('hidden');
            modal.classList.add('flex');

            requestAnimationFrame(function() {
                modalContent.classList.remove('opacity-0', 'scale-95');
                modalContent.classList.add('opacity-100', 'scale-100');
            });
        }

        function hideModal() {
            modalContent.classList.remove('opacity-100', 'scale-100');
            modalContent.classList.add('opacity-0', 'scale-95');

            setTimeout(function() {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                if (modalImage) modalImage.src = '';
            }, 220);
        }

        function findAncestor(el, cls) {
            while (el && el !== document) {
                if (el.classList && el.classList.contains(cls)) return el;
                el = el.parentNode;
            }
            return null;
        }

        var detailButtons = Array.prototype.slice.call(document.querySelectorAll('.details-btn') || []);
        detailButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var product = (btn.closest && btn.closest('.product')) || findAncestor(btn, 'product');
                var title = btn.getAttribute('data-title') || '';
                var text = btn.getAttribute('data-text') || '';
                var imgSrc = '';

                if (product) {
                    var imgEl = product.querySelector && product.querySelector('img');
                    if (imgEl && imgEl.getAttribute) imgSrc = imgEl.getAttribute('src') || '';

                    if (!title) {
                        var h = product.querySelector && product.querySelector('h3');
                        if (h) title = h.textContent || '';
                    }
                }

                showModal({ title: title, text: text, img: imgSrc });
            });
        });

        if (closeModal) closeModal.addEventListener('click', hideModal);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) hideModal();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.key === 'Esc') hideModal();
        });
    })();

    // -----------------------------
    // 5) СЛАЙДЕР 
    // -----------------------------
    (function() {
        var slider = document.getElementById('servicesWrapper');
        var prevBtn = document.getElementById('prevService');
        var nextBtn = document.getElementById('nextService');

        if (!slider || !prevBtn || !nextBtn) return;

        var currentIndex = 0;
        var cards = slider.children || [];
        var totalCards = cards.length;
        var visibleCards = 3;

        function updateSlider() {
            if (!cards.length) return;
            var cardWidth = cards[0].offsetWidth;
            slider.style.transform = 'translateX(-' + (currentIndex * cardWidth) + 'px)';
        }

        nextBtn.addEventListener('click', function() {
            if (currentIndex < totalCards - visibleCards) {
                currentIndex++;
                updateSlider();
            }
        });

        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        
        window.addEventListener('resize', updateSlider);
        updateSlider();
    })();

    // 6) Форма -> WhatsApp

    (function() {
        var orderButtons = document.querySelectorAll('.order-btn'); // кнопка в карточке
        var form = document.getElementById('leadForm');
        if (!form) return;

        var messageField = form.querySelector('[name="message"]');

        orderButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                
                var product = btn.closest('.product');
                var name = btn.getAttribute('data-name') || '';
                if (!name && product) {
                    var h = product.querySelector('h3');
                    if (h) name = h.textContent.trim();
                }

                
                if (messageField) {
                    messageField.value = name ? (name + ' — 1 шт') : '';
                }

                
                form.scrollIntoView({ behavior: 'smooth' });
            });
        });
    })();

    (function() {
        var form = document.getElementById('leadForm');
        if (!form) return;

        var phoneTarget = "77753694574"; 

         form.addEventListener('submit', function(e) {
    e.preventDefault();

    var nameInput = form.querySelector('[name="name"]');
    var phoneInput = form.querySelector('[name="phone"]');
    var messageInput = form.querySelector('[name="message"]');
    var agreeInput = form.querySelector('[name="agree"]'); 

    var name = nameInput && nameInput.value ? nameInput.value.trim() : '';
    var phone = phoneInput && phoneInput.value ? phoneInput.value.trim() : '';
    var message = messageInput && messageInput.value ? messageInput.value.trim() : '';

    if (!name || !phone) {
        alert('Пожалуйста, заполните имя и телефон.');
        return;
    }

    if (agreeInput && !agreeInput.checked) {
        alert('Пожалуйста, согласитесь с политикой обработки информации.');
        return;
    }

    var text = 'Здравствуйте! Хочу запросить счёт.\n\nИмя: ' + name +
        '\nТелефон: ' + phone +
        '\nТовар: ' + (message || '—');

    var url = 'https://wa.me/' + phoneTarget + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
});

    })();

    Array.prototype.slice.call(document.querySelectorAll('.buy-btn') || []).forEach(function(btn) {
        btn.addEventListener('click', function() {
            var title = btn.getAttribute('data-title') || btn.closest('.product')?.getAttribute('data-name') || 'Товар';
            var price = btn.getAttribute('data-price') || '';
            var phoneTarget = '77753694574';
            var text = 'Здравствуйте! Хочу заказать: ' + title + (price ? ('\nЦена: ' + price) : '');
            window.open('https://wa.me/' + phoneTarget + '?text=' + encodeURIComponent(text), '_blank');
        });
    });


}); 