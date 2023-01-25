import appManager from "../../../common/service/AppManager";
import socketManager from '../../service/SocketManager';
import {MessageType} from "../../types";

const parse = (val) => {
  return parseFloat(val.replace('px', ''));
};

const boundCheck = (pos, mousePos) => {
  return pos - 8 < mousePos && pos + 8 > mousePos;
};

export default class EventHandler {
  constructor() {
  }

  dragStart = (event) => {
    if (this.selectedNode === event.target) {
      if (document.body.style.cursor !== "move" || this.resizingTableColumn) {
        if (!this.resizingTableColumn || this.resizingBoundaryTableColumn) {
          this.currentResizeNode = event.target;
        }

        event.preventDefault();
      }

      let parentLeft = event.target.parentElement.offsetLeft;
      let parentTop = event.target.parentElement.offsetTop;

      console.log("\n====================================");
      console.log(event.clientY );
      console.log(parentTop);
      console.log(event.target.style.top);
      console.log("====================================");

      this.dragOffset.x = event.clientX - (parentLeft + parseFloat(event.target.style.left.replace('px', '')));
      this.dragOffset.y = event.clientY - (parentTop + parseFloat(event.target.style.top.replace('px', '')));
    }
  };

  dragOver = (event) => {
    event.preventDefault();
  };

  initDragAndDrop = (selectionHandler, container) => {
    this.dragOffset = {};
    setTimeout(() => {
      let dropTarget = document.getElementsByClassName('dropTarget')[0];
      if(dropTarget) {
        dropTarget.addEventListener("dragstart", this.dragStart, false);
        dropTarget.addEventListener("dragover", this.dragOver, false);
      }
    }, 2000);

    container.addEventListener("mousedown", this.handleMouseDown);
    container.addEventListener("mouseup", (event) => this.handleMouseUp(event, selectionHandler));
    container.addEventListener("mousemove", this.handleMouseMove);

    let placeHolders = document.getElementsByClassName('_draggable_');

    for (const placeHolder of placeHolders) {
      placeHolder.addEventListener('mousemove', (event) => this.handleItemMouseMove(event, document.getElementsByClassName('dropTarget')[0]), false);
      placeHolder.addEventListener('mouseout', this.handleItemMouseOut, false);
      placeHolder.addEventListener('mouseup', (event) => this.handleItemMouseClick(placeHolder, placeHolder.id, selectionHandler), false);
      placeHolder.addEventListener('dragend', (event) => this.handleItemDrop(event, document.getElementsByClassName('dropTarget')[0]), false);
    }
  };

  handleMouseMove = (event) => {
    this.resizeNode(event, this.currentResizeNode);
  };

  handleMouseDown = (event) => {
    this.mouseDown = true;
  };

  handleMouseUp = (event, selectionHandler) => {
    this.mouseDown = false;
    this.currentResizeNode = null;
    document.body.style.cursor = "default";

    if (typeof event.target.className === 'string'
      && event.target.className !== '_draggable_' && !event.target.className.startsWith('_item_table')) {
      this.resetBorders();
      this.selectedNode = null;
      this.selectedNodeInitPosition = null;
      selectionHandler(null);
    }

    this.resizingTableColumn = false;
  };

  updateInputItemValue(metadata) {
    let elementById = document.getElementById(metadata.id);
    elementById.value = metadata.value;
  }

  handleInputValueChange = (event) => {
    let metadata = {
      id: event.target.id,
      value: event.target.value
    };

    socketManager.emitEvent(MessageType.WHITEBOARD_EVENT, {
      userId: appManager.getUserDetails().userId,
      metadata: metadata,
      eventType: "INPUT_VALUE_CHANGE"
    })
  };

