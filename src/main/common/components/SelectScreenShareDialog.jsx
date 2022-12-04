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
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

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
          <Box sx={{ flexGrow: 1 }}>
            <Grid className={'spacing-xs-2'} container columns={{ xs: 4, sm: 8, md: 12 }}>
              {
                props.sources &&
                props.sources.map((source, index) => (
                  <Grid style={{ padding: '8px' }} item xs={2} sm={4} md={4} key={index}>
                    <img
                      onClick={() => props.selectSourceHandler(source)}
                      src={source.thumbnailUrl}
                      alt={""}
                    />
                    <p style={{ marginTop: '8px' }}>{source.name}</p>
                  </Grid>
              ))}
            </Grid>
          </Box>
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
