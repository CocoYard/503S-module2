<?php
session_start();      
$username = $_SESSION['username'];
if (isset($_GET['delete'])){
	$FilePath = "/home/Yong/users/".$username."/";
	$status=unlink($FilePath.$_GET['delete']);
	if($status){  
	echo "The file deleted successfully<br>";
	}else{  
	echo "Sorry, cannot delete this file! <br>";
	}  
}?>
<b id="second">5</b>&nbsp seconds later back to main page&nbsp<a href="javascript:goBack();">back</a> 
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