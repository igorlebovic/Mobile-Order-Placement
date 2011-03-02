/*
  Copyright 2007-2008 Nathan Zorn OGG, LLC
  See LICENSE.txt 
*/

var APP_DEFAULT_WAIT = 60
var APP_DEFAULT_HOLD = 1

Speeqe.Application.prototype = {
   
    vibrate: function() {
	window.location = "device://Notification.vibrate";
    },
    
    setChatroom: function(room)
    {
	if (room.split("@").length == 1)
	{
      
	    tmp_room = [room,
	    "@",
	    Speeqe.CHAT_SERVER];
	    this._chatroom = tmp_room.join("");
      
	}
	else
	{
	    this._chatroom = room;
	}
    },
    getChatroom: function() {
	return this._chatroom;
    },    
    run: function(username,password)
    {
	//parse query string to find given room name
	var query = window.location.search.substring(1);

	var parms = query.split('&');
	for (i=0;i<parms.length;i++)
	{
	    keyvals = parms[i].split('=');
	    if ((keyvals.length > 0) && (keyvals[0] == 'room'))
		{
		    this.setChatroom(keyvals[1]);
		}
	}

	//if username and password are not specified log in anonymously
	if(!username && !password)
	{
	    username = Speeqe.XMPP_DOMAIN;
	    password = "password";
	    this.anonymous = true;
	}

	this._connection.connect(username,
				 password,
				 app._connectCallback,
				 APP_DEFAULT_WAIT,
				 APP_DEFAULT_HOLD);
	
    },

    jidSession: function (myJid) {
	var data = { jid: myJid };
	jQuery.post("/checkout/ajax_store_jid/",
		    data,
		    function(response) {
		    },
		    "json")
    },
	
    anonymSession: function(anonym) {
	var data = { anonymous: anonym };
	jQuery.post("/checkout/ajax_store_anonym/",
		    data,
		    function(response) {
		    },
		    "json")
    },
    
    _connectCallback: function (status, cond)
    {

	app._statusview.displayStatus(status,cond,app._connected);
	

	if (status == Strophe.Status.AUTHFAIL)
	{
	    app._connection.disconnect();
	    app._authFailed = true;
	}
	else if (status == Strophe.Status.CONNECTED)
	{
	    app._connection.pause();
	    app._connected = true;

	    title = document.title.replace("!! ","");
	    document.title = title;

	    app._connection.resume();

	    //Add handlers for messages and user presence
	    app._connection.addHandler(app._onMessage,
				       null,
				       "message",
				       null,
				       null,
				       null);
	    
	    app._connection.addHandler(app._onPresence,
				       null,
				       "presence",
				       null,
				       null,
				       null);

	    //Send presence to the server
//	    var presence = $pres({from:app._connection.jid}).c("priority",{}).cnode(Strophe.xmlTextNode("-1")).tree();
	    var presence = $pres({to: "aerosmile@kangoria.com/bot"}).c('register', {xmlns: "http://metajack.im/ns/toetem"}).cnode(Strophe.xmlTextNode("-1")).tree();

	    app._connection.send(presence);


	    //join the chat room
	    app.joinchat(app._chatroom);

	}
	else if (status == Strophe.Status.DISCONNECTED || status == Strophe.Status.CONNFAIL)
	{
	    app._connected = false;
	    app._connection.jid = "";
	    app._chat = null;
	    app._chatroom = null;
	    title = "!! " + document.title;
	    document.title = title;
	    app._statusview.toggleStatusElement("#status_disconnected");	    
	}
	else if (status == Strophe.Status.DISCONNECTING)
	{
	    app.disconnect();
	}
	return true;

    },
    
    //Clean up and discconnect from xmpp server
    disconnect: function ()
    {
	//remove all roster items
	for (i in this._roster)
	{
	    $("#rosteritem"+this._roster[i].id).remove();
	    delete this._roster[i];    
	}
	this.leave(function() {
	    app._connection.disconnect();
	});
    },
    
    leave: function (call_back)
    {
	if(this._chat)
	{
	    this._chat.leave(call_back);
	}
	
    },
    
    joinchat: function(chatname) 
    {
	var nickname = this._connection.jid;
	var jid = this._connection.jid;

	if(this.anonymous)
	{
	    nickname = Speeqe.generate_anonymous_nick()+"@"+Speeqe.XMPP_DOMAIN;
	    app.anonymSession(nickname);	    
	    jid = Speeqe.XMPP_DOMAIN;
	}
	if (!this._chat)
	{

	    if(nickname.split("/").length > 0)
	    {
		nickname = nickname.split("/")[0];
	    }
	    this._chat = new Speeqe.Chat(chatname,
					 this._connection,
					 nickname);
	    
	}

	this._chat.join();
	this._chatroom_view.displayJoiningStatus();

    },
    
    joinChatWithPassword: function(password) {
  if(this._chat)
  {
      this._chat.join(password);
      this._chatroom_view.displayJoiningStatus();
  }
    },
    messageView: function() {
  return this._message_view;
    },
    _onMessage: function(stanza) {

  if (app._chat)
  {

      var type = $(stanza).attr('type');
    
      if ('error' != type)
      {
    var from = $(stanza).attr('from');
    userroom = from.split("/");
    user = userroom[1];
    room = userroom[0];

    //determine if message is subject change
    if ($(stanza).find('subject').length > 0)
        {
      app._message_view.displayTopic(stanza);
        }
    else if ($(stanza).text())
        {
      if(!user)
          {
        user = from;
          }
      //Find the avatar for the user posting the message.
      srcurl = '/avatar-service/lookup/?sha1=';
      var the_sha1 = "f2f8ab835b10d66f9233518d1047f3014b3857cf";
      if(app._roster[user])
          {
        
        if(app._roster[user].sha1)
            {
          the_sha1 = app._roster[user].sha1;
            }
        
          }
      srcurlsha = [srcurl,
             the_sha1];
      srcurl = srcurlsha.join("");
      //message belongs to the current user?
      var current_user = false;
      
      if (app._chat._nick === user)
          {
        current_user = true;
          }
      app._message_view.displayMessage(user,
                srcurl,
                stanza,
                current_user);
        
        }
      
      }
      else
      {
    app._message_view.displayErrorMessage(stanza);

      }
  }
	
	// skipola code
	var message = stanza;
	var from = $(message).attr('from');

        if ($(message).find('waiting').length > 0) {
            $(message).find('waiting > player').each(function () {
                    $('#waiting tbody').append(
                            "</td><td>" +
                            ($(this).attr('jid') === app._connection.jid ?
                             "" :
                             "<input type='button' class='start_button' id='start_game' " +
                             "value='Start Game' name='" + $(this).attr('jid') + "'>") +
                            "</td></tr>");
            });
            
        } else if ($(message).find('invite').length > 0) {

	    app.get_order(function(result) {
		    try {
			// vibration
			navigator.notification.beep();
                        navigator.notification.vibrate();
		    } catch(e){
			// No equivalent in web app
		    }
		    app.update_order(result);
		});

        } else if ($(message).find('game-started').length > 0) {
	        $('#order_accepted').trigger('click');

        } else {
            var cmdNode = $(message)
                .find('*[xmlns="http://metajack.im/ns/toetem"]');
            var cmd = null;
            var row, col;
            if (cmdNode.length > 0) {
                cmd = cmdNode.get(0).tagName;
            }
            if (cmd === 'game-started') {
		alert('test');
            }

        }

	return true;
    },

    get_order: function(callback_fn) {
	$.getJSON(
	    'http://' + location.host + '/checkout/ajax_order_accepted/1/',
	    callback_fn
	);
    },

    just_get_order: function(callback_fn) {
	$.getJSON(
	    'http://' + location.host + '/checkout/ajax_order_lookup/1/',
	    callback_fn
	);
    },
    
    update_order: function (result) {
	if (result.response_1.length == 0) {
	    $(".orders_1").html("");
	    var item_order = '<ul class="edgetoedge">' +
			     '<li>No pending orders</li>' +
			     '</ul>';
	    $(".orders_1").append(item_order);
	}
	else {
	    $(".orders_1").html("");
	    $.each(result.response_1, function(i) {
		var response_1 = result.response_1[i];
		var item_order = '<form id="product-' + response_1.item_slug + '" action="http://' + window.location.hostname + '/checkout/modify_order/' + response_1.item_slug + '/" method="POST" class="form" style="margin-bottom:-2px;">' +
				 '<ul class="edgetoedge">' +
				 '<input type="hidden" name="item_id" value="' + response_1.item_id + '" />' +
				 '<li><a href="#" class="submit">' + response_1.orders + '</a></li>' +
				 '</ul>' +
				 '</form>';
		$(".orders_1").append(item_order);
	    });
	}
	if (result.response_2.length == 0) {
	    $(".orders_2").html("");
	    $(".orders_2").html("<li>No accepted orders</li>");
	}
	else {
	    $(".orders_2").html("");
	    $.each(result.response_2, function(i) {
		var response_2 = result.response_2[i];
		var li = '<li>' + response_2.orders + '</li>';
		$(".orders_2").append(li);
	    });
	}
	if (result.response_3.length == 0) {
	    $(".orders_3").html("");
	    $(".orders_3").html("<li>No orders waiting</li>");
	}
	else {
	    $(".orders_3").html("");
	    $.each(result.response_3, function(i) {
		var response_3 = result.response_3[i];
		var li = '<li>' + response_3.orders + '</li>';
		$(".orders_3").append(li);
	    });
	}
	if (result.response_4.length == 0) {
	    $(".orders_4").html("");
	    var item_order = '<ul class="rounded">' +
			     '<li>No past orders</li>' +
			     '</ul>';
	    $(".orders_4").append(item_order);
	}
	else {
	    $(".orders_4").html("");
	    var item_order1 = '<ul class="rounded">';
	    $(".orders_4").append(item_order1);
	    $.each(result.response_4, function(i) {
		var response_4 = result.response_4[i];
		var item_order2 = '<li>' +
				  'Order #' + response_4.id + ' - ' + response_4.date +
				  '</li>';
		$(".orders_4").append(item_order2);
	    });
	    var item_order3 = '</ul>';
	    $(".orders_4").append(item_order3);
	}

	var iqid = app._connection.getUniqueId('update_page');
	var iq = Strophe.xmlElement("iq", [
					      ["id", iqid],
					      ["to", "aerosmile@kangoria.com/bot"],
					      ["type", "set"]
				       ]);
	var query = Strophe.xmlElement("waiting", [
						    ["xmlns", 
						     "http://metajack.im/ns/toetem"]
					  ]);
	iq.appendChild(query);
	app._connection.send(iq);

    },

    
    messageView: function() {
  return this._message_view;
    },
    sendMessage: function(text) {
  if (this._chat)
  {
      //test for valid /me message
      textm = text.replace(/\s/g,"");
      
      if(textm != "/me")
      {
    this._chat.sendMessage(text);
      }
      else
      {
    //create stanza for error message
    var error_message = "Error: Must send more than just /me.";
    var kick_message_ar = ["<message from='",
               this._chatroom,             
               "' to='4@dev.speeqe.com/3' id='1'><x xmlns='jabber:x:event'><composing/></x></message>"];
    
    var estanza = $(kick_message_ar.join(""));
    var body_elem = document.createElement("body");
    var body_text = document.createTextNode(error_message);
    body_elem.appendChild(body_text);

    estanza.append(body_elem);
    this._message_view.displayErrorMessage(estanza);
      }
  }
  this._message_view.scrollTop();

    },

    _onPresence: function(stanza) {
	
	//store jid in a session variable
	var myJid = $(stanza).attr("to");
	app.jidSession(myJid);

if (app._chat)
  {
      var my_app = app;

      $(stanza).find("x").each( function(i,xquery) {
    
    //Handle only MUC user protocol
    var xmlns = $(xquery).attr("xmlns");

    if (xmlns && xmlns.match(Strophe.NS.MUC))
    {

        var error = $(stanza).find("error");

        if (error.length > 0)
        {
      if(error.attr("code") == '409') //409 is nick conflict
      {
          if(my_app._chat)
        console.log("error 409");       
          //nick conflict so tack on another character
          my_app._chat._nick = my_app._chat._nick + "_";
          my_app._chat.join(my_app._chatroom);
      }
      else if(error.attr("code") == '401') //401 auth required
      {
          //display password dialog
          my_app._chatroom_view.password();
      }
      else
      {
          //display error message
          my_app._chatroom_view.error(my_app._chatroom,
                  my_app._chat._nick,
                  stanza);
          my_app.disconnect();
      }

        }
        else
        {

      //Search for status code
      var status = $(stanza).find("status").attr("code");
      if('201' == status)
      {
          my_app._chat.createInstantRoom();
      }
      if('307' == status || '301' == status)
      {
          //test if user is kicked, otherwise show the message
          var message_to = $(stanza).attr("from").split("/")[1];
          my_app._message_view.displayKickBan(stanza);
          if(message_to == my_app._chat._nick)
          {
        my_app._chatroom_view.statusDisconnect(stanza);
        my_app.disconnect();
          }
          else
          {
        
        var roster_item = my_app._roster[nick]; 
        if(roster_item)
        {
            $("#rosteritem"+roster_item.id).remove();
            delete my_app._roster[nick];
            my_app._rosteritemview.showJoinLeave(nick,"left");
        }
          }
      }
      var room = $(stanza).attr("from").split("/")[0];
      //room presence contains an 'item'
      var fulljid = $(stanza).find("item").attr("jid");

      if(room == my_app._chatroom)
      {
          var nick = $(stanza).attr("from").split("/")[1];
          if(my_app._chat._nick == nick)
          {
        my_app._chatroom_view.show(my_app._chatroom,
                 my_app._chat._nick);
          }
          my_app._chatroom_view.hideJoiningStatus();
          my_app._statusview.toggleStatusElement("#status_connected");      
      }

      if (fulljid)
      {
          var jid = fulljid.split("/")[0];
          var nick = $(stanza).attr("from").split("/")[1];
          var fullnick = $(stanza).attr("from");
          if((!$(stanza).attr("type")) || ("available" == $(stanza).attr("type")))
          {
          
        var roster_item = my_app._roster[nick];
        if(!roster_item)
        {
            roster_item = new Speeqe.RosterItem(my_app._connection,
                  fullnick,
                  nick);
            my_app._roster[nick] = roster_item;
            
            my_app._rosteritemview.show(roster_item,
                nick);
            
            var roster_item_id = "#rosteritem" + roster_item.id;
            $(roster_item_id + " .roster_user_name").click(function() {
          my_app.completeNick("@"+$(this).text());
            });
            my_app.createRosterPopup($(roster_item_id));
            
        }
        else
            {//update existing user with presence changes
            }
        roster_item.getAvatar();
        
        
          }
          else if (("error"==$(stanza).attr("type")) || ("unavailable" == $(stanza).attr("type")))
          {
        
        var roster_item = my_app._roster[nick]; 
        if(roster_item)
        {
            $("#rosteritem"+roster_item.id).remove();
            delete my_app._roster[nick];
            my_app._rosteritemview.showJoinLeave(nick,"left");
        }
          }

      }
      else 
      {
          /*Handle anonymous rooms. Default avatar and only nick shows.*/

          if (room == my_app._chatroom)
          {
        var nick = $(stanza).attr("from").split("/")[1];
        var fullnick = $(stanza).attr("from");

        if("unavailable" != $(stanza).attr("type"))
        {
            var roster_item = my_app._roster[nick];
            if(!roster_item)
            {
          roster_item = new Speeqe.RosterItem(my_app._connection,
                    fullnick,
                    nick);
          
          my_app._roster[nick] = roster_item;

          my_app._rosteritemview.show(roster_item,nick);
          
          var roster_item_id = "#rosteritem" + roster_item.id;
          var roster_item_selector = roster_item_id + " .roster_user_name";

          $(roster_item_selector).click(function() {
              my_app.completeNick("@"+$(this).text());
          });
          my_app.createRosterPopup($(roster_item_id));

            }
            roster_item.getAvatar();
            
        }
        else if (("error"==$(stanza).attr("type")) || ("unavailable" == $(stanza).attr("type")))
        {
            
            var roster_item = my_app._roster[nick]; 
            if(roster_item)
          {
              $("#rosteritem"+roster_item.id).remove();
              delete my_app._roster[nick];
              my_app._rosteritemview.showJoinLeave(nick,"left");
          }
        }
          }
      }
        }
    }//not a muc 
      });
  }	
	return true;
    },
    completeNick: function(nick_elem) {
  var msg_text = $("#send_chat_message").attr("value");
  msg_text += nick_elem;
  $("#send_chat_message").attr("value",msg_text+" ");
  $("#send_chat_message").focus();
    },
    createRosterPopup: function(roster_elem) {

  if(! roster_elem) return;
  if(roster_elem.length == 0) return;
  // options
  var distance = 1;
  var time = 250;
  var hideDelay = 500;

  var hideDelayTimer = null;

  // tracker
  var beingShown = false;
  var shown = false;

  var trigger = roster_elem;
  var popup = $('.rostervcard', roster_elem).css('opacity', 0);

  // set the mouseover and mouseout on both element
  $([trigger.get(0), popup.get(0)]).mouseover(function () {
    
      // stops the hide event if we move from the trigger to the
      // popup element
      if (hideDelayTimer)
      {
    clearTimeout(hideDelayTimer);
      }
      // don't trigger the animation again if we're being shown,
      // or already visible
      if (beingShown || shown)
      {
    return;
      }
      else
      {
    beingShown = true;
    var top = $(this).css("top");
    var left = $(this).css("left");
    // reset position of popup box
    popup.css({
                   top: top,
       left: left,
       display: 'block' // brings the popup back in to view
       })

    // (we're using chaining on the popup) now animate
    // it's opacity and position
    .animate({
                   top: '-=' + distance + 'px',
       opacity: 1
          }, time, 'swing', function() {
        // once the animation is complete, set
        // the tracker variables
        beingShown = false;
        shown = true;
          });
      }
  }).mouseout(function () {
    
      // reset the timer if we get fired again - avoids double animations
      if (hideDelayTimer)
      {
    clearTimeout(hideDelayTimer);
      }
      // store the timer so that it can be cleared in the
      // mouseover if required
      hideDelayTimer = setTimeout(function () {
    hideDelayTimer = null;
    popup.animate({
          top: '-=' + distance + 'px',
       opacity: 0
       }, time, 'swing', function () {
           // once the animate is complete, set the
           // tracker variables
           shown = false;
           // hide the popup entirely after the effect
           // (opacity alone doesn't do the job)
           popup.css('display', 'none');
       });
      }, hideDelay);
  });

    },
    connected: function () {
	return this._connected;
    },

    configure_chat: function() {
  if(this._chat)
  {
      var iqid = this._chat.configure();
      this._connection.addHandler(app._onRoomConfigureResult,
          null,
          "iq",
          null,
          iqid,
          null);
  }
  else
  {
      this._roomconfigview.showError("Unable to configure room.");
      this._roomconfigview.show();      
  }

    },

    send_chat_configuration: function(config) {
  if(this._chat)
  {

      var iqid = this._chat.saveConfiguration(config);
      this._connection.addHandler(app._onRoomSaveConfigureResult,
          null,
          "iq",
          null,
          iqid,
          null);
  }
    },
    
    _onRoomConfigureResult: function(stanza) {
  //display form

  var query = $(stanza).find("query")

  if (query.length > 0)
  {
      app._roomconfigview.buildConfigurationForm(stanza);
  }
  else
  {
      //display error
      app._roomconfigview.showError("Unable to configure room.");
  }
  
  $("#configure_room_form").find("a").click(function()
      {
    app._roomconfigview.hide();
    if(app._chat)
    {
        app._chat.cancelConfiguration();
    }
    return false;
      });
  app._roomconfigview.show();
    },
    _onRoomSaveConfigureResult: function (stanza) {

  var query = $(stanza).find("query");
  if(query.length > 0)
  {
      if (query.find("error").length > 0)
    {
        //display error
        app._roomconfigview.showError("Unable to configure room.");
        
    }
      else
    {
        app._roomconfigview.addMessage("<p>Saved.</p>");
    }
  }
  else
  {
      //display error
      app._roomconfigview.showError("Unable to configure room.");     

  }

    },
    //find a username based on partial name, returns actual username
    findRosterItem: function(partial_name) {
  var retval = null;
  if(app._roster)
  {
      for(var x in app._roster)
      {
    if(x.match(partial_name))
    {
        return x;
    }
      }
      
  }
  return retval;
    }
};