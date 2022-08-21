
export default class Utils {
    constructor() {
    }

    SYSTEM_ERROR_MESSAGE = "A system error has accured. Please contact your system administrator";

    static isNull(value) {
        return value === null || typeof value === 'undefined';
    }

    static capitalize = (s) => {
        if (typeof s !== 'string') return '';
        return s.charAt(0).toUpperCase() + s.slice(1)
    };

    static joinScript(lines) {
        let script = '';

        for(let i=0;i<lines.length;i++) {
            let line = lines[i].trim();
            if(!line.endsWith(';') && !line.endsWith(':')) {
                line += ';'
            }

            line += '\n';
            script += line;
        }

        return script;
    }

    static sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }

    static isStringEmpty(val) {
        return typeof val === 'undefined' || val === null || val.trim().length === 0;
    }

    static getFields(formId, className) {
        let inputFields = [];
        let form = document.getElementById(formId);
        if (!Utils.isNull(form)) {
            let inputDivs = form.getElementsByClassName(className);
            for (let i = 0; i < inputDivs.length; i++) {
                let inputs = inputDivs[i].getElementsByTagName("input");
                for (let j = 0; j < inputs.length; j++) {
                    inputFields.push(inputs[j]);
                }
            }
        }

        return inputFields;
    }

    static offsetDate(date, yearOffset, monthOffset, dayOffset) {
        let year = date.getFullYear() + yearOffset;
        let day = date.getDate() + dayOffset;
        let month = date.getMonth() + monthOffset;

        return new Date(year, month, day);
    }

    autoSetDate(viewRef, formRef, newDate, yearOffset, monthOffset, dayOffset, autoFillDateName, refDateName) {
        let stateDate = viewRef.state[refDateName];
        let tempDate = stateDate;
        if (Utils.isNull(stateDate) || stateDate.getTime() !== newDate.getTime()) {
            viewRef.setState({ ...viewRef.state, [refDateName]: newDate }, () => {
                if (!Utils.isNull(tempDate) && !Utils.isNull(viewRef.state.id)) {
                    let autoFillDate = Utils.offsetDate(newDate, yearOffset, monthOffset, dayOffset);
                    formRef.current.setValue(autoFillDateName, autoFillDate);
                }
                else if (Utils.isNull(viewRef.state.id)) {
                    let autoFillDate = Utils.offsetDate(newDate, yearOffset, monthOffset, dayOffset);
                    formRef.current.setValue(autoFillDateName, autoFillDate);
                }
            });
        }
    }

    static getArgs(func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function(arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }

    static getPropertyChainPath = (expression) => {
        let path = {};

        if(!this.isNull(expression)) {
            let tokens = expression.split('.');
            path.property = tokens[tokens.length - 1];

            let voExpression = expression.substring(0, expression.indexOf('.'));
            path.valueObject = dynamicJS.executeScript(`${Math.random()}_PropertyChainUtilsEval`, voExpression);
            for (let i=1;i<tokens.length - 1;i++) {
                let token = tokens[i];
                if(!this.isNull(path.valueObject)) {
                    let getter = path.valueObject[token];
                    if (!Utils.isNull(getter)) {
                        if (typeof getter === 'function') {
                            path.valueObject = getter();
                        } else {
                            path.valueObject = getter;
                        }
                    }
                } else {
                    break;
                }
            }
        }

        return path;
    };

    static mergeStyles = (defaultStyle, config) => {
        let configStyle = Utils.getComponentAttribute(config, 'style', null);
        if(configStyle) {
            let properties = Object.getOwnPropertyNames(configStyle);
            for (const property of properties) {
                defaultStyle[property] = configStyle[property];
            }
        }

        return defaultStyle;
    };

    static publishSystemErrorMessage = (viewId, component = null) => {
        let message = {
            messageType: 'ERROR',
            message: 'A system error has accured. Please try again later'
        };

        let event = new Event(applicationContext, viewId, message);
        eventManager.fireEvent(EventType.MESSAGE_ARRIVED, event);

        if(component !== null) {
            event = new Event(component, viewId, message);
            eventManager.fireEvent(EventType.MESSAGE_ARRIVED, event);
        }
    }
}
