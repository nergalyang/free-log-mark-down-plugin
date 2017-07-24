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

    activate(state) {
        this.markDownUploadView = new markDownUploadView(state.markDownUploadViewState);
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.markDownUploadView.getElement(),
            visible: false
        });
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'Free-log-mark-down:upload': () => this.upLoad()
        }));
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.markDownUploadView.destroy();
    },

    serialize() {

    },

    upLoad() {
        var self = this;
        $('#uploadClk').off('click');
        $('#uploadClk').on('click', ()=>{
            self.startUpload(self.modalPanel);
        });
        $('#free-log-close-btn').off('click');
        $('#free-log-close-btn').on('click', (e)=>{
            e.preventDefault();
            self.modalPanel.hide();
        });
        this.modalPanel.show();
    },

    hide() {
        this.modalPanel.hide();
    },

    startUpload(panel) {
        atom.notifications.addSuccess('upLoad starting');
        let editor = atom.workspace.getActiveTextEditor();
        let uploadStr = editor.getText();
        let currentFilePath = atom.workspace.getActiveTextEditor().getPath();

        var formData = {
            // Pass data via Streams
            file: fs.createReadStream(currentFilePath)
        };

       $.extend( defaultJSON, formData);
       defaultJSON.resourceName = $('#free-log-resource-name').val();
        request.post({url:'http://192.168.0.3:7001/v1/resources', formData: defaultJSON}, function optionalCallback(err, httpResponse, body) {
          if (err) {
            return atom.notifications.addWarning('upload failed:');
          }
          atom.notifications.addSuccess('upLoad successful!');
          panel.hide();
        });
    }
};
