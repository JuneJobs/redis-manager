import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {
    AgGridReact
} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import axios from "axios";

const styles = {
    card: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
};

class Domain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [{
                headerName: "키",
                field: "key"
            }, {
                headerName: "값",
                field: "value"
            }],
            rowData: [{
                key: "s:t:a:332",
                value: "34"
            }]
        }
    }

    getData = async () => {
        var opts = {
            "header": {
                "msgType": 31,
                "msgLen": 0,
                "endpointId": 1
            },
            "payload": {
                "bdt": "657072000",
                "gender": "0",
                "userId": "dev.j.jobs1028@gmail.com",
                "userPw": "test1234@",
                "userFn": "Admin",
                "userLn": "System"
            }
        };
        try {
            const response = await axios.post("/serverapi", opts);
            console.log(response.data);
        } catch (e) {
            console.log(e);
        }
    }

    render() {

        const { classes } = this.props;
        const bull = <span className={classes.bullet}>•</span>;
        return (
            
            <Card className={classes.card}>
            <div>서버 저장값</div>
            <CardContent>
               <div 
                    className="ag-theme-balham">
                    <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}>
                    </AgGridReact>
                </div>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={this.getData}>Learn More</Button>
            </CardActions>
            </Card>
        );
    }
}

Domain.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Domain);
