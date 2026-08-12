<?php
// Указываем браузеру, что возвращаем ответ в формате JSON
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Получаем и очищаем данные от потенциально опасного кода (XSS / SQL-инъекции)
    $name = isset($_POST['name']) ? trim(htmlspecialchars($_POST['name'])) : '';
    $email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
    $message = isset($_POST['message']) ? trim(htmlspecialchars($_POST['message'])) : '';

    // Валидация полей
    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['status' => 'error', 'message' => 'Пожалуйста, заполните все обязательные поля.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Неверный формат адреса электронной почты.']);
        exit;
    }

    // НАСТРОЙКА АДРЕСАТА: ваша почта
    $to = 'av.mikhailov93@gmail.com'; 
    $subject = 'Новое сообщение с сайта alexmikhailov.com';

    // Форматируем красивое HTML-тело письма
    $mailContent = "
        <h2 style='color: #2449B4; font-family: sans-serif;'>Новая заявка с сайта-портфолио</h2>
        <table style='font-family: sans-serif; font-size: 14px; border-collapse: collapse; width: 100%; max-width: 600px;'>
            <tr style='background-color: #f8f9fa;'>
                <th style='border: 1px solid #dee2e6; padding: 10px; text-align: left; width: 150px;'>Параметр</th>
                <th style='border: 1px solid #dee2e6; padding: 10px; text-align: left;'>Данные</th>
            </tr>
            <tr>
                <td style='border: 1px solid #dee2e6; padding: 10px; font-weight: bold;'>Имя:</td>
                <td style='border: 1px solid #dee2e6; padding: 10px;'>{$name}</td>
            </tr>
            <tr>
                <td style='border: 1px solid #dee2e6; padding: 10px; font-weight: bold;'>Email:</td>
                <td style='border: 1px solid #dee2e6; padding: 10px;'><a href='mailto:{$email}'>{$email}</a></td>
            </tr>
            <tr>
                <td style='border: 1px solid #dee2e6; padding: 10px; font-weight: bold;'>Сообщение:</td>
                <td style='border: 1px solid #dee2e6; padding: 10px; line-height: 1.5;'>" . nl2br($message) . "</td>
            </tr>
        </table>
    ";

    // Формируем заголовки отправки (Headers)
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=utf-8\r\n";
    
    // ВАЖНО ДЛЯ BEGET: Отправитель должен быть на вашем домене, иначе спам-фильтры заблокируют письмо!
    $headers .= "From: info@alexmikhailov.com\r\n"; 
    $headers .= "Reply-To: {$email}\r\n";

    // Отправляем письмо через встроенную функцию PHP mail()
    if (mail($to, $subject, $mailContent, $headers)) {
        echo json_encode(['status' => 'success', 'message' => 'Сообщение успешно отправлено! Я свяжусь с вами в ближайшее время.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Произошла ошибка при отправке на сервере. Пожалуйста, попробуйте позже.']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Недопустимый метод отправки данных.']);
}