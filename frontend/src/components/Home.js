import React from 'react';
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

import { useTheme, makeStyles, AppBar, Button, Container, Toolbar, Typography, Zoom, Fade, Paper } from "@material-ui/core";
import SearchBar from 'material-ui-search-bar';
import NewProjectDialog from './NewProjectDialog';
import ProjectSearchBar from './ProjectSearchBar';
  
const useStyles = makeStyles((theme) => ({
    root: {
        background: 'linear-gradient(30deg, #232526 0%, #434345 100%)',
        height: '100vh',
        overflowX: 'hidden',
    },
    appbar: {
        background: 'transparent',
        boxShadow: 0,
        paddingRight: theme.spacing(2),
    },
    logo: {
        width: '3%',
        height: 'auto',
    },
    title: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
          ].join(','),
        fontWeight: 300,
        marginLeft: theme.spacing(1),
        flexGrow: 1,
    },
    searchTitle: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
          ].join(','),
        fontWeight: 500,
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(4),
        textAlign: 'center'
    },
    container: {
        marginTop: theme.spacing(20)
    }
}));

export default function Home(props) {
    const classes = useStyles();

    const [createOpen, setCreateOpen] = React.useState(false);
    const handleNewProjectButtonPress = () => {
        setCreateOpen(true);
    };

    const handleNewProjectDialogClose = () => {
        setCreateOpen(false);
    };

    return (
        <BrowserRouter>
            <div className={classes.root}>
                <AppBar className={classes.appbar} position="sticky" elevation={0}>
                        <Zoom in={true} style={{ transitionDelay: '100ms' }} {...{ timeout: 800 }} onEntered={() => window.dispatchEvent(new CustomEvent("resize"))}>
                            <Toolbar className={classes.toolbar}>
                                <img className={classes.logo} src="/images/logo.png" alt="logo"/>
                                <Typography variant="h5" className={classes.title}>
                                    EasyDoc
                                </Typography>
                                <Button variant="outlined" onClick={handleNewProjectButtonPress}>Create new Project</Button>
                            </Toolbar>
                        </Zoom>
                    </AppBar>
                    <Container className={classes.container}>
                        <Zoom in={true} style={{ transitionDelay: '500ms' }}>
                            <Typography variant="h3" className={classes.searchTitle}>
                                Find and read documentations with EasyDoc!
                            </Typography>
                        </Zoom>
                        <ProjectSearchBar />
                    </Container>
                    <NewProjectDialog open={createOpen} handleClose={handleNewProjectDialogClose}/>
            </div>
        </BrowserRouter>
    );
}