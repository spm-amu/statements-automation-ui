import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Table, Tbody, Tr, Th, Td} from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import Checkbox from '@material-ui/core/Checkbox';
import Utils from '../Utils';
import './DataGrid.css';
import DataGridHeading from "./DataGridHeading";
import TableCellContent from "./TableCellContent";
import TablePagination from '@material-ui/core/TablePagination';
import {grey300} from 'material-ui/styles/colors'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {observable, observe} from "mobx"
import * as $ from "jquery";
import Alert from "react-bootstrap/Alert";
import {post} from "../service/RestService";

export const MULTI_SELECT_CHECKBOX_COL_WIDTH = 64;

function evaluateTableCellWidth(multiSelect, column, columnCount) {
  let width = column.attributes['width'];
  return multiSelect === true ?
    "calc(" + (typeof width !== 'undefined' ? width :
    (100 / columnCount) + "%") + " - " + (MULTI_SELECT_CHECKBOX_COL_WIDTH / columnCount) + "px)"
    :
    (typeof width !== 'undefined' ? width : (100 / columnCount) + "%");
}

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  paper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: '0',
  },
  scrollPadding: {
    padding: '8px !important'
  },
  noScrollPadding: {
    padding: '0 !important',
    width: '1px !important'
  },
  tableBody: {
    display: 'block',
    overflowY: 'auto'
  },
  tableSelected: {
    backgroundColor: grey300,
    "&:hover": {
      background: "#f1f1f1"
    }
  },
  tableRow: {
    "&:hover": {
      background: "#f1f1f1"
    }
  },
  tableWrapper: {
    height: '100%'
  },
  table: {
    height: '100%',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  }
}));

