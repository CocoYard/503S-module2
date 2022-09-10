<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
    session_start();
    
    $username = $_GET["username"];
    $file = fopen("/home/Yong/users.txt", "r") or exit("unreadable");
    $existUser = true;
    while (!feof($file)){
        $usr_item = fgets($file);
        if (trim($usr_item) == $username){
            echo "<script>
            alert('Welcome to the file sharing system')
            </script>";
            $_SESSION['username'] = "$username";
            $existUser = True;
	        header("Location:view.php");
        }

    }
    if ($existUser){
	echo "<script>
	alert('Login Error: please check the username!');
	</script>";
        header("Refresh:1;url=login.html");
    }
    fclose($file);

    ?>
</body>
</html>
