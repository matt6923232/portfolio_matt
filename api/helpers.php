<?php
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
header('Content-Type: application/json; charset=utf-8');

function json_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}
function respond(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}
function normalize_username(string $username): string {
    return strtolower(trim($username));
}
function require_login(): array {
    if (empty($_SESSION['user_id'])) respond(['success'=>false,'message'=>'LOGIN REQUIRED.'], 401);
    return $_SESSION['user'];
}
function public_user(array $user): array {
    return ['id'=>(int)$user['id'], 'username'=>$user['username'], 'role'=>$user['role']];
}