export const DataGrid = React.memo(React.forwardRef((props, ref) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState('desc');
  const [config] = React.useState(props.config);
  const [orderBy, setOrderBy] = React.useState(props.defaultOrderField);
  const [selected, setSelected] = React.useState([]);
  const [totalNumberOfRows, setTotalNumberOfRows] = React.useState(0);
  const [criteria] = React.useState({});
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState(!Utils.isNull(props.rows) ? props.rows : []);
  const [deletedRows, setDeletedRows] = React.useState([]);
  const [originalData, setOriginalData] = React.useState([]);
  const [editable, setEditable] = React.useState(false);
  const [scrollWidth, setScrollWidth] = React.useState(0);
  const [rowsPerPageOptions] = React.useState([15, 30, 45, 60, 75]);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [cells] = React.useState([]);
  const {actionsToolbar} = props;
  const [headingHandle] = React.useState({});
  const [filterHandle] = React.useState({});
  const rowCount = React.useRef(-1);
  const loadingRef = React.useRef(true);
  let noteKey = 0;

  function updateScrollBarPadding() {
    var tbody = document.getElementById('mainTableBody');
    if (tbody !== null && typeof tbody !== 'undefined') {
      setScrollWidth(tbody.offsetWidth - tbody.clientWidth);
    }
  }

  window.onresize = function onresize() {
    updateScrollBarPadding();
  };

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  };

  function handleSelectAllClick(event) {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n.name);
      setSelected(newSelecteds);
      props.onSelectionChange(newSelecteds);
    } else {
      setSelected([]);
      props.onSelectionChange([]);
    }
  }

  function getSelectedRows(selected) {
    let selectedRows = [];
    for (var i = 0; i < rows.length; i++) {
      let row = rows[i];
      for (var j = 0; j < selected.length; j++) {
        if (row.id === selected[j]) {
          selectedRows.push(row);
        }
      }
    }

    return selectedRows;
  }

  function doHandleClick(event, id) {
    const selectedIndex = -1;
    selected.indexOf(id);
    let newSelected = [];

    if (props.multiSelect === true) {
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
    } else {
      newSelected.push(id);
    }

    let selectedRows = getSelectedRows(newSelected);

    setSelected(newSelected);
    if (!Utils.isNull(props.onSelectionChange)) {
      props.onSelectionChange(selectedRows);
    }
  }

  function fireSelectionEvent() {
  }

  function handleClick(event, id) {
    if (!Utils.isNull(props.onCellSelectionChange)) {
      return;
    }

    doHandleClick(event, id);
  }

  function handleCellClick(event, id, column) {
    if (column.fieldType !== "document") {
      // TODO : Evaluate if this call is necessary
      doHandleClick(event, id);
    }

    if (!Utils.isNull(props.onCellSelectionChange)) {
      props.onCellSelectionChange(id, column);
    }
  }

  function handleChangePage(event, newPage) {
    criteria.currentPage = newPage + 1;
    criteria.pageSize = config.pageSize;
    setPage(newPage);
    search();
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(rowsPerPage => event.target.value);
    setPage(0);
  }

  const observeRow = (row) => {
    let observableRow = observable(row);
    observe(
      observableRow,
      change => {
        let newValue = change.newValue;
        let oldValue = change.oldValue;

        if (newValue !== oldValue) {
          refreshCell(row.id, change.name);
        }
      }
    );

    return observableRow;
  };

  function processData(data, conf) {
    setTotalNumberOfRows(data.totalNumberOfRecords ? data.totalNumberOfRecords : data.records.length);

    let tableRows = [];
    let records = data.records;
    for (let i = 0; i < records.length; i++) {
      if (!Utils.isNull(records[i].map)) {
        tableRows.push(observeRow(records[i].map));
      } else {
        tableRows.push(observeRow(records[i]));
      }
    }

    setRows(tableRows);
  }

  const search = () => {
    post(props.dataUrl, (response) => {
        console.log('RESPONSE: ', response);
        setOriginalData(response.records);
        processData(response);
      }, (e) => {

      },
      criteria);
  };

  React.useEffect(() => {
    if (!Utils.isNull(config) && !Utils.isNull(rowsPerPage)) {
      criteria.currentPage = 0;
      criteria.pageSize = config.pageSize;
      search();
    }
  }, [rowsPerPage]);

  React.useEffect(() => {
    if(props.criteriaParams) {
      criteria.currentPage = 0;
      criteria.pageSize = !Utils.isNull(rowsPerPage) ? rowsPerPage : config.pageSize;
      criteria.parameters = [];
      let properties = Object.getOwnPropertyNames(props.criteriaParams);
      for (const property of properties) {
        let parameter = {};
        let paramValue = props.criteriaParams[property];
        parameter.name = property;
        if(!Utils.isNull(paramValue)) {
          parameter.value = paramValue;
        }

        criteria.parameters.push(parameter);
      }

      console.log("\n\n\nCRITERIA", criteria);
      search();
    }
  }, [props.criteriaParams]);

  React.useEffect(() => {
    if (Utils.isNull(config)) {
      let isEditable = false;
      let visibleColumnCount = 0;

      for (const column of config.columns) {
        if(!Utils.getComponentAttribute(column, "hidden", false)) {
          visibleColumnCount++;
        }
      }

      for (let i = 0; i < config.columns.length; i++) {
        let column = config.columns[i];

        if (!isEditable && column.attributes['editable'] === true) {
          isEditable = true;
          setEditable(true);
        }

        column.width = evaluateTableCellWidth(props.selectionMode === 'MULTIPLE', column, visibleColumnCount);
        if (!Utils.isNull(column.attributes) && column.attributes['editable'] === true && Utils.isNull(column.editor)) {
          let defaultEditor = {};
          defaultEditor.fieldType = 'TEXT_FIELD';
          defaultEditor.id = column.id + 'Editor';

          column.editor = defaultEditor;
        }
      }
    }
  }, []);

  React.useEffect(() => {
    if (!Utils.isNull(config)) {
      criteria.currentPage = 0;
      criteria.pageSize = config.pageSize;
      if (loadingRef.current === true) {
        if(!Utils.isNull(props.loadCompleteHandler)) {
          props.loadCompleteHandler(config.id);
        }

        let autoLoadData = Utils.getComponentAttribute(config, 'autoLoadData', null);
        if (autoLoadData === null || autoLoadData === true) {
          //search();
        }

        loadingRef.current = false;
      }
    }
  }, [config]);

  React.useEffect(() => {
    if (!Utils.isNull(props.data)) {
      let conf = config;
      if (Utils.isNull(conf)) {
        conf = Utils.parseConfig(props.config, props.viewId);
      }

      processData(props.data, conf);
    }
  }, [props.data]);

  function addRowFocusListener(row) {
    $("#ROW-" + row.id).focusout(function () {
      let newSelected = [];
      for (const selectedElement of selected) {
        if (selectedElement !== row.id) {
          newSelected.push(selectedElement);
        }
      }

      setSelected(newSelected);
    });
  }

  React.useEffect(() => {
    if (editable) {
      for (const row of rows) {
        // TODO : Fix the focus loss behavior
        //addRowFocusListener(row);
      }
    }
  });

  React.useEffect(() => {
    updateScrollBarPadding();
    rowCount.current = rows.length;
  }, [rows]);

  React.useEffect(() => {
    if (!Utils.isNull(deletedRows) && deletedRows.length > 0) {
      setDeletedRows(null);
    }

    rowCount.current = rows.length;
  }, [deletedRows]);

  React.useEffect(() => {
    if (!Utils.isNull(props.rows)) {
      let rowValues = [];

      for (const row of props.rows) {
        rowValues.push(observeRow(row));
      }

      setRows(rowValues);
    }
  }, [props.rows]);

  React.useEffect(() => {
    fireSelectionEvent()
  }, [selected]);

  const isSelected = id => selected.indexOf(id) !== -1;
  const editorChangeHandler = (rowId, field, value) => {
    for (const row of rows) {
      if (row.id === rowId) {
        row[field] = value;
        break;
      }
    }

    valueChangeCallback(rows);
  };

  const isFilterable = () => {
    for (let i = 0; i < props.config.columns.length; i++) {
      let column = props.config.columns[i];
      if (column.attributes['filterable'] === true) {
        return true;
      }
    }

    return false;
  };

  const createCell = (row, columnName, cellHandle) => {
    let rowCells = null;
    for (const cellsEntry of cells) {
      if (cellsEntry.rowId === row.id) {
        rowCells = cellsEntry;
        break;
      }
    }

    if (Utils.isNull(rowCells) || rowCells.length === 0) {
      rowCells = {};
      rowCells.rowId = row.id;
      cells.push(rowCells);
    }

    rowCells[columnName] = cellHandle;
  };

  const refreshCell = (rowId, columnName) => {
    let rowCells = null;
    for (const cell of cells) {
      if (cell.rowId === rowId) {
        rowCells = cell;
        break;
      }
    }

    if (!Utils.isNull(rowCells)) {
      let cell = rowCells[columnName];

      if (!Utils.isNull(cell)) {
        cell.api.refresh();
      }
    }
  };

  const valueChangeCallback = (valueRows) => {
    if (!Utils.isNull(props.valueChangeHandler)) {
      let invalidRows = valueRows.filter((row) => {
        return !Utils.isNull(row.errors) && row.errors.length > 0;
      });

      if (invalidRows.length > 0) {
        props.valueChangeHandler(null);
      } else {
        props.valueChangeHandler(valueRows);
      }
    }
  };

  function getTileLabel(row) {
    let counter = 0;
    return (
      <span>
                {config.columns.map(column => (
                  !column.attributes.hidden ?
                    <span key={counter++}>
                                {
                                  row[!Utils.isNull(column.dataBinding) ? column.dataBinding : column.id]
                                }
                      <br/>
                            </span> :
                    null))
                }
            </span>
    );
  }

  function renderTile(row, key) {
    return (<Grid item xs style={{height: '200px', minWidth: '200px'}} key={key}>
      <Button variant="contained" color="secondary"
              style={{width: '100%', height: '100%'}}
              onClick={event => doHandleClick(event, row.id)}
      >
        {
          getTileLabel(row)
        }
      </Button>
    </Grid>);
  }

  function renderTiles() {
    return (
      <React.Fragment>
        {stableSort(rows, getSorting(order, orderBy)).map((row, index) => {
          const isItemSelected = isSelected(row.id);
          const labelId = `enhanced-table-checkbox-${index}`;
          row.index = index;

          return (
            renderTile(row, index)
          )
        })}
      </React.Fragment>
    );
  }

  return (
    <div ref={ref} style={(Utils.isNull(props.hasBorder) || props.hasBorder === true) && (!Utils.isNull(config)) ?
      Utils.mergeStyles({
        margin: '0',
        border: '1px solid #e2e2e2',
        borderRadius: '4px'
      }, props.config) : props.style}>
      {
        !Utils.isNull(props.config.notes) ?
          props.config.notes.map((note) => {
            return <div key={noteKey++}>
              <Alert
                variant={note.messageType === 'WARN' ? 'warning' :
                  note.messageType === 'INFO' ? '' : 'danger'}
                show={true}
              >
                <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>{note.message}</p>
              </Alert>
            </div>
          })
          : null
      }
      {
        rowsPerPageOptions.includes(props.config.pageSize) && !Utils.isNull(config) ?
          config.gridType === 'TILE' ?
            <div style={{margin: "0 0 8px 8px"}}>
              <div className={classes.root}>
                <Grid container spacing={1}>
                  <Grid container item xs={12} spacing={1}>
                    {
                      renderTiles()
                    }
                  </Grid>
                </Grid>
              </div>
            </div>
            :
            <div>
              <div className='responsive-table' style={{height: props.height}}>
                <Table className="ouiTable"
                       cellSpacing="0"
                       aria-labelledby="tableTitle"
                       style={{width: '100%'}}
                >
                  <DataGridHeading
                    ref={React.createRef()}
                    handle={headingHandle}
                    config={config}
                    numSelected={selected.length}
                    scrollWidth={scrollWidth}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={totalNumberOfRows}
                  />
                  <Tbody className={classes.tableBody}
                         style={{maxHeight: !Utils.isNull(props.bodyMaxHeight) ? props.bodyMaxHeight : "42vh"}}
                         id="mainTableBody">
                  {stableSort(rows, getSorting(order, orderBy)).map((row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    row.index = index;
                    let counter = 0;

                    return (
                      <Tr
                        style={{display: 'flex', flexWrap: 'wrap'}}
                        onClick={event => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        id={'ROW-' + row.id}
                        selected={props.selectionMode === 'SINGLE' ? isItemSelected : false}
                        className={props.selectionMode === 'SINGLE' && isItemSelected ? classes.tableSelected : classes.tableRow}
                      >
                        {
                          config.selectionMode === 'MULTIPLE' ?
                            <Td padding="checkbox"
                                width={MULTI_SELECT_CHECKBOX_COL_WIDTH + "px"}
                                className={"selectCell"}>
                              <Checkbox
                                checked={isItemSelected}
                                inputProps={{'aria-labelledby': labelId}}
                              />
                            </Td> : null

                        }
                        {config.columns.map(column => (
                          column.attributes['hidden'] === true ? null :
                            counter++ === config.columns.length - 1 && actionsToolbar !== null && typeof actionsToolbar !== "undefined" ?
                              <Td
                                style={{
                                  width: column.attributes.width
                                }}
                                align="left"
                                className={isItemSelected && !Utils.isNull(props.form) && !Utils.isNull(column.editor) ? "editCell" : null}
                                key={column.id}>
                                Row action toolbar not supported
                              </Td> :
                              <Td
                                style={{
                                  width: column.attributes.width
                                }}
                                align="left"
                                className={isItemSelected && !Utils.isNull(props.form) && !Utils.isNull(column.editor) ? "editCell" : null}
                                key={column.id}
                                onClick={event => handleCellClick(event, row.id, column)}
                              >
                                <TableCellContent
                                  viewId={props.viewId}
                                  form={props.form}
                                  formValues={props.formValues}
                                  editor={column.editor}
                                  ref={React.createRef()}
                                  refCallback={createCell}
                                  selected={isItemSelected}
                                  validator={column.validator}
                                  valueChangeHandler={editorChangeHandler}
                                  columnConfig={column}
                                  actionHandler={
                                    (e) => {
                                      if(props.actionHandler) {
                                        if (!Utils.isNull(props.retrieveOriginalData) && props.retrieveOriginalData) {
                                          props.actionHandler(e, originalData);
                                        } else {
                                          props.actionHandler(e);
                                        }
                                      }
                                    }
                                  }
                                  dataBinding={!Utils.isNull(column.dataBinding) ? column.dataBinding : column.id}
                                  row={row}
                                  contentType={column.fieldType}/>
                              </Td>

                        ))}
                      </Tr>
                    );
                  })}
                  </Tbody>
                </Table>
              </div>
              {
                Utils.isNull(props.pagination) || props.pagination === true ?
                  <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={totalNumberOfRows}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                      'aria-label': 'previous page',
                    }}
                    nextIconButtonProps={{
                      'aria-label': 'next page',
                    }}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                  />
                  :
                  null
              }
            </div>
          :
          null
      }
    </div>
  );
}));
