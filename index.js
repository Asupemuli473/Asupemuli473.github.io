var num_text = 0;
var num_picture = 0;
var num_video = 0;
var num_canvas = 0;

var current_canvas = 0;

var time_since_last_touch = -1;

var eraser_state = false;


function init(){
    var c = document.getElementById("ed_canvas");
    c.width = window.innerWidth*0.95;
    c.height = window.innerHeight*0.7;
    c.style.width = c.width;
    c.style.height = c.height;
    
    c.addEventListener("mousedown", start_path);
    c.addEventListener("mousemove", draw_to_new_point);
    c.addEventListener("mouseup", end_path);
    
    c.addEventListener("touchstart", start_path);
    c.addEventListener("touchmove", draw_to_new_point);
    c.addEventListener("touchend", end_path);
    
    c.getContext('2d').lineWidth = 5;
    
    document.getElementById("editor").style.display = "none";
    document.getElementById("editor_buttons").style.display = "none";

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	document.getElementById("label_l").style.display="none";
	document.getElementById("label_c").style.display="none";
	document.getElementById("color_picker").style.display="none";
	window.addEventListener("orientationchange", redraw_canvas);
    }
    else{
	document.getElementById("color_list").style.display = "none";
    }
}

function redraw_canvas(event){
    var c = document.getElementById("ed_canvas");
    c.width = window.innerWidth*0.95;
    c.height = window.innerHeight*0.7;
    c.style.width = c.width;
    c.style.height = c.height;
    document.getElementsByTagName("h1")[0].innerHTML = document.getElementById("editor").style.display;
    
    if(document.getElementById("editor").style.display=="inline"){
	document.getElementsByTagName("h1")[0].innerHTML = "image detected";
	var image = new Image();
	image.src = c.toDataURL();
	var ratio = image.width/image.height;
	if(image.width>c.width){
	    image.style.width = c.width;
	    image.style.height = c.width/ratio;
	}
	else{
	    image.style.height = c.height;
	    image.style.width = c.height*ratio;
	}
	c.getContext('2d').drawImage(image,0,0);
    }
    
    

}

function add(type){
    var elem;
    var id;
    
    switch(type){
    case 'text':
	elem = document.createElement("textarea"); 
	elem.setAttribute("placeholder","Enter text here");
	elem.setAttribute("id", "text_".concat(num_text++));
	break;
    case 'picture':
	elem = document.createElement("input");
	elem.setAttribute("id", "picture_".concat(num_picture++));
	elem.setAttribute("class", "note");
	elem.setAttribute("type", "file");
	elem.setAttribute("accept", "image/*");
	elem.setAttribute("capture", "camera");
	elem.setAttribute("onchange", "change_image(this)");
	break;
    case 'video':
	elem = document.createElement("input"); 
	elem.setAttribute(id, "video_".concat(num_video++));
	elem.setAttribute("type", "file");
	elem.setAttribute("accept", "video/*");
	elem.setAttribute("capture", "camera");
	elem.setAttribute("onchange", "change_video(this)");
	break
    case 'canvas':
	elem = document.createElement("img");
	current_canvas = num_canvas;
	elem.setAttribute("id", "canvas_"+(num_canvas++));
	
	elem.addEventListener("dblclick", open_canvas);
	elem.addEventListener("touchstart", test_double_click);
	document.getElementById("content").style.display = "none";
	document.getElementById("content_buttons").style.display = "none";

	document.getElementById("editor").style.display = "inline";
	document.getElementById("editor_buttons").style.display = "inline";
	break;
    }
    
    var p = document.createElement("p");
    p.appendChild(elem);
    
    var div = document.getElementById("notes");
    div.appendChild(p);
}

function change_image(e){
    var pic_url = URL.createObjectURL(e.files[0]);
    var id_of_img_tag = e.id.concat("_img");
    var elem = document.getElementById(id_of_img_tag);
    if(!elem){
	elem = document.createElement("img");
	elem.setAttribute("id", id_of_img_tag);
	elem.setAttribute("alt", "image");
	insertAfter(elem, e);
    }
    elem.setAttribute("src", pic_url);
}

