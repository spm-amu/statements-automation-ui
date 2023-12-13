import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
import PropTypes from "prop-types";
import {
    makeStyles
} from "@material-ui/core/styles";

import styles from "../../assets/jss/components/cardTextStyle";

const useStyles = makeStyles(styles);

export default function CardText(props) {
    const classes = useStyles();
    const {
        className,
        children,
        color,
        ...rest
    } = props;
    const cardTextClasses = classNames({
        [classes.cardText]: true,
        [classes[color + "CardHeader"]]: color,
        [className]: className !== undefined
    });
    return ( <
        div className = {
            cardTextClasses
        } { ...rest
        } > {
            children
        } </div>
    );
}

CardText.propTypes = {
    className: PropTypes.string,
    color: PropTypes.oneOf([
        "warning",
        "success",
        "danger",
        "info",
        "primary",
        "rose"
    ]),
    children: PropTypes.node
};
