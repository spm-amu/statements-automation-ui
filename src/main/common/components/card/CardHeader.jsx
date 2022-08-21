import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
import PropTypes from "prop-types";
import {
    makeStyles
} from "@material-ui/core/styles";

import styles from "../../assets/jss/components/cardHeaderStyle";
const useStyles = makeStyles(styles);

export default function CardHeader(props) {
    const classes = useStyles();
    const {
        className,
        children,
        color,
        plain,
        image,
        contact,
        signup,
        stats,
        icon,
        text,
        ...rest
    } = props;
    const cardHeaderClasses = classNames({
        [classes.cardHeader]: true,
        [classes[color + "CardHeader"]]: color,
        [classes.cardHeaderPlain]: plain,
        [classes.cardHeaderImage]: image,
        [classes.cardHeaderContact]: contact,
        [classes.cardHeaderSignup]: signup,
        [classes.cardHeaderStats]: stats,
        [classes.cardHeaderIcon]: icon,
        [classes.cardHeaderText]: text,
        [className]: className !== undefined
    });
    return ( <
        div className = {
            cardHeaderClasses
        } { ...rest
        } > {
            children
        } </div>
    );
}

CardHeader.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    plain: PropTypes.bool,
    image: PropTypes.bool,
    contact: PropTypes.bool,
    signup: PropTypes.bool,
    stats: PropTypes.bool,
    icon: PropTypes.bool,
    text: PropTypes.bool,
    children: PropTypes.node
};
