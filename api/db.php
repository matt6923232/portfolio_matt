<?php
// Student Portfolio Website - MySQL connection
$host = '127.0.0.1';
$db   = 'student_portfolio';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$db};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    // Lightweight migration for installations created by the earlier build.
    try {
        $hasAvatar = $pdo->query("SHOW COLUMNS FROM users LIKE 'avatar_path'")->fetch();
        if (!$hasAvatar) {
            $pdo->exec("ALTER TABLE users ADD COLUMN avatar_path VARCHAR(500) NULL AFTER display_name");
        }
    } catch (Throwable $migrationError) {
        // The normal connection remains usable; the installer/update page can retry.
    }
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success'=>false,'message'=>'Database connection failed. Import the SQL database and check api/db.php.']);
    exit;
}
