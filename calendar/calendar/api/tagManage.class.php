<?php
require '../database.php';

class TagManage{
    public function addTag($usr_id, $tag_name){
        global $mysqli;
        $stmt = $mysqli->prepare("select count(*) from tag where tag_name = ? and user_id = ?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('ss', $tag_name, $usr_id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count == 0) {
            $stmt = $mysqli->prepare("insert into tag (user_id, tag_name) values (?, ?)");
            if(!$stmt){
                printf("Query Prep Failed: %s\n", $mysqli->error);
                exit;
            }
            $stmt->bind_param('ss', $usr_id, $tag_name);
            $stmt->execute();
            $stmt->close();
            return false;
        }else{
            return true;
        }


    }

    public function deleteTag($usr_id, $tag_name){
        global $mysqli;

        // check whether a tag created for group
        $stmt = $mysqli->prepare("select count(*) from event join grp_member gm on gm.grp_id = event.grp_id where tag_name = ? and gm.user_id = ? and gm.grp_id != 0");
        $stmt->bind_param('ss', $tag_name, $usr_id);
        $stmt->execute();
        $stmt->bind_result($isGrpTag);
        $stmt->fetch();
        if($isGrpTag){
            return array('success' => false, 'msg' => "Cannot delete a group's tag");
        }
        $stmt->close();

        // delete tag
        $stmt = $mysqli->prepare("delete from tag where tag_name = ?  and user_id = ?");
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('ss', $tag_name, $usr_id);
        $stmt->execute();
        $stmt->close();
        return array('success' => true);

    }

    public function getTag($usr_id){
        global $mysqli;
        // show group events' tags
        $stmt = $mysqli->prepare("select tag_name from event join grp_member gm on event.grp_id = gm.grp_id where gm.user_id = ? and gm.grp_id != 0 and tag_name != 'None' union select tag_name from tag where user_id = ? and tag_name != 'None'");
        $stmt->bind_param("dd", $usr_id, $usr_id);
        $stmt->execute();
		$stmt->bind_result($tag_name);
        $arr = array();
        while ($stmt->fetch()) {
            array_push($arr, htmlentities($tag_name));
        }
        $stmt->close();
        return $arr;
    }

}
