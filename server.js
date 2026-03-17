const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 8000;
const PROJECT_DIR = __dirname.replace('assets/api', '');


const TELEGRAM_BOT_TOKEN = '8237955977:AAFJNa1HWuf369o47hfn63grkvpL77Ilfo8';
const TELEGRAM_CHAT_ID = '@miniups5';


const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let fileName = parsedUrl.pathname;
    
    // Обработка API запроса для отправки заказа
    if (fileName === 'assets/api/send_order.php' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const orderData = JSON.parse(body);
                
                // Валидация
                if (!orderData.lastName || !orderData.firstName || !orderData.phone || !orderData.quantity || !orderData.delivery) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Не все данные заполнены' }));
                    return;
                }
                
                // Формируем сообщение для Telegram
                let message = '📦 <b>НОВИЙ ЗАКАЗ!</b>\n\n';
                message += '👤 <b>Прізвище:</b> ' + orderData.lastName + '\n';
                message += '👤 <b>Ім\'я:</b> ' + orderData.firstName + '\n';
                
                if (orderData.patronymic) {
                    message += '👤 <b>По батькові:</b> ' + orderData.patronymic + '\n';
                }
                
                message += '📱 <b>Телефон:</b> ' + orderData.phone + '\n';
                message += '📦 <b>Кількість:</b> ' + orderData.quantity + '\n';
                message += '📍 <b>Адреса доставки:</b> ' + orderData.delivery + '\n';
                message += '\n✅ Час замовлення: ' + new Date().toLocaleString('uk-UA');
                
                // Отправляем в Telegram
                const telegramUrl = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
                const postData = querystring.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                });
                
                const telegramReq = https.request(telegramUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': postData.length
                    }
                }, (telegramRes) => {
                    let responseBody = '';
                    telegramRes.on('data', chunk => {
                        responseBody += chunk;
                    });
                    
                    telegramRes.on('end', () => {
                        console.log('✅ Новий заказ відправлено в Telegram:', {
                            lastName: orderData.lastName,
                            firstName: orderData.firstName,
                            phone: orderData.phone,
                            quantity: orderData.quantity
                        });
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Заказ отправлен в Telegram!' }));
                    });
                });
                
                telegramReq.on('error', (error) => {
                    console.error('❌ Ошибка отправки в Telegram:', error.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Ошибка отправки в Telegram: ' + error.message }));
                });
                
                telegramReq.write(postData);
                telegramReq.end();
                
            } catch (error) {
                console.error('🔴 Ошибка обработки:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Ошибка обработки' }));
            }
        });
        return;
    }
    
    // Обработка просмотра заказов
    if (fileName === 'assets/api/view_orders.php' || fileName === '/orders') {
        const logsFile = path.join(PROJECT_DIR, 'assets', 'api', 'orders_log.json');
        let logs = [];
        
        if (fs.existsSync(logsFile)) {
            const fileContent = fs.readFileSync(logsFile, 'utf8');
            logs = JSON.parse(fileContent || '[]');
        }
        
        // HTML для просмотра заказов
        let html = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Переглад заказів</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #ff4757;
            text-decoration: none;
            font-weight: 600;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .order-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #ff4757;
        }
        .order-card h3 {
            color: #ff4757;
            margin-bottom: 15px;
        }
        .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            font-size: 15px;
        }
        .no-orders {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        .timestamp {
            color: #999;
            font-size: 12px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← На головну</a>
        <h1>📋 Переглад заказів</h1>`;
        
        if (logs.length === 0) {
            html += '<div class="no-orders">Закази ще не були відправлені</div>';
        } else {
            logs.reverse().forEach(order => {
                html += `
                <div class="order-card">
                    <h3>Заказ ${order.lastName} ${order.firstName}</h3>
                    <div class="order-info">
                        <div class="info-item">
                            <span class="info-label">Прізвище</span>
                            <span class="info-value">${order.lastName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Ім'я</span>
                            <span class="info-value">${order.firstName}</span>
                        </div>
                        ${order.patronymic ? `
                        <div class="info-item">
                            <span class="info-label">По батькові</span>
                            <span class="info-value">${order.patronymic}</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <span class="info-label">Телефон</span>
                            <span class="info-value">${order.phone}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Кількість</span>
                            <span class="info-value">${order.quantity} шт.</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Адреса доставки</span>
                            <span class="info-value">${order.delivery}</span>
                        </div>
                    </div>
                    <div class="timestamp">⏰ ${order.timestamp}</div>
                </div>`;
            });
        }
        
        html += `
    </div>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }
    
    // По умолчанию - index.html для корня
    if (fileName === '/') {
        fileName = '/index.html';
    }
    
    // Путь к файлу
    let filePath = path.join(PROJECT_DIR, fileName);
    
    // Проверяем расширение файла
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Читаем файл
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Файл не найден</h1><p>Файл не существует: ' + fileName + '</p>');
        } else {
            res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                   ЛОКАЛЬНИЙ СЕРВЕР                         ║');
    console.log('║                                                            ║');
    console.log(`║  🌍 Сайт:     http://localhost:${PORT}                      ║`);
    console.log(`║  📋 Закази:   http://localhost:${PORT}/orders              ║`);
    console.log('║                                                            ║');
    console.log('║  Нажмите Ctrl+C для зупинення сервера                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
});

process.on('SIGINT', () => {
    console.log('\n\nСервер зупинено.');
    process.exit(0);
});
