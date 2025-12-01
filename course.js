// Инициализация страницы курса
document.addEventListener('DOMContentLoaded', function() {
    initCourseInteractions();
    initSmoothScrolling();
    checkUserAccess();
});

// ==================== ВЗАИМОДЕЙСТВИЯ КУРСА ====================
function initCourseInteractions() {
    // Обработчики для уроков
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Не срабатывает при клике на кнопки
            if (e.target.tagName === 'BUTTON') return;
            
            const lessonNumber = this.getAttribute('data-lesson');
            const isLocked = this.querySelector('.lesson-status').textContent === '🔒';
            
            if (isLocked) {
                showLockedLesson(lessonNumber);
            } else {
                startLesson(lessonNumber);
            }
        });
    });

    // Анимация появления уроков
    animateLessons();
}

function animateLessons() {
    const lessons = document.querySelectorAll('.lesson-item');
    lessons.forEach((lesson, index) => {
        lesson.style.animationDelay = `${index * 0.1}s`;
        lesson.classList.add('fade-in');
    });
}

// ==================== ФУНКЦИИ УРОКОВ ====================
function startLesson(lessonNumber) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData) {
        showNotification('Сначала нужно зарегистрироваться! 🦆', 'error');
        setTimeout(() => {
            window.location.href = 'index.html#register';
        }, 2000);
        return;
    }

    // Показываем сообщение о начале урока
    const lessonTitles = {
        1: 'Знакомство с Python и уткой',
        2: 'Типы данных и переменные',
        3: 'Условные операторы',
        4: 'Циклы и итерации',
        5: 'Функции'
    };

    const title = lessonTitles[lessonNumber] || `Урок ${lessonNumber}`;
    
    showNotification(`Начинаем урок: "${title}"! 🎉`, 'success');
    
    // В реальном приложении здесь будет переход на страницу урока
    setTimeout(() => {
        showNotification('Урок откроется после старта курса 15 января 2026 года!', 'info');
    }, 2000);
}

function showLockedLesson(lessonNumber) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData) {
        showNotification('Сначала нужно зарегистрироваться! 🦆', 'error');
        setTimeout(() => {
            window.location.href = 'index.html#register';
        }, 2000);
        return;
    }

    showNotification(
        `Этот урок откроется после старта курса 15 января 2026 года! 🗓️\n\nУтка уже готовит для тебя крутые материалы! 🦆`,
        'info'
    );
}

// ==================== ПРОВЕРКА ДОСТУПА ====================
function checkUserAccess() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData) {
        // Показываем призыв к регистрации
        const notice = document.querySelector('.course-notice');
        if (notice) {
            notice.style.background = 'rgba(255, 107, 53, 0.1)';
            notice.style.border = '2px solid var(--primary)';
        }
    }
}

// ==================== ПЛАВНАЯ ПРОКРУТКА ====================
function initSmoothScrolling() {
    // Плавная прокрутка к якорям
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerHeight = 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== СТИЛИ ДЛЯ СТРАНИЦЫ КУРСА ====================
const courseStyles = `
.course-page {
    padding: 120px 0 50px;
}

.course-header {
    text-align: center;
    margin-bottom: 3rem;
}

.course-header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.status-badge {
    background: var(--gradient);
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    display: inline-block;
    margin: 1rem 0;
}

.duck-message {
    color: var(--primary);
    font-weight: 600;
    margin-top: 0.5rem;
}

.course-description {
    margin-bottom: 3rem;
}

.description-card {
    background: var(--bg-card);
    padding: 2rem;
    border-radius: 20px;
    border: 1px solid var(--border);
    text-align: center;
}

.description-card h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.description-card p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

.duck-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.duck-feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 15px;
    transition: transform 0.3s ease;
}

.duck-feature:hover {
    transform: translateY(-3px);
}

.feature-emoji {
    font-size: 2rem;
}

.module-section {
    margin-bottom: 4rem;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.8s ease forwards;
}

.module-section:nth-child(1) { animation-delay: 0.1s; }
.module-section:nth-child(2) { animation-delay: 0.3s; }

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.module-header h2 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.module-subtitle {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.lessons-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.lesson-group h3 {
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-size: 1.3rem;
    padding-left: 1rem;
    border-left: 4px solid var(--primary);
}

.lessons-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.lesson-item {
    background: var(--bg-card);
    padding: 1.5rem;
    border-radius: 15px;
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
    transform: translateY(20px);
}

.lesson-item.fade-in {
    opacity: 1;
    transform: translateY(0);
    transition: all 0.5s ease;
}

.lesson-item:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
}

.lesson-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--gradient);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.lesson-item:hover::before {
    transform: scaleX(1);
}

.lesson-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.lesson-number {
    font-weight: 600;
    color: var(--primary);
}

.lesson-status {
    font-size: 1.2rem;
}

.lesson-item h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.lesson-item p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    line-height: 1.5;
    font-size: 0.9rem;
}

.lesson-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.lesson-meta span {
    background: rgba(255, 107, 53, 0.1);
    padding: 0.3rem 0.6rem;
    border-radius: 10px;
}

.lesson-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.lesson-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.lesson-badge.free {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
}

.lesson-badge.pro {
    background: rgba(255, 107, 53, 0.2);
    color: var(--primary);
}

.course-notice {
    background: var(--bg-card);
    padding: 3rem;
    border-radius: 20px;
    border: 1px solid var(--border);
    text-align: center;
    margin-top: 3rem;
}

.notice-content h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.notice-content p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    line-height: 1.6;
    font-size: 1.1rem;
}

/* Адаптивность */
@media (max-width: 768px) {
    .course-header h1 {
        font-size: 2rem;
    }
    
    .lessons-grid {
        grid-template-columns: 1fr;
    }
    
    .lesson-actions {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .duck-features {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .module-header h2 {
        font-size: 2rem;
    }
}

/* Стили для заблокированных уроков */
.lesson-item[data-locked="true"] {
    opacity: 0.7;
    position: relative;
}

.lesson-item[data-locked="true"]::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
}
`;

// Добавляем стили в страницу
const styleSheet = document.createElement('style');
styleSheet.textContent = courseStyles;
document.head.appendChild(styleSheet);

// Функция уведомлений (если не загружен script.js)
if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}