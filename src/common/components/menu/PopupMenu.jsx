import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {PopupMenuBar } from './MenuBars';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        height: '100%'
    }
}));

export default function PopupMenu(props) {
    const classes = useStyles();
    let counter = 0;

    return (
        <div className={classes.root}>
            {
                props.menus.map(menu => (
                    <PopupMenuBar config={menu} key={++counter}/>
                ))
            }
        </div>
    );
}
