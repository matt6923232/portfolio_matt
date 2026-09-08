<?php
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

$user = require_login();
$action = $_GET['action'] ?? 'list';

if ($action === 'list') {
    $stmt = $pdo->prepare('SELECT p.*, wp.name AS profile_name FROM projects p JOIN website_profiles wp ON wp.id=p.profile_id WHERE wp.owner_user_id=? ORDER BY p.created_at DESC');
    $stmt->execute([(int)$user['id']]);
    respond(['success'=>true,'projects'=>$stmt->fetchAll()]);
}

if ($action === 'featured') {
    $stmt = $pdo->query("SELECT p.id,p.category,p.type,p.title,p.description,p.link,p.image FROM projects p JOIN website_profiles wp ON wp.id=p.profile_id JOIN featured_projects f ON f.project_id=p.id ORDER BY f.sort_order ASC, f.id ASC");
    respond(['success'=>true,'projects'=>$stmt->fetchAll()]);
}

if ($action === 'create') {
    $data = json_input();
    $profileId = (int)($data['profile_id'] ?? 0);
    $title = trim((string)($data['title'] ?? ''));
    if (!$profileId || $title === '') respond(['success'=>false,'message'=>'PROFILE AND PROJECT TITLE ARE REQUIRED.'], 422);
    $check=$pdo->prepare('SELECT id FROM website_profiles WHERE id=? AND owner_user_id=?');
    $check->execute([$profileId,(int)$user['id']]);
    if(!$check->fetch()) respond(['success'=>false,'message'=>'PROFILE NOT FOUND.'],404);
    $stmt=$pdo->prepare('INSERT INTO projects(profile_id,category,type,title,description,link,image) VALUES(?,?,?,?,?,?,?)');
    $stmt->execute([$profileId,(string)($data['category']??''),(string)($data['type']??''),$title,(string)($data['description']??''),(string)($data['link']??''),(string)($data['image']??'')]);
    respond(['success'=>true,'id'=>(int)$pdo->lastInsertId()]);
}

if ($action === 'feature') {
    $projectId=(int)($_GET['id']??0);
    $check=$pdo->prepare('SELECT p.id FROM projects p JOIN website_profiles wp ON wp.id=p.profile_id WHERE p.id=? AND wp.owner_user_id=?');
    $check->execute([$projectId,(int)$user['id']]);
    if(!$check->fetch()) respond(['success'=>false,'message'=>'PROJECT NOT FOUND.'],404);
    $stmt=$pdo->prepare('INSERT IGNORE INTO featured_projects(project_id,sort_order) VALUES(?,COALESCE((SELECT MAX(x.sort_order)+1 FROM (SELECT sort_order FROM featured_projects) x),0))');
    $stmt->execute([$projectId]);
    respond(['success'=>true]);
}

if ($action === 'unfeature') {
    $projectId=(int)($_GET['id']??0);
    $stmt=$pdo->prepare('DELETE f FROM featured_projects f JOIN projects p ON p.id=f.project_id JOIN website_profiles wp ON wp.id=p.profile_id WHERE f.project_id=? AND wp.owner_user_id=?');
    $stmt->execute([$projectId,(int)$user['id']]);
    respond(['success'=>true]);
}

respond(['success'=>false,'message'=>'Unknown project action.'],404);
