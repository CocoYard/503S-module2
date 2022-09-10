
<?php
session_start();

// Get the filename and make sure it is valid
$filename = $_FILES['uploadedfile']['name'];
	// We believe any files that can be stored in PC are competent to transfer.
    // So it is no need to check the file name.
	// if( !preg_match('/^[\w_\.\-]+$/', $filename) ){
	// 	echo "Invalid filename";
	// 	exit;
	// }
// Get the username and make sure it is valid
$username = $_SESSION['username'];
if( !preg_match('/^[\w_\-]+$/', $username) ){
	echo "Invalid username";
	exit;
}

$full_path = sprintf("/home/Yong/users/%s/%s", $username, $filename);

// judge the file's legitimacy
if (is_uploaded_file($_FILES['uploadedfile']['tmp_name'])){

	if( move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $full_path) ){
		echo "<h1>Uploaded successfully!</h1><br>";?>
		<b id="second">5</b>&nbsp seconds later back to main page&nbsp;<a href="javascript:goBack();">back</a> 
		<script type="text/javascript"> 
			var sec = document.getElementById("second");
			var i = 5;
			var timer = setInterval(function(){
				if (i == 0){

				}
				else {
					i--;
					sec.innerHTML = i;
					if(i==1){
						window.location.href = "view.php";
					}
				}
			},1000);
			
			function goBack(){ 
				window.location.href = "view.php";
			} 
		</script> 
		<?php 
	}else{
		// header("Location: upload_failure.html");
		echo "<h1>Failure!</h1><br>";
		// print_r($_FILES);
		echo "<a href='view.php'> back </a>";
		exit;
	}
}
else{
	echo '<h1>Please choose a file and make sure it is legal.</h1>';
	?>
	<b id="second">5</b>&nbsp seconds later back to main page&nbsp;<a href="javascript:goBack();">back</a> 
		<script type="text/javascript"> 
			var sec = document.getElementById("second");
			var i = 5;
			var timer = setInterval(function(){
				if (i == 0){
					// No action
				}
				else {
					i--;
					sec.innerHTML = i;
					if(i==1){
						window.location.href = "view.php";
					}
				}
			},1000);
			
			function goBack(){ 
				window.location.href = "view.php";
			} 
		</script> 
<?php
}
