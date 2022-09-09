<?php
// login_ajax.php
ini_set("session.cookie_httponly", 1);

header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

//Because you are posting the data via fetch(), php has to retrieve it elsewhere.
$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

//Variables can be accessed as such:
$username = $json_obj['username'];
$pwd_guess = $json_obj['password'];
//This is equivalent to what you previously did with $_POST['username'] and $_POST['password']

// Check to see if the username and password are valid.  (You learned how to do this in Module 3.)


require 'database.php';
$stmt = $mysqli->prepare("select user_id, password from user where username=?");
if(!$stmt){
	echo json_encode(array(
		"success" => false,
		"message" => "Database invalid"
	));
	exit;
}
else{
	// Bind the parameter
	$stmt->bind_param('s', $username);
	$stmt->execute();


	// Bind the results
	$stmt->bind_result($user_id, $pwd_hash);
	$stmt->fetch();

	// Compare the submitted password to the actual password hash
	if(password_verify($pwd_guess, $pwd_hash)){
		$stmt->close();
		session_start();
		$_SESSION['user_id'] = $user_id;
		$_SESSION['username'] = $username;
		$_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32)); 

		
		echo json_encode(array(
			"success" => true,
			"username" => $username,
			'token' => $_SESSION['token']
		));

		exit;
	}else{
		$stmt->close();
		echo json_encode(array(
			"success" => false,
			"message" => "Incorrect Username or Password"
		));
		exit;
	}
}
?>