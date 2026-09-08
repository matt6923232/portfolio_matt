<?php
require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
$user = require_login();
$action=$_GET['action']??'get';
$profileId=(int)($_GET['profile_id']??0);
if(!$profileId) respond(['success'=>false,'message'=>'PROFILE ID REQUIRED.'],422);
$check=$pdo->prepare('SELECT id FROM website_profiles WHERE id=? AND owner_user_id=?');
$check->execute([$profileId,(int)$user['id']]);
if(!$check->fetch()) respond(['success'=>false,'message'=>'PROFILE NOT FOUND.'],404);
if($action==='get'){
 $stmt=$pdo->prepare('SELECT home_json,about_json,hero_json FROM customizations WHERE profile_id=?'); $stmt->execute([$profileId]); $row=$stmt->fetch();
 respond(['success'=>true,'content'=>$row?["home"=>json_decode($row['home_json'],true),"about"=>json_decode($row['about_json'],true),"hero"=>json_decode($row['hero_json'],true)]:null]);
}
if($action==='save'){
 $data=json_input();
 $home=json_encode($data['home']??[],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); $about=json_encode($data['about']??[],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); $hero=json_encode($data['hero']??[],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
 $stmt=$pdo->prepare('INSERT INTO customizations(profile_id,home_json,about_json,hero_json) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE home_json=VALUES(home_json),about_json=VALUES(about_json),hero_json=VALUES(hero_json)'); $stmt->execute([$profileId,$home,$about,$hero]); respond(['success'=>true]);
}
respond(['success'=>false,'message'=>'Unknown customization action.'],404);
