// Конфигурация API
const API_BASE_URL = 'http://localhost:5000';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initDuckMessages();
    initForms();
    initSmoothScroll();
    addLoadingAnimation();
});

// ==================== ТЕМА ====================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Устанавливаем текущую тему
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Обработчик переключения темы
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// ==================== УТКА ====================
function initDuckMessages() {
    const messageBubble = document.querySelector('.message-bubble');
    if (messageBubble) {
        const messages = [
            '"Кря! Я научу тебя Python! 🐍"',
            '"Танцуй и учись! 💃"',
            '"Боты - это весело! 🎉"',
            '"Присоединяйся к уткам! 🦆"',
            '"Python + Утка = ❤️"'
        ];
        
        let currentIndex = 0;
        
        // Меняем сообщение каждые 5 секунд
        setInterval(() => {
            currentIndex = (currentIndex + 1) % messages.length;
            messageBubble.style.animation = 'none';
            void messageBubble.offsetWidth; // Перезапуск анимации
            messageBubble.textContent = messages[currentIndex];
            messageBubble.style.animation = 'messagePop 0.5s ease';
        }, 5000);
    }
}

// ==================== ФОРМЫ ====================
function initForms() {
    initRegistrationForm();
    initSupportForm();
}

// Форма регистрации
function initRegistrationForm() {
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            };
            
            // Валидация
            if (!validateRegistration(formData)) return;
            
            // Сохраняем в localStorage
            localStorage.setItem('userData', JSON.stringify(formData));
            
            // Показываем уведомление
            showNotification('Ура! Ты теперь утка! 🦆 Перенаправляем в личный кабинет...', 'success');
            
            // Перенаправляем через 2 секунды
            setTimeout(() => {
                window.location.href = 'cabinet.html';
            }, 2000);
        });
    }
}

// Форма поддержки
function initSupportForm() {
    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('supportName').value.trim(),
                email: document.getElementById('supportEmail').value.trim(),
                topic: document.getElementById('supportTopic').value,
                message: document.getElementById('supportMessage').value.trim()
            };
            
            // Валидация
            if (!validateSupport(formData)) return;
            
            // Отправляем сообщение
            await sendSupportMessage(formData);
        });
    }
}

// ==================== ВАЛИДАЦИЯ ====================
function validateRegistration(formData) {
    if (!formData.name) {
        showNotification('Пожалуйста, введите ваше имя', 'error');
        return false;
    }
    
    if (!isValidEmail(formData.email)) {
        showNotification('Пожалуйста, введите корректный email', 'error');
        return false;
    }
    
    if (formData.password.length < 6) {
        showNotification('Пароль должен содержать не менее 6 символов', 'error');
        return false;
    }
    
    return true;
}

function validateSupport(formData) {
    if (!formData.name) {
        showNotification('Пожалуйста, введите ваше имя', 'error');
        return false;
    }
    
    if (!isValidEmail(formData.email)) {
        showNotification('Пожалуйста, введите корректный email', 'error');
        return false;
    }
    
    if (!formData.topic) {
        showNotification('Пожалуйста, выберите тему вопроса', 'error');
        return false;
    }
    
    if (formData.message.length < 10) {
        showNotification('Сообщение должно содержать не менее 10 символов', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== API ФУНКЦИИ ====================
async function sendSupportMessage(formData) {
    const submitBtn = document.querySelector('#supportForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Показываем загрузку
    submitBtn.innerHTML = '🦆 Отправляем...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('Сообщение отправлено утке! 🦆 Ответим в течение 2 часов.', 'success');
            document.getElementById('supportForm').reset();
        } else {
            showNotification('Ошибка при отправке: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        showNotification('Ошибка сети. Проверьте подключение к интернету.', 'error');
    } finally {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== УТИЛИТЫ ====================
function initSmoothScroll() {
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function addLoadingAnimation() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Иконка в зависимости от типа
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Стили уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Звуки утки (опционально)
function addDuckSounds() {
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            // Можно добавить звук крякания
            console.log('Кря! 🦆');
        });
    });
}

// Инициализируем звуки
addDuckSounds();