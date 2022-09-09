<?php
    require_once './tagManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    if(isset($_SESSION['user_id'])){
        $tag_name = $_POST['tag_name'];
        $usr_id = $_SESSION['user_id'];
        $tagmanage = new TagManage();
        $isExistTag = $tagmanage->addTag($usr_id, $tag_name);
        $res = array( 'isExistTag' => $isExistTag, 'isLogin' => true);
        echo json_encode($res);
    }
    else {
        echo json_encode(array('isLogin' => false));
    }
