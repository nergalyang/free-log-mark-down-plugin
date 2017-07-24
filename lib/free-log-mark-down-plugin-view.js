'use babel';
import $ from 'jquery';

export default class markDownUploadView {

  constructor(serializedState) {
    // Create root element
    this.element = $('<div><div>');
    this.element.addClass('mark-down-upload-view');

    // Create message element
    const message = $('<div>'+
        '<div class="row">'+
            '<div class="col-md-11"></div>'+
            '<div class="col-md-1"><a id="free-log-close-btn">Close</a></div>'+
        '</div>'+
        '<div class="row">'+
            '<div class="col-md-offset-4 col-md-5"><label>Your resource name: <input class="free-log-resource-name" id="free-log-resource-name"></label></div>'+
            '<div class="col-md-offset-5 col-md-2"><button class="btn btn-default" id="uploadClk">Upload</button></div>'+
        '</div>'+
    '</div>');
    message.addClass('message');
    this.element.append(message);

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
