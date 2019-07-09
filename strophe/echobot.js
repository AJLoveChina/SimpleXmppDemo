var BOSH_SERVICE = 'wss://404.city:5280/ws';
var connection = null;
let meJID;

function log(msg) {
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}

$(document).on("click", "#send-message", () => {
	let toJid = $("#to-jid").val();
	let toMessage = $("#to-message").val();

    let body = document.createElement("body");
    body.innerHTML = toMessage;
    log(`发送消息: ${toMessage}`);
    var reply = $msg({to: toJid, from: meJID, type: 'chat'})
        .cnode(body);
    connection.send(reply.tree());
});

function onConnect(status) {
    if (status == Strophe.Status.CONNECTING) {
        log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
        log('Strophe failed to connect.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
        log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {

        log('Strophe is disconnected.');
        $('#connect').get(0).value = 'connect';
        $("#huifu").hide();

    } else if (status == Strophe.Status.CONNECTED) {

        $("#huifu").show();
        log('Strophe is connected.');
        log('ECHOBOT: Send a message to ' + connection.jid +
            ' to talk to me.');

        connection.addHandler(onMessage, null, 'message', null, null, null);
        connection.send($pres().tree());
    }
}

function onMessage(msg) {
    var to = msg.getAttribute('to');
    meJID = to;
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "chat" && elems.length > 0) {
        var body = elems[0];
        log(`收到一条消息.  发送方地址: ${from}  内容: ${Strophe.getText(body)}`);
    }

    return true;
}

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE);

    $('#connect').bind('click', function () {
        var button = $('#connect').get(0);
        if (button.value == 'connect') {
            button.value = 'disconnect';

            connection.connect($('#jid').get(0).value,
                $('#pass').get(0).value,
                onConnect);
        } else {
            button.value = 'connect';
            connection.disconnect();
        }
    });
});
