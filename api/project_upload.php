<?php
require_once __DIR__ . '/common.php';
$user = require_user();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['success'=>false,'message'=>'METHOD NOT ALLOWED.'],405);
if (empty($_FILES['project_zip']) || $_FILES['project_zip']['error'] !== UPLOAD_ERR_OK) respond(['success'=>false,'message'=>'PLEASE SELECT A PROJECT ZIP FILE.'],422);
$file=$_FILES['project_zip'];
if ($file['size'] > 50*1024*1024) respond(['success'=>false,'message'=>'PROJECT ZIP MUST BE 50MB OR SMALLER.'],422);
if (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'zip') respond(['success'=>false,'message'=>'PROJECT MUST BE A ZIP FILE.'],422);
if (!class_exists('ZipArchive')) respond(['success'=>false,'message'=>'ZIP SUPPORT IS NOT ENABLED IN PHP.'],500);
$zip=new ZipArchive();
if ($zip->open($file['tmp_name']) !== true) respond(['success'=>false,'message'=>'INVALID ZIP FILE.'],422);
$blocked=['php','phtml','phar','cgi','pl','py','sh','exe','bat','cmd','com','dll','so','asp','aspx'];
$root=dirname(__DIR__).DIRECTORY_SEPARATOR.'uploads'.DIRECTORY_SEPARATOR.'projects'.DIRECTORY_SEPARATOR.(int)$user['id'];
if(!is_dir($root)) @mkdir($root,0755,true);
$slug=preg_replace('/[^a-z0-9]+/i','-',pathinfo($file['name'],PATHINFO_FILENAME));
$slug=trim($slug,'-') ?: 'project';
$folder=$slug.'-'.bin2hex(random_bytes(6));
$dest=$root.DIRECTORY_SEPARATOR.$folder;
@mkdir($dest,0755,true);
$indexFound=false;
for($i=0;$i<$zip->numFiles;$i++){
  $stat=$zip->statIndex($i); $name=str_replace('\\','/',$stat['name']??'');
  if($name==='' || str_ends_with($name,'/')) continue;
  $parts=explode('/',$name); $safe=[];
  foreach($parts as $part){ if($part===''||$part==='.') continue; if($part==='..') { $zip->close(); respond(['success'=>false,'message'=>'ZIP CONTAINS AN INVALID PATH.'],422); } $safe[]=$part; }
  if(!$safe) continue;
  $ext=strtolower(pathinfo(end($safe),PATHINFO_EXTENSION));
  if(in_array($ext,$blocked,true)){ $zip->close(); respond(['success'=>false,'message'=>'ZIP CONTAINS A DISALLOWED EXECUTABLE/SERVER FILE.'],422); }
  $target=$dest.DIRECTORY_SEPARATOR.implode(DIRECTORY_SEPARATOR,$safe);
  $parent=dirname($target); if(!is_dir($parent)) @mkdir($parent,0755,true);
  $in=$zip->getStream($name); if(!$in){$zip->close();respond(['success'=>false,'message'=>'UNABLE TO READ ZIP CONTENT.'],500);}
  $out=@fopen($target,'wb'); if(!$out){fclose($in);$zip->close();respond(['success'=>false,'message'=>'UNABLE TO WRITE PROJECT FILE.'],500);}
  stream_copy_to_stream($in,$out); fclose($in); fclose($out);
  if(strtolower(basename($name))==='index.html' && !$indexFound) $indexFound=$target;
}
$zip->close();
if(!$indexFound){
  // Remove incomplete project.
  $it=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dest,FilesystemIterator::SKIP_DOTS),RecursiveIteratorIterator::CHILD_FIRST);
  foreach($it as $item){$item->isDir()?@rmdir($item->getPathname()):@unlink($item->getPathname());} @rmdir($dest);
  respond(['success'=>false,'message'=>'PROJECT ZIP MUST CONTAIN AN INDEX.HTML FILE.'],422);
}
$relative='uploads/projects/'.(int)$user['id'].'/'.$folder.'/'.str_replace($dest.DIRECTORY_SEPARATOR,'',$indexFound);
$relative=str_replace('\\','/',$relative);
respond(['success'=>true,'link'=>$relative,'folder'=>'uploads/projects/'.(int)$user['id'].'/'.$folder]);
