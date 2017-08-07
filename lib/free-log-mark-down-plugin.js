'use babel';
import $ from 'jquery';
import markDownUploadView from './free-log-mark-down-plugin-view';
import { CompositeDisposable } from 'atom';
import  request  from 'request';
import  debug  from 'request-debug';
import defaultJSON from '../defaultUploadJSON';
import fs from 'fs';
//监听request的network
//debug(request);
export default {
    markDownUploadView: null,
    modalPanel: null,
    subscriptions: null,
    initialize() {
        this.jwt = atom.config.get('free-log-mark-down-plugin.jwt')
    },
    activate(state) {
        //生成view对象
        this.markDownUploadView = new markDownUploadView(state.markDownUploadViewState, this.jwt);
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
    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.markDownUploadView.destroy();
    },
    serialize() {

    },
    showPanel() {
        //绑定点击事件
        if( this.jwt ) {
            loginBiding.apply(this);
        }else {
            jwtBinding.apply(this);
        }
        this.modalPanel.show();
    },
    loginBiding() {
        $('#uploadClk').off('click');
        $('#uploadClk').on('click', ()=>{
            this.startUpload(this.modalPanel);
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
        $('#logoutClk').off('click', () => {
            this.logout();
        });
    },
    hide() {
        this.modalPanel.hide();
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
        defaultJSON.resourceName = $('#free-log-user-name').val();
        request.post({
                url:'http://192.168.0.3:7001/v1/resources',
                formData: defaultJSON
            }, function optionalCallback(err, httpResponse, body) {

                let responsebody = JSON.parse(body);
                    if (err) {
                        return atom.notifications.addWarning('upload failed:');
                    }
                if ( responsebody.errcode == 100 ) {

                    panel.hide();

                    return atom.notifications.addError('upload failed: '+responsebody.msg);
                }
                //添加jwt
                atom.config.get('free-log-mark-down-plugin.jwt','还没做')
                atom.notifications.addSuccess('upLoad successful!, resourceId is :'+ responsebody.data.resourceId);
                panel.hide();
            });
    },
    logout() {
        request.post({
                headers: {
                    'authentication': 'pending'
                },
                url:'',
            }, function optionalCallback(err, httpResponse, body) {

            });
    }
};
