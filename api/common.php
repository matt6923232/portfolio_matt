<?php
session_start(); header('Content-Type: application/json; charset=utf-8'); require_once __DIR__.'/../config/database.php';
function json_input():array{$d=json_decode(file_get_contents('php://input')?:'{}',true);return is_array($d)?$d:[];}
function respond(array $d,int $s=200):never{http_response_code($s);echo json_encode($d,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function ensure_schema():void{global $pdo;try{$pdo->exec("ALTER TABLE users ADD COLUMN avatar_path VARCHAR(500) NULL AFTER display_name");}catch(Throwable $e){}}
ensure_schema();
function current_user():?array{if(empty($_SESSION['user_id']))return null;global $pdo;$s=$pdo->prepare('SELECT id,username,display_name,avatar_path,is_owner FROM users WHERE id=? LIMIT 1');$s->execute([$_SESSION['user_id']]);$u=$s->fetch();return $u?:null;}
function require_user():array{$u=current_user();if(!$u)respond(['success'=>false,'message'=>'NOT_AUTHENTICATED'],401);return $u;}