function change_video(e){
    var vid_url = URL.createObjectURL(e.files[0]);
    var id_of_vid_tag = e.id.concat("_vid");
    var elem = document.getElementById(id_of_vid_tag);
    if(!elem){
	elem = document.createElement("video");
	elem.setAttribute("id", id_of_vid_tag);
	elem.setAttribute("controls","");
	insertAfter(elem, e);
    }
    elem.setAttribute("src", vid_url);
}

function insertAfter(el, referenceNode){
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}


function test_double_click(event){
    var d = new Date;
    var millis = d.getTime();
    if(millis-time_since_last_touch<350){
	event.preventDefault();
	open_canvas(event);
    }
    else{
	time_since_last_touch = millis;
    }
}


function open_canvas(event){
    var i = event.target;
    var num = i.id.split("_")[1];
    
    document.getElementById("content").style.display = "none";
    document.getElementById("content_buttons").style.display = "none";
    
    document.getElementById("editor").style.display = "inline";
    document.getElementById("editor_buttons").style.display = "inline";

    current_canvas = num;
    var image = new Image;
    image.src = i.src;
    document.getElementById("ed_canvas").getContext('2d').drawImage(image,0,0);
    
    
}

function close_canvas(){
    var c = document.getElementById("ed_canvas");
    var dataURL = c.toDataURL();
    document.getElementById("canvas_"+current_canvas).setAttribute("src",dataURL);

    document.getElementById("content").style.display = "inline";
    document.getElementById("content_buttons").style.display = "inline";
    
    document.getElementById("editor").style.display = "none";
    document.getElementById("editor_buttons").style.display = "none";

    c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

function download_data(event){

}

var cur_drawing_ctx = -1;

function start_path(event){
    if(event.type=='touchstart'){
	event.preventDefault();
    }
    cur_drawing_ctx = event.target.getContext("2d");
    cur_drawing_ctx.beginPath();
    if(event.type=='touchstart'){
	cur_drawing_ctx.moveTo(event.layerX, event.layerY);
    }
    else{
	cur_drawing_ctx.moveTo(event.layerX-event.target.offsetLeft, event.layerY-event.target.offsetTop);
    }
}

function draw_to_new_point(event){
    if(event.type=='touchmove'){
	event.preventDefault();
    }
    if(cur_drawing_ctx!=-1){
	if(event.type=='touchmove'){
	    cur_drawing_ctx.lineTo(event.layerX, event.layerY);
	}
	else{
	    cur_drawing_ctx.lineTo(event.layerX-event.target.offsetLeft, event.layerY-event.target.offsetTop);
	}
	cur_drawing_ctx.stroke();
    }
}

function end_path(event){
    cur_drawing_ctx.stroke();
    cur_drawing_ctx = -1;
}

function select_color(){
    var ctx = document.getElementById("ed_canvas").getContext('2d');
    var color = document.getElementById("color_picker").value;
    ctx.strokeStyle = color;
}

function select_linewidth(){
    var ctx = document.getElementById("ed_canvas").getContext('2d');
    var lw = document.getElementById("linewidth_slider").value;
    ctx.lineWidth = lw;
}

function eraser(){
    var btn = document.getElementById("eraser_btn");
    var ctx = document.getElementById("ed_canvas").getContext('2d');
    if(!eraser_state){
	btn.setAttribute("class","pressed");
	eraser_state = true;
	ctx.strokeStyle = "#FFFFFF";
    }
    else{
	btn.setAttribute("class", "tools");
	eraser_state = false;
	ctx.strokeStyle = "#000000";
    }
}

function color_picked_list(){
    var e = document.getElementById("color_list");
    var c = e.value;
    switch(c){
    case "black":
	c="#000000";
	break;
    case "red":
	c="#FF0000";
	break;
    case "blue":
	c="#0000FF";
	break;
    case "yellow":
	c="FFFF00";
	break;
    case "green":
	c="00FF00";
	break;
    }
    document.getElementById("ed_canvas").getContext('2d').strokeStyle = c;
}
