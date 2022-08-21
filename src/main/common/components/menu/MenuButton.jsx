import React from 'react';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from "./MenuItem";
import {makeStyles} from '@material-ui/core/styles';
import MenuList from '@material-ui/core/MenuList';
import Utils from '../../Utils';
import IconButton from '@material-ui/core/IconButton';
import Icon from '../Icon';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    paper: {
        marginRight: theme.spacing(2),
    },
    MuiButtonWhite: {
        color: '#fff'
    },
    wrapper: {
        maxHeight: "32px",
        minwidth: "60px",
        zIndex: 2
    }
}));

const MenuButton = React.forwardRef((props, ref) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    let width = !Utils.isNull(props.config.attributes['width']) ? parseInt(props.config.attributes['width'].toString().replace('px', '')) : null;
    const [disabled, setDisabled] = React.useState(false);
    const [itemRefs] = React.useState([]);
    const [config, setConfig] = React.useState(null);

    React.useEffect(
        () => {
            props.handle.api = api();
            if (Utils.isNull(config)) {
                let parsedConfig = Utils.parseConfig(props.config, props.viewId);
                setConfig(parsedConfig);
                eventManager.addSubscriptions(parsedConfig.eventHandlingConfig, props.handle, props.viewId);
                eventManager.addSystemSubscriptions(parsedConfig);
            }
        });

    React.useEffect(() => {
        if (!Utils.isNull(config)) {
            // TODO : Synch with loading of the menu items of the menu button. This may cause some load scripts to fail
            props.loadCompleteHandler(config.id);
        }
    }, [config]);

    const handleToggle = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const handleClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    function createItemRef() {
        let ref = React.createRef();
        itemRefs.push(ref);

        return ref;
    }

    const api = () => {
        return {
            get id() {
                return props.config.id;
            },
            getChildren: () => {
                return itemRefs;
            },
            set disabled(disabled) {
                setDisabled(disabled);
            },
            refresh() {
                setDisabled(Utils.evaluateBooleanExpression(config.disabled, config.id));
            }
        }
    };

    return (
        <div className={classes.root} style={{width: width}}>
            <div className={classes.wrapper}>
                {
                    !Utils.isNull(props.config.icon) && !Utils.isNull(props.config.attributes['label']) ?
                        <Button
                            className={classes.MuiButtonDefault}
                            variant="contained"
                            ref={anchorRef}
                            color="primary"
                            size="large"
                            disabled={disabled}
                            onClick={handleToggle}
                            startIcon={<Icon id={props.config.icon}/>}
                        >
                            props.config.attributes['label']
                        </Button>
                        :
                        !Utils.isNull(props.config.icon) ?
                            <IconButton
                                className={classes.margin}
                                ref={anchorRef}
                                aria-controls="menu-list-grow"
                                disabled={disabled}
                                aria-haspopup="true"
                                onClick={handleToggle}
                            >
                                <Icon id={props.config.icon}/>
                            </IconButton>
                            :
                            <Button
                                className={classes.MuiButtonDefault}
                                ref={anchorRef}
                                aria-controls="menu-list-grow"
                                disabled={disabled}
                                aria-haspopup="true"
                                onClick={handleToggle}
                            >
                                {props.config.attributes['label']}
                            </Button>

                }
                <Popper open={open} anchorEl={anchorRef.current} keepMounted transition disablePortal>
                    {({TransitionProps, placement}) => (
                        <Grow
                            {...TransitionProps}
                            style={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                        >
                            <Paper id="menu-list-grow">
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList style={{background: "#ffffff", opacity: "1"}}>
                                        {props.config.menu.items.map(item => (
                                            <MenuItem config={item} viewId={props.viewId} key={item.id}
                                                      ref={createItemRef()}/>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        </div>
    );
});

export default MenuButton;
