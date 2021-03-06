var APP_DEFAULT_WAIT = 60
var APP_DEFAULT_HOLD = 1

Speeqe.Application.prototype = {
   
    _connection: null,

    games: {},
    waiting: [],
    presence: {},
   
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

	this._connection.connect('aerosmile@kangoria.com/bot',
				 'aerodiet',
				 app._connectCallback,
				 APP_DEFAULT_WAIT,
				 APP_DEFAULT_HOLD);
	
    },
    
    _connectCallback: function (status, cond)
    {

//	app._statusview.displayStatus(status,cond,app._connected);
	

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
	    
	    $('#log').prepend("<p>Order placement enabled</p>");

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

	    app._connection.addHandler(app._onIq,
				       null,
				       "iq",
				       null,
				       null,
				       null);

	    //Send presence to the server
//	    var presence = $pres();
//	    app._connection.send(presence);
//	var presence = Strophe.xmlElement("presence");
	var presence = $pres({from:app._connection.jid}).c("priority",{}).cnode(Strophe.xmlTextNode("-1")).tree();
//	var presence = $pres()
	app._connection.send(presence);
	    
	    
	    //join the chat room
//	    app.joinchat(app._chatroom);

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
    
    _onIq: function (iq) {
        var id = $(iq).attr('id');
	var cart = id.split(':');
	var cart_id = cart[1];
        var from = $(iq).attr('from');
        var type = $(iq).attr('type');
        
        // make sure we know the user's presence first
        if (!app.presence[Strophe.getBareJidFromJid(from)]) {
            app.send_error(iq, 'auth', 'forbidden');
        } else {
            var child = $(iq).find('*[xmlns="http://metajack.im/ns/toetem' +
                                   '"]:first');
            if (child.length > 0) {
                if (type === 'get') {
                    app.send_error(iq, 'cancel', 'bad-request');
                    return true;
                } else if (type !== 'set') {
                    // ignore IQ-error and IQ-result
                    return true;
                }
                
                switch (child[0].tagName) {
                case 'waiting':
                    app.on_waiting(id, cart_id, from, child);
                    break;
                    
                case 'start':
                    app.on_game_start(iq, id, from, child);
                    break;

                case 'response_to_merchant':
                    app.on_response_to_merchant(iq, id, from, child);
                    break;

                default:
                    app.send_error(iq, 'cancel', 'bad-request');
                }
            } else {
                app.send_error(iq, 'cancel', 'feature-not-implemented');
            }
        }

        return true;
    },


    _onPresence: function(stanza) {
	//skipola code
        var from = $(stanza).attr('from');
        var bare_from = Strophe.getBareJidFromJid(from);
	var node_from = Strophe.getNodeFromJid(from);
        var type = $(stanza).attr('type');
        var bare_jid = Strophe.getBareJidFromJid(app._connection.jid);
        var domain = Strophe.getDomainFromJid(from);

        if (domain === 'conference.kangoria.com') {
            // handle room presence
            var room2 = Strophe.getNodeFromJid(from);
            var player = Strophe.getResourceFromJid(from);
            var game = app.games[room2];

            if (game && type !== 'unavailable') {
                // handle observers joining

                var msg = $msg({to: from, type: 'chat'});
                if (game.status === 'starting') {
                    msg.c('body').t('Waiting for players...').up()
                        .c('game-state', {xmlns: 'http://metajack.im/ns/toetem',
                                          'phase': game.status,
                                          'x-player': game.x_player,
                                          'o-player': game.o_player});
                }

                app._connection.send(msg);
                $('#log').prepend("<p>Sent state to observer " + bare_from +
                                  " in game " + game.room2 + ".</p>");
            }
        } else if ((!type || type === "unavailable") && 
                   bare_from !== bare_jid) {
            // handle directed presence from players
            if (type === "unavailable") {
                delete app.presence[bare_from];
                
                // remove from lists
                app.remove_waiting(from);

                 $('#log').prepend("<p>Unregistered " + node_from + "</p>");
            } else if ($(stanza).find('register').length > 0) {

                app.presence[bare_from] = from;

                $('#log').prepend("<p>Registered " + node_from + "</p>");    
	    }
        }
	return true;
    },
    
    // skipola code
    is_waiting: function (jid) {
        var bare_jid = Strophe.getBareJidFromJid(jid);

        var i;
        for (i = 0; i < app.waiting.length; i++) {
            var wjid = Strophe.getBareJidFromJid(app.waiting[i]);
            if (wjid === bare_jid) {
                return true;
            }
        }

        return false;
    },

    remove_waiting: function (jid) {
        var bare_jid = Strophe.getBareJidFromJid(jid);

        var i;
        for (i = 0; i < app.waiting.length; i++) {
            var wjid = Strophe.getBareJidFromJid(app.waiting[i]);
            if (wjid === bare_jid) {
                break;
            }
        }

        if (i < app.waiting.length) {
            app.waiting.splice(i, 1);

            $('#log').prepend("<p>Order accepted from " + bare_jid + "</p>");
        }
    },

    send_error: function (iq, etype, ename, app_error) {
        var error = $iq({to: $(iq).attr('from'),
                         id: $(iq).attr('id'),
                         type: 'error'})
            .cnode(iq.cloneNode(true)).up()
            .c('error', {type: etype})
            .c(ename, {xmlns: Strophe.NS.STANZAS}).up();

        if (app_error) {
            error.c(app_error, {xmlns: "http://metajack.im/ns/toetem"});
        }
        
        app._connection.send(error);
    },


    broadcast: function (from) {	
        $.each(app.presence, function () {
	    var msg = Strophe.xmlElement("message", [
							["to",
							this]
					    ]);
	    var child1 = Strophe.xmlElement("waiting", [
							["xmlns", 
							"http://metajack.im/ns/toetem"]
					    ]);
	    var child2 = Strophe.xmlElement("player", [
							["jid", 
							from]
					    ]);
	    msg.appendChild(child1).appendChild(child2);
            app._connection.send(msg);
        });
    },

    send_waiting: function (jid) {
        var msg = $msg({to: jid})
            .c('waiting', {xmlns: 'http://metajack.im/ns/toetem'});

        $.each(app.waiting, function () {
            msg.c('player', {jid: this}).up();
        });

        app._connection.send(msg);
    },
    
    
    on_waiting: function (id, cart_id, from, elem) {
	app.just_get_order(function(result) {
	    app.update_order(result)
	});

        // if they were already waiting, remove them so their resource
        // can be updated
        if (app.is_waiting(from)) {
// recently removed for testing
//	    app.remove_waiting(from);
        }

        app.waiting.push(from);

	var iq = Strophe.xmlElement("iq", [
					      ["id", id],
					      ["to", from],
					      ["type", "result"]
				       ]);
	app._connection.send(iq);

        app.broadcast(from);
/*
        $('#log').prepend("<p>Order arrived from " +
                          Strophe.getBareJidFromJid(from) + ".</p>");
*/
    },

    just_get_order: function(callback_fn) {
	$.getJSON(
	    'http://' + location.host + '/checkout/ajax_merchant_lookup/1/',
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
		var item_order = '<form id="product-' + response_1.item_slug + '" action="http://' + window.location.hostname + '/merchant/manageorder/' + response_1.item_slug + '/" method="POST" class="form" style="margin-bottom:-2px;">' +
				 '<ul class="edgetoedge">' +
				 '<input type="hidden" name="xmpp_jid" value="' + response_1.xmpp_jid + '" />' +
				 '<input type="hidden" name="cart_id" value="' + response_1.cart_id + '" />' +
				 '<li><a href="#" class="submit">' + response_1.customer_orders + '</a></li>' +
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
		var item_order = '<form id="product-' + response_2.item_slug + '" action="http://' + window.location.hostname + '/merchant/manageorder2/' + response_2.item_slug + '/" method="POST" class="form" style="margin-bottom:-2px;">' +
				 '<ul class="edgetoedge">' +
				 '<input type="hidden" name="xmpp_jid" value="' + response_2.xmpp_jid + '" />' +
				 '<input type="hidden" name="cart_id" value="' + response_2.cart_id + '" />' +
				 '<li><a href="#" class="submit">' + response_2.customer_orders + '</a></li>' +
				 '</ul>' +
				 '</form>';
		$(".orders_2").append(item_order);
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
		var item_order = '<form id="product-' + response_3.item_slug + '" action="http://' + window.location.hostname + '/merchant/manageorder3/' + response_3.item_slug + '/" method="POST" class="form" style="margin-bottom:-2px;">' +
				 '<ul class="edgetoedge">' +
				 '<input type="hidden" name="xmpp_jid" value="' + response_3.xmpp_jid + '" />' +
				 '<input type="hidden" name="cart_id" value="' + response_3.cart_id + '" />' +
				 '<li><a href="#" class="submit">' + response_3.customer_orders + '</a></li>' +
				 '</ul>' +
				 '</form>';
		$(".orders_3").append(item_order);
	    });
	}
    },

    send_games: function (jid) {
        var msg = $msg({to: jid})
            .c('games', {xmlns: 'http://metajack.im/ns/toetem'});

        $.each(app.games, function (room2) {
            msg.c('game', {'x-player': this.x_player,
                           'o-player': this.o_player,
                           'room': app.game_room(room2)}).up();
        });

        app._connection.send(msg);
    },

    new_game: function () {
        return {
            room2: null,
            waiting: 2,
            status: 'starting',
            x_player: null,
            o_player: null,
            winner: null
        };
    },

    on_game_start: function (from) {
// alert(from);
        // remove players from waiting list
//        app.remove_waiting(from);

        // create game room and invite players
	app.create_game(from);
    },

    create_game: function (player1) {
        // generate a random room name, and make sure it
        // doesn't already exist to our knowledge
        var room2;
        do {
            room2 = "" + Math.floor(Math.random() * 1000000);
        } while (app.games[room2]);

        var room_jid = room2 + "@conference.kangoria.com/app";
        app._connection.addHandler(function (presence) {
	    var game;

            if ($(presence).find('status[code="201"]').length > 0) {
                // room was freshly created
                game = app.new_game();
                game.room2 = room2;

                // create initial game state with randomized sides
                game.x_player = player1;
		app.games[room2] = game;

                // invite players to start the game
                app.invite_players(game);


                $('#log').prepend("<p>Contacted customer via " + room2 + ".</p>");
            } else {
                // room was already in use, we need to start over
                app._connection.send(
                    $pres({to: room_jid, type: 'unavailable'}));
                app.create_game(player1);
            }

            return false;
        }, null, "presence", null, null, room_jid);

	var msg = Strophe.xmlElement("presence", [
		  ["to", room_jid],
		  ["xmlns", "jabber:client"]
	     ]);
	var x = Strophe.xmlElement("x", [
		  ["xmlns", "http://jabber.org/protocol/muc"]
	    ]);
	msg.appendChild(x);
	app._connection.send(msg);
    },


    invite_players: function (game) {
        // send room invites
        $.each([game.x_player], function () {
	    var msg = Strophe.xmlElement("message", [
							["to",
							game.room2 + "@conference.kangoria.com"]
					    ]);
	    var child1 = Strophe.xmlElement("x", [
							["xmlns", 
							"http://jabber.org/protocol/muc#user"]
					    ]);
	    var child2 = Strophe.xmlElement("invite", [
							["to", 
							this]
					    ]);
	    msg.appendChild(child1).appendChild(child2);
            app._connection.send(msg);

        });
    },


    start_game: function (game) {
        game.status = 'playing';
        Referee.connection.send(
            Referee.muc_msg(game)
                .c('body').t('The match has started.').up()
                .c('game-started', {xmlns: Referee.NS_TOETEM,
                                    'x-player': game.x_player,
                                    'o-player': game.o_player}));

        $('#log').prepend("<p>Started game " + game.room + ".</p>");
    },


    game_room: function (room2) {
        return room2 + "@conference.kangoria.com";
    },

    muc_msg: function (game) {
        return $msg({to: app.game_room(game.room2), type: "groupchat"});
    },

    find_game: function (player) {
        var game = null;
        $.each(app.games, function (r, g) {
            if (Strophe.getBareJidFromJid(g.x_player) === Strophe.getBareJidFromJid(player)) {
                game = g;
                return false;
            }
        });

        return game;
    },

    on_response_to_merchant: function (iq, id, from, elem) {

                app._connection.send(
                    $iq({to: from, id: id, type: 'result'}));

                var game = app.find_game(from);
                app._connection.send(
                    $msg({to: from, type: "chat"})
                        .c('body').t('teeeeeest').up()
                        .c('response_confirmation', {xmlns: 'http://metajack.im/ns/toetem'}));

                $('#response_to_merchant').append("Customer said thank you! ");
    }
    
};
