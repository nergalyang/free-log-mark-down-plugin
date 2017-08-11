'use babel';
import $ from 'jquery';
import _ from 'underscore';
import fstools from  './functional-tools';
import DownloadView from './download-view';
import UploadView from './upload-view';
import LoginView from './login-view'
import { CompositeDisposable } from 'atom';
import request  from 'request';
import debug  from 'request-debug';
import defaultJSON from '../defaultUploadJSON';
import fs from 'fs';
//监听request的network
debug(request);
export default {
    subscriptions: null,
    panels:[],
    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();
        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'Free-log-mark-down:login': (e) => this.showPanel(e),
            'Free-log-mark-down:upload': (e) => this.showPanel(e),
            'Free-log-mark-down:download': (e) => this.showPanel(e)
        }));
    },
    deactivate() {
        //不一定每个view都已经生成
        try {
            this.loginView.destroy();
            this.uploadView.destroy();
            this.downloadView.destroy();
        } catch(e) {

        }
        destroyEach(this.panels);
        this.subscriptions.dispose();
    },
    serialize() {},
    showPanel(e) {
        _.compose(this.closeBinding.bind(this),
             fstools.dispatch(
                fstools.isas('Free-log-mark-down:login', this.showLoginPanel.bind(this), this.loginBiding.bind(this) ),
                fstools.isas('Free-log-mark-down:upload', this.showUploadPanel.bind(this), this.jwtBinding.bind(this) ),
                fstools.isas('Free-log-mark-down:download', this.showDownloadPanel.bind(this), this.downloadBinding.bind(this) )
            ))(e);
            //e的type是命令
    },
    showLoginPanel(e) {
        this.loginView = new LoginView();
        this.loginPanel = atom.workspace.addModalPanel({
            item: this.loginView.getElement(),
            visible: false
        });
        this.panels.push(this.loginPanel);
        this.loginPanel.show();
    },
    showUploadPanel() {
        var jwtFlag = this.checkjwt();
        if ( !jwtFlag ) {
            destroyEach(this.panels);
            return this.showPanel({'type': 'Free-log-mark-down:login'});
        }
        //根据是否有jwt渲染view
        this.uploadView = new UploadView();
        this.uploadPanel = atom.workspace.addModalPanel({
            item: this.uploadView.getElement(),
            visible: false
        });
        $('#jwt-username').html(atom.config.get('free-log-mark-down-plugin.username'));
        this.panels.push(this.uploadPanel);
        //显示panel
        this.uploadPanel.show();
    },
    showDownloadPanel() {
        if( !this.checkjwt() ) return atom.notifications.addError('Download error: please login first');
        this.downloadView = new DownloadView();
        this.downloadPanel = atom.workspace.addModalPanel({
            item: this.downloadView.getElement(),
            visible: false
        });
        this.panels.push(this.downloadPanel);
        this.downloadPanel.show();
    },
    checkjwt() {
        return atom.config.get('free-log-mark-down-plugin.jwt');
    },
    //绑定登陆点击事件
    closeBinding() {
        var self = this;
        $('.free-log-close-btn').off('click');
        $('.free-log-close-btn').on('click', (e)=>{
            e.preventDefault();
            destroyEach(self.panels);
        });
    },
    loginBiding() {
        $('#loginClk').off('click');
        $('#loginClk').on('click', ()=>{
            this.login.call(this);
        });
    },
    //绑定jwt上传点击事件
    jwtBinding() {
        //上传
        $('#jwtUploadClk').off('click');
        $('#jwtUploadClk').on('click', () => {
            this.startUpload(this.uploadPanel);
        });
        //清除jwt
        $('#logoutClk').off('click');
        $('#logoutClk').on('click', () => {
            this.logout.call(this);
        });
    },
    downloadBinding(){
        var self = this;
        $('#downloadClk').off('click');
        $('#downloadClk').on('click', () => {
            let resourceId = $('#download-resourceid').val();
            if(_.isEmpty( resourceId )) {
                return self.downloadView.setWarning('Please enter a resourceId');
            }
            self.startDownload.call( self,  resourceId );
        })
    },
    login () {
        var self = this;
        var username = $('#free-log-login-username').val(),
              password = $('#free-log-login-password').val();
        if (!( username && password )) {
            $('#loginMsg').html('Please enter usename or password.');
        }
        $('#loginMsg').html('');
        request.get({
            url: ['http://192.168.0.3:1201/identity/v1/passport/login?userName=',usename,'&passWord=',password,'&jwtType=header'].join('')
        }, function optionalCallback(err, httpResponse, body) {
            var bodyJSON = JSON.parse(body);
            destroyEach(self.panels);
            if (err ) {
                return atom.notifications.addWarning('login failed: '+err);
            }
            if ( !( bodyJSON.errcode == 0 && bodyJSON.ret == 0 )  ) {
                return atom.notifications.addError('login failed: '+bodyJSON.msg);
            }
            //储存当前用户名及jwt
            atom.config.set('free-log-mark-down-plugin.username', username);
            atom.config.set('free-log-mark-down-plugin.jwt',bodyJSON.data);
            atom.notifications.addSuccess('login successfully!');
            // //显示panel
            // self.showPanel({'type': 'Free-log-mark-down:upload'});
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
        let resourceName = $('free-log-resource-name').val();
        if ( resourceName ) defaultJSON.resourceName = resourceName;
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
                    panel.destroy();
                    return atom.notifications.addError('upload failed: '+responsebody.msg);
                }
                //添加jwt
                atom.notifications.addSuccess('upLoad successful!, resourceId is :'+ responsebody.data.resourceId);
                panel.destroy();
            });
    },
    startDownload(resourceId) {
        var self = this;
        request.get({
                headers : {
                    authentication : atom.config.get('free-log-mark-down-plugin.jwt')
                },
                url:'http://192.168.0.3:1201/resource/v1/resources/'+resourceId+'.md'
            }, function optionalCallback(err, httpResponse, body) {
                destroyEach(self.panels);
                if (err)  return atom.notifications.addWarning('upload failed:');
                var bodyJSON = JSON.parse(body);
                atom.workspace.getActiveTextEditor().insertText(bodyJSON.data);
                atom.notifications.addSuccess('download successful!');
            });
    },
    logout() {
        destroyEach(this.panels);
        atom.config.set('free-log-mark-down-plugin.jwt',null);
        atom.config.set('free-log-mark-down-plugin.username', null);
    }
};

function destroyEach( objs ) {
    _.each(objs, (el) => {
            el.destroy();
    });
}
