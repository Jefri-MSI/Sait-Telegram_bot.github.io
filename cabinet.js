// Загрузка данных при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
    updateProgress();
    updateCountdown();
    loadSupportResponses(); // Загружаем ответы поддержки
    startAutoRefresh(); // Запускаем автообновление
});

// ==================== ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ====================
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData) {
        // Заполняем данные пользователя
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userEmail').textContent = userData.email;
        
        // Генерируем инициалы для аватара
        const initials = generateInitials(userData.name);
        document.getElementById('userInitials').textContent = initials;
        
        // Загружаем ответы поддержки после загрузки данных пользователя
        setTimeout(() => {
            loadSupportResponses();
        }, 1000);
    } else {
        // Если нет данных, перенаправляем на главную
        window.location.href = 'index.html';
    }
}

function generateInitials(name) {
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
function setupEventListeners() {
    // Выход из аккаунта
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Обработчики для кнопок материалов
    document.querySelectorAll('.material-item .btn').forEach(button => {
        button.addEventListener('click', function() {
            const materialTitle = this.closest('.material-item').querySelector('h4').textContent;
            showNotification(`Материал "${materialTitle}" скоро будет доступен!`, 'info');
        });
    });

    // Кнопка вступления в чат
    const chatBtn = document.querySelector('.community-card .btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            showNotification('Ссылка на Telegram-чат скоро будет отправлена на вашу почту!', 'info');
        });
    }
}

function logout() {
    if (confirm('Точно хотите выйти из аккаунта?')) {
        localStorage.removeItem('userData');
        showNotification('Вы вышли из аккаунта. Возвращайтесь скорее! 🦆', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// ==================== ПРОГРЕСС ОБУЧЕНИЯ ====================
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const duckMessage = document.getElementById('duckMessage');
    
    if (!progressFill || !progressText || !duckMessage) return;
    
    // Для демонстрации - начальный прогресс
    const progress = 0;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = getProgressText(progress);
    duckMessage.textContent = getDuckMessage(progress);
}

function getProgressText(progress) {
    if (progress === 0) return 'Курс еще не начался';
    if (progress < 30) return 'Начало положено!';
    if (progress < 70) return 'Отличный прогресс!';
    return 'Почти закончили!';
}

function getDuckMessage(progress) {
    const messages = [
        '"Ждем старта курса! Скоро начнем танцевать с кодом!"',
        '"Отличное начало! Продолжаем учиться! 🎉"',
        '"Уже полпути прошли! Так держать! 💃"',
        '"Почти у цели! Осталось совсем немного! 🚀"'
    ];
    
    if (progress === 0) return messages[0];
    if (progress < 30) return messages[1];
    if (progress < 70) return messages[2];
    return messages[3];
}

// ==================== ОБРАТНЫЙ ОТСЧЕТ ====================
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const courseStart = new Date('2026-01-15');
    const now = new Date();
    
    if (now < courseStart) {
        const diff = courseStart - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        countdownElement.textContent = `Осталось: ${days} дней ${hours} часов`;
        
        // Обновляем каждую минуту
        setTimeout(updateCountdown, 60000);
    } else {
        countdownElement.textContent = 'Курс начался!';
        const statusCard = document.querySelector('.status-card h3');
        const statusIcon = document.querySelector('.status-icon');
        if (statusCard) statusCard.textContent = 'Статус: Курс активен';
        if (statusIcon) statusIcon.textContent = '🎉';
    }
}

// ==================== ОТВЕТЫ ПОДДЕРЖКИ ====================
let currentMessages = []; // Храним текущие сообщения
let refreshInterval = null; // Интервал автообновления

function loadSupportResponses() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData || !userData.email) {
        const container = document.getElementById('supportResponses');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>Войдите в систему для просмотра ответов</p>
                </div>
            `;
        }
        return;
    }

    console.log('🔄 Загрузка ответов для email:', userData.email);

    // Используем правильный endpoint
    fetch(`http://localhost:5000/api/support/user/messages?email=${encodeURIComponent(userData.email)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📨 Получены данные:', data);
            if (data.success) {
                // Сравниваем с предыдущими сообщениями
                const newMessages = data.messages;
                const hasNewResponses = checkForNewResponses(currentMessages, newMessages);
                
                currentMessages = newMessages; // Обновляем текущие сообщения
                
                displaySupportResponses(currentMessages);
                updateSupportStats(currentMessages);
                
                if (hasNewResponses) {
                    showNotification('🎉 Появились новые ответы от утки!', 'success');
                    playNewResponseSound();
                }
            } else {
                showNotification('Ошибка загрузки ответов: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('❌ Ошибка загрузки ответов:', error);
            showNotification('Ошибка загрузки ответов', 'error');
        });
}

