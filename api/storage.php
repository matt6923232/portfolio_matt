<?php
require_once __DIR__ . '/common.php';
$user = require_user();
$userId = (int)$user['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT storage_key, storage_value FROM user_storage WHERE user_id = ?');
    $stmt->execute([$userId]);
    $storage = [];
    foreach ($stmt->fetchAll() as $row) $storage[$row['storage_key']] = $row['storage_value'];
    respond(['success'=>true,'user'=>$user,'storage'=>$storage]);
}

$data = json_input();
$key = (string)($data['key'] ?? '');
if ($key === '' || strlen($key) > 190) respond(['success'=>false,'message'=>'Invalid storage key.'], 422);

if (($data['action'] ?? 'set') === 'remove') {
    $stmt = $pdo->prepare('DELETE FROM user_storage WHERE user_id = ? AND storage_key = ?');
    $stmt->execute([$userId, $key]);
    respond(['success'=>true]);
}

$value = (string)($data['value'] ?? '');
$stmt = $pdo->prepare('INSERT INTO user_storage (user_id, storage_key, storage_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE storage_value = VALUES(storage_value)');
$stmt->execute([$userId, $key, $value]);
respond(['success'=>true]);