  createNode = (metadata, selectionHandler, test) => {
    let dropTarget = document.getElementsByClassName('dropTarget')[0];
    if (dropTarget) {
      let node = document.createElement(metadata.type);
      const properties = Object.getOwnPropertyNames(metadata);
      for (const property of properties) {
        if(property !== 'style' && property !== 'attributes' && property !== 'offsetLeft' && property !== 'offsetTop') {
          node[property] = metadata[property];
        }
      }

      if(metadata.style) {
        const properties = Object.getOwnPropertyNames(metadata.style);
        for (const property of properties) {
            node.style[property] = metadata.style[property];
        }
      }

      if(metadata.attributes) {
        const properties = Object.getOwnPropertyNames(metadata.attributes);
        for (const property of properties) {
            node.setAttribute(property, metadata.attributes[property]);
        }
      }

      if(!test) {
        node.addEventListener('dragend', (event) => this.handleItemDrop(event, dropTarget), false);
        node.addEventListener('mousemove', (event) => this.handleItemMouseMove(event, dropTarget), false);
        node.addEventListener('mouseout', this.handleItemMouseOut, false);
        node.addEventListener('mouseup', (event) => this.handleItemMouseClick(node, metadata.id, selectionHandler), false);
        node.addEventListener('keyup', (event) => this.handleInputValueChange(event), false);
      }

      dropTarget.appendChild(node);

      return node;
    }
  };

  handleGrabRelease = (event, props, selectionHandler, successHandler) => {
    let width = props.width;
    let height = props.height;

    let nodeMetadata = {
      type: "input",
      id: props.id,
      innerText: props.description,
      className: "_draggable_",
      style: {
        lineHeight: event.target.style.lineHeight,
        left: event.clientX + 'px',
        top: event.clientY + 'px',
        position: "absolute",
        height: height + 'px',
        width: width + 'px',
      },
      attributes: {
        draggable: true
      }
    };

    this.selectedNode = this.createNode(nodeMetadata, selectionHandler);
    this.setSelectedInitNodePos();

    socketManager.emitEvent(MessageType.WHITEBOARD_EVENT, {
      userId: appManager.getUserDetails().userId,
      metadata: nodeMetadata,
      eventType: "ADD_INPUT_FIELD"
    });

    if (typeof event.target.className === 'string' && !event.target.className.includes("paletteButton")
      && !event.target.className.includes("paletteButtonLabel")
      && !event.target.className.includes("paletteButtonSelected")) {
      document.getElementsByTagName("body")[0].style.cursor = 'default';
    }

    successHandler(nodeMetadata);
  };

  getDropTarget(node) {
    let parent = node;
    let dropTarget = null;
    while (parent) {
      if (parent.className === 'dropTarget') {
        dropTarget = parent;
        break;
      }

      parent = parent.parentElement;
    }

    return dropTarget;
  }

  moveItem = (item, metaData) => {
    console.log("DO : ", this.dragOffset);
    item.style.left = ((metaData.clientX - metaData.offsetLeft) - metaData.dragOffset.x) + 'px';
    item.style.top = ((metaData.clientY - metaData.offsetTop) - metaData.dragOffset.y) + 'px';
  };

  handleItemDrop = (event, target) => {
    //console.log("\n\n\n\nclientY : " + event.clientY + " offsetTop : " + target.offsetTop + " dragOffset.y : " + this.dragOffset.y + " BY : " + event.target.id);

    let metadata = {
      id: event.target.id,
      clientX: event.clientX,
      clientY: event.clientY,
      offsetLeft: target.offsetLeft,
      offsetTop: target.offsetTop,
      dragOffset: {
        x: this.dragOffset.x,
        y: this.dragOffset.y
      }
    };

    this.moveItem(event.target, metadata);

    //event.target.style.left = ((event.clientX - target.offsetLeft) - this.dragOffset.x) + 'px';
    //event.target.style.top = ((event.clientY - target.offsetTop) - this.dragOffset.y) + 'px';
    event.preventDefault();
    event.stopImmediatePropagation();

    this.currentResizeNode = null;
    this.mouseDown = false;
    document.body.style.cursor = "default";
    this.resetBorders();
    //event.target.style.border = '2px dashed green';
    this.selectedNode = event.target;

    socketManager.emitEvent(MessageType.WHITEBOARD_EVENT, {
      userId: appManager.getUserDetails().userId,
      metadata: metadata,
      eventType: "MOVE_ITEM"
    });
  };

