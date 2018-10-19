<?php


class SfmomaCollectionBase {

	/*
	$key = valid collection API key required
	*/

	function __construct($key, $root="https://www.sfmoma.org/api/collection/") {
		$this->api_key = $key;
		$this->api_root = $root;
	}

	// curl one particular URL
	function query_collection($url, $query_params=[]) {

		$ch = curl_init();
		$timeout = 5;
		$request_headers[] = 'Authorization: Token '.$this->api_key;
		$query = http_build_query($query_params);

		$url = $url.'?'.$query;

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
		$data_json = curl_exec($ch);
		curl_close($ch);

		$data = json_decode($data_json);

		return $data;

	}

	// recursively scrape collection data
	function get_api_data($url, $page, &$api_data, $query_params) {

		$params = array();
		$params['page'] = $page;
		if (!empty($query_params)) {
			foreach ($query_params as $key => $value) {
				$params[$key] = $value;
			}
		}

		$response = $this->query_collection($url,$params);
		$next = $response->next;
		
		$api_data[] = $response;

		if ($next) {
			$page++;
			error_log($next);
			$this->get_api_data($url, $page, $api_data, $query_params);
		}

		return $api_data;

	}

	function prepare_query($url, $query_params) {
		$data = array();
		$page = 1;
		$data = $this->get_api_data($url, $page, $data, $query_params);
		return $data;
	}

	function get_artist_data($query_params=[]) {
		
		$url = $this->create_api_url('artists');
		$data = $this->prepare_query($url, $query_params);
		
		return $data;

	}

	function get_artwork_data($query_params=[], $page=null, $page_size=null) {
		$url = $this->create_api_url('artworks');
		if($page){
            $params = array();
            $params['page'] = $page;
            if($page_size){
                $params['page_size'] = $page_size;
            }
            if (!empty($query_params)) {
                foreach ($query_params as $key => $value) {
                    $params[$key] = $value;
                }
            }
		    $data = $this->query_collection($url,$params);
		} else {
		    $data = $this->prepare_query($url, $query_params);
        }
		return $data;

	}

	function get_exhibition_data($query_params=[]) {
		$url = $this->create_api_url('exhibitions');
		$data = $this->prepare_query($url, $query_params);

		return $data;

	}

	function create_api_url($section) {

		switch ($section) {
			case "artists":
				$url = $this->api_root."artists/";
				break;
			case "artworks":
				$url = $this->api_root."artworks/";
				break;
			case "exhibitions":
				$url = $this->api_root."exhibitions/";
				break;
			default:
				$url = $this->api_root;

		}

		return $url;

	}

}

?>