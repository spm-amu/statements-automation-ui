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

      console.log("\n\n\n\n====================================");
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
      let elements = document.getElementsByClassName("dropTarget");
      for (const element of elements) {
        element.addEventListener("dragstart", this.dragStart, false);
        element.addEventListener("dragover", this.dragOver, false);
      }
    }, 2000);

    container.addEventListener("mousedown", this.handleMouseDown);
    container.addEventListener("mouseup", (event) => this.handleMouseUp(event, selectionHandler));
    container.addEventListener("mousemove", this.handleMouseMove);

    let parent = document.getElementsByClassName('__sys_placeholders')[0];
    let placeHolders = document.getElementsByClassName('_draggable_');
    let dropTarget = this.getDropTarget(parent);

    for (const placeHolder of placeHolders) {
      placeHolder.addEventListener('mousemove', (event) => this.handleItemMouseMove(event, parent), false);
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

    this.tableItemPreResizeWidth = null;
    this.tableItemPreResizeHeight = null;
    this.lastColItemPreResizeWidth = null;
    this.firstColItemPreResizeWidth = null;
    this.firstRowItemPreResizeHeight = null;
    this.resizingTableColumn = false;
  };

  handleGrabRelease = (event, props, selectionHandler) => {
    let width = props.width;
    let height = props.height;

    let parent = event.target;
    let dropTarget = document.getElementsByClassName('dropTarget')[0];//this.getDropTarget(parent);

    if (dropTarget) {
      let container = document.getElementById('templateContainer');
      let node = document.createElement("input");

      node.id = props.id;
      node.style.lineHeight = event.target.style.lineHeight;
      node.style.left = event.clientX + 'px';
      node.style.top = event.clientY + 'px';
      //node.style.padding = '4px';
      //node.style.border = '2px dashed green';
      node.className = "_draggable_";
      node.style.position = "absolute";
      node.setAttribute("draggable", true);
      node.style.height = height + 'px';
      node.style.width = width + 'px';
      node.innerText = props.description;
      //node.innerHTML = "<input onkeyup='(e) => alert(e)' style='width: 100%; height: 100%'></input>";
      node.addEventListener('dragend', (event) => this.handleItemDrop(event, dropTarget), false);

      let placeHolders = dropTarget.getElementsByClassName('__sys_placeholders')[0];
      node.addEventListener('mousemove', (event) => this.handleItemMouseMove(event, placeHolders), false);
      node.addEventListener('mouseout', this.handleItemMouseOut, false);
      node.addEventListener('mouseup', (event) => this.handleItemMouseClick(node, props.id, selectionHandler), false);

      placeHolders.appendChild(node);
      this.selectedNode = node;
      this.setSelectedInitNodePos();
    }

    if (typeof event.target.className === 'string' && !event.target.className.includes("paletteButton")
      && !event.target.className.includes("paletteButtonLabel")
      && !event.target.className.includes("paletteButtonSelected")) {
      document.getElementsByTagName("body")[0].style.cursor = 'default';
    }
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

  handleItemDrop = (event, target) => {
    console.log("\n\n\n\nclientY : " + event.clientY + " offsetTop : " + target.offsetTop + " dragOffset.y : " + this.dragOffset.y);
    event.target.style.left = ((event.clientX - target.offsetLeft) - this.dragOffset.x) + 'px';
    event.target.style.top = ((event.clientY - target.offsetTop) - this.dragOffset.y) + 'px';
    event.preventDefault();

    this.currentResizeNode = null;
    this.mouseDown = false;

    document.body.style.cursor = "default";
    this.resetBorders();
    //event.target.style.border = '2px dashed green';
    this.selectedNode = event.target;
  };

  resizeTables(node, spec) {
    let tables = node.getElementsByClassName('_item_table');
    let table = tables && tables.length > 0 ? tables[0] : null;

    if (!this.tableItemPreResizeWidth && table) {
      this.tableItemPreResizeWidth = parse(table.style.width);
    }

    if (!this.tableItemPreResizeHeight && table) {
      this.tableItemPreResizeHeight = parse(table.style.height);
    }

    if (table) {
      if (spec.rightOffset !== 0) {
        let numCols = table['data-num-cols'];
        let lastCols = node.getElementsByClassName(`_item_table_col_${numCols - 1}`);
        let newWidth;
        let resized = true;

        for (const lastCol of lastCols) {
          if (!this.lastColItemPreResizeWidth) {
            this.lastColItemPreResizeWidth = parse(lastCol.style.width);
          }

          newWidth = (this.lastColItemPreResizeWidth + spec.rightOffset);
          //console.log(spec.leftOffset + " : " + spec.rightOffset + " : " + this.lastColItemPreResizeWidth);

          if (newWidth >= 32) {
            lastCol.style.width = newWidth + 'px';
          } else {
            resized = false;
            break;
          }
        }

        if (resized) {
          table.style.width = (this.tableItemPreResizeWidth + spec.rightOffset) + 'px';
        }
      }

      if (spec.leftOffset !== 0) {
        let newWidth;
        let firstCols = node.getElementsByClassName('_item_table_col_0');
        let resized = true;

        for (const firstCol of firstCols) {
          if (!this.firstColItemPreResizeWidth) {
            this.firstColItemPreResizeWidth = parse(firstCol.style.width);
          }

          newWidth = (this.firstColItemPreResizeWidth + (spec.leftOffset * -1));
          if (newWidth >= 32) {
            firstCol.style.width = newWidth + 'px';
          } else {
            resized = false;
            break;
          }
        }

        if (resized) {
          table.style.width = (this.tableItemPreResizeWidth + (spec.leftOffset * -1)) + 'px';
        }
      }

      if (spec.topOffset !== 0 || spec.bottomOffset !== 0) {
        let newHeight;
        let rows = node.getElementsByClassName('_item_table_tr');

        if (!this.firstRowItemPreResizeHeight) {
          this.firstRowItemPreResizeHeight = parse(rows[0].style.height);
        }

        if (spec.topOffset !== 0) {
          newHeight = this.firstRowItemPreResizeHeight - spec.topOffset / rows.length;
        } else if (spec.bottomOffset !== 0) {
          newHeight = this.firstRowItemPreResizeHeight + spec.bottomOffset / rows.length;
        }

        for (const row of rows) {
          row.style.height = newHeight + 'px';
        }

        if (spec.topOffset !== 0) {
          table.style.height = (this.tableItemPreResizeHeight - spec.topOffset) + 'px';
        }

        if (spec.bottomOffset !== 0) {
          table.style.height = (this.tableItemPreResizeHeight + spec.bottomOffset) + 'px';
        }

        table.style.height = (this.tableItemPreResizeHeight +
          (spec.topOffset !== 0 ? spec.topOffset : spec.bottomOffset)) + 'px';
      }
    }
  }

  resizeNode = (event, node) => {
    //console.log(this.mouseDown + " : " + node + " : " + this.resizingTableColumn);
    if (this.mouseDown && node) {
      let container = document.getElementById('templateContainer');
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

        this.resizeTables(node, resizeSpec);
      }
    }
  };

  updateCursor = (node, event, itemParent) => {
    if (!this.mouseDown && this.selectedNode) {
      let container = document.getElementById('templateContainer');

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
