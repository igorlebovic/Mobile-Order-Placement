var jQT = $.jQTouch({
    icon: '/images/jqtouch.png',
    statusBar: 'black'
});

$(document).ready(function()
{

    setTimeout(orientation,0);
    setInterval(orientation,500);
    
    var menu_links = $("#speeqe-menu #dropdown-menu li a");
    var menu_items = $("#container .menu-item");
    menu_items.hide();
    $("#speeqe-menu").hide();
	        
	menu_links.each(function(i)
	{
		$(this).toggle(
		function()
		{  	
            $("#chat").hide();
			menu_links.removeClass("clicked");
    		$(this).addClass("clicked");
        			
        	switch(i)
          	{
             	case 0: 	openButton($("#online"));      							
             				break;
             	case 1:		openButton($("#current-room"));
             	            break;
             	case 2:     openButton($("#layer1"));		
          	}
		},function()
        {
        	menu_links.removeClass("clicked");
        	menu_items.hide();
        	$("#chat").show();
        	window.scrollTo(0,$("#wrapper").height() + 0);
        });
     });

    var interval;
     
    $("#info").toggle(function()
	{
		$(this).addClass("in-use");
		$("#speeqe-menu").fadeIn();
        window.scrollTo(0,$("#wrapper").height() + 0);
		setTimeout(positionSpan,0);
                interval = setInterval(positionSpan,500);
	},function()
	{
		$(this).removeClass("in-use");
        $("span.in-use").remove();
		$("#speeqe-menu").hide();
        menu_items.hide();
        $("#chat").show();
        window.clearInterval(interval);
        window.scrollTo(0,$("#wrapper").height() + 0);
	});
	
	function openButton(element)
	{
		menu_items.hide();
    	       element.show();
               element.css("min-height","120px");
               positionSpan();
	}
	
	function positionSpan()
	{
	    $("#info").append("<span class='in-use'></span>");
		$("span.in-use").css("top",$("#info").offset().top - 16);
        $("span.in-use").css("left",$("#info").offset().left + 8);
	}
	
	function orientation()
	{
	    if($("body").width()<=320)
	    {
	    	document.body.setAttribute("orient", "portrait");
	    }
	    else 
	    {
	    	document.body.setAttribute("orient","landscape");
	    }
	}
});