'use babel';
import $ from 'jquery'
export default class markDownUploadView {

  constructor(serializedState) {
    // Create root element
    this.element = $('<div><div>');
    this.element.addClass('mark-down-upload-view');

    // Create message element
    const message = $('<div><div>');
    message.html = 'pendingState';
    message.addClass('message');
    this.element.append(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }
  setMessage(result) {
      this.element.html('');
      const message = $('<div><div>');
      message.html(result);
      message.addClass('message');
      this.element.append(message);
  }
  getElement() {
    return this.element;
  }

}