function checkForNewResponses(oldMessages, newMessages) {
    if (!oldMessages || oldMessages.length === 0) return false;
    
    let hasNew = false;
    
    newMessages.forEach(newMsg => {
        const oldMsg = oldMessages.find(msg => msg.id === newMsg.id);
        if (oldMsg && !oldMsg.has_response && newMsg.has_response) {
            hasNew = true;
            console.log(`🎯 Новый ответ на сообщение #${newMsg.id}`);
        }
    });
    
    return hasNew;
}

function displaySupportResponses(messages) {
    const container = document.getElementById('supportResponses');
    if (!container) return;
    
    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <p>У вас пока нет обращений в поддержку</p>
                <a href="support.html" class="btn btn-primary small">Задать вопрос</a>
            </div>
        `;
        return;
    }

    console.log('📝 Отображение сообщений:', messages.length);

    container.innerHTML = messages.map(message => `
        <div class="support-response-item ${message.has_response ? 'has-response' : 'no-response'}" id="message-${message.id}">
            <div class="response-header">
                <div class="response-meta">
                    <span class="response-topic">${message.topic}</span>
                    <span class="response-date">${formatDate(message.created_at)}</span>
                </div>
                <div class="response-status ${message.status}">
                    ${getStatusText(message.status)}
                    ${message.urgent ? ' 🚨' : ''}
                </div>
            </div>
            
            <div class="user-message">
                <strong>Ваш вопрос:</strong>
                <p>${message.message}</p>
            </div>
            
            ${message.has_response ? `
                <div class="admin-response">
                    <div class="response-header">
                        <strong>🦆 Ответ утки:</strong>
                        <span class="response-date">${formatDate(message.responded_at)}</span>
                    </div>
                    <p>${message.admin_response}</p>
                </div>
            ` : `
                <div class="waiting-response" id="waiting-${message.id}">
                    <span class="waiting-icon">⏳</span>
                    <span>Ожидаем ответа от утки...</span>
                    <div class="waiting-animation">
                        <div class="dot-flashing"></div>
                    </div>
                </div>
            `}
            
            <div class="response-actions">
                <span class="message-id">ID: #${message.id}</span>
                <div class="action-buttons">
                    ${!message.has_response ? `
                        <button class="btn btn-outline small" onclick="checkSingleResponse(${message.id})">
                            🔄 Проверить
                        </button>
                    ` : `
                        <button class="btn btn-success small" onclick="markAsRead(${message.id})">
                            ✅ Прочитано
                        </button>
                    `}
                    <button class="btn btn-outline small" onclick="refreshSingleMessage(${message.id})">
                        🔍 Подробнее
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function checkSingleResponse(messageId) {
    console.log(`🔍 Проверка ответа для сообщения #${messageId}`);
    
    showNotification(`Проверяем ответ на сообщение #${messageId}...`, 'info');
    
    // Показываем анимацию загрузки
    const waitingElement = document.getElementById(`waiting-${messageId}`);
    if (waitingElement) {
        waitingElement.innerHTML = `
            <span class="waiting-icon">🔄</span>
            <span>Проверяем ответ...</span>
            <div class="waiting-animation">
                <div class="dot-flashing"></div>
            </div>
        `;
    }
    
    // Используем правильный endpoint для проверки
    fetch(`http://localhost:5000/api/support/response/${messageId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.has_response) {
                showNotification(`🎉 Получен ответ на сообщение #${messageId}!`, 'success');
                
                // Обновляем конкретное сообщение
                refreshSingleMessage(messageId);
                
            } else {
                showNotification(`Ответа на сообщение #${messageId} пока нет`, 'info');
                
                // Возвращаем обычное состояние
                if (waitingElement) {
                    waitingElement.innerHTML = `
                        <span class="waiting-icon">⏳</span>
                        <span>Ожидаем ответа от утки...</span>
                        <div class="waiting-animation">
                            <div class="dot-flashing"></div>
                        </div>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Ошибка проверки ответа:', error);
            showNotification('Ошибка проверки ответа', 'error');
        });
}

function refreshSingleMessage(messageId) {
    console.log(`🔄 Обновление сообщения #${messageId}`);
    
    // Загружаем свежие данные для конкретного сообщения
    fetch(`http://localhost:5000/api/support/response/${messageId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем сообщение в текущем списке
                const messageIndex = currentMessages.findIndex(msg => msg.id === messageId);
                if (messageIndex !== -1) {
                    currentMessages[messageIndex] = {
                        ...currentMessages[messageIndex],
                        admin_response: data.admin_response,
                        responded_at: data.responded_at,
                        status: data.status,
                        has_response: data.has_response
                    };
                    
                    // Перерисовываем сообщение
                    displaySupportResponses(currentMessages);
                    
                    if (data.has_response) {
                        showNotification(`✅ Сообщение #${messageId} обновлено`, 'success');
                    }
                }
            }
        })
        .catch(error => {
            console.error('Ошибка обновления сообщения:', error);
        });
}

