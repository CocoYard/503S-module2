<?php
require '../database.php';

class eventManage{
    public function addEvent($user_id, $title, $description, $date, $tag, $grp_id){
        global $mysqli;

        $stmt = $mysqli->prepare("insert into event (user_id, title, content, date_time, tag_name, grp_id) values (?, ?, ?, ?, ?, ?)");
        if(!$stmt){
            return sprintf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('dssssd', $user_id, $title, $description, $date, $tag, $grp_id);
        $stmt->execute();
        $stmt->close();
        return "Added successfully! ";

    }
    public function updateEventShareCode($user_id, $event_id){
        //
        global $mysqli;
        $share_code = md5($event_id);
        $stmt = $mysqli->prepare("UPDATE event SET share_code = ? WHERE event_id = ? and user_id = ?");
        if(!$stmt){
            return sprintf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('sdd', $share_code,  $event_id, $user_id);
        $stmt->execute();
        $stmt->close();
        return "Updated successfully! ";

    }

    public function addEventbyShareCode ($user_id, $share_code) {
        global $mysqli;
        $stmt = $mysqli->prepare("select grp_id, tag_name, date_time, title, content from event where share_code = ?");
        $stmt->bind_param("d", $share_code);
        $stmt->execute();
		$stmt->bind_result($grp_id, $tag_name, $date, $title, $content);
        $stmt->fetch();
        $stmt->close();

        $stmt1 = $mysqli->prepare("insert into event (user_id, title, content, date_time, tag_name, grp_id) values (?, ?, ?, ?, ?, ?)");
        if(!$stmt1){
            return sprintf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt1->bind_param('dssssd', $user_id, $title, $content, $date, $tag_name, $grp_id);
        $stmt1->execute();
        $stmt1->close();

    }



    public function deleteEvent($user_id, $event_id){
        global $mysqli;
        // check whether made by other group members
        $stmt = $mysqli->prepare("select user_id from event where event_id = ?");
        if(!$stmt){
            return sprintf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('d', $event_id);
        $stmt->bind_result($creator_id);
        $stmt->execute();
        $stmt->fetch();
        $stmt->close();
        if($user_id != $creator_id) {
            return "you should delete an event created by yourself rather than other group members! ";
        }
        
        // delete
        $stmt = $mysqli->prepare("delete from event where event_id = ?  and user_id = ?");
        if(!$stmt){
                return sprintf("Query Prep Failed: %s\n", $mysqli->error);
                exit;
        }
        $stmt->bind_param('ss', $event_id, $user_id);
        $stmt->execute();
        $stmt->close();
        return "Deleted successfully! ";
    }



    public function getEventsByTag($user_id, $tag_names) {
        // For now this doesn't consider groups. 
        // It doesn't consider multiple tag_name-s
        if (count($tag_names) == 0) {
            return array();
        }

        global $mysqli;
        $arr = array();
        foreach($tag_names as $tag){
            $stmt = $mysqli->prepare("select event_id, title, tag_name, grp_id from event where user_id = ? and tag_name = ?");
            $stmt->bind_param("ds", $user_id, $tag);
            $stmt->execute();
            $stmt->bind_result($event_id, $title, $tag_name, $grp_id);
            while ($stmt->fetch()) {
                $event_item = ['event_id' => $event_id, 'title' => $title, 'tag_name' => $tag_name, 'grp_id' => $grp_id];
                array_push($arr, $event_item);
            }
            $stmt->close();
        }
        return $arr;

    }

    public function getEventsByTagGrp($user_id, $tag_names, $grp_id){

		// if no tag, return empty
		
		if (count($tag_names) == 0) {
            return array();
        }
		
		// $grp_id == -1 show events of all groups and No Group，query according to tag_name, grp_id
		if ($grp_id == -1){
            global $mysqli;
            $arr = array();
            // find all groups user joined
            $grp_ids = array();
            $stmt = $mysqli->prepare("select grp_id from grp_member where user_id = ?");
            $stmt->bind_param("d", $user_id);
            $stmt->execute();
            $stmt->bind_result($cur_grp_id);
            while($stmt->fetch()) {
                if ($cur_grp_id != 0){
                    array_push($grp_ids, $cur_grp_id);
                }
            }
            $stmt->close();
            // 1. all events in user's groups (except No Group)
            foreach($tag_names as $tag){
                foreach($grp_ids as $g_id){
                    $stmt = $mysqli->prepare("select event_id, title, tag_name, g.grp_id, grp_name from event join grp g on g.grp_id = event.grp_id where tag_name = ? and g.grp_id = ?");
                    $stmt->bind_param("sd", $tag, $g_id);
                    $stmt->execute();
                    $stmt->bind_result($event_id, $title, $tag_name, $g_id, $grp_name);
                    while ($stmt->fetch()) {
                        $event_item = ['event_id' => $event_id, 'title' => htmlentities($title), 'tag_name' => htmlentities($tag_name), 'grp_id' => $g_id, 'grp_name' => htmlentities($grp_name)];
                        array_push($arr, $event_item);
                    }
                    $stmt->close();

                }
            }
            // 2. all events created by user with No Group
            foreach($tag_names as $tag){
                $stmt = $mysqli->prepare("select event_id, title, tag_name, g.grp_id, grp_name from event join grp g on g.grp_id = event.grp_id where tag_name = ? and g.grp_id = 0 and user_id = ?");
                $stmt->bind_param("sd", $tag, $user_id);
                $stmt->execute();
                $stmt->bind_result($event_id, $title, $tag_name, $g_id, $grp_name);
                while ($stmt->fetch()) {
                    $event_item = ['event_id' => $event_id, 'title' => htmlentities($title), 'tag_name' => htmlentities($tag_name), 'grp_id' => $g_id, 'grp_name' => htmlentities($grp_name)];
                    array_push($arr, $event_item);
                }
            }
            $stmt->close();
            return $arr;
			
		}

		// other situation if not None Group, query $tag_names, $grp_id
        else if($grp_id != 0){
            global $mysqli;
            $arr = array();
            foreach($tag_names as $tag){
                $stmt = $mysqli->prepare("select event_id, title, tag_name, g.grp_id, grp_name from event join grp g on g.grp_id = event.grp_id where tag_name = ? and g.grp_id = ?");
                $stmt->bind_param("sd",  $tag, $grp_id);
                $stmt->execute();
                $stmt->bind_result($event_id, $title, $tag_name, $g_id, $grp_name);
                while ($stmt->fetch()) {
                    $event_item = ['event_id' => $event_id, 'title' => htmlentities($title), 'tag_name' => $tag_name, 'grp_id' => $g_id, 'grp_name' => htmlentities($grp_name)];
                    array_push($arr, $event_item);
                }
                $stmt->close();
            }
            return $arr;
			
        }
        // when query None Group
        else {
            global $mysqli;
            $arr = array();
            foreach($tag_names as $tag){
                $stmt = $mysqli->prepare("select event_id, title, tag_name, g.grp_id, grp_name from event join grp g on g.grp_id = event.grp_id where user_id = ? and tag_name = ? and g.grp_id = 0");
                $stmt->bind_param("ds", $user_id, $tag);
                $stmt->execute();
                $stmt->bind_result($event_id, $title, $tag_name, $g_id, $grp_name);
                while ($stmt->fetch()) {
                    $event_item = ['event_id' => $event_id, 'title' => htmlentities($title), 'tag_name' => $tag_name, 'grp_id' => $g_id, 'grp_name' => htmlentities($grp_name)];
                    array_push($arr, $event_item);
                }
                $stmt->close();
            }
            return $arr;
        }
    }
    public function getEventDetail($event_id) {
        global $mysqli;
        $stmt = $mysqli->prepare("select grp_id, tag_name, date_time, title, content from event where event_id = ?");
        $stmt->bind_param("d", $event_id);
        $stmt->execute();
		$stmt->bind_result($grp_id, $tag_name, $date, $title, $content);
        $res = array();
        while ($stmt->fetch()) {
            $res['grp_id'] = $grp_id;
            $res['tag_name'] = $tag_name;
            $res['date'] = $date;
            // only title needs HTML display. others are in input text.
            $res['title'] = $title;
            $res['description'] = $content;
        }
        return $res;
    }
    public function editEvent($user_id, $title, $description, $date, $tag, $grp_id, $event_id) {
        global $mysqli;

        // test whether created by yourself
        // check whether made by other group members
        $stmt = $mysqli->prepare("select user_id from event where event_id = ?");
        if(!$stmt){
            return sprintf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('d', $event_id);
        $stmt->bind_result($creator_id);
        $stmt->execute();
        $stmt->fetch();
        $stmt->close();
        if($user_id != $creator_id) {
            return "Cannot updated an event created by other group members! ";
        }

        // update table
        $stmt = $mysqli->prepare("UPDATE event SET title = ?, content = ?, date_time = ?, tag_name = ?, grp_id = ? WHERE event_id = ? and user_id = ?");
        if(!$stmt){
            return sprintf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('ssssddd', $title, $description, $date, $tag, $grp_id, $event_id, $user_id);
        $stmt->execute();
        $stmt->close();
        return "Updated successfully! ";
    }

}

?>