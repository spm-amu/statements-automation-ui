import React from 'react';
import {withStyles, makeStyles} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

const LightTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
}))(Tooltip);

const useStylesBootstrap = makeStyles((theme) => ({
    arrow: {
        color: theme.palette.common.black,
    },
    tooltip: {
        backgroundColor: theme.palette.common.black,
    },
}));

const useStylesError = makeStyles((theme) => ({
    arrow: {
        color: '#f44336',
    },
    tooltip: {
        backgroundColor: '#f44336',
    },
}));

function BootstrapTooltip(props) {
    const classes = useStylesBootstrap();
    return <Tooltip arrow classes={classes} {...props} />;
}

function ErrorTooltip(props) {
    const classes = useStylesError();
    return <Tooltip arrow classes={classes} {...props} />;
}

const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))(Tooltip);

export default function CustomTooltip(props) {
    return (
        <div>
            {
                props.type === 'LIGHT' ?
                    <LightTooltip title={props.title}>
                        {props.children}
                    </LightTooltip>
                    :
                    props.type === 'BOOTSTRAP' ?
                        <BootstrapTooltip title={props.title}>
                            {props.children}
                        </BootstrapTooltip>
                        : props.type === 'ERROR' ?
                        <ErrorTooltip title={props.title}>
                            {props.children}
                        </ErrorTooltip>
                        :
                        <HtmlTooltip
                            title={
                                <React.Fragment>
                                    <Typography color="inherit">{props.heading}</Typography>
                                    {props.title}
                                </React.Fragment>
                            }
                        >
                        </HtmlTooltip>
            }
        </div>
    );
}