function updateSupportStats(messages) {
    const totalElement = document.getElementById('totalRequests');
    const answeredElement = document.getElementById('answeredRequests');
    const waitingElement = document.getElementById('waitingRequests');
    
    if (totalElement && answeredElement) {
        const total = messages.length;
        const answered = messages.filter(msg => msg.has_response).length;
        const waiting = total - answered;
        
        totalElement.textContent = total;
        answeredElement.textContent = answered;
        if (waitingElement) {
            waitingElement.textContent = waiting;
        }
    }
}

function getStatusText(status) {
    const statusMap = {
        'new': '🆕 Новый',
        'answered': '✅ Отвечен',
        'in_progress': '🔄 В работе'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function markAsRead(messageId) {
    console.log(`✅ Отмечаем сообщение #${messageId} как прочитанное`);
    showNotification(`Сообщение #${messageId} отмечено как прочитанное`, 'success');
}

// Автоматическая проверка новых ответов
function startAutoRefresh() {
    // Останавливаем предыдущий интервал если есть
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Проверяем каждые 30 секунд
    refreshInterval = setInterval(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.email) {
            console.log('🔄 Автообновление ответов...');
            loadSupportResponses();
        }
    }, 30000); // 30 секунд
    
    console.log('🚀 Автообновление ответов запущено (каждые 30 секунд)');
}

function refreshSupportResponses() {
    showNotification('🔄 Принудительное обновление ответов...', 'info');
    loadSupportResponses();
}

function playNewResponseSound() {
    // Простой звук уведомления
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Аудио контекст не поддерживается');
    }
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

