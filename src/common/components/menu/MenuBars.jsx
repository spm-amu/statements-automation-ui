import React from 'react'
import List from '@material-ui/core/List'
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Utils from '../../Utils';
import MenuItem from "./MenuItem";
import {white, grey200, grey900} from 'material-ui/styles/colors';

const useStyles = makeStyles(theme => ({
    // TODO: Merge these styles
    expandable: {
        borderTop: '1px solid white',
        color: grey900,
        fontSize: '14px',
        paddingLeft: '20px',
        '&:hover': {
            color: theme.palette.secondary.main
        }
    },listItem: {
        borderTop: '1px solid white',
        backgroundColor: grey200,
        color: grey900,
        fontSize: '14px',
        paddingLeft: '28px',
        '&:hover': {
            color: theme.palette.secondary.main
        }
    },
    listItemSelected: {
        borderTop: '1px solid white',
        backgroundColor: grey200,
        color: theme.palette.secondary.main,
        fontSize: '14px',
        paddingLeft: '28px',
        borderLeft: '2px solid' + theme.palette.secondary.main,
        '&:hover': {
            color: theme.palette.secondary.main
        }
    }
}));


export function CollapsibleMenuBar(props) {
    const classes = useStyles();
    const [selectedLink, setSelectedLink] = React.useState('');
    const [itemExpansionStatuses, setItemExpansionStatuses] = React.useState({});
    const defaultElement = React.useRef(null);

    React.useEffect(
        () => {
            if(props.activeMenu !== props.name){
                setSelectedLink(null);
            }
        },[props.activeMenu]);

    function selectLink(item) {
        setSelectedLink(item);
        if (!Utils.isNull(props.optionSelectHandler)) {
            props.optionSelectHandler(props.name);
        }
    }

    function handleClick(item) {
        var value;
        if (typeof itemExpansionStatuses[item] === 'undefined') {
            value = false;
        } else {
            value = !itemExpansionStatuses[item];
        }

        setItemExpansionStatuses({ ...itemExpansionStatuses, [item]: value });
    }

    function handler(children) {
        return children.map((child) => {
            if (!child.items || child.items.length === 0) {
                return (
                    <div key={child.id}>
                        <ListItem
                            className={child.id === selectedLink ? classes.listItemSelected : classes.listItem}
                            button
                            ref={child.default === true ? defaultElement : null}
                            onClick={() => selectLink(child.id)}
                            key={child.id}>
                            <MenuItem config={child} ref={React.createRef()} viewId="menuBar"/>
                        </ListItem>
                    </div>
                );
            } else {
                if (typeof itemExpansionStatuses[child.id] === 'undefined') {
                    itemExpansionStatuses[child.id] = false
                }
            }

            return (
                <div key={child.id}>
                    <ListItem
                        className={classes.expandable}
                        button
                        onClick={() => handleClick(child.id)}
                    >
                        <ListItemText
                            primary={child.attributes['label']}
                        />
                        { itemExpansionStatuses[child.id] === false ?
                            <ExpandLess /> :
                            <ExpandMore />
                        }
                    </ListItem>
                    <Collapse
                        className={classes.wrapperInner}
                        in={itemExpansionStatuses[child.id]}
                        timeout="auto"
                        unmountOnExit
                    >
                        {handler(child.items)}
                    </Collapse>
                </div>
            )
        })
    }

    return (
        props.config === null || typeof props.config === 'undefined' ?
            <div /> :
            <div style={{ width: "100%" }}>
                <List>
                    {handler(props.config.menus)}
                </List>
            </div>
    );
}

export function PopupMenuBar(props) {
    const classes = useStyles();
    const [children, setChildren] = React.useState({});

    function handleClick(item) {
    }

    function handler(children) {
        return children.map((child) => {
            if (!child.items || child.items.length === 0) {
                return (
                    <MenuItem mode='cascaded' ref={React.createRef()} viewId="menuBar" config={child}/>
                );
            }

            return (
                <MenuItem config={child} ref={React.createRef()} mode='cascaded' viewId="menuBar" menuItems={handler(child.items)}/>
            )
        })
    }

    return (
        props.config === null || typeof props.config === 'undefined' ?
            <div /> :
            <div style={{ width: "100%" }}>
                <MenuItem config={props.config} mode='cascaded' ref={React.createRef()} viewId="menuBar" menuItems={handler(props.config.items)}/>
            </div>
        )
}
