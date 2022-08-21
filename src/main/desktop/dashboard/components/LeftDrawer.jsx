import React from 'react';
import Drawer from 'material-ui/Drawer';
import {spacing, typography} from 'material-ui/styles';
import {white, blue600, grey900, grey400} from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import Assessment from 'material-ui/svg-icons/action/assessment';
import Work from 'material-ui/svg-icons/action/group-work';
import PopupMenu from '../../../common/components/menu/PopupMenu';
import Utils from '../../../common/Utils'

const LeftDrawer = (props) => {
    let { navDrawerOpen } = props;

    const styles = {
        spacer: {
            height: '2px'
        },
        topSpacer: {
            cursor: 'pointer',
            fontSize: 22,
            color: typography.textFullWhite,
            lineHeight: `${spacing.desktopKeylineIncrement}px`,
            fontWeight: typography.fontWeightLight,
            backgroundColor: blue600,
            paddingLeft: 40,
            height: 56,
        },
        orgLogo: {
            cursor: 'pointer',
            margin: "auto",
            padding: 16,
            width: '70%',
            backgroundColor: white
        },
        menuItem: {
            color: grey900,
            fontSize: 14
        },
        hr: {
            borderTop: `1px solid ${grey400}`,
            height: 1,
            backgroundColor: white
        }
    };

    return (
        <Drawer width={320}
                docked={true}
                open={navDrawerOpen}>
            <div style={styles.spacer}/>
            <div style={styles.orgLogo}>
                <img src={"http://www.rendzonene.co.za/wp-content/uploads/2015/05/REDZONENE_Gold.jpg"} style={{width: "100%"}}  alt={""}/>
            </div>
            <div style={styles.hr}/>
            <div className="row" style={{ borderBottom: '1px solid ' + grey400}}>
                {
                    Utils.isNull(props.settings.dashboardMenu) ?
                        null :
                        <div className="col" style={{ textAlign: 'right', paddingRight: '2px'}}>
                            <IconMenu color={grey900}
                                      iconButtonElement={
                                          <IconButton><Assessment color={grey900}/></IconButton>
                                      }
                                      targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            >
                                <PopupMenu menus={props.settings.dashboardMenu.menus}/>
                            </IconMenu>
                        </div>
                }
                <div className="col" style={{textAlign: Utils.isNull(props.settings.dashboardMenu) ? 'center' : 'left', paddingLeft: '2px'}}>
                    <IconMenu color={grey900}
                              iconButtonElement={
                                  <IconButton size={48}><Work color={grey900}/></IconButton>
                              }
                              targetOrigin={{horizontal: 'right', vertical: 'top'}}
                              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                    >
                        <PopupMenu menus={props.settings.workflowMenu.menus}/>
                    </IconMenu>
                </div>
            </div>
            <div>
                {
                    props.settings !== null ?
                        <p>AAAAAAAA</p>
                        :
                        null
                }
            </div>
            <div className="row" style={{ paddingLeft: '32px', paddingTop: '16px', borderTop: '1px solid ' + grey400 }}>
                <div style={{ marginLeft: '32px'}}>
                    <img width={56} src="data:image/jpeg;base64,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" alt={""}/>
                </div>
                <div className="col" style={{ marginTop: '16px', color: grey400 }}>
                    Copyright (c) 2018
                </div>
            </div>
        </Drawer>
    );
};

LeftDrawer.propTypes = {
    navDrawerOpen: PropTypes.bool,
    menus: PropTypes.array,
    username: PropTypes.string,
};

export default LeftDrawer;
