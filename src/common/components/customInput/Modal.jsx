import React from 'react';
import "./Modal.css";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";


const ModalComponent = React.memo(React.forwardRef((props, ref) => {

  const dynamicModalClass = () => (props.open ? { display: 'block' } : '');

  return (

      <Modal open={props.open} onClose={props.onClose} >
        <div className="modal" style={dynamicModalClass()} id="channelModal">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text">{props.modalHeader}</h4>
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
                      color={'primary'}
                      onClick={props.onSave}
                    >
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
  );
}));

export default ModalComponent;




