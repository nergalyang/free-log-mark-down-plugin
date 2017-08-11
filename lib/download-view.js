'use babel';
import $ from 'jquery';
import _ from 'underscore';
let fs = require('fs');
let path = require('path');
//由于content_security_policy 我们无法使用eval所以template估计是用不成了
export default class UploadView {
  //jwt is a boolean
  constructor(serializedState, jwt) {
    // Create root element
    this.element = $('<div><div>');
    this.element.addClass('mark-download-view');
    // Create message element
    let template = fs.readFileSync(path.resolve(__dirname, '../html/download-template.html'), 'utf-8');
    const message = $(template);
    message.addClass('message');
    this.element.append(message);
  }
  setWarning ( msg ) {
      $('.free-log-warning').html(msg);
  }
  // Returns an object that can be retrieved when package is activated
    serialize() {}
  // Tear down any state and detach
    destroy() {
        this.element.remove();
      }
    getElement() {
      return this.element;
    }
}
//65ba6cabe08375329ad1925345ff7a8f0a7093b5
