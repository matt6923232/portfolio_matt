<?php
require_once __DIR__ . '/common.php';
$user = require_user();
$userId = (int)$user['id'];

$uploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'avatars';
if (!is_dir($uploadDir)) @mkdir($uploadDir, 0755, true);

function updateProfileAvatar(PDO $pdo, int $userId, string $path): void {
    $stmt = $pdo->prepare('SELECT storage_value FROM user_storage WHERE user_id = ? AND storage_key = ? LIMIT 1');
    $stmt->execute([$userId, 'maneclangWebsiteProfiles']);
    $row = $stmt->fetch();
    if (!$row) return;
    $profiles = json_decode($row['storage_value'], true);
    if (!is_array($profiles)) return;
    foreach ($profiles as &$profile) {
        if (is_array($profile)) $profile['image'] = $path;
    }
    unset($profile);
    $json = json_encode($profiles, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $stmt = $pdo->prepare('UPDATE user_storage SET storage_value = ? WHERE user_id = ? AND storage_key = ?');
    $stmt->execute([$json, $userId, 'maneclangWebsiteProfiles']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(['success'=>true,'avatar_path'=>$user['avatar_path'] ?? '']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $old = (string)($user['avatar_path'] ?? '');
    if ($old && str_starts_with($old, 'uploads/avatars/')) @unlink(dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $old));
    $pdo->prepare('UPDATE users SET avatar_path = NULL WHERE id = ?')->execute([$userId]);
    updateProfileAvatar($pdo, $userId, '');
    respond(['success'=>true,'avatar_path'=>'']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['success'=>false,'message'=>'METHOD NOT ALLOWED.'], 405);

if (empty($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) respond(['success'=>false,'message'=>'PLEASE SELECT AN IMAGE.'], 422);
$file = $_FILES['avatar'];
if ($file['size'] > 5 * 1024 * 1024) respond(['success'=>false,'message'=>'IMAGE MUST BE 5MB OR SMALLER.'], 422);
$info = @getimagesize($file['tmp_name']);
if (!$info) respond(['success'=>false,'message'=>'INVALID IMAGE FILE.'], 422);
$mime = $info['mime'] ?? '';
$ext = match ($mime) { 'image/jpeg'=>'jpg', 'image/png'=>'png', 'image/webp'=>'webp', 'image/gif'=>'gif', default=>null };
if (!$ext) respond(['success'=>false,'message'=>'USE JPG, PNG, WEBP, OR GIF.'], 422);

$filename = 'user_' . $userId . '_' . bin2hex(random_bytes(10)) . '.' . $ext;
$target = $uploadDir . DIRECTORY_SEPARATOR . $filename;
if (!move_uploaded_file($file['tmp_name'], $target)) respond(['success'=>false,'message'=>'UNABLE TO SAVE IMAGE.'], 500);

$path = 'uploads/avatars/' . $filename;
$old = (string)($user['avatar_path'] ?? '');
$pdo->prepare('UPDATE users SET avatar_path = ? WHERE id = ?')->execute([$path, $userId]);
if ($old && str_starts_with($old, 'uploads/avatars/')) @unlink(dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $old));
updateProfileAvatar($pdo, $userId, $path);
respond(['success'=>true,'avatar_path'=>$path]);
