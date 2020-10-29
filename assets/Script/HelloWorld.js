cc.Class({
    extends: cc.Component,

    properties: {
        langLabelSetup1PlaceHolder: {
            default: null,
            type: cc.Label
        },

        langLabelSetup1BtnLabel: {
            default: null,
            type: cc.Label
        },

        langLabelSetup2PlaceHolder: {
            default: null,
            type: cc.Label
        },

        langLabelSetup2BtnLabel: {
            default: null,
            type: cc.Label
        },

        subscribeRemoteStreamLabel: {
            default: null,
            type: cc.Label
        },

        publishLocalStreamLabel: {
            default: null,
            type: cc.Label
        },

        subscribeOrPublishStreamLabel: {
            default: null,
            type: cc.Label
        },

        btnInit: {
            default: null,
            type: cc.Button
        },

        btnJoin: {
            default: null,
            type: cc.Button
        },

        btnLocal: {
            default: null,
            type: cc.Button
        },

        btnRemote: {
            default: null,
            type: cc.Button
        },

        btnCNLang: {
            default: null,
            type: cc.Button
        },

        btnENLang: {
            default: null,
            type: cc.Button
        },

        ebAppID: {
            default: null,
            type: cc.EditBox
        },

        ebChannel: {
            default: null,
            type: cc.EditBox
        },

        logListView: {
            default: null,
            type: cc.ScrollView
        },

        localSprite: {
            default: null,
            type: cc.Sprite
        },

        disableLocalSprite: {
            default: null,
            type: cc.Sprite
        },

        remoteSprite: {
            default: null,
            type: cc.Sprite
        },

        disableRemoteSprite: {
            default: null,
            type: cc.Sprite
        },

        cnLanguageSprite: {
            default: null,
            type: cc.Sprite
        },

        enLanguageSprite: {
            default: null,
            type: cc.Sprite
        },

        cnLanguageLabel: {
            default: null,
            type: cc.Label
        },

        enLanguageLabel: {
            default: null,
            type: cc.Label
        },

        itemTemplate: {
            default: null,
            type: cc.Node
        },
        joined: false,
        lang: "zh",
        muteRemote: false,
        muteLocal: false,
        logs: 0,
    },

    // use this for initialization
    onLoad: function () {
        this.initAgoraEvents();
        this.btnInit.interactable = true;
        this.btnJoin.interactable = false;
        this.btnLocal.interactable = false;
        this.btnRemote.interactable = false;
        this.ebAppID.interactable = false;
        this.lang = cc.sys.language;
        this.initMultiLang();
        this.updateLangBackground(true);
        this.updateMute();
        this.initAgora();
    },

    initAgoraEvents: function () {
        if (agora) {
            agora.on('joinChannelSuccess', this.onJoinChannelSuccess, this);
            agora.on('leaveChannel', this.onLeaveChannel, this);
            agora.on('rejoinChannelSuccess', this.onRejoinChannelSuccess, this);
            agora.on('warning', this.onWarning, this);
            agora.on('error', this.onError, this);
            agora.on('audioQuality', this.onAudioQuality, this);
            agora.on('audioVolumeIndication', this.onAudioVolumeIndication, this);
            agora.on('networkQuality', this.onNetworkQuality, this);
            agora.on('userJoined', this.onUserJoined, this);
            agora.on('userOffline', this.onUserOffline, this);
            agora.on('userMuteAudio', this.onUserMuteAudio, this);
            agora.on('audioRouteChanged', this.onAudioRoutingChanged, this);
            agora.on('connectionLost', this.onConnectionLost, this);
            agora.on('connectionInterrupted', this.onConnectionInterrupted, this);
            agora.on('requestToken', this.onRequestToken, this);
            agora.on('connectionBanned', this.onConnectionBanned, this);
            agora.on('clientRoleChanged', this.onClientRoleChanged, this);
        }
    },

    onDestroy: function () {
        this.uninitAgoraEvents();
    },

    uninitAgoraEvents: function () {
        if (agora) {
            agora.off('joinChannelSuccess', this.onJoinChannelSuccess, this);
            agora.off('leaveChannel', this.onLeaveChannel, this);
            agora.off('rejoinChannelSuccess', this.onRejoinChannelSuccess, this);
            agora.off('warning', this.onWarning, this);
            agora.off('error', this.onError, this);
            agora.off('audioQuality', this.onAudioQuality, this);
            agora.off('audioVolumeIndication', this.onAudioVolumeIndication, this);
            agora.off('networkQuality', this.onNetworkQuality, this);
            agora.off('userJoined', this.onUserJoined, this);
            agora.off('userOffline', this.onUserOffline, this);
            agora.off('userMuteAudio', this.onUserMuteAudio, this);
            agora.off('audioRouteChanged', this.onAudioRoutingChanged, this);
            agora.off('connectionLost', this.onConnectionLost, this);
            agora.off('connectionInterrupted', this.onConnectionInterrupted, this);
            agora.off('requestToken', this.onRequestToken, this);
            agora.off('connectionBanned', this.onConnectionBanned, this);
            agora.off('clientRoleChanged', this.onClientRoleChanged, this);
        }
    },

    initMultiLang: function () {
        if (this.lang === cc.sys.LANGUAGE_CHINESE) {
            this.langLabelSetup1PlaceHolder.string = "App ID (声网控制台获取)";
            this.langLabelSetup1BtnLabel.string = "初始化 (默认已经初始化)";
            this.langLabelSetup2PlaceHolder.string = "能标识频道的频道名";
            this.langLabelSetup2BtnLabel.string = this.joined ? "离开频道" : "加入频道";
            this.subscribeOrPublishStreamLabel.string = "发布和订阅流";
            this.publishLocalStreamLabel.string = "发布流";
            this.subscribeRemoteStreamLabel.string = "订阅流";
        } else if (this.lang === cc.sys.LANGUAGE_ENGLISH) {
            this.langLabelSetup1PlaceHolder.string = "App ID (Get from Agora Dashboard)";
            this.langLabelSetup1BtnLabel.string = "Initialize (Initialized by default)";
            this.langLabelSetup2PlaceHolder.string = "Channel Name";
            this.langLabelSetup2BtnLabel.string = this.joined ? "Leave Channel" : "Join Channel";
            this.subscribeOrPublishStreamLabel.string = "Publish or subscribe stream";
            this.publishLocalStreamLabel.string = "Publish";
            this.subscribeRemoteStreamLabel.string = "Subscribe";
        }
    },

    initAgora: function () {
        // PLEASE KEEP THIS appId IN SAFE PLACE
        // Get your own App ID at https://docs.agora.io/cn/Interactive%20Gaming/game_c?platform=Cocos%20Creator
        // After you entered the appId, remove ## outside of YOUR_APPID
        var appid = ##YOUR_APPID;
        if (appid == "") {
            this.printLog("Please input appid!");
            return;
        }
        agora && agora.init(appid);
        this.btnInit.interactable = false;
        this.btnJoin.interactable = true;
        this.ebAppID.string = appid;
        this.ebAppID.enabled = false;

        this.printLog("Step 1: Init Agora Engine");
        this.printLog("Init agora, appid: " + appid);
        this.printCode(`agora && agora.init('${appid}');`);
        this.printLog("Init engine success!");
        this.printLog("\r\n\r\n");
        this.printLog("Step 2: Join Channel");
    },

    // step2: join Channel
    joinChannel: function () {
        if (this.joined) {
            agora && agora.leaveChannel();
            this.printCode(`agora && agora.leaveChannel();`);
        } else {
            var channel = this.ebChannel.string;
            if (channel == "") {
                this.printLog("Please input channel!");
                return;
            }
            agora && agora.joinChannel("", channel, "", 0);
            this.printCode(`agora && agora.joinChannel("", '${channel}', "", 0);`);
        }
    },

    updateMute: function () {
        this.localSprite.node.active = !this.muteLocal;
        this.disableLocalSprite.node.active = this.muteLocal;
        this.remoteSprite.node.active = !this.muteRemote;
        this.disableRemoteSprite.node.active = this.muteRemote;
    },

    btnLocalStream: function () {
        this.muteLocal = !this.muteLocal;
        this.updateMute();
        agora && agora.muteLocalAudioStream(this.muteLocal);
        this.printLog(this.muteLocal ? "mute" : "unmute" + " local audio");
        this.printCode(`agora && agora.muteLocalAudioStream(${this.muteLocal});`);
    },

    btnRemoteStream: function () {
        this.muteRemote = !this.muteRemote;
        this.updateMute();
        agora && agora.muteAllRemoteAudioStreams(this.muteRemote)
        this.printLog(this.muteRemote ? "mute" : "unmute" + " remote audio");
        this.printCode(`agora && agora.muteAllRemoteAudioStreams(${this.muteRemote});`);
    },

    switchLangCN: function () {
        this.lang = cc.sys.LANGUAGE_CHINESE;
        this.initMultiLang();
        this.updateLangBackground(true);
    },

    switchLangEN: function () {
        this.lang = cc.sys.LANGUAGE_ENGLISH;
        this.initMultiLang();
        this.updateLangBackground(false);
    },

    updateLangBackground: function (isCnLanguage) {
        if (isCnLanguage) {
            this.cnLanguageSprite.node.active = true;
            this.enLanguageSprite.node.active = false;
            this.cnLanguageLabel.node.color = new cc.Color(204, 204, 204, 255);
            this.enLanguageLabel.node.color = cc.Color.WHITE;
        } else {
            this.cnLanguageSprite.node.active = false;
            this.enLanguageSprite.node.active = true;
            this.enLanguageLabel.node.color = new cc.Color(204, 204, 204, 255);
            this.cnLanguageLabel.node.color = cc.Color.WHITE;
        }
    },

    exitBtnClick: function () {
        if (cc.sys.isBrowser) {
            cc.game.restart();
        } else if (cc.sys.isNative) {
            cc.game.end();
        }
    },

    printCode: function (code) {
        this.printLog("   ");
        this.printLog("---------- Sample code start ----------");
        this.printLog(code);
        this.printLog("---------- Sample code end   ----------");
        this.printLog("   ");
    },

    printLog: function (info) {
        var item = cc.instantiate(this.itemTemplate);
        this.logListView.content.addChild(item);
        item.getComponent('Item').updateItem(info);
        this.logListView.scrollToBottom(0.1);
    },

    onJoinChannelSuccess: function (channel, uid, elapsed) {
        // agora && agora.muteLocalAudioStream(this.muteLocal);
        // agora && agora.muteAllRemoteAudioStreams(this.muteRemote);
        this.btnLocal.interactable = true;
        this.btnRemote.interactable = true;
        this.joined = true;
        this.initMultiLang();
        this.printLog("Join channel success, channel: " + channel + " uid: " + uid + " elapsed: " + elapsed);
    },

    onLeaveChannel: function (stat) {
        this.printLog("Leave channel success");
        this.btnLocal.interactable = false;
        this.btnRemote.interactable = false;
        this.joined = false;
        this.initMultiLang();
    },

    onRejoinChannelSuccess: function (channel, uid, elapsed) {
        this.printLog("onRejoinChannelSuccess, channel: " + channel + " uid: " + uid + " elapsed: " + elapsed);
    },

    onWarning: function (warn, msg) {
        this.printLog("onWarning, warn: " + warn + " msg: " + msg);
    },

    onError: function (warn, msg) {
        this.printLog("onError, warn: " + warn + " msg: " + msg);
    },

    onAudioQuality: function (uid, quality, delay, lost) {
        cc.log("onAudioQuality, uid: " + uid + " quality: " + quality + " delay: " + delay + " lost: " + lost);
    },

    onAudioVolumeIndication: function (speakers, speakerNumber, totalVolume) {
        this.printLog("[js]onAudioVolumeIndication, speakerNumber: %d, totalVolume: %d!", speakerNumber, totalVolume);
        for (var i = 0; i < speakerNumber; i++) {
            if (speakers[i].uid == 0 && speakerNumber == 1) {
                this.printLog("[js]onAudioVolumeIndication, Local Speaker: [%d], uid: %d, volume: %d", i, speakers[i].uid, speakers[i].volume);
                return;
            } else {
                this.printLog("[js]onAudioVolumeIndication, Remote Speaker: [%d], uid: %d, volume: %d", i, speakers[i].uid, speakers[i].volume);
            }
        }
    },

    onNetworkQuality: function (uid, txQuality, rxQuality) {
        cc.log("onNetworkQuality, uid: " + uid + " txQuality: " + txQuality + " rxQuality: " + rxQuality);
    },

    onUserJoined: function (uid, elapsed) {
        this.printLog("onUserJoined, uid: " + uid + " elapsed: " + elapsed);
    },

    onUserOffline: function (uid, reason) {
        this.printLog("onUserOffline, uid: " + uid + " reason: " + reason);
    },

    onUserMuteAudio: function (uid, muted) {
        this.printLog("onUserMuteAudio, uid: " + uid + " muted: " + muted);
    },

    onAudioRoutingChanged: function (routing) {

    },

    onConnectionLost: function () {
        this.printLog("onConnectionLost");
    },

    onConnectionInterrupted: function () {
        this.printLog("onConnectionInterrupted");
    },

    onRequestToken: function () {
        this.printLog("onRequestToken");
    },

    onConnectionBanned: function () {
        this.printLog("onConnectionBanned");
    },

    onClientRoleChanged: function (oldRole, newRole) {
        this.printLog("onClientRoleChanged");
    },
});
