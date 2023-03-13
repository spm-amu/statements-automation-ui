import React from "react";
import {Th, Tr} from "react-super-responsive-table";
import {MULTI_SELECT_CHECKBOX_COL_WIDTH} from "./DataGrid";
import Checkbox from "@material-ui/core/Checkbox";
import DataGridColumn from "./DataGridColumn";
import PropTypes from "prop-types";
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    tableHead: {
        fontSize: '14px !important',
        display: 'block',
        overflow: 'inherit',
    }
}));

const DataGridHeading = React.memo(React.forwardRef((props, ref) => {
    const classes = useStyles();
    const {onSelectAllClick, numSelected, rowCount, onRequestSort} = props;
    const [columnHandles] = React.useState([]);
    const [sortDirection, setSortDirection] = React.useState('desc');

    const createSortHandler = property => event => {
        onRequestSort(event, property);
        setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    };

    let columnCounter = 0;
    React.useEffect(() => {
        props.handle.api = api();
    });

    const createColumnHandle = () => {
        let handle = {};
        columnHandles.push(handle);
        return handle;
    };

    const api = () => {
        return {
            get id() {
                // DataGridHeading
                return props.config.id;
            },
            getChildren: () => {
                return columnHandles;
            }
        }
    };

    return (
        <thead className={classes.tableHead} style={{width: "calc(100% - " + props.scrollWidth + "px)"}} ref={ref}>
        <Tr style={{display: 'flex', flexWrap: 'wrap'}}>
            {
                props.config.selectionMode === 'MULTIPLE' ?
                    <Th padding="checkbox" width={MULTI_SELECT_CHECKBOX_COL_WIDTH + "px"} className="selectCell">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{'aria-label': 'select all'}}
                        />
                    </Th> : null

            }
            {props.config.columns.map(column => (
                column.attributes['hidden'] === true ? null :
                    <DataGridColumn key={columnCounter++} config={column} handle={createColumnHandle()}
                                    ref={React.createRef()}
                                    sortDirection={sortDirection}
                                    createSortHandler={createSortHandler}/>
            ))}
        </Tr>
        </thead>
    );
}));

DataGridHeading.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired,
};

function arePropsEqual(prev, next) {
    return prev.config === next.config && prev.scrollWidth === next.scrollWidth
        && prev.rowCount === next.rowCount && prev.numSelected === next.numSelected;
}

export default React.memo(DataGridHeading, arePropsEqual)
