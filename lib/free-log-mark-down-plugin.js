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
        this.markDownUploadView.destroy();
        this.modalPanel.destroy();
        this.subscriptions.dispose();
    },
    serialize() {},
    showPanel() {
        var jwtFlag = this.checkjwt();
        //根据是否有jwt渲染view
        this.markDownUploadView.reCreate(jwtFlag);
        //绑定点击事件
        if( !jwtFlag ) {
            this.loginBiding.apply(this);
        }else {
            this.jwtBinding.apply(this);
        }
        //显示panel
        this.modalPanel.show();
    },
    //绑定登陆点击事件
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
    //绑定jwt上传点击事件
    jwtBinding() {
        //上传
        $('#jwtUploadClk').off('click');
        $('#jwtUploadClk').on('click', () => {
            this.startUpload(this.modalPanel);
        });
        //隐藏窗口
        $('#jwt-close-btn').off('click');
        $('#jwt-close-btn').on('click', (e)=>{
            e.preventDefault();
            this.modalPanel.hide();
        });
        //清楚jwt
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
            if (err ) return atom.notifications.addWarning('login failed: '+err);
            if ( !( bodyJSON.errcode == 0 && bodyJSON.ret == 0 )  ) {
                self.modalPanel.hide();
                return atom.notifications.addError('login failed: '+bodyJSON.msg);
            }
            var username = $('#free-log-username').val();
            //储存当前用户名及jwt
            atom.config.set('free-log-mark-down-plugin.username', username);
            atom.config.set('free-log-mark-down-plugin.jwt',bodyJSON.data);
            atom.notifications.addSuccess('login successfully!');
            //显示panel
            self.showPanel();
        });
    },
    startUpload(panel) {
        atom.notifications.addSuccess('upLoad starting');
        let editor = atom.workspace.getActiveTextEditor(),
            uploadStr = editor.getText(),
            currentFilePath = atom.workspace.getActiveTextEditor().getPath(),
            formData = {
                // Pass data via Streams
                file: fs.createReadStream(currentFilePath)
            };
        $.extend( defaultJSON, formData);
        defaultJSON.resourceName = $('free-log-resource-name').val()?$('free-log-resource-name').val():'defaultResourceName';
        request.post({
                headers : {
                    authentication : atom.config.get('free-log-mark-down-plugin.jwt')
                },
                url:'http://192.168.0.3:1201/resource/v1/resources',
                formData: defaultJSON
            }, function optionalCallback(err, httpResponse, body) {
                let responsebody = JSON.parse(body);
                if (err)  return atom.notifications.addWarning('upload failed:');
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
        this.modalPanel.hide();
        atom.config.set('free-log-mark-down-plugin.jwt',null);
        atom.config.set('free-log-mark-down-plugin.username', null);
    }
};
