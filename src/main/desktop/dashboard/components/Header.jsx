import React from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/svg-icons/navigation/menu';
import {white} from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';

const Header = (props) => {
    const {styles, handleChangeRequestNavDrawer} = props;
    const [title, setTitle] = React.useState("");
    const style = {
        appBar: {
            position: 'fixed',
            top: 0,
            overflow: 'hidden',
            maxHeight: 57
        },
        menuButton: {
            marginLeft: 10
        },
        iconsRightContainer: {
            marginLeft: 20
        },
        avatar: {
            div: {
                padding: '12px 32px 8px 4px',
                height: 32,
                color: white,
                cursor: 'pointer'
            },
            icon: {
                float: 'right',
                display: 'block',
                marginRight: 15,
                outline: 'none'
            },
            span: {
                float: 'left',
                paddingTop: 0,
                display: 'block',
                color: 'white',
                fontWeight: 300,
                marginRight: '32px'
            }
        }
    };

    React.useEffect(
        () => {
        });

    return (
        <div>
            <AppBar
                style={{...styles, ...style.appBar}}
                title={
                    <div>{title}</div>
                }
                iconElementLeft={
                    <IconButton style={style.menuButton} onClick={handleChangeRequestNavDrawer}>
                        <Menu color={white} />
                    </IconButton>
                }
                iconElementRight={
                    <div style={style.iconsRightContainer}>
                        <IconMenu color={white}
                                  iconButtonElement={
                                      <div style={style.avatar.div}>
                                          <span style={style.avatar.span} className="content-desktop">Amukelani Shandlale</span>
                                          <Avatar src="data:image/jpeg;base64,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"
                                                  size={24}
                                                  style={style.avatar.icon}/>
                                      </div>
                                  }
                                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                  anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                        >
                            <MenuItem primaryText="Sign out" onClick={props.logoutCallBack}/>
                        </IconMenu>
                    </div>
                }
            />
        </div>
    );
};

Header.propTypes = {
    styles: PropTypes.object,
    handleChangeRequestNavDrawer: PropTypes.func
};

export default Header;
