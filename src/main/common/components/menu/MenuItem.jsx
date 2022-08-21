import React from 'react';
import MenuItemComponent from 'material-ui/MenuItem';
import RightChevron from 'material-ui/svg-icons/navigation/chevron-right';
import Utils from '../../Utils';

const MenuItem = React.forwardRef((props, ref) => {
    const [handle] = React.useState({});
    const [initializing, setInitializing] = React.useState(true);

    React.useEffect(
        () => {
        });

    const handleClick = (e) => {
      alert("Click fireee");
    };

    return (
        <MenuItemComponent onClick={(e) => handleClick(e)} ref={ref}
                           rightIcon={props.mode === 'cascaded' && !Utils.isNull(props.menuItems) && props.menuItems.length > 0 ?
                               <RightChevron/> : null}
                           menuItems={props.menuItems}>{props.config.attributes['label']}</MenuItemComponent>
    );
});

export default MenuItem;
