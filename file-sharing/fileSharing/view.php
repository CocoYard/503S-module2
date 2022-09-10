<?php 
	session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Sharing</title>
	<style>
		html {height: 100%;}
		body { position: relative; min-height: 100%; background: #fff url(background/bg.jpg) 50% 50% no-repeat; background-size: cover;}        
		table.bg, tr.bg {
			border:1px solid black;
			background: rgba(190, 147, 119, 0.4);
			width:100%;
		}
		td {
			background: rgba(190, 147, 119, 0.2);
		}
		table.sp {
			background: rgba(190, 147, 119, 0.4);
			width:100%;
		}
		.rec{border:1px solid white; border-radius:5px; width:60px;height:20px; color:#FFF;}
        
</style>
</head>
<body>
	<table class = "sp">
	<tr>
		<th>
			<form enctype="multipart/form-data" action="uploader.php" method="POST">
				<p>
					<input type="hidden" name="MAX_FILE_SIZE" value="20000000" />
					<label for="uploadfile_input">Choose a file to upload:</label> <input name="uploadedfile" type="file" id="uploadfile_input" />
				</p>
				<p>
					<input type="submit" value="Upload File" style="width: 100px; text-align:center; background-color:#FFF;color:#279ee2;" class="rec"/>
				</p>
			</form>
		</th>
		<th>
			<form action="checkout.php" method="get">
					<p style = "font-size:150%"><?php echo $_SESSION['username']?></p>
					<p><input type="submit" value="logout" style="text-align:center; background-color:#FFF;color:#279ee2;" class="rec"></p>
			</form>
		</th>
	</tr>
	</table>
<div>
	<h1>your files</h1>
	<?php
		// show the files' time
		date_default_timezone_set('America/Chicago');
		// read dir
		if (isset($_SESSION['username'])){

			$username = $_SESSION['username'];
			// check the name
			if( !preg_match('/^[\w_\-]+$/', $username) ){
				echo "Invalid username";
				exit;
			}
			$dir = "/home/Yong/users/".$username.'/';
			$handler = opendir($dir);
			while (($filename = readdir($handler)) !== false) {//!== is for avoiding files named '0'
				if ($filename != "." && $filename != "..") {
						$files[] = $filename ;
						$filesize[] = filesize($dir.$filename);
						$filetime[] = date('Y-m-d H:i:s', filemtime($dir.$filename));
						$imag[] = pathinfo($dir.$filename, PATHINFO_EXTENSION);
				}
			}
			closedir($handler);
	?>
			<table class = "bg">
				<tr class = "bg">
					<th>type</th>
					<th>name</th>
					<th>size</th>
					<th>last modified</th>
					<th>operations</th>
				</tr>
				<?php
				// print all
				if (!isset($files)){
					echo '<div style="font-size: 30px;background: rgba(250, 250, 250, 0.5);"> You have no shared files. Try uploading some~<div>';
				}
				else
				for ($i = count($files) - 1; $i >= 0; --$i) {
				?>
					<tr>
						<td style="text-align:center;">
							
							<?php if ($imag[$i] == 'png' or $imag[$i] == 'jpg' or $imag[$i] == 'jpeg' or $imag[$i] == 'gif' or $imag[$i] == 'heic'){
								echo '<img width="40" height="40" src="./pic/pict.png" alt = "picture"/>';
							}
							elseif($imag[$i] == 'mov' or $imag[$i] == 'MOV'or $imag[$i] == 'mp4' or $imag[$i] == 'avi' or $imag[$i] == 'rmvb'){
								echo '<img width="40" height="40" src="./pic/movie.png" alt = "video"/>';
							}
							elseif($imag[$i] == 'txt' or $imag[$i] == 'pdf' or $imag[$i] == 'docx' or $imag[$i] == 'doc'){
								echo '<img width="40" height="40" src="./pic/txt.png" alt = "words"/>';
							}
							else{
								echo '<img width="40" height="40" src="./pic/web.png" alt = "unknown"/>';
							}
						// echo $imag[$i];
						?>
						
						</td>
						<td> <?php echo htmlentities($files[$i]); ?> </td>
						<td> <?php 
						if ($filesize[$i] < 1024){
							echo $filesize[$i].' B';
						}
						elseif ($filesize[$i] < 1024 * 1024){
							echo round($filesize[$i]/1024,2).' KB';
						}
						else{
							echo round($filesize[$i]/1024/1024,2).' MB';
						 } ?> </td>
						<td> <?php echo $filetime[$i]; ?></td>
						<td style="text-align:center;">
								<form  style="margin:1%;display:inline;" action="delete.php" method="GET">
										<input type="hidden" name="delete" value="<?php echo htmlentities($files[$i]); ?>" />
										<input type="submit" value="delete" style="text-align:center; background-color:#FFF;color:black;" class = "rec"/>
								</form>
								<form style="margin:1%;display:inline;" enctype="multipart/form-data" action="preview.php" method="GET">
										<input type="hidden" name="file" value="<?php echo htmlentities($files[$i]);?>" />
										<input type="submit" value="view" style="text-align:center; background-color:#FFF;color:black;" class="rec"/>
	
								</form>
								<form style="margin:1%;display:inline;" enctype="multipart/form-data" action="download.php" method="GET">
										<input type="hidden" name="file" value="<?php echo htmlentities($files[$i]);?>" />
										<input type="submit" value="download" style="width:80px; text-align:center; background-color:#FFF;color:black;" class = "rec"/>
	
								</form>
	
						</td>
					</tr>
				<?php
				}
				?>
			</table>

		<?php 
		}
		?>
		
	
</div>


</body>
</html>