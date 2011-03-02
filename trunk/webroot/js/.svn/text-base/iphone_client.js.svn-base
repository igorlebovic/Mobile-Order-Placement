// from svn revision 14. replaced temporarily and renamed the latest file to _temprenamed

$(document).ready(function()
{
	setTimeout(orientation,0);
	setInterval(orientation,500);
	
	var menu_links = $("#speeqe-menu #dropdown-menu li a");
	var menu_items = $(".menu-item");
        menu_items.hide();
        $("#speeqe-menu").show();
	        
	menu_links.each(function(i)
	{
		if (i==0) {
		        $("#chat").hide();
		        $("#chatbox").hide();
			$(this).addClass("clicked");
			openButton($("#dashboard"));
		}
		$(this).click(function()
		{
			menu_items.hide();
			menu_links.removeClass("clicked");
			$(this).addClass("clicked");
				
			switch(i)
			{
				case 0:	openButton($("#dashboard"));$("#chatbox").hide();$("#chat").hide();
				break;
				case 1:	openButton($("#online"));$("#chatbox").hide();$("#chat").hide();
				break;
				case 2: openButton($("#current-room"));$("#chatbox").hide();$("#chat").hide();
				break;
				case 3: openButton($("#layer1"));$("#chatbox").hide();$("#chat").hide();
				break;
				case 4:	openButton($("#chat"));$("#chatbox").show();
			}
		});
        });

    var interval;
    
	function openButton(element)
	{
		menu_items.hide();
                element.show();
                element.css("min-height","120px");
//                positionSpan();
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


