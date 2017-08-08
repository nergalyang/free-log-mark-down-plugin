'use babel';
import $ from 'jquery';
import markDownUploadView from './free-log-mark-down-plugin-view';
import { CompositeDisposable } from 'atom';
import request  from 'request';
import debug  from 'request-debug';
import defaultJSON from '../defaultUploadJSON';
import fs from 'fs';
//监听request的network
debug(request);
export default {
    markDownUploadView: null,
    modalPanel: null,
    subscriptions: null,
    initialize() {

    },
    activate(state) {
        //生成view对象
        this.markDownUploadView = new markDownUploadView(null, this.checkjwt());
        //panel添加view对象
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.markDownUploadView.getElement(),
            visible: false
        });
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'Free-log-mark-down:upload': () => this.showPanel()
        }));
    },
    checkjwt() {
        return atom.config.get('free-log-mark-down-plugin.jwt');
    },
    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.markDownUploadView.destroy();
    },
    serialize() {

    },
    showPanel() {
        //绑定点击事件
        var jwtFlag = this.checkjwt();
        this.markDownUploadView.reCreate(jwtFlag);
        if( !jwtFlag ) {
            this.loginBiding.apply(this);
        }else {
            this.jwtBinding.apply(this);
        }
        this.modalPanel.show();
    },
    loginBiding() {
        $('#loginClk').off('click');
        $('#loginClk').on('click', ()=>{
            this.login(this.modalPanel);
        });
        $('#free-log-close-btn').off('click');
        $('#free-log-close-btn').on('click', (e)=>{
            e.preventDefault();
            this.modalPanel.hide();
        });
    },
    jwtBinding() {
        $('#jwtUploadClk').off('click');
        $('#jwtUploadClk').on('click', () => {
            this.startUpload(this.modalPanel);
        });
        $('#jwt-close-btn').off('click');
        $('#jwt-close-btn').on('click', (e)=>{
            console.log('jwt close click')
            e.preventDefault();
            this.modalPanel.hide();
        });
        $('#logoutClk').off('click');
        $('#logoutClk').on('click', () => {
            this.logout();
        });
    },
    login () {
        var self = this;
        request.get({
            url: 'http://192.168.0.3:1201/identity/v1/passport/login?userName=yuliang&passWord=123456&jwtType=header'
        }, function optionalCallback(err, httpResponse, body) {
            var bodyJSON = JSON.parse(body)
            if (err ) return atom.notifications.addWarning('upload failed:');
            if ( bodyJSON.errcode == 100 ) {
                self.modalPanel.hide();
                return atom.notifications.addError('upload failed: '+bodyJSON.msg);
            }
            var username = $('#free-log-username').val();
            atom.config.set('free-log-mark-down-plugin.username', username);
            atom.config.set('free-log-mark-down-plugin.jwt',bodyJSON.data);
            atom.notifications.addSuccess('login successfully!');
            self.showPanel()
        });
    },
    startUpload(panel) {
        atom.notifications.addSuccess('upLoad starting');
        let editor = atom.workspace.getActiveTextEditor();
        let uploadStr = editor.getText();
        let currentFilePath = atom.workspace.getActiveTextEditor().getPath();

        let formData = {
           // Pass data via Streams
            file: fs.createReadStream(currentFilePath)
        };
        $.extend( defaultJSON, formData);
        defaultJSON.resourceName = $('#jwt-username').val();
        request.post({
                headers : {
                    authentication : atom.config.get('free-log-mark-down-plugin.jwt')
                },
                url:'http://192.168.0.3:1201/resource/v1/resources',
                formData: defaultJSON
            }, function optionalCallback(err, httpResponse, body) {

                let responsebody = JSON.parse(body);
                if (err) {
                    return atom.notifications.addWarning('upload failed:');
                }
                if ( !( responsebody.errcode == 0 &&  responsebody.ret ==0 ) ) {
                    panel.hide();
                    return atom.notifications.addError('upload failed: '+responsebody.msg);
                }
                //添加jwt

                atom.notifications.addSuccess('upLoad successful!, resourceId is :'+ responsebody.data.resourceId);
                panel.hide();
            });
    },
    logout() {
        atom.config.set('free-log-mark-down-plugin.jwt',null)
    }
};
