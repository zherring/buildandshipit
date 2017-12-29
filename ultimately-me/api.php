<?php
switch ($_SERVER['HTTP_ORIGIN']) {
    case 'http://127.0.0.1':
    case 'http://127.0.0.1:8000':
    case 'http://localhost':
    case 'http://ultme.star29dev.com':
    case 'https://ultme.star29dev.com':
    case 'http://ultme.test.star29dev.com':
    case 'https://ultme.test.star29dev.com':
        header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
        header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
        header('Access-Control-Max-Age: 1000');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    break;
}

require_once __DIR__.'/php/silex/vendor/autoload.php';
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$mysqli = new mysqli("mysql.ultme.star29dev.com", "ultme_master", "!Cl0ud5ync", "ultme");
$REQUEST_DATA = array_merge($_GET, (array) json_decode(file_get_contents('php://input')));


$app = new Silex\Application();

$app->post('/tileset', function(Request $request) {
    if($request->get('setKey') != '' && $request->get('setData') != ''){
        $set_key = $mysqli->real_escape_string($request->get('setKey'));
        list($key,$token) = explode('-',$set_key);
        $data = $mysqli->real_escape_string($request->get('setData'));
        $sql = "INSERT INTO ultme.tile_set (set_key,data) VALUES('{$key}','{$data}') ON DUPLICATE KEY UPDATE data = '{$data}'";
        $result = $mysqli->query($sql);
        $sql = "INSERT INTO ultme.tile_set_key_token (set_key,set_token) VALUES('{$key}','{$token}') ON DUPLICATE KEY IGNORE";
        $result = $mysqli->query($sql);
        return new Response('posted', 200);
    }
    return new Response('failed', 200);
});

$app->get('/tileset', function(Request $request){
    if($request->get('setKey') != ''){
        $set_key = $mysqli->real_escape_string($request->get('setKey'));
        list($key,$token) = explode('-',$set_key);
        $sql = "SELECT TS.data FROM ultme.tile_set as TS left join ultme.tile_set_key_token as TSKT on TS.set_key = TSKT.set_key WHERE TS.set_key = '{$key}' and TSKT.set_token = '{$token}'";
        $result = $mysqli->query($sql);

        $return = array();
        while($data = $result->fetch_array(MYSQLI_ASSOC)){
            $return = $data['data'];
        }
        print $return;
        die;
    }
});

$app->run();

die;
switch($_SERVER['REQUEST_METHOD']){
    case 'POST':
        if($REQUEST_DATA['cmd'] != ''){
            switch($REQUEST_DATA['cmd']){
                case 'tileset':
                    if($REQUEST_DATA['setKey'] != '' && $REQUEST_DATA['setData'] != ''){
                        $set_key = $mysqli->real_escape_string($REQUEST_DATA['setKey']);
                        list($key,$token) = explode('-',$set_key);
                        $data = $mysqli->real_escape_string($REQUEST_DATA['setData']);
                        $sql = "INSERT INTO ultme.tile_set (set_key,data) VALUES('{$key}','{$data}') ON DUPLICATE KEY UPDATE data = '{$data}'";
                        $result = $mysqli->query($sql);
                        $sql = "INSERT INTO ultme.tile_set_key_token (set_key,set_token) VALUES('{$key}','{$token}') ON DUPLICATE KEY IGNORE";
                        $result = $mysqli->query($sql);
                        die('posted');
                    }
                break;
            }
        }
    break;
    case 'PUT':

    break;
    case 'DELETE':

    break;
    case 'GET':
    default:
        if($REQUEST_DATA['cmd'] != ''){
            switch($REQUEST_DATA['cmd']){
                case 'tileset':
                    if($REQUEST_DATA['setKey'] != ''){
                        $set_key = $mysqli->real_escape_string($REQUEST_DATA['setKey']);
                        list($key,$token) = explode('-',$set_key);
                        $sql = "SELECT TS.data FROM ultme.tile_set as TS left join ultme.tile_set_key_token as TSKT on TS.set_key = TSKT.set_key WHERE TS.set_key = '{$key}' and TSKT.set_token = '{$token}'";
                        $result = $mysqli->query($sql);

                        $return = array();
                        while($data = $result->fetch_array(MYSQLI_ASSOC)){
                            $return = $data['data'];
                        }
                        print $return;
                        die;
                    }
                break;
            }
        }
    break;
}
die;
?>
