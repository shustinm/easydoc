import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Fade, makeStyles } from '@material-ui/core';
import { CREATE_API } from '../api';
import Axios from 'axios';
import { Redirect } from 'react-router';
import Loader from 'react-loader-spinner';

const useStyles = makeStyles((theme) => ({
    button: {
        color: "#03DAC6"
    },
    textfield: {
        '& label.Mui-focused': {
            color: theme.palette.text.secondary,
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: theme.palette.text.secondary,
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.text.secondary,
            },
            '&:hover fieldset': {
                borderColor: theme.palette.text.secondary,
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.text.secondary,
            }, 
        },
    },
    spinnerDiv: {
        position: 'absolute',
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
    }
}));

export default function NewProjectDialog(props) {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);

    const handleSend = React.useCallback(
        async event => {
            setLoading(true);
            event.preventDefault();
            const { url } = event.target.elements;
            Axios.post(CREATE_API + "?url=" + url.value).then((res) => { setLoading(false); props.handleClose() });
        }
    )

    return (
        <div>
            {loading 
            ? <Fade in={true}> 
                <div className={classes.spinnerDiv}> 
                    <Loader type="BallTriangle" color="#E54921" height={160} width={160}/>
                </div>
            </Fade>
            : <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                New Project
            </DialogTitle>
            <form onSubmit={handleSend}>
                <DialogContent>
                <DialogContentText>
                    To create a new project, please provide a git link.
                </DialogContentText>
                    <TextField
                        label="Clone URL"
                        fullWidth
                        variant="outlined"
                        name="url"
                        placeholder="git@github.com:easydoc/easydoc.git"
                        className={classes.textfield}
                        />
                </DialogContent>
                <DialogActions>
                <Button onClick={props.handleClose} className={classes.button}>
                    Cancel
                </Button>
                <Button className={classes.button} type="submit">
                    Create
                </Button>
                </DialogActions>
            </form>
        </Dialog>}
        </div>
    );
}
