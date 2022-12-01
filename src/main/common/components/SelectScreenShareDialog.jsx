/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import './AlertDialog.css'
import ActivityCard from './activity/ActivityCard';

export default function SelectScreenShareDialog(props) {

  const handleClose = () => {
    props.handleCloseHandler();
  };

  return (
    <div>
      <Dialog
        fullWidth={true}
        open={props.open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Select window to share"}
        </DialogTitle>
        <DialogContent>
          <div className={'col'}>
            {
              props.sources &&
              props.sources.map((source, index) => {
              return <div key={index}>
                  <img
                    onClick={() => props.selectSourceHandler(source)}
                    src={source.thumbnailUrl}
                    alt={""}
                  />
                  <p style={{ marginTop: '8px' }}>{source.name}</p>
                </div>;
              })
            }
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            autoFocus
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
