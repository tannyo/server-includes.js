/*
 * server-includes.js
 * Emulate server includes for testing.
 * Poor man's template system. Retrieve apache include comments and replace
 * them with a remote include file. Do not use this in a production environment
 * as it will render the site unsearchable since all navigation using this
 * method is created with javascript! An apache server if configured correctly
 * will include the navigation and other files correctly so that the website
 * is searchable.
 *
 * Modification Log:
 * 2014-05-02 TKO Created by Tanny O'Haley
 * 2014-09-04 TKO Added ability to process nested includes.
 */
(function server_includes(callback) {
  'use strict';

  var run_server_includes = 1,
    file_includes = {
      files: 0,
      els: {}
    },
    debug = true;

  /*
   * Get the number of top level properties in an object.
   */
  function objLength(obj) {
    var count = 0, key;

    if (typeof obj === "object") {
      if (Object.keys) {
        return Object.keys(obj).length;
      }

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          count++;
        }
      }
    }

    return count;
  }

  // Replace the include comment with the include file contents. The outerHTML
  // method does not work with comments, use a custom nodeReplace function.
  function nodeReplace(node, string) {
    var div = document.createElement('div'), nodes, parent, i, l;

    parent = node.parentNode;
    // Convert string to DOM elements.
    div.innerHTML = string;
    // Retrieve the DOM elements.
    nodes = div.childNodes;
    // Walk through each DOM element and add it to the DOM.
    for (i = 0, l = nodes.length; i < l; i++) {
      // Adding the node to the DOM removes the node from the nodes array,
      // so always use the first node in the nodes array.
      parent.insertBefore(nodes[0], node);
    }

    // Delete the replaced node from the DOM
    parent.removeChild(node);
  }

  function complete() {
    // If there are no more files to download, run callback function..
    if (!file_includes.files) {
      // If we included files, run it again for nested includes.
      if (objLength(file_includes.els)) {
        file_includes.els = {};
        run();
        return;
      }

      document.body.style.display = "";
      if (debug) {
        console.timeEnd("server_includes");
      }

      if (typeof callback === "function") {
        callback();
      }
    }
  }

  function done(data, url) {
    var nodes = file_includes.els[url], i;
    // Include file has been retrieved.
    if (debug) {
      console.log("replacing: %c<!--%s--> %c(%i) with %c%s", "color:darkgreen", nodes[0].data, "color:", nodes.length, "color:blue", url);
    }
    for (i = 0; i < nodes.length; i++) {
      nodeReplace(nodes[i], data);
    }
    // Decrement the number of include files to download.
    file_includes.files--;
    complete();
  }

  function ajax(url, done_callback, error_callback) {
    function ajax_done(data) {
      if (typeof done_callback === "function") {
        done_callback(data, url);
      }
    }

    function ajax_error(data) {
      if (typeof error_callback === "function") {
        error_callback(data, url);
      }

    }
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        ajax_done(request.responseText);
      } else {
        // We reached our target server, but it returned an error
        if (debug) {
          console.error("error:", url);
        }
        ajax_error(request);
      }
    };

    request.onerror = function () {
      // There was a connection error of some sort
      ajax_error(request);
    };

    request.send();
  }

  function getComments(curr_element) { // this is the recursive function
    var comments = [], i;
    // base case: node is a comment node
    if (curr_element.nodeName === "#comment" || curr_element.nodeType === 8) {
      // You need this OR because some browsers won't support either nodType or nodeName... I think...
      comments[comments.length] = curr_element;
    } else if (curr_element.childNodes.length > 0) {
      // recursive case: node is not a comment node
      for (i = 0; i < curr_element.childNodes.length; i++) {
        // adventures with recursion!
        comments = comments.concat(getComments(curr_element.childNodes[i]));
      }
    }
    return comments;
  }

  function run() {
    var i, ca, comment_text, file_name;

    if (debug) {
      console.time("server_includes");
      console.log("<========== running server includes", run_server_includes++);
    }

    // Prevent FOUC.
    document.body.style.display = "none";

    // This is for firefox that throws an error when not accessing a file.
    try {
      ca = getComments(document.getElementsByTagName("html")[0]);
    } catch (e) {
      ca = [];
    }

    // Process all comment elements.
    for (i = 0; i < ca.length; i++) {
      // Get the text of the comment.
      comment_text = ca[i].nodeValue.trim();
      // Is this an include comment?
      if (/^\#include/.test(comment_text)) {
        // Get the file name of the include.
        file_name = comment_text.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "");
        // Store the comment element by file name.
        if (!file_includes.els[file_name]) {
          // Increment the number of files to include.
          file_includes.files++;
          // Create an empty array for comment elements.
          file_includes.els[file_name] = [];
        }
        // This allows us to get the include file once and replace multiple comments.
        file_includes.els[file_name].push(ca[i]);
      }
    }

    // Get the include files.
    for (file_name in file_includes.els) {
      if (file_includes.els.hasOwnProperty(file_name)) {
        // Get the file.
        if (debug) {
          console.log("getting: %c%s", "color: blue", file_name);
        }

        ajax(file_name, done);
      }
    }

    // Check to see if there are files to download.
    complete();
  }

  run();
}());
