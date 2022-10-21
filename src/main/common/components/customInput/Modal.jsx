import React from 'react';
import '../../assets/scss/react-select/_react-select.scss';
import '../../assets/scss/flatpickr/flatpickr.scss';
import "./Modal.css";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";


const ModalComponent = React.memo(React.forwardRef((props, ref) => {

  const dynamicModalClass = () => (props.open ? { display: 'block' } : '');

  return (
    <div>
      {/*<button type="button" onClick={handleOpen}>*/}
      {/*  {props.openLabel}*/}
      {/*</button>*/}
      <Modal open={props.open} onClose={props.onClose}>
        <div className="modal" style={dynamicModalClass()} id="channelModal">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text">{props.modalHeader}</h4>

                {/*<button*/}
                {/*  onClick={handleClose}*/}
                {/*  style={{ color: '#fff' }}*/}
                {/*  type="button"*/}
                {/*  className="close"*/}
                {/*  data-dismiss="modal"*/}
                {/*  aria-label="Close"*/}
                {/*>*/}
                {/*  <span aria-hidden="true">&times;</span>*/}
                {/*</button>*/}
              </div>

              <div className="modal-body">
                {props.body}
              </div>

              <div className="modal-footer">

                <div style={{width: '100%', display: 'flex', justifyContent: 'right', margin: '16px 0'}}>
                  <div style={{marginRight: '4px'}}>
                    <Button
                      variant={'contained'}
                      size="large"
                      color={'primary'}>
                      SAVE
                    </Button>
                  </div>
                  <Button
                    variant={'text'}
                    size="large"
                    onClick={props.onClose}
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}));

export default ModalComponent;




