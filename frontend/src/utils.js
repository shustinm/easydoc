import React from 'react';
import Axios from 'axios'


export function Fetch(url, setState) {
    React.useEffect(() => {
        setState({ loading: true });
        Axios.get(url)
            .then((res) => setState({ loading: false, data: res.data }))
            .catch((error) => setState({ loading: false, error: true }));
    }, [setState, url]);
}
