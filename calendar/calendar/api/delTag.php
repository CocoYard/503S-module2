<?php
    require_once 'tagManage.class.php';
    ini_set("session.cookie_httponly", 1);
    session_start();

    if(isset($_SESSION['user_id'])){
        $tag_name = html_entity_decode($_POST['tag_name']);
        $usr_id = $_SESSION['user_id'];
        $tagmanage = new TagManage();
        $res = $tagmanage->deleteTag($usr_id, $tag_name);
        echo json_encode($res);
    }
    else {
        echo json_encode(array('success' => false, 'msg' => "Please login first! "));
    }

?>