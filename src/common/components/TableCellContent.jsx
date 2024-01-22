import React from "react";
import Utils from '../Utils';
import ErrorIcon from '@material-ui/icons/Error';
import CustomTooltip from "./Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Icon from "./Icon";

const TableCellContent = React.memo(React.forwardRef((props, ref) => {
  const [contentType] = React.useState(props.contentType);
  const [refresher, setRefresher] = React.useState(true);

  const validate = (value) => {
    let validator = props.validator;
    let errors = props.row.errors;
    if (!Utils.isNull(errors)) {
      errors = errors.filter((error) => {
        return error.column !== props.dataBinding;
      });

      props.row.errors = errors;
    }

    if (!Utils.isNull(validator)) {
      let required = false;
      if (!Utils.isNull(validator.nullable)) {
        let nullableExpression = validator.nullable.replace(/\[#i]/g, `[${props.row.index}]`);
        required = !Utils.evaluateBooleanExpression(nullableExpression, props.dataBinding);
      }

      let validation = Utils.validateField(props.dataBinding,
        required, props.formValues, value, validator);
      if (!validation.valid) {
        let error = {};
        error.column = props.dataBinding;
        error.message = validation.message;

        if (Utils.isNull(errors)) {
          errors = [];
          props.row.errors = errors;
        }

        props.row.errors.push(error);
        return error;
      }
    }

    return null;
  };

  const valueChangeHandler = (value) => {
    validate(value);
    props.valueChangeHandler(props.row.id, props.dataBinding, value);
  };

  React.useEffect(() => {
    if (!Utils.isNull(props.editor)) {
      props.editor.id = props.editor.id.replace(".", "_");
      if (Utils.isNull(props.editor.attributes)) {
        props.editor.attributes = {};
      }

      props.editor.attributes['minWidth'] = 0;
      let value = props.row[props.dataBinding];
      valueChangeHandler(Utils.isNull(value) ? null : value);
    }
  }, [props.editor]);

  React.useEffect(() => {
  }, []);

  const getStaticDisplayValue = () => {
    let displayValue;
    let contentValue = props.row[props.dataBinding];

    if (props.columnConfig.cellFormat === 'MONEY' || props.columnConfig.cellFormat === 'NUMBER') {
      return Utils.isNull(contentValue) ? '' : contentValue.toFixed(2);
    } else {
      if (Utils.isNull(contentValue)) {
        displayValue = "";
      } else if (contentType === 'DATE') {
        displayValue = new Date(contentValue).toLocaleDateString();
      } else if (contentType === 'TIME') {
        displayValue = new Date(contentValue).toLocaleTimeString();
      } else if (contentType === 'DATE_TIME') {
        displayValue = new Date(contentValue).toLocaleDateString() + ' ' + new Date(contentValue).toLocaleTimeString();
      } else {
        if (typeof contentValue === 'object') {
          // TODO : First check if the editor has a display template. If it does, use it to get the display value
          if (!Utils.isNull(contentValue.map)) {
            displayValue = contentValue.map.label;
          } else {
            displayValue = contentValue.label;
          }
        } else {
          displayValue = contentValue;
        }
      }

      return displayValue;
    }
  };

  const doRender = () => {
    if (props.columnConfig.attributes.toolbar) {
      return (
        <div>
          {props.columnConfig.attributes.toolbar.items.map((item, index) => {
            return <div key={index}>
              <IconButton
                style={{color: '#01476C', width: '36px', height: '36px', marginLeft: '8px'}}
                onClick={(e) => {
                  props.actionHandler({
                    id: item.id,
                    data: props.row
                  });
                }}
              >
                <Icon id={item.icon} color={'rgb(175, 20, 75)'}/>
              </IconButton>
            </div>
          })}
        </div>
      )
    }

    return getStaticDisplayValue();
  };

  const render = () => {
    let error = validate(props.row[props.dataBinding]);
    let hasError = !Utils.isNull(error);
    return <table className={'tableCellContentContainer'} border="0" ref={ref}>
      <tbody>
      <tr>
        {hasError ?
          <td style={{width: '8px'}}><CustomTooltip title={error.message} type={'ERROR'}><ErrorIcon
            style={{color: '#f44336'}}/></CustomTooltip>
          </td> : null}
        <td style={props.columnConfig.cellFormat === 'MONEY' || props.columnConfig.cellFormat === 'NUMBER'
          ? {textAlign: 'right', maxWidth: 0, color: props.textColor} : {textAlign: 'left', maxWidth: 0, color: props.textColor}}>{doRender()}</td>
      </tr>
      </tbody>
    </table>
  };

  return render();
}));

export default TableCellContent;
