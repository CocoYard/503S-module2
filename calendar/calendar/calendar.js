let months_list = ["January", "Febrary", "March", "April", "May", "June", "July", "Auguest", "September", "October", "November", "December"];
let cur_day = new Date();
let month_today = new Month(cur_day.getFullYear(), cur_day.getMonth());

function drawCalender() {
	let to_display = "";
	let cur_class;
	let weeks = month_today.getWeeks();
	for (let i in weeks) {
		cur_week = weeks[i].getDates();
		for (let j in cur_week) {
			calender_day = cur_week[j];
			if (calender_day.getDate() == cur_day.getDate() && month_today.month == cur_day.getMonth() && calender_day.getFullYear() == cur_day.getFullYear()) {
				cur_class = " class='blue bluebox'";
			} else {
				cur_class = "";
			}
			to_display += "<li" + cur_class + ">" + calender_day.getDate() + "</li>";
		}
	}
	document.getElementById("days").innerHTML = to_display;
	document.getElementById("calendar-title").innerHTML = months_list[month_today.month] + " " + calender_day.getFullYear();

}
drawCalender();

document.getElementById("prev").onclick = function (e) {
	e.preventDefault();
	month_today = month_today.prevMonth();
	drawCalender();
}
document.getElementById("next").onclick = function (e) {
	e.preventDefault();
	month_today = month_today.nextMonth();
	drawCalender();
}
