<?php
require_once __DIR__ . '/common.php';
$action = $_GET['action'] ?? '';
$data = json_input();
if ($action === 'register') {
    $displayName=trim((string)($data['displayName']??'')); $username=trim((string)($data['username']??'')); $password=(string)($data['password']??''); $confirm=(string)($data['confirmPassword']??'');
    if($displayName===''||mb_strlen($displayName)<2||mb_strlen($displayName)>80) respond(['success'=>false,'message'=>'PLEASE ENTER A VALID FULL NAME (2-80 CHARACTERS).'],422);
    if(strlen($username)<3||strlen($username)>100) respond(['success'=>false,'message'=>'USERNAME MUST BE 3-100 CHARACTERS.'],422);
    if(!preg_match('/^[a-zA-Z0-9_.-]+$/',$username)) respond(['success'=>false,'message'=>'USERNAME CAN ONLY CONTAIN LETTERS, NUMBERS, DOT, DASH, OR UNDERSCORE.'],422);
    if(strlen($password)<6) respond(['success'=>false,'message'=>'PASSWORD MUST BE AT LEAST 6 CHARACTERS.'],422);
    if($password!==$confirm) respond(['success'=>false,'message'=>'PASSWORDS DO NOT MATCH.'],422);
    $username=strtolower($username);
    $stmt=$pdo->prepare('SELECT id FROM users WHERE username=? LIMIT 1'); $stmt->execute([$username]);
    if($stmt->fetch()) respond(['success'=>false,'message'=>'USERNAME ALREADY EXISTS.'],409);
    try{
      $pdo->beginTransaction();
      $stmt=$pdo->prepare('INSERT INTO users(username,password_hash,display_name,is_owner) VALUES(?,?,?,0)'); $stmt->execute([$username,password_hash($password,PASSWORD_DEFAULT),$displayName]); $uid=(int)$pdo->lastInsertId();
      $profile=['id'=>'profile_'.$uid,'name'=>$displayName,'description'=>'','url'=>'index.html','image'=>'','isNew'=>false,'setupComplete'=>true,'accountUsername'=>$username,'protected'=>false];
      $empty=['home'=>['welcome'=>'','headline'=>'','subtitle'=>'','description'=>'','primaryButton'=>'','secondaryButton'=>'','labelNumber'=>'','labelText'=>''],'about'=>['welcome'=>'','headlineTop'=>'','headlineBottom'=>'','subtitle'=>'','paragraph1'=>'','paragraph2'=>'','paragraph3'=>'','pageNumber'=>'','pageLabel'=>'','profileNumber'=>'','profileLabel'=>''],'hero'=>['design'=>'sphere']];
      $stmt=$pdo->prepare('INSERT INTO user_storage(user_id,storage_key,storage_value) VALUES(?,?,?)');
      foreach([['maneclangWebsiteProfiles',json_encode([$profile],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)],['maneclangWebsiteContent',json_encode([$profile['id']=>$empty],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)],['maneclangFeaturedProjects','[]'],['maneclangProjects','[]'],['maneclangAchievements_'.$username,'[]'],['maneclangGallery_'.$username,'[]'],['maneclangSkills_'.$username,'[]']] as $x) $stmt->execute([$uid,$x[0],$x[1]]);
      $pdo->commit();
    }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack(); respond(['success'=>false,'message'=>'REGISTRATION FAILED: '.$e->getMessage()],500);}
    respond(['success'=>true,'message'=>'ACCOUNT CREATED SUCCESSFULLY.','username'=>$username,'display_name'=>$displayName]);
}
if($action==='login'){
 $username=strtolower(trim((string)($data['username']??''))); $password=(string)($data['password']??'');
 $stmt=$pdo->prepare('SELECT id,username,display_name,avatar_path,password_hash,is_owner FROM users WHERE username=? LIMIT 1');$stmt->execute([$username]);$u=$stmt->fetch();
 if(!$u||!password_verify($password,$u['password_hash']))respond(['success'=>false,'message'=>'INVALID USERNAME OR PASSWORD.'],401);
 session_regenerate_id(true);$_SESSION['user_id']=(int)$u['id'];unset($u['password_hash']);respond(['success'=>true,'account'=>$u]);
}
if($action==='logout'){$_SESSION=[];if(ini_get('session.use_cookies')){$p=session_get_cookie_params();setcookie(session_name(),' ',time()-42000,$p['path'],$p['domain'],$p['secure'],$p['httponly']);}session_destroy();respond(['success'=>true]);}
if($action==='me'){ $u=current_user(); respond(['success'=>true,'authenticated'=>(bool)$u,'user'=>$u]); }
respond(['success'=>false,'message'=>'UNKNOWN AUTH ACTION.'],400);
