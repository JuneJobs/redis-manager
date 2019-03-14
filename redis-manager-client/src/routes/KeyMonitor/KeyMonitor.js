import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import {
    AgGridReact
} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import axios from "axios";
import 'typeface-roboto';
//Dialog
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Input from "@material-ui/core/Input";
import MenuItem from '@material-ui/core/MenuItem';
import NativeSelect from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    _h6Spacing: {
        margin: '0 10px',   
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    dense: {
        marginTop: 19,
    },
    menu: {
        width: 200,
    },
    card: {
        minWidth: 275,
        minHeight: 65,
        margin: theme.spacing.unit,
    },
    newCard: {
        minWidth: 275,
        minHeight: 200,
        margin: theme.spacing.unit,
    },
    title: {
        fontSize: 14,
    },
    addMonitor: {
        textAlign: 'right',
        width: '100%'
    },
    open: false,
    formControl: {
        //margin: theme.spacing.unit,
        minWidth: '100%',
    },
});

class Domain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [{
                headerName: "Logical Domain",
                field: "key",
                align: "right",
                width: 200,
                //headerCheckboxSelection: true,
                //checkboxSelection: true,
                editable: false
            }, {
                headerName: "Physical Domain",
                field: "value",
                editable: false
            }],
            defaultColDef: {
                width: 200,
                editable: true,
                filter: "agTextColumnFilter"
            },
            rowSelection: "single",
            rowData: [],
            selectedData: {
                key: '',
                value: ''
            },
            readonly: true,
            mode: 'R',
            numChildren: 0

        }
    }

    handleFabAdd = event => {
        this.setState({
            open: true
        });
    };
    handleAddButton = () => {
        this.setState({
            numChildren: this.state.numChildren + 1,
            open:false
        });
    };

    handleCloseButton = () => {
        this.setState({
            open: false
        });
    };

    ChildComponent = props => {
        const { classes } = this.props;
        return (
            <Card className={classes.newCard}>
                <div className={classes.addMonitor}>
                </div>
            </Card>
        );
    };   

    render() {

        const { classes } = this.props;
        // const bull = <span className={classes.bullet}>•</span>;
        const children = [];        
        for (var i = 0; i < this.state.numChildren; i += 1) {
            children.push(
                <this.ChildComponent 
                    key={i} 
                    number={i} 
                />
            );
        };

        return (
            <div id="test">
                <Card className={classes.card}>
                    <Toolbar >
                        <div>
                        <Typography variant="h6" color="inherit" className={classes._h6Spacing} noWrap>
                        Key Monitor
                        </Typography>
                        </div>
                        <div className={classes.addMonitor}>
                            <Fab
                                variant="extended"
                                size="small"
                                color="secondary"
                                aria-label="Add"
                                className={classes.margin}
                                onClick={this.handleFabAdd.bind(this)}
                            >
                            <AddIcon className={classes.extendedIcon} />
                            Add a new monitor
                            </Fab>
                        </div>
                        <CardContent>
                            
                        </CardContent>
                    </Toolbar>
                </Card>
                {children}
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                <DialogTitle id="form-dialog-title">Add a new monitor</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please pick one of the key type
                    </DialogContentText>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink htmlFor="key-type-label-placeholder">
                            Key Type
                        </InputLabel>
                        <NativeSelect
                            value={this.state.selectedData.tyKey}
                            //onChange={this.handleNativeSelectChange.bind(this)}
                            input={
                            <Input
                                name="keyType"
                                id="key-type-label-placeholder"
                            />
                            }
                            name="keyType"
                        >
                            <MenuItem value={"Strings"}>Type 1: Simple Key</MenuItem>
                            <MenuItem value={"Lists"}>Type 2: Pattern Key</MenuItem>
                            <MenuItem value={"Sets"}>Type 3</MenuItem>
                            <MenuItem value={"Hashes"}>Type 4</MenuItem>
                        </NativeSelect>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleAddButton.bind(this)} color="primary">
                    Add
                    </Button>
                    <Button onClick={this.handleCloseButton.bind(this)} color="secondary">
                    Cancel
                    </Button>
                </DialogActions>
                </Dialog>
            </div>
        );
    }
}

Domain.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Domain);
