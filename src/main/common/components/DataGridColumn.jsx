import React from 'react';
import Utils from '../Utils';
import {Th} from "react-super-responsive-table";
import TableSortLabel from '@material-ui/core/TableSortLabel';
import './DataGrid.css';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    tableHeaderCell: {
        overflow: 'inherit',
        textAlign: 'left !important'
    },
    tableHeaderCellNumeric: {
        overflow: 'inherit',
        textAlign: 'right !important'
    }
}));

const DataGridColumn = React.memo(React.forwardRef((props, ref) => {
    const [config, setConfig] = React.useState(props.config);
    const [label] = React.useState(props.config.attributes['label']);
    const [postfix, setPostfix] = React.useState('');
    const [required, setRequired] = React.useState(false);
    const classes = useStyles();

    React.useEffect(
        () => {
        }, [props.config]);

    const api = () => {
        return {
            get id() {
                return props.config.id;
            },
            getChildren: () => {
                return [];
            },
            refresh: () => {
                if (!Utils.isNull(config.validator) && !Utils.isNull(config.validator.nullable)) {
                    let nullable = Utils.evaluateBooleanExpression(config.validator.nullable.replace(/rows\[#i]/g, 'selection[0]'), config.id);
                    if (!nullable !== required) {
                        setRequired(!nullable);
                        setPostfix(!nullable ? '*' : '');
                    }
                }
            }
        }
    };

    return (
        <Th
            key={config.id}
            padding={'default'}
            className={config.cellFormat === 'MONEY' || config.cellFormat === 'NUMBER' ? classes.tableHeaderCellNumeric : classes.tableHeaderCell}
            style={{
              width: config.attributes.width
            }}
        >
          {
            config.attributes['sortable'] === true ?
              <TableSortLabel
                active={false}
                direction={props.sortDirection}
                onClick={props.createSortHandler(config.id)}
              >
                {label + postfix}
              </TableSortLabel>
              :
              label + postfix
          }
        </Th>
    );
}));

export default DataGridColumn;
