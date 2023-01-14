import moment from 'moment';

const colors = [
  '#F44336', '#e91e63', '#9c27b0', '#673ab7',
  '#ff9800', '#ff5722', '#795548', '#607d8b',
  '#3f51b5', '#2196F3', '#00bcd4', '#009688',
  '#2196F3', '#32c787', '#00BCD4', '#ff5652',
  '#ffc107', '#ff85af', '#FF9800', '#39bbb0',
  '#4CAF50', '#ffeb3b', '#ffc107',
];

export default class Utils {
  constructor() {
  }

  SYSTEM_ERROR_MESSAGE =
    'A system error has accured. Please contact your system administrator';

  static isNull(value) {
    return value === null || typeof value === 'undefined';
  }

  static formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr",
      "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec"
    ];

    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return date.getDate() + ' ' + monthNames[monthIndex] + ' ' + year + ' - ' + date.getHours() + ':' + date.getMinutes();
  }

  static getAvatarColor(name) {
    name = name.substr(0, 6);

    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = 31 * hash + name.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
  }

  static isObjectsEqual(obj1, obj2) {
    let properties = Object.getOwnPropertyNames(obj1);
    for (let i = 0; i < properties.length; i++) {
      if (JSON.stringify(obj1[properties[i]]) !== JSON.stringify(obj2[properties[i]])) {
        return true;
      }
    }

    return true;
  }

  static getInitials(name) {
    const parts = name.split(' ');
    let initials = '';
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].length > 0 && parts[i] !== '') {
        initials += parts[i][0]
      }
    }
    return initials
  }

  static isToday(date) {
    return !moment(date).isBefore(moment(), "day");
  }

  static capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  static joinScript(lines) {
    let script = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line.endsWith(';') && !line.endsWith(':')) {
        line += ';';
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
    return (
      typeof val === 'undefined' || val === null || val.trim().length === 0
    );
  }

  static getFields(formId, className) {
    const inputFields = [];
    const form = document.getElementById(formId);
    if (!Utils.isNull(form)) {
      const inputDivs = form.getElementsByClassName(className);
      for (let i = 0; i < inputDivs.length; i++) {
        const inputs = inputDivs[i].getElementsByTagName('input');
        for (let j = 0; j < inputs.length; j++) {
          inputFields.push(inputs[j]);
        }
      }
    }

    return inputFields;
  }

  static offsetDate(date, yearOffset, monthOffset, dayOffset) {
    const year = date.getFullYear() + yearOffset;
    const day = date.getDate() + dayOffset;
    const month = date.getMonth() + monthOffset;

    return new Date(year, month, day);
  }

  static getMonthlyPeriod(val) {
    if(val === -1) {
      return "Last";
    } else if(val === 1) {
      return "First";
    } else if(val === 2) {
      return "Second";
    } else if(val === 3) {
      return "Third";
    } else {
      return "Fourth";
    }
  }

  static getDayOfWeekDescription(val) {
    if(val === "SU") {
      return "Sunday";
    } else if(val === "MO") {
      return "Monday";
    } else if(val === "TU") {
      return "Tuesday";
    } else if(val === "WE") {
      return "Wednesday";
    } else if(val === "TH") {
      return "Thursday";
    } else if(val === "FR") {
      return "Friday";
    } else {
      return "Saturday";
    }
  }

  autoSetDate(
    viewRef,
    formRef,
    newDate,
    yearOffset,
    monthOffset,
    dayOffset,
    autoFillDateName,
    refDateName
  ) {
    const stateDate = viewRef.state[refDateName];
    const tempDate = stateDate;
    if (Utils.isNull(stateDate) || stateDate.getTime() !== newDate.getTime()) {
      viewRef.setState({...viewRef.state, [refDateName]: newDate}, () => {
        if (!Utils.isNull(tempDate) && !Utils.isNull(viewRef.state.id)) {
          const autoFillDate = Utils.offsetDate(
            newDate,
            yearOffset,
            monthOffset,
            dayOffset
          );
          formRef.current.setValue(autoFillDateName, autoFillDate);
        } else if (Utils.isNull(viewRef.state.id)) {
          const autoFillDate = Utils.offsetDate(
            newDate,
            yearOffset,
            monthOffset,
            dayOffset
          );
          formRef.current.setValue(autoFillDateName, autoFillDate);
        }
      });
    }
  }

  static getArgs(func) {
    // First match everything inside the function argument parens.
    const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

    // Split the arguments string into an array comma delimited.
    return args
      .split(',')
      .map(function (arg) {
        // Ensure no inline comments are parsed and trim the whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();
      })
      .filter(function (arg) {
        // Ensure no undefined values are added.
        return arg;
      });
  }

  static getPropertyChainPath = (expression) => {
    const path = {};

    if (!this.isNull(expression)) {
      const tokens = expression.split('.');
      path.property = tokens[tokens.length - 1];

      const voExpression = expression.substring(0, expression.indexOf('.'));
      path.valueObject = dynamicJS.executeScript(
        `${Math.random()}_PropertyChainUtilsEval`,
        voExpression
      );
      for (let i = 1; i < tokens.length - 1; i++) {
        const token = tokens[i];
        if (!this.isNull(path.valueObject)) {
          const getter = path.valueObject[token];
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
    const configStyle = Utils.getComponentAttribute(config, 'style', null);
    if (configStyle) {
      const properties = Object.getOwnPropertyNames(configStyle);
      for (const property of properties) {
        defaultStyle[property] = configStyle[property];
      }
    }

    return defaultStyle;
  };

  static selectThemeColors = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary25: '#7367f01a', // for option hover bg-color
      primary: '#7367f0', // for selected option bg-color
      neutral10: '#7367f0', // for tags bg-color
      neutral20: '#ededed', // for input border-color
      neutral30: '#ededed', // for input hover border-color
    },
  });

  static isObjEmpty = obj => Object.keys(obj).length === 0;

  static getFormattedDate = (date) => {
    return date.toLocaleDateString('en-GB').split('/').reverse().join('-');
  };

  static getChatMeetingTitle = (participants, currentUserId, charMax) => {
    let name = '';

    if (participants.length === 2) {
      name = participants.find(p => p.userId !== currentUserId).name;
    } else {
      participants.forEach((user, index) => {
        if (index < 4 && user.userId !== currentUserId) {
          name = name + user.name + ', ';
        }
      })

      name = name.slice(0, charMax);

      if (name.length < charMax || participants.length > 2) {
        name = name + '...';
      }

      if (participants.length > 3) {
        name = name + '+' + (participants.length - 3);
      }
    }

    return name;
  };

  static getComponentAttribute(field, attribute, defaultValue) {
    if (this.isNull(field.attributes)) {
      return defaultValue;
    }

    return this.isNull(field.attributes[attribute]) ? defaultValue : field.attributes[attribute];
  }

  static setSessionValue(name, value) {
    sessionStorage.setItem(name, value);
  }

  static getSessionValue(name) {
    return sessionStorage.getItem(name);
  }
}

export const isNull = (value) => {
  return Utils.isNull(value);
};
