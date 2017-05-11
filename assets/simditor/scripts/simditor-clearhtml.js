(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('simditor-clearhtml', ["jquery","simditor"], function (a0,b1) {
      return (root['SimditorClearHtml'] = factory(a0,b1));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"),require("simditor"));
  } else {
    root['SimditorClearHtml'] = factory(jQuery,Simditor);
  }
}(this, function ($, Simditor) {

var SimditorClearHtml,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SimditorClearHtml = (function(superClass) {
  extend(SimditorClearHtml, superClass);

  function SimditorClearHtml() {
    return SimditorClearHtml.__super__.constructor.apply(this, arguments);
  }

  SimditorClearHtml.cls = 'simditor-clearhtml';

  SimditorClearHtml.i18n = {
    'zh-CN': {
      clearhtml: '清除格式'
    },
    'en-US': {
      clearhtml: 'Clear Format'
    }
  };

  SimditorClearHtml.prototype.name = 'clearhtml';

  SimditorClearHtml.prototype.needFocus = false;

  SimditorClearHtml.prototype.iconClassOf = function() {
    return 'simditor-clearhtml-icon-uuke-qingchu';
  };

  SimditorClearHtml.prototype._init = function() {
    return SimditorClearHtml.__super__._init.call(this);
  };

  // It is assumed that style-root nodes and their ancestors do not have styles or style effects.
  // Therefore we just need to move leaves up to the next level of style-root nodes to become
  // their direct children.
  SimditorClearHtml.prototype.styleRootNodes = null;

  SimditorClearHtml.prototype.isStyleRootNode = function(node) {
    if (this.styleRootNodes === null ) {
      this.styleRootNodes = ["th", "td"].concat(this.editor.util.blockNodes);
    }
    node = $(node)[0];
    if (!node || node.nodeType === Node.TEXT_NODE) {
      return false;
    }
    return new RegExp("^(" + (this.styleRootNodes.join('|')) + ")$").test(node.nodeName.toLowerCase());
  };

  SimditorClearHtml.prototype.canNodeBeRemoved = function($node) {
      return $node.contents().length === 0 && $node[0].nodeType !== Node.TEXT_NODE && !$node.is("hr, br, img, th, td");
  };

  SimditorClearHtml.prototype._moveLeavesUp = function(nodes) {
    while (nodes.length > 0) {
      var node = nodes.pop();
      var $node = $(node);
      var $contents = $node.contents();

      if ($contents.length > 0) {
        $.merge(nodes, $contents.get());
        continue;
      }

      if (this.canNodeBeRemoved($node)) {
        $node.remove();
        continue;
      }

      var parentNode = node.parentNode;
      while (!this.isStyleRootNode(parentNode)) {
        var $prevNode = $(parentNode);
        $node.detach();
        if (this.canNodeBeRemoved($prevNode)) {
          $prevNode.replaceWith($node);
          parentNode = node;
        }
        else {
          $prevNode.after($node);
        }
        parentNode = parentNode.parentNode;
      }
    }
  };

  SimditorClearHtml.prototype.command = function() {
    var range = this.editor.selection.range();
    if (!range || range.collapsed) {  // Nothing is selected.
      return;
    }

    var nodes = [];

    // Process start and end nodes.

    // The range properties will change during the algorithm, so record them in advance.
    var startNode = range.startContainer, endNode = range.endContainer;
    var startOffset = range.startOffset, endOffset = range.endOffset;

    var node = startNode;
    var $node = $(node);
    var parentNode = null;
    var $parentNode = null;

    // Move the selected string/elements up as high as possible and duplicate and split the ancestors on the way into two parts.
    var splitAndMoveUp = (function (_this) {
      return function (node, splitIndex, insertedContents) {
        var $detached = $(node).contents().slice(splitIndex).detach();
        while (!_this.isStyleRootNode(node)) {
          var $contents = $(node.parentNode).contents();
          var nodeIndex = $contents.index(node);
          var clonedNode = node.cloneNode(false);
          var $clonedNode = $(clonedNode);
          $clonedNode.append($detached);
          $detached = $clonedNode.add($contents.slice(nodeIndex + 1).detach());
          node = node.parentNode;
        }
        $(node).append(insertedContents);
        $(node).append($detached);
      };
    })(this);

    var doBeforeReturn = (function (_this) {
      return function () {
        _this._moveLeavesUp(nodes);
        range = document.createRange();
        range.setStartBefore(startNode);
        range.setEndAfter(endNode);
        _this.editor.selection.range(range);
        _this.editor.trigger('valuechanged');
        _this.editor.trigger('selectionchanged');
      };
    })(this);

    if (startNode == endNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        let selected;
        $parentNode = $(node.parentNode);
        let splitIndex = $parentNode.contents().index(startNode);
        if (startOffset === 0 && endOffset === node.nodeValue.length) {
          selected = startNode;
          $(selected).detach();
        }
        else {
          selected = document.createTextNode(node.nodeValue.substring(startOffset, endOffset));

          if (startOffset === 0) {
            node.nodeValue = node.nodeValue.substring(endOffset);
          }
          else {
            if (endOffset < node.nodeValue.length) {
              $node.after(node.nodeValue.substring(endOffset));
            }
            node.nodeValue = node.nodeValue.substring(0, startOffset);
            ++splitIndex;
          }
        }
        splitAndMoveUp($parentNode[0], splitIndex, selected);
        startNode = endNode = selected;
      }
      else {  // The selected nodes may be images, <hr>s and <br>s.
        parentNode = node;
        $parentNode = $(parentNode);
        let $contents = $parentNode.contents();
        let $selected = $contents.slice(startOffset, endOffset).detach();
        splitAndMoveUp(parentNode, startOffset, $selected);
        $.merge(nodes, $selected.get());
        startNode = $selected.first()[0];
        endNode = $selected.last()[0];
      }

      doBeforeReturn();
      return;
    }

    // Adjust start node.

    var $startNodes = this.editor.selection.startNodes().slice(0);  // slice(0): clone the whole array

    if (startNode.nodeType === Node.TEXT_NODE) {
      if (startOffset > 0) {
        // The text node must be explicitly created, in case startOffset == startNode.nodeValue.length, i.e. the string is empty.
        selected = document.createTextNode(startNode.nodeValue.substring(startOffset));
        startNode.nodeValue = startNode.nodeValue.substring(0, startOffset);
        $(startNode).after(selected);
        let $contents = $(startNode.parentNode).contents();
        let nodeIndex = $contents.index(startNode);
        startNode = $contents[nodeIndex + 1];
        $startNodes[0] = startNode;
      }
    }
    else {
      if (startOffset >= $(startNode).contents().length) {
        $(startNode).append(document.createTextNode(""));
      }
      startNode = $(startNode).contents()[startOffset];
      let startNodes = $startNodes.get();
      startNodes.unshift(startNode);
      $startNodes = $(startNodes);
    }

    // Adjust end node.

    var $endNodes = this.editor.selection.endNodes().slice(0);  // slice(0): clone the whole array

    if (endNode.nodeType === Node.TEXT_NODE) {
      if (endOffset < endNode.nodeValue.length) {
        // The text node must be explicitly created, in case endOffset == 0, i.e. the string is empty.
        selected = document.createTextNode(endNode.nodeValue.substring(0, endOffset));
        endNode.nodeValue = endNode.nodeValue.substring(endOffset);
        $(endNode).before(selected);
        let $contents = $(endNode.parentNode).contents();
        let nodeIndex = $contents.index(endNode);
        endNode = $contents[nodeIndex - 1];
        $endNodes[0] = endNode;
      }
    }
    else {
      if (endOffset <= 0) {
        $(endNode).prepend(document.createTextNode(""));
        endOffset = 1;
      }
      endNode = $(endNode).contents()[endOffset - 1];
      let endNodes = $endNodes.get();
      endNodes.unshift(endNode);
      $endNodes = $(endNodes);
    }

    // Find:
    // 1. The common ancestor of start and end nodes.
    // 2. The first style root node of selection.
    // 3. The last style root node of selection.

    var commonAncestor = null;
    var startStyleRootNode = null, endStyleRootNode = null;
    for (var i = 0; i < $startNodes.length; ++i) {
      let node = $startNodes[i];
      if (startStyleRootNode === null && this.isStyleRootNode(node)) {
        startStyleRootNode = node;
      }
      if ($endNodes.index(node) > -1) {
        commonAncestor = node;
        break;
      }
    }
    if (commonAncestor === null) {
      commonAncestor = this.editor.body[0];
    }
    for (var i = 0; i < $endNodes.length; ++i) {
      let node = $endNodes[i];
      if (this.isStyleRootNode(node)) {
        endStyleRootNode = node;
        break;
      }
      if (node === commonAncestor) {
        break;
      }
    }

    // Process start nodes.

    var startLast = null;

    if (startNode !== commonAncestor) {
      let $nodes = $(startNode);

      // Detach start nodes and move them up as high as possible.
      while (startNode.parentNode !== startStyleRootNode && startNode.parentNode !== commonAncestor) {
        let $parentNode = $(startNode.parentNode);
        let $contents = $parentNode.contents();
        let nodeIndex = $contents.index(startNode);
        $nodes = $nodes.add($contents.slice(nodeIndex + 1)).detach();
        if ($parentNode.contents().length > 0) {
          $parentNode.after($nodes);
        }
        else {
          $parentNode.replaceWith($nodes);
        }
      }

      let node = $nodes[$nodes.length - 1];

      // Add the middle nodes between startStyleRootNode and the direct start child of commonAncestor.
       while (node.parentNode !== commonAncestor) {
        let $parentNode = $(node.parentNode);
        let $contents = $parentNode.contents();
        let nodeIndex = $contents.index(node);
        $nodes = $nodes.add($contents.slice(nodeIndex + 1));
        node = node.parentNode;
      }

      startLast = node;

      $.merge(nodes, $nodes.get());
    }

    // Process end nodes.

    var endFirst = null;

    if (endNode !== commonAncestor) {
      let $nodes = $(endNode);

      // Detach end nodes and move them up as high as possible.
      while (endNode.parentNode !== endStyleRootNode && endNode.parentNode !== commonAncestor) {
        let $parentNode = $(endNode.parentNode);
        let $contents = $parentNode.contents();
        let nodeIndex = $contents.index(endNode);
        $nodes = $nodes.add($contents.slice(0, nodeIndex)).detach();
        if ($parentNode.contents().length > 0) {
          $parentNode.before($nodes);
        }
        else {
          $parentNode.replaceWith($nodes)
        }
      }

      let node = $nodes[0];

      // Add the middle nodes between endStyleRootNode and the direct end child of commonAncestor.
      while (node.parentNode !== commonAncestor) {
        let $parentNode = $(node.parentNode);
        let $contents = $parentNode.contents();
        let nodeIndex = $contents.index(node);
        $nodes = $nodes.add($contents.slice(0, nodeIndex));
        node = node.parentNode;
      }

      endFirst = node;

      $.merge(nodes, $nodes.get());
    }

    // Move the selected contents up as high as possible and split the ancestors on the way into two parts.
    if (startStyleRootNode === null && endStyleRootNode === null) {
      let $contents = $(commonAncestor).contents();
      let startIndex = $contents.index(startNode);
      let endIndex = $contents.index(endNode);
      let $selected = $contents.slice(startIndex, endIndex + 1).detach();
      splitAndMoveUp(commonAncestor, startIndex, $selected);
      commonAncestor = $selected.parent()[0];
    }

    // Add the direct middle children of commonAncestor.

    var $contents = $(commonAncestor).contents();
    var middleStartIndex = startLast === null ? 0 : $contents.index(startLast) + 1;
    var middleEndIndex = endFirst === null ? undefined : $contents.index(endFirst);
    $.merge(nodes, $contents.slice(middleStartIndex, middleEndIndex).get());

    doBeforeReturn();
  };

  return SimditorClearHtml;

})(Simditor.Button);

Simditor.Toolbar.addButton(SimditorClearHtml);

return SimditorClearHtml;

}));
