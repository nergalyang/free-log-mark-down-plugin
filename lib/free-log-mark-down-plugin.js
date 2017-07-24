'use babel';
import $ from 'jquery';
import markDownUploadView from './free-log-mark-down-plugin-view';
import { CompositeDisposable } from 'atom';
import  request  from 'request';
require('request-debug')(request);


export default {
    exampleView: null,
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

        atom.notifications.addSuccess('upLoad starting');
        //{buttons:[{className:"md-success-upload",text:'Close',onDidClick:function(){ $('.md-success-upload').closest('atom-notifications').remove() }}]}
      console.log('upLoad starting');
      let editor = atom.workspace.getActiveTextEditor();
      let uploadStr = editor.getText();
      let currentFilePath = atom.workspace.getActiveTextEditor().getPath();

      var formData = {

        // Pass data via Streams
        my_file: fs.createReadStream(currentFilePath)


      };
      request.post({url:'http://service.com/upload', formData: formData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
      });

  }
};
