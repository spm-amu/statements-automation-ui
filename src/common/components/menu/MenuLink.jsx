import React from 'react';
import Utils from '../../Utils';
import {useDispatch} from "react-redux";
import {actionCreators} from "../../redux/store/DashboardStore";
import Icon from "../Icon";

const MenuLink = React.forwardRef((props, ref) => {
  //const dispatch = useDispatch();

  React.useEffect(
    () => {
    }, [props.config]);

  const handleClick = (e) => {
    e.preventDefault();
    dispatch(actionCreators.setActiveRoute(props.name));
  };

  const api = {
    get id() {
      // MenuItem
      return !Utils.isNull(props.config) ? props.config.id : null;
    }
  };

  const handle = {
    "api": api
  };

  return (
    <a
      onClick={(e) => handleClick(e)}
      ref={ref}
      style={{color: 'inherit', marginLeft: ((props.level + 1) * 8) + 'px'}}
    >
      {
        props.icon !== undefined ? (
          <Icon id={"home"}/>
      ) : (
        <>
                    <span className="sidebar-normal">
                      {" "}
                      {props.name}
                      {" "}
                    </span>{" "}
        </>
      )}{" "}
    </a>
  );
});

export default MenuLink;
