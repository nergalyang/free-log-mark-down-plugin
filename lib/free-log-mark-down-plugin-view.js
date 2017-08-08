'use babel';
import $ from 'jquery';
import _ from 'underscore';
let fs = require('fs');
let path = require('path');
//由于content_security_policy 我们无法使用eval所以template估计是用不成了
export default class markDownUploadView {
  //jwt is a boolean
  constructor(serializedState, jwt) {
    // Create root element
    let template;
    this.element = $('<div><div>');
    this.element.addClass('mark-down-upload-view');
    // Create message element
    if( !jwt ) {
        template = fs.readFileSync(path.resolve(__dirname, '../html/login-template.html'), 'utf-8');
    } else {
        template = fs.readFileSync(path.resolve(__dirname, '../html/jwt-upload-template.html'), 'utf-8');
    }
    const message = $(template);
    message.addClass('message');
    this.element.append(message);
    if( jwt ) $('#jwt-username').html(atom.config.get('free-log-mark-down-plugin.username'));
  }
  // Returns an object that can be retrieved when package is activated
    serialize() {}
  // Tear down any state and detach
    destroy() {
    this.element.remove();
    }
  reCreate(jwt) {
       this.element.html('');
      if( !jwt ) {
          template = fs.readFileSync(path.resolve(__dirname, '../html/login-template.html'), 'utf-8');
      } else {
          template = fs.readFileSync(path.resolve(__dirname, '../html/jwt-upload-template.html'), 'utf-8');
      }
      const message = $(template);
      message.addClass('message');
      this.element.append(message);
      if( jwt ) $('#jwt-username').html(atom.config.get('free-log-mark-down-plugin.username'))
  }
  getElement() {
    return this.element;
  }
}
