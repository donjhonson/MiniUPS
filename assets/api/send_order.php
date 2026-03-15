<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$botToken = '8237955977:AAFJNa1HWuf369o47hfn63grkvpL77Ilfo8';
$chatId = '@miniups5';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['lastName'], $data['firstName'], $data['phone'], $data['delivery'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Не всі дані заповнені']);
    exit;
}

$message = "📦 <b>НОВИЙ ЗАКАЗ!</b>\n\n";
$message .= "👤 <b>Прізвище:</b> " . htmlspecialchars($data['lastName']) . "\n";
$message .= "👤 <b>Ім'я:</b> " . htmlspecialchars($data['firstName']) . "\n";

if (!empty($data['patronymic'])) {
    $message .= "👤 <b>По батькові:</b> " . htmlspecialchars($data['patronymic']) . "\n";
}

$message .= "📱 <b>Телефон:</b> " . htmlspecialchars($data['phone']) . "\n";
$message .= "📦 <b>Кількість:</b> " . htmlspecialchars($data['quantity'] ?? 1) . "\n";
$message .= "📍 <b>Адреса доставки:</b> " . htmlspecialchars($data['delivery']) . "\n";
$message .= "\n✅ Час замовлення: " . date('d.m.Y H:i:s');

$telegramUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
$postData = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'HTML'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $telegramUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
// curl_close($ch) deprecated в PHP 8.0+, убрали

if ($httpCode === 200) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Замовлення відправлено!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Помилка відправки в Telegram']);
}