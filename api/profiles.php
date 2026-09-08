<?php
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

$user = require_login();
$action = $_GET['action'] ?? 'list';

if ($action === 'list') {
    $stmt = $pdo->prepare('SELECT id, name, description, url, image, is_protected, created_at FROM website_profiles WHERE owner_user_id = ? ORDER BY is_protected DESC, id ASC');
    $stmt->execute([(int)$user['id']]);
    respond(['success'=>true,'profiles'=>$stmt->fetchAll()]);
}

if ($action === 'create') {
    $data = json_input();
    $name = trim((string)($data['name'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    if ($name === '') respond(['success'=>false,'message'=>'PROFILE NAME IS REQUIRED.'], 422);
    $stmt = $pdo->prepare('INSERT INTO website_profiles (owner_user_id, name, description, url, image, is_protected) VALUES (?, ?, ?, \'index.html\', \'\', 0)');
    $stmt->execute([(int)$user['id'], $name, $description]);
    respond(['success'=>true,'id'=>(int)$pdo->lastInsertId()]);
}

if ($action === 'delete') {
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('DELETE FROM website_profiles WHERE id = ? AND owner_user_id = ? AND is_protected = 0');
    $stmt->execute([$id, (int)$user['id']]);
    respond(['success'=>$stmt->rowCount() > 0]);
}

respond(['success'=>false,'message'=>'Unknown profile action.'], 404);
