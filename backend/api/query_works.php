<?php

# load the SDK
include '../collection.php';
# load the config file that contains your API key
include '../config.php';

# initialize the SDK with your API key
$collection = new SfmomaCollectionBase(SFMOMA_API_KEY);

/* 
$query_params array can be a list of any available filters
For a list of filters visit: https://www.sfmoma.org/api/collection/docs/

*/

$query_params = array(
	"object_keywords__icontains" => $_GET['keywords'],
	"has_images" => 1,
);

$artists = $collection->get_artwork_data($query_params, $_GET['page'], $_GET['page_size']);

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
$response_json = json_encode($artists);
echo($response_json);

?>