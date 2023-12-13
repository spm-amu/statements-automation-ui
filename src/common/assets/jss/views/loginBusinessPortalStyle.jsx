import {grey400, grey500, white} from "material-ui/styles/colors";

const styles = {
    title: {
        minWidth: 320,
        maxWidth: 400,
        height: 'auto',
        fontSize: '30px'
    },
    loginContainer: {
        minWidth: 320,
        maxWidth: 400,
        padding: '16px',
        height: 'auto'
    },
    paper: {
        padding: 20,
        overflow: 'auto'
    },
    buttonsDiv: {
        display: "inline-block",
        textAlign: "center",
        marginTop: '8px'
    },
    flatButton: {
        color: grey500,
    },
    checkRemember: {
        style: {
            float: 'left',
            maxWidth: 180,
            paddingTop: 5
        },
        labelStyle: {
            color: grey500
        },
        iconStyle: {
            color: grey500,
            borderColor: grey500,
            fill: grey500
        }
    },
    componentWrapper: {
        display: "inline",
        textAlign: "center"
    },
    loginBtn: {
        float: 'right'
    },
    btn: {
        background: '#4f81e9',
        color: white,
        padding: 7,
        borderRadius: 2,
        margin: 2,
        fontSize: 13
    },
    btnFacebook: {
        background: '#4f81e9'
    },
    btnGoogle: {
        background: '#e14441'
    },
    btnSpan: {
        marginLeft: 5
    }
};

export default styles;