  resizeNode = (event, node) => {
    //console.log(this.mouseDown + " : " + node + " : " + this.resizingTableColumn);
    if (this.mouseDown && node) {
      let container = document.getElementById('workspaceContainer');
      if (container) {
        let mouseX = event.clientX - this.resizingItemParent.offsetLeft + container.scrollLeft;
        let mouseY = event.clientY - this.resizingItemParent.offsetTop + container.scrollTop;
        let resizeSpec = {
          leftOffset: 0,
          rightOffset: 0,
          topOffset: 0,
          bottomOffset: 0
        };

        if (this.boundCheckLeft) {
          let widthDiff = mouseX - parse(node.style.left);
          let newWidth = parse(node.style.width) - widthDiff;

          //console.log("\n\n\n SETTING SPEC LEFT : " + this.selectedNodeInitPosition.left);
          resizeSpec.leftOffset = mouseX - this.selectedNodeInitPosition.left;

          if (newWidth >= 20) {
            node.style.width = newWidth + 'px';
            node.style.left = mouseX + 'px';
          }
        }

        if (this.boundCheckRight) {
          let newWidth = mouseX - parse(node.style.left);

          resizeSpec.rightOffset = newWidth - this.selectedNodeInitPosition.width;
          if (newWidth >= 20) {
            node.style.width = newWidth + 'px';
          }
        }

        if (this.boundCheckTop) {
          let heightDiff = mouseY - parse(node.style.top);
          let newHeight = parse(node.style.height) - heightDiff;

          resizeSpec.topOffset = mouseY - this.selectedNodeInitPosition.top;

          if (newHeight >= 20) {
            node.style.height = newHeight + 'px';
            node.style.top = mouseY + 'px';
          }

          resizeSpec.topResized = true;
        }

        if (this.boundCheckBottom) {
          let newHeight = mouseY - parse(node.style.top);

          resizeSpec.bottomOffset = newHeight - this.selectedNodeInitPosition.height;

          if (newHeight >= 20) {
            node.style.height = newHeight + 'px';
          }

          resizeSpec.bottomResized = true;
        }
      }
    }
  };

  updateCursor = (node, event, itemParent) => {
    if (!this.mouseDown && this.selectedNode) {
      let container = document.getElementById('workspaceContainer');

      let left = parse(node.style.left) + container.offsetLeft;
      let right = left + parse(node.style.width);
      let top = parse(node.style.top) + itemParent.offsetTop;
      let bottom = top + parse(node.style.height);
      let mouseX = event.clientX + container.scrollLeft;
      let mouseY = event.clientY + container.scrollTop;

      this.boundCheckTop = boundCheck(top, mouseY);
      this.boundCheckLeft = boundCheck(left, mouseX);
      this.boundCheckRight = boundCheck(right, mouseX);
      this.boundCheckBottom = boundCheck(bottom, mouseY);

      if ((this.boundCheckTop && this.boundCheckLeft) || (this.boundCheckBottom && this.boundCheckRight)) {
        document.body.style.cursor = "nwse-resize";
      } else if ((this.boundCheckTop && this.boundCheckRight) || (this.boundCheckBottom && this.boundCheckLeft)) {
        document.body.style.cursor = "nesw-resize";
      } else if (this.boundCheckTop || this.boundCheckBottom) {
        document.body.style.cursor = "ns-resize";
      } else if (this.boundCheckLeft || this.boundCheckRight) {
        document.body.style.cursor = "ew-resize";
      } else {
        document.body.style.cursor = "move";
        node.style.cursor = "move";
        this.selectedNode = node;
      }

      this.resizingItemParent = itemParent;
    }
  };

  resetBorders = () => {
    let items = document.getElementsByClassName("_draggable_");
    for (const item of items) {
      item.style.border = 'none';
    }
  };

  handleItemMouseOut = (event) => {
    if (!this.currentResizeNode) {
      document.body.style.cursor = "default";
    }
  };

  handleItemMouseMove = (event, itemParent) => {
    let node = event.target;
    this.updateCursor(node, event, itemParent);
  };

  handleItemMouseClick = (node, id, selectionHandler) => {
    this.resetBorders();
    //node.style.border = '2px dashed green';
    this.selectedNode = node;
    this.setSelectedInitNodePos();

    selectionHandler(id, node);
  };

  setSelectedInitNodePos() {
    this.selectedNodeInitPosition = {
      top: parse(this.selectedNode.style.top),
      left: parse(this.selectedNode.style.left),
      width: parse(this.selectedNode.style.width),
      height: parse(this.selectedNode.style.height)
    };
  }
}