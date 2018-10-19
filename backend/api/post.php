<?php

$size = (int) $_SERVER['CONTENT_LENGTH'];

$response_json = '';

if($size<500000){
    $path = dirname(__FILE__);

    file_put_contents($path."/../data/".$_POST['resourceId'], $_POST['data']);
    $response_json = json_encode([ "size" => $size ]);
}else{
    $response_json = json_encode([ "size" => $size, "error" => "data size too large" ]);
}

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
echo($response_json);

?>