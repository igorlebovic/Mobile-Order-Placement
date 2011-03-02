var Toetem = {
    connection: null,
    referee: null,
    NS_TOETEM: "http://metajack.im/ns/toetem",
    NS_MUC: "http://jabber.org/protocol/muc",
    game: null,
    x_player: null,
    o_player: null,
    turn: null,
    my_side: null,
    watching: false,

    on_message: function (message) {
        var from = $(message).attr('from');

        if ($(message).find('x > invite').attr('from') === Toetem.referee) {
            $('#getstarted_div').append(
                            "<input id='getstarted' class='button' type='button' value='Respond to Merchant'>");
        } else {
            var cmdNode = $(message)
                .find('*[xmlns="' + Toetem.NS_TOETEM + '"]');
            var cmd = null;
            var row, col;
            if (cmdNode.length > 0) {
                cmd = cmdNode.get(0).tagName;
            }
            if (cmd === 'game-started') {
                var me = Toetem.connection.jid;
                Toetem.x_player = cmdNode.attr('x-player');
                
            } else if (cmd === 'insert-test') {
                $('#testing').append("click response ");
            }
        }

        return true;
    },

};

$(document).ready(function () {
    
    var strHref = window.location.href;
    
    if (strHref.indexOf("?") > -1) {
        $(document).trigger('bypass_connect');
    }
    else {
        $(document).trigger('referee_connect', {
            jid: 'root@kangoria.com/bot',
            password: 'aerodiet'
        });
    }

// testing
    $('#getstarted').live('click', function () {
        $('#testing').append("clicked ");
        
        Toetem.connection.sendIQ(
            $iq({to: Toetem.referee, type: "set"})
                .c("testing", {xmlns: Toetem.NS_TOETEM}));
    });

    
    $('input.start_button').live('click', function () {

        var customer = $(this).attr('name');
        Referee.on_game_start(customer);

    });

});

$(document).bind('referee_connect', function (ev, data) {
    var ref_conn = new Strophe.Connection(
        "http://kangoria.com:5280/http-bind/");
    ref_conn.connect(data.jid, data.password, function (status) {
        if (status === Strophe.Status.CONNECTED) {
            $(document).trigger('referee_connected');
        } else if (status === Strophe.Status.DISCONNECTED) {
            $(document).trigger('disconnected');
        }
    });
    Referee.connection = ref_conn;
});

$(document).bind('referee_connected', function () {
    var ref_conn = Referee.connection;
    referee_id = ref_conn.jid;
    $('#log').prepend("<p>Connected as " + ref_conn.jid + "</p>");
//    $(document).trigger('connect');


    ref_conn.addHandler(Referee.on_presence, null, "presence");
    ref_conn.addHandler(Referee.on_iq, null, "iq");
    
    ref_conn.send($pres());
});

$(document).bind('bypass_connect', function () {
    $(document).trigger('player_connect', {
        jid: 'aerosmile@kangoria.com/player2',
        password: 'aerodiet',
        referee: "root@kangoria.com/bot"
    });
});

$(document).bind('player_connect', function (ev, data) {
    var conn = new Strophe.Connection(
        "http://kangoria.com:5280/http-bind/");

    conn.connect(data.jid, data.password, function (status) {
        if (status === Strophe.Status.CONNECTED) {
            $(document).trigger('player_connected');
        }
    });

    Toetem.connection = conn;
    Toetem.referee = data.referee;
});

$(document).bind('player_connected', function () {
    $('#disconnect').removeAttr('disabled');
    $('#wait').removeAttr('disabled');

    Toetem.connection.addHandler(Toetem.on_message, null, "message");

    // tell the referee we're online
    Toetem.connection.send(
        $pres({to: Toetem.referee})
            .c('register', {xmlns: Toetem.NS_TOETEM}));
    $(document).trigger('joining_game');
});

$(document).bind('joining_game', function () {
    Toetem.connection.sendIQ(
        $iq({to: Toetem.referee, type: "set"})
            .c("waiting", {xmlns: Toetem.NS_TOETEM}));
});