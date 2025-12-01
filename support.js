// Конфигурация API
const API_BASE_URL = 'http://localhost:5000';

// Инициализация страницы поддержки
document.addEventListener('DOMContentLoaded', function() {
    initSupportForm();
    initFAQInteractions();
    loadUserDataToForm();
    initTheme();
    initDuckAnimations();
});

// ==================== ТЕМА ====================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ==================== АНИМАЦИИ УТКИ ====================
function initDuckAnimations() {
    // Анимация утки в поддержке
    const duckAvatar = document.querySelector('.duck-avatar');
    if (duckAvatar) {
        setInterval(() => {
            duckAvatar.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                duckAvatar.style.transform = 'translateY(0px)';
            }, 500);
        }, 2000);
    }
}

// ==================== ФОРМА ПОДДЕРЖКИ ====================
function initSupportForm() {
    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Получаем данные из формы
            const formData = {
                name: document.getElementById('supportName').value.trim(),
                email: document.getElementById('supportEmail').value.trim(),
                topic: document.getElementById('supportTopic').value,
                message: document.getElementById('supportMessage').value.trim(),
                urgent: document.getElementById('urgent').checked
            };
            
            // Валидация
            if (!validateSupportForm(formData)) return;
            
            // Отправляем сообщение
            await sendSupportMessage(formData);
        });
    }
}

function validateSupportForm(formData) {
    // Проверка имени
    if (!formData.name || formData.name.length < 2) {
        showNotification('Имя должно содержать не менее 2 символов', 'error');
        document.getElementById('supportName').focus();
        return false;
    }
    
    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        showNotification('Пожалуйста, введите корректный email', 'error');
        document.getElementById('supportEmail').focus();
        return false;
    }
    
    // Проверка темы
    if (!formData.topic) {
        showNotification('Пожалуйста, выберите тему вопроса', 'error');
        document.getElementById('supportTopic').focus();
        return false;
    }
    
    // Проверка сообщения
    if (!formData.message || formData.message.length < 10) {
        showNotification('Сообщение должно содержать не менее 10 символов', 'error');
        document.getElementById('supportMessage').focus();
        return false;
    }
    
    if (formData.message.length > 1000) {
        showNotification('Сообщение слишком длинное (максимум 1000 символов)', 'error');
        document.getElementById('supportMessage').focus();
        return false;
    }
    
    return true;
}

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
            showNotification('🎉 Сообщение отправлено утке! Ответим в течение 24 часов.', 'success');
            
            // Очищаем форму
            document.getElementById('supportForm').reset();
            
            // Перенаправляем в личный кабинет через 2 секунды
            setTimeout(() => {
                window.location.href = 'cabinet.html';
            }, 2000);
            
        } else {
            showNotification('❌ Ошибка при отправке: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        showNotification('❌ Ошибка сети. Проверьте подключение к интернету.', 'error');
    } finally {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ====================
function loadUserDataToForm() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData) {
        // Автозаполняем поля формы
        const nameInput = document.getElementById('supportName');
        const emailInput = document.getElementById('supportEmail');
        
        if (nameInput && userData.name) {
            nameInput.value = userData.name;
        }
        
        if (emailInput && userData.email) {
            emailInput.value = userData.email;
        }
    }
}

// ==================== FAQ ВЗАИМОДЕЙСТВИЯ ====================
function initFAQInteractions() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            // Переключаем видимость ответа
            const answer = this.querySelector('p');
            if (answer.style.display === 'none' || !answer.style.display) {
                answer.style.display = 'block';
                this.style.background = 'var(--bg-secondary)';
            } else {
                answer.style.display = 'none';
                this.style.background = 'var(--bg-card)';
            }
        });
    });
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

console.log('Support.js загружен и готов к работе! 🦆');