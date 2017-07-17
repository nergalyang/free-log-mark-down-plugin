'use babel';
import $ from 'jquery';
import markDownUploadView from './free-log-mark-down-plugin-view';
import { CompositeDisposable } from 'atom';

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
    console.log('upLoad starting');
    let editor = atom.workspace.getActiveTextEditor();
    let uploadStr = editor.getText();
    console.log(uploadStr);
    $.ajax({
        type:'post',
        url: 'abc.com',
        data: uploadStr,
        success: (data)=> {
            this.markDownUploadView.setMessage('you are good!');
            this.modalPanel.show();
            setTimeout(()=>{
                this.modalPanel.hide();
            },2000);
        },
        error: (data) => {
            this.markDownUploadView.setMessage('upload fails!!');
            this.modalPanel.show();
            setTimeout(()=>{
                this.modalPanel.hide();
            },2000);
        }
    });

  }

};
