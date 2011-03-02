var Referee = {
    connection: null,

    games: {},
    waiting: [],
    presence: {},

    NS_TOETEM: "http://metajack.im/ns/toetem",
    NS_MUC: "http://jabber.org/protocol/muc",
    NS_MUC_USER: "http://jabber.org/protocol/muc#user",
    NS_MUC_OWNER: "http://jabber.org/protocol/muc#owner",

    MUC_SERVICE: 'conference.kangoria.com',
    
    is_waiting: function (jid) {
        var bare_jid = Strophe.getBareJidFromJid(jid);

        var i;
        for (i = 0; i < Referee.waiting.length; i++) {
            var wjid = Strophe.getBareJidFromJid(Referee.waiting[i]);
            if (wjid === bare_jid) {
                return true;
            }
        }

        return false;
    },

    remove_waiting: function (jid) {
        var bare_jid = Strophe.getBareJidFromJid(jid);

        var i;
        for (i = 0; i < Referee.waiting.length; i++) {
            var wjid = Strophe.getBareJidFromJid(Referee.waiting[i]);
            if (wjid === bare_jid) {
                break;
            }
        }

        if (i < Referee.waiting.length) {
            Referee.waiting.splice(i, 1);

            $('#log').prepend("<p>Removed " + bare_jid + " from " +
                              "waiting list</p>");
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
            error.c(app_error, {xmlns: Referee.NS_TOETEM});
        }
        
        Referee.connection.send(error);
    },

    on_presence: function (pres) {
        var from = $(pres).attr('from');
        var bare_from = Strophe.getBareJidFromJid(from);
        var type = $(pres).attr('type');
        var bare_jid = Strophe.getBareJidFromJid(Referee.connection.jid);
        var domain = Strophe.getDomainFromJid(from);

        if (domain === Referee.MUC_SERVICE) {
            // handle room presence
            var room = Strophe.getNodeFromJid(from);
            var player = Strophe.getResourceFromJid(from);
            var game = Referee.games[room];

            if (game && type !== 'unavailable') {
                // handle observers joining
                var msg = $msg({to: from, type: 'chat'});
                if (game.status === 'starting') {
                    msg.c('body').t('Waiting for players...').up()
                        .c('game-state', {xmlns: Referee.NS_TOETEM,
                                          'phase': game.status,
                                          'x-player': game.x_player,
                                          'o-player': game.o_player});
                }

                Referee.connection.send(msg);

                $('#log').prepend("<p>Sent state to observer " + bare_from +
                                  " in game " + game.room + ".</p>");
            }
        } else if ((!type || type === "unavailable") && 
                   bare_from !== bare_jid) {
            // handle directed presence from players
            if (type === "unavailable") {
                delete Referee.presence[bare_from];
                
                // remove from lists
                Referee.remove_waiting(from);

                $('#log').prepend("<p>Unregistered " + bare_from + ".</p>");
            } else if ($(pres).find('register').length > 0) {
                Referee.presence[bare_from] = from;

                $('#log').prepend("<p>Registered " + bare_from + ".</p>");
                
                Referee.send_waiting(from);
                Referee.send_games(from);
            }
        }
        
        return true;
    },

    broadcast: function (func) {
        $.each(Referee.presence, function () {
            var msg = func($msg({to: this}));
            Referee.connection.send(msg);
        });
    },

    send_waiting: function (jid) {
        var msg = $msg({to: jid})
            .c('waiting', {xmlns: Referee.NS_TOETEM});

        $.each(Referee.waiting, function () {
            msg.c('player', {jid: this}).up();
        });

        Referee.connection.send(msg);
    },
    
    on_iq: function (iq) {
        var id = $(iq).attr('id');
        var from = $(iq).attr('from');
        var type = $(iq).attr('type');
        
        // make sure we know the user's presence first
        if (!Referee.presence[Strophe.getBareJidFromJid(from)]) {
            Referee.send_error(iq, 'auth', 'forbidden');
        } else {
            var child = $(iq).find('*[xmlns="' + Referee.NS_TOETEM +
                                   '"]:first');
            if (child.length > 0) {
                if (type === 'get') {
                    Referee.send_error(iq, 'cancel', 'bad-request');
                    return true;
                } else if (type !== 'set') {
                    // ignore IQ-error and IQ-result
                    return true;
                }
                
                switch (child[0].tagName) {
                case 'waiting':
                    Referee.on_waiting(id, from, child);
                    break;
                    
                case 'start':
                    Referee.on_game_start(iq, id, from, child);
                    break;

                case 'testing':
                    Referee.on_testing(iq, id, from, child);
                    break;

                default:
                    Referee.send_error(iq, 'cancel', 'bad-request');
                }
            } else {
                Referee.send_error(iq, 'cancel', 'feature-not-implemented');
            }
        }

        return true;
    },
    
    
    on_waiting: function (id, from, elem) {

                $('#waiting tbody').append(
                        "</td><td>" +
                        ($(this).attr('jid') === Referee.connection.jid ?
                         "" :
                         "<input type='button' class='start_button' id='start_game' " +
                         "value='Accept Order' name='" + from + "'>") +
                        "</td></tr>");


        // if they were already waiting, remove them so their resource
        // can be updated
        if (Referee.is_waiting(from)) {
            Referee.remove_waiting(from);
        }

        Referee.waiting.push(from);

        Referee.connection.send($iq({to: from, id: id, type: 'result'}));

        Referee.broadcast(function (msg) {
            return msg.c('waiting', {xmlns: Referee.NS_TOETEM})
                .c('player', {jid: from});
        });

        $('#log').prepend("<p>Added " +
                          Strophe.getBareJidFromJid(from) + " to " +
                          "waiting list.</p>");
    },

    send_games: function (jid) {
        var msg = $msg({to: jid})
            .c('games', {xmlns: Referee.NS_TOETEM});

        $.each(Referee.games, function (room) {
            msg.c('game', {'x-player': this.x_player,
                           'o-player': this.o_player,
                           'room': Referee.game_room(room)}).up();
        });

        Referee.connection.send(msg);
    },

    new_game: function () {
        return {
            room: null,
            waiting: 2,
            status: 'starting',
            x_player: null,
            o_player: null,
            winner: null
        };
    },

    on_game_start: function (from) {
        // remove players from waiting list
        Referee.remove_waiting(from);

        // create game room and invite players
        Referee.create_game(from);
    },

    create_game: function (player1) {
        // generate a random room name, and make sure it
        // doesn't already exist to our knowledge
        var room;
        do {
            room = "" + Math.floor(Math.random() * 1000000);
        } while (Referee.games[room]);

        var room_jid = room + "@" + Referee.MUC_SERVICE + "/Referee";
        Referee.connection.addHandler(function (presence) {
            var game;

            if ($(presence).find('status[code="201"]').length > 0) {
                // room was freshly created
                game = Referee.new_game();
                game.room = room;

                // create initial game state with randomized sides
                game.x_player = player1;

                // invite players to start the game
                Referee.invite_players(game);


                $('#log').prepend("<p>Created game room " + room + ".</p>");
            } else {
                // room was already in use, we need to start over
                Referee.connection.send(
                    $pres({to: room_jid, type: 'unavailable'}));
                Referee.create_game(player1, player2);
            }

            return false;
        }, null, "presence", null, null, room_jid);
        
        Referee.connection.send(
            $pres({to: room_jid})
                .c("x", {xmlns: Referee.NS_MUC}));
    },
    
    invite_players: function (game) {
        // send room invites
        $.each([game.x_player], function () {
            Referee.connection.send(
                $msg({to: game.room + "@" + Referee.MUC_SERVICE})
                    .c('x', {xmlns: Referee.NS_MUC_USER})
                    .c('invite', {to: this}));
        });
    },

    game_room: function (room) {
        return room + "@" + Referee.MUC_SERVICE;
    },

    muc_msg: function (game) {
        return $msg({to: Referee.game_room(game.room), type: "groupchat"});
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

    find_game: function (player) {
        var game = null;
        $.each(Referee.games, function (r, g) {
            if (g.x_player === player) {
                game = g;
                return false;
            }
        });

        return game;
    },

    on_testing: function (iq, id, from, elem) {

                Referee.connection.send(
                    $iq({to: from, id: id, type: 'result'}));

                var game = Referee.find_game(from);
//                alert(game);
                Referee.connection.send(
                    $msg({to: from, type: "chat"})
                        .c('body').t('teeeeeest').up()
                        .c('insert-test', {xmlns: Referee.NS_TOETEM}));

                $('#testing').append("customer ");
    }
};