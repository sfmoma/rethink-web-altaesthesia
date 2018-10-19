<?php

$response_json = '';

$path = dirname(__FILE__);

$data = file_get_contents($path."/../data/".$_GET['resourceId']);
$response_json = $data? $data : json_encode([ 'error' => 'file not found' ]);

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
echo($response_json);

?>