import {grey400, grey500, white} from "material-ui/styles/colors";

const styles = {
  title: {
    minWidth: 320,
    maxWidth: 500,
    height: 'auto',
    fontSize: '30px'
  },
  loginContainer: {
    minWidth: 320,
    maxWidth: 500,
    padding: '16px',
    height: 'auto'
  },
  paper: {
    padding: 20,
    overflow: 'auto'
  },
  buttonsDiv: {
    textAlign: 'center',
    padding: 10
  },
  flatButton: {
    color: grey400
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
  loginBtn: {
    float: 'right',
    background: '#01476C'
  },
  btn: {
    background: '#01476C',
    color: white,
    padding: 7,
    borderRadius: 2,
    margin: 2,
    fontSize: 13
  },
  btnFacebook: {
    background: '#01476C'
  },
  btnGoogle: {
    background: '#e14441'
  },
  btnSpan: {
    marginLeft: 5
  }
};

export default styles;
