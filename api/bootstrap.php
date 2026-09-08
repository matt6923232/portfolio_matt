<?php
require_once __DIR__ . '/common.php';
$user = require_user();
$stmt = $pdo->prepare('SELECT storage_key, storage_value FROM user_storage WHERE user_id = ?');
$stmt->execute([(int)$user['id']]);
$storage = [];
foreach ($stmt->fetchAll() as $row) $storage[$row['storage_key']] = $row['storage_value'];
respond(['success'=>true,'user'=>$user,'storage'=>$storage]);
