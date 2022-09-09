<?php
// register_ajax.php
ini_set("session.cookie_httponly", 1);

header("Content-Type: application/json"); 

//Because you are posting the data via fetch(), php has to retrieve it elsewhere.
$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

//Variables can be accessed as such:
$username = $json_obj['username'];
// check the name
if( !preg_match('/^[\w_\-]+$/', $username) ){
    echo json_encode(array(
		"success" => false,
		"message" => "Invalid username"
	));
    exit;
}

$password = $json_obj['password'];

if ($password == "") {

    echo json_encode(array(
        "success" => false, 
        "message" => "Please input password."
    ));
    exit;
}

// insert data into database
require 'database.php';
$hashed_password = password_hash($mysqli->real_escape_string($password), PASSWORD_BCRYPT);
$stmt = $mysqli->prepare("insert into user (username, password) values (?, ?)");
$stmt->bind_param('ss', $username, $hashed_password);
if (!$stmt->execute()) {
    // printf("Query Prep Failed: %s\n%s", $mysqli->error,  $mysqli->errno);
    if ($mysqli->errno == 1062) {
        echo json_encode(array(
            "success" => false, 
            "message" => "This username has already been registered. Please retry."
        ));
        $stmt->close();
        exit;
    }
    echo json_encode(array(
        "success" => false, 
        "message" => "Register failed. Please retry."
    ));
    $stmt->close();
    exit;
}
else{
    $stmt->close();
    $stmt = $mysqli->prepare("select user_id from user where username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();

    ///////
    $stmt = $mysqli->prepare("insert into grp_member (grp_id, user_id) values (0, ?)");
    $stmt->bind_param("d", $user_id);
    if (!$stmt->execute()) {
        // printf("Query Prep Failed: %s\n%s", $mysqli->error,  $mysqli->errno);
        if ($mysqli->errno == 1062) {
            echo json_encode(array(
                "success" => false, 
                "message" => "This username has already been registered. Please retry."
            ));
            $stmt->close();
            exit;
        }
        echo json_encode(array(
            "success" => false, 
            "message" => "Register failed. Please retry.".$user_id
        ));
        $stmt->close();
        exit;
    }
    else{
        $stmt->close();
        echo json_encode(array(
        "success" => true
        ));
        exit;
    }
}
?>