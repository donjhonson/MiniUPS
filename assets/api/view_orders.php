<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Переглад заказів</title>
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
        <h1>📋 Переглад заказів</h1>
        
        <?php
        $logsFile = __DIR__ . '/orders_log.json';
        
        if (!file_exists($logsFile)) {
            echo '<div class="no-orders">Заказити ще не було</div>';
        } else {
            $logs = json_decode(file_get_contents($logsFile), true) ?? [];
            
            if (empty($logs)) {
                echo '<div class="no-orders">Заказити ще не було</div>';
            } else {
                // Выводим в обратном порядке (последние сверху)
                foreach (array_reverse($logs) as $order) {
                    echo '<div class="order-card">';
                    echo '<h3>Заказ ' . htmlspecialchars($order['lastName']) . ' ' . htmlspecialchars($order['firstName']) . '</h3>';
                    echo '<div class="order-info">';
                    
                    echo '<div class="info-item">';
                    echo '<span class="info-label">Прізвище</span>';
                    echo '<span class="info-value">' . htmlspecialchars($order['lastName']) . '</span>';
                    echo '</div>';
                    
                    echo '<div class="info-item">';
                    echo '<span class="info-label">Ім\'я</span>';
                    echo '<span class="info-value">' . htmlspecialchars($order['firstName']) . '</span>';
                    echo '</div>';
                    
                    if (!empty($order['patronymic'])) {
                        echo '<div class="info-item">';
                        echo '<span class="info-label">По батькові</span>';
                        echo '<span class="info-value">' . htmlspecialchars($order['patronymic']) . '</span>';
                        echo '</div>';
                    }
                    
                    echo '<div class="info-item">';
                    echo '<span class="info-label">Телефон</span>';
                    echo '<span class="info-value">' . htmlspecialchars($order['phone']) . '</span>';
                    echo '</div>';
                    
                    echo '<div class="info-item">';
                    echo '<span class="info-label">Кількість</span>';
                    echo '<span class="info-value">' . htmlspecialchars($order['quantity']) . ' шт.</span>';
                    echo '</div>';
                    
                    echo '<div class="info-item">';
                    echo '<span class="info-label">Адреса доставки</span>';
                    echo '<span class="info-value">' . htmlspecialchars($order['delivery']) . '</span>';
                    echo '</div>';
                    
                    echo '</div>';
                    echo '<div class="timestamp">⏰ ' . htmlspecialchars($order['timestamp']) . '</div>';
                    echo '</div>';
                }
            }
        }
        ?>
    </div>
</body>
</html>
