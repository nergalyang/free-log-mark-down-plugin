'use babel';

import FreeLogMarkDownPluginView from './free-log-mark-down-plugin-view';
import { CompositeDisposable } from 'atom';

export default {

  freeLogMarkDownPluginView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.freeLogMarkDownPluginView = new FreeLogMarkDownPluginView(state.freeLogMarkDownPluginViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.freeLogMarkDownPluginView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'free-log-mark-down-plugin:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.freeLogMarkDownPluginView.destroy();
  },

  serialize() {
    return {
      freeLogMarkDownPluginViewState: this.freeLogMarkDownPluginView.serialize()
    };
  },

  toggle() {
    console.log('FreeLogMarkDownPlugin was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
