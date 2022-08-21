import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";
import {
    NavLink
} from "react-router-dom";

import {
    makeStyles
} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/icons/Menu";
import Fingerprint from "@material-ui/icons/Fingerprint";
import LockOpen from "@material-ui/icons/LockOpen";
import CardAvatar from "../card/CardAvatar";
import Button from "../RegularButton";
import styles from "../../assets/jss/components/authNavbarStyle";

const useStyles = makeStyles(styles);

export default function AuthNavbar(props) {
    const [open, setOpen] = React.useState(false);
    const handleDrawerToggle = () => {
        setOpen(!open);
    };
    // verifies if routeName is the one active (in browser input)
    const activeRoute = routeName => {
        return window.location.href.indexOf(routeName) > -1 ? true : false;
    };
    const classes = useStyles();
    const {
        color,
        brandText
    } = props;
    const appBarClasses = cx({
        [" " + classes[color]]: color
    });
    var list = ( <
        List className = {classes.list}>
            <ListItem className = {classes.listItem}>
                <NavLink to = { "/login" }
                         className = {
                             cx(classes.navLink, {
                                 [classes.navLinkActive]: activeRoute("/login")
                             })
                         }
                >
                    <Fingerprint className = {classes.listItemIcon} />
                    <ListItemText primary = { "Login" } disableTypography = {true}
                        className = { classes.listItemText }
                    />
                </NavLink>
            </ListItem>

            <ListItem className = {classes.listItem}>
                <NavLink to = { "/forgot-password" }
                         className = {
                             cx(classes.navLink, {
                                 [classes.navLinkActive]: activeRoute("/forgot-password")
                             })
                         }
                >
                    <LockOpen className = {classes.listItemIcon} />
                    <ListItemText primary = { "Forgot Password" } disableTypography = {true}
                                  className = { classes.listItemText }
                    />
                </NavLink>
            </ListItem>
         </List>
    );

    return (
        <AppBar position="static" className={classes.appBar + appBarClasses} >
            <Toolbar className={classes.container} >
                <Hidden smDown>
                    <div className={classes.flex} >
                        <div className={"row"}>
                            <CardAvatar plain>
                                <img src={require(props.appLogoUrl)}  alt="..." />
                            </CardAvatar>

                            <Button href = "#" className = {classes.title} color = "transparent" >
                                { brandText }
                            </Button>
                        </div>
                    </div>
                </Hidden>
                <Hidden mdUp >
                    <div className = { classes.flex }>
                        <Button href = "#" className = { classes.title } color = "transparent" >
                            Business Agility
                        </Button>
                    </div>
                </Hidden>
                <Hidden mdUp >
                    <Button className = { classes.sidebarButton }
                        color = "transparent"
                        justIcon aria-label = "open drawer"
                        onClick = {
                            handleDrawerToggle
                        }
                    >
                        <Menu />
                    </Button>
                </Hidden>
            </Toolbar>
        </AppBar>
    );
}

AuthNavbar.propTypes = {
    color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
    brandText: PropTypes.string
};
