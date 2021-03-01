import React from 'react';
import { useHistory } from "react-router-dom";
import { Avatar, ClickAwayListener, Fade, Icon, IconButton, List, ListItem, makeStyles, Menu, MenuItem, Paper, Typography, withStyles } from '@material-ui/core';
import SearchBar from './SearchBar';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';


import Axios from 'axios';

import { API, QUERY_API, BASE_URI } from '../api';
import { BookRounded, DockRounded, VisibilityRounded } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    option: {
        fontSize: 15,
        '& > span': {
          marginRight: 10,
          fontSize: 18,
        },
      },
      autocompletePaper: {
          marginTop: theme.spacing(0.2),
      },
      linkDescription: {
          flex: 1,
      }
}));

const CustomTextField = withStyles({
    root: {
      '& label.Mui-focused': {
        color: 'white',
      },
      '& .MuiInput-underline': {
        borderBottomColor: 'white',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'white',
        },
        '&:hover fieldset': {
          borderColor: 'white',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'white',
        },
      },
    },
  })(TextField);


function queryData(currentQuery, saveState, saveMenuState) {
    saveState({ loading: true });
    Axios.get(QUERY_API, {
        params: {
            query: currentQuery
        }
    })
    .then((res) => saveState({ loading: false, data: res.data}))
    .catch((error) => saveState({ loading: false, error: true}));
}

function SiteListView(props) {
    const classes = useStyles();

    const [url, doctool] = props.entry.split(':');
    const [project, repo] = url.split('/');
    const title = project + " / " + repo;

    const reg = new RegExp(props.query, 'gi');
    const finalTitle = title.replace(reg, function(str) {return '<b>'+str+'</b>'});

    const icons = {
        "mkdocs": BookRounded,
        "doxygen": DockRounded,
        "sphinx": VisibilityRounded,
    }

    return (
        <ListItem button onClick={() => {
            let path = BASE_URI + '/' + project + '/' + repo + "/" + doctool + "/";
            window.location.href = path;
        }}>
            <div className={classes.linkDescription} dangerouslySetInnerHTML={{__html: finalTitle}} />
            {React.createElement(icons[doctool])}
        </ListItem>
    );
}

export default function ProjectSearchBar(props) {
    const classes = useStyles();
    const [queryState, setQueryState] = React.useState({ loading: false, error: false, data: [] });
    const [menuState, setMenuState] = React.useState({ showMenu: false, entries: [] });

    const handleSearchChange = (query) => {
        if (query) {
            queryData(query, setQueryState);
            setMenuState({ showMenu: true, entries: queryState.data, query: query })
        } else {
            setMenuState({ showMenu: false, entries: [] });
        }
    }

    return (
        <div>
            <Fade in={true} style={{ transitionDelay: '500ms' }}>
                <SearchBar onChange={handleSearchChange} />
            </Fade>
            <ClickAwayListener onClickAway={() => setMenuState({ showMenu: false, entries: [] })}>
                <Fade in={menuState.showMenu}>
                    <Paper className={classes.autocompletePaper}>
                        <List>
                            {menuState.entries && menuState.entries.map((entry) => <SiteListView key={entry} query={menuState.query} entry={entry} />)}
                        </List>
                    </Paper>
                </Fade>
            </ClickAwayListener>
        </div>
    );
}