// ==================== СТИЛИ ДЛЯ ЛИЧНОГО КАБИНЕТА ====================
const cabinetStyles = `
.cabinet {
    padding: 120px 0 50px;
    min-height: 100vh;
}

.cabinet-header {
    text-align: center;
    margin-bottom: 3rem;
}

.cabinet-header h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    background: var(--bg-card);
    padding: 2rem;
    border-radius: 20px;
    border: 1px solid var(--border);
    max-width: 500px;
    margin: 0 auto;
}

.user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
}

.user-details {
    text-align: left;
}

.user-details h3 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.user-details p {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.level-badge {
    background: var(--gradient);
    color: white;
    padding: 0.3rem 1rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
}

.cabinet-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.progress-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.progress-card, .status-card, .materials-card, .community-card, .support-responses-card {
    background: var(--bg-card);
    padding: 2rem;
    border-radius: 20px;
    border: 1px solid var(--border);
    transition: all 0.3s ease;
}

.progress-card:hover, .status-card:hover, .materials-card:hover, .community-card:hover, .support-responses-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
}

.progress-bar {
    width: 100%;
    height: 10px;
    background: var(--bg-tertiary);
    border-radius: 10px;
    margin: 1rem 0;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--gradient);
    border-radius: 10px;
    transition: width 0.5s ease;
}

.progress-text {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.duck-motivation {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 15px;
    border-left: 4px solid var(--primary);
}

.duck-mini {
    font-size: 2rem;
    animation: duckDance 2s ease-in-out infinite;
}

.status-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.duck-countdown {
    color: var(--primary);
    font-weight: 600;
    margin: 1rem 0;
}

.materials-list {
    list-style: none;
}

.material-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border);
}

.material-item:last-child {
    border-bottom: none;
}

.material-icon {
    font-size: 1.5rem;
}

.material-info {
    flex: 1;
}

.material-info h4 {
    margin-bottom: 0.3rem;
    color: var(--text-primary);
}

.material-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.btn.small {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
}

.community-stats {
    display: flex;
    justify-content: space-around;
    margin: 1.5rem 0;
}

.community-stat {
    text-align: center;
}

.community-stat .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.community-stat .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
}

/* Стили для ответов поддержки */
.support-responses-card {
    background: var(--bg-card);
    padding: 2rem;
    border-radius: 20px;
    border: 1px solid var(--border);
    margin-top: 2rem;
}

.responses-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.responses-stats {
    display: flex;
    gap: 2rem;
}

.responses-stats .stat {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.responses-stats .stat span {
    color: var(--text-primary);
    font-weight: 600;
}

.support-response-item {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
}

.support-response-item:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
}

.support-response-item.has-response {
    border-left: 4px solid var(--primary);
}

.response-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.response-meta {
    flex: 1;
}

.response-topic {
    font-weight: 600;
    color: var(--text-primary);
    display: block;
    margin-bottom: 0.5rem;
}

.response-date {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.response-status {
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
}

.response-status.new {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
}

.response-status.answered {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
}

.response-status.in_progress {
    background: rgba(33, 150, 243, 0.2);
    color: #2196f3;
}

.user-message {
    background: rgba(255, 107, 53, 0.05);
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    border-left: 3px solid var(--primary);
}

.user-message strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: 0.5rem;
}

.user-message p {
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

.admin-response {
    background: rgba(76, 175, 80, 0.05);
    padding: 1rem;
    border-radius: 10px;
    border-left: 3px solid #4caf50;
    margin-top: 1rem;
}

.admin-response .response-header {
    margin-bottom: 0.5rem;
}

.admin-response strong {
    color: #4caf50;
}

.admin-response p {
    color: var(--text-primary);
    margin: 0;
    line-height: 1.5;
}

.waiting-response {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 193, 7, 0.05);
    border-radius: 10px;
    color: var(--text-secondary);
    margin-top: 1rem;
}

.waiting-icon {
    font-size: 1.2rem;
}

.response-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.message-id {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.no-data {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
}

.no-data p {
    margin-bottom: 1rem;
}

/* Анимации для ответов поддержки */
.waiting-animation {
    margin-left: 10px;
    display: inline-block;
}

.dot-flashing {
    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: var(--primary);
    color: var(--primary);
    animation: dotFlashing 1s infinite linear alternate;
    animation-delay: 0.5s;
}

.dot-flashing::before, .dot-flashing::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
}

.dot-flashing::before {
    left: -15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: var(--primary);
    color: var(--primary);
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 0s;
}

.dot-flashing::after {
    left: 15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: var(--primary);
    color: var(--primary);
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 1s;
}

@keyframes dotFlashing {
    0% {
        background-color: var(--primary);
        opacity: 0.3;
    }
    50%, 100% {
        background-color: var(--primary);
        opacity: 1;
    }
}

/* Анимация появления нового ответа */
@keyframes newResponse {
    0% {
        background-color: rgba(76, 175, 80, 0.1);
        transform: scale(0.95);
    }
    50% {
        background-color: rgba(76, 175, 80, 0.3);
        transform: scale(1.02);
    }
    100% {
        background-color: rgba(76, 175, 80, 0.1);
        transform: scale(1);
    }
}

.support-response-item.has-response.new-response {
    animation: newResponse 2s ease-in-out;
}

/* Стили для кнопок действий */
.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-success {
    background: #4CAF50;
    color: white;
    border: none;
}

.btn-success:hover {
    background: #45a049;
    transform: translateY(-2px);
}

/* Анимация обновления */
@keyframes refreshing {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.refreshing {
    animation: refreshing 1s linear infinite;
}

/* Статусы сообщений */
.support-response-item.no-response {
    border-left: 4px solid #ffc107;
}

.support-response-item.has-response {
    border-left: 4px solid #4CAF50;
}

.support-response-item.in-progress {
    border-left: 4px solid #2196F3;
}

.refresh-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.auto-refresh-info {
    color: var(--text-muted);
    font-size: 0.8rem;
}

/* Адаптивность */
@media (max-width: 768px) {
    .cabinet-content {
        grid-template-columns: 1fr;
    }
    
    .user-info {
        flex-direction: column;
        text-align: center;
    }
    
    .user-details {
        text-align: center;
    }
    
    .community-stats {
        flex-direction: column;
        gap: 1rem;
    }
    
    .responses-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .responses-stats {
        justify-content: space-between;
    }
    
    .response-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .response-actions {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .response-actions button {
        width: 100%;
    }
}
`;

// Добавляем стили в страницу
const styleSheet = document.createElement('style');
styleSheet.textContent = cabinetStyles;
document.head.appendChild(styleSheet);

// Функция уведомлений (если не загружен script.js)
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        alert(message);
    }
}

console.log('Cabinet.js загружен и готов к работе! 🦆');