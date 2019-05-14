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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from "@material-ui/core/Switch";
import CachedIcon from '@material-ui/icons/Cached';

import Select from 'react-select';
import Snackbar from '@material-ui/core/Snackbar';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { stat } from 'fs';

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
    txtStructure: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 120
    },
    txtMonType: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 120,
    },
    Switch: {
        marginRight: theme.spacing.unit,
        marginTop: 23
    },
    Fab: {
        marginRight: theme.spacing.unit,
        marginTop: 23
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
        minWidth: 575,
        minHeight: 200,
        margin: theme.spacing.unit,
    },
    title: {
        fontSize: 14,
    },
    singleValue: {
        fontSize: 14,
    },
    addMonitor: {
        textAlign: 'right',
        width: '100%'
    },
    deleteButton: {
        textAlign: 'right',
        width: '100%'
    },
    closeCard: {
        textAlign: 'right',
    },
    open: false,
    formControl: {
        //margin: theme.spacing.unit,
        minWidth: 500,
    },
    input: {
        display: 'flex',
        padding: 0,
    }
});

// const suggestions 

class KeyString extends Component {
    render() {
        const { classes } = this.props;
        return (
          <div>
            <TextField
              ref="txtPsKey"
              id="txtPsKey"
              label="txtPsKey"
              inputRef={el => this.psKey = el}
              //placeholder="Put the keys pattern"
              fullWidth
              margin="normal"
              // value={this.state.selectedData.ptKey}
              //onChange={this.handleTextChange("ptKey")}
              InputLabelProps={{
                shrink: true
              }}
            />
          </div>
        );
    }
};


function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

const components = {
    Control,
    SingleValue
};

class Domain extends Component {
    constructor(props) {
        super(props);
        this.gridKeyType = {
            string: [{
                headerName: "ID",
                type: 'string',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            },{
                headerName: "value",
                field: "value",
                editable: false,
                width: 200
            }],
            list: [{
                headerName: "ID",
                type: 'list',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            },{
                headerName: "values",
                field: "values",
                editable: false,
                width: 200
            }],
            set: [{
                headerName: "ID",
                type: 'set',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            },{
                headerName: "member",
                field: "member",
                editable: false,
                width: 200
            }],
            sortedSet: [{
                headerName: "ID",
                type: 'sortedSet',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            },{
                headerName: "score",
                field: "score",
                editable: false,
                width: 200
            },{
                headerName: "member",
                field: "member",
                editable: false,
                width: 200
            }],
            geoSet: [{
                headerName: "ID",
                type: 'geoSet',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            },{
                headerName: "longitude",
                field: "lng",
                editable: false,
                width: 200
            },{
                headerName: "latitude",
                field: "lat",
                editable: false,
                width: 200
            },{
                headerName: "member",
                field: "member",
                editable: false,
                width: 200
            }],
            hash: [{
                headerName: "ID",
                type: 'hash',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            },{
                headerName: "field",
                field: "field",
                editable: false,
                width: 200
            },{
                headerName: "value",
                field: "value",
                editable: false,
                width: 200
            }]
        };

        this.state = {
            numChildren: 0,
            cardDataSet: [{
                id: 1,
                monTitle: 'user key monitor',
                sec: 5,
                auto: true,
                type: 'single',
                psKey: 'user:seq',
                tyKey: 'string',
                rowData: []
            }, {
                id:2,
                monTitle: 'user name monitor',
                sec: 5,
                auto: false,
                type: 'single',
                psKey: 'user:name',
                tyKey: 'hash',
                rowData: []
            }],
            defaultColDef: {
                width: 200,
                editable: true,
                filter: "agTextColumnFilter"
            },
            rowSelection: "single",
            monType: 'single',
            newKey: null,
            keys: null,
            monTitle: null,
            sec: 20,
            snackBar: {
                open: false,
                vertical: 'top',
                horizontal: 'center',
                msg: ''
            }
        }
        //첫번째 포맷에 들어가야 하는 것
        //키 선택, 키 조회

        //Data format
        this.form = {
            pageSetting: {
                idx: 1,
                title: 'This is Title',
                type: 1,
                ord: 0,
                cnt: 100,
                reInt: 1000
            }
        }
    }

    handleFabAdd = event => {
        this.setState({
            open: true
        });
    };
    handleAddButton = async () => {
        if (this.state.monTitle === null) {
            this.setState({
                'snackBar': {
                    open: true,
                    vertical: 'top',
                    horizontal: 'center',
                    msg: 'Please enter monitor title.'
                }
            });
            return;
        }
        if (this.state.newKey === null) {
            this.setState({
                'snackBar': {
                    open: true,
                    vertical: 'top',
                    horizontal: 'center',
                    msg: 'Please select a key.'
                }
            });
            return;
        }
        let params = {};
        params = {
            "queryType": "POST",
            "monTitle": this.state.monTitle,
            "psKey": this.state.newKey.value,
            "tyKey": this.state.newKey.tyKey,
            "monType": this.state.monType,
            "sec": this.state.sec,
            "auto": false
        }
        await axios.post("/MonitorList", params);

        this.setState({
            open:false
        });

        this._setMonitorCard();
    };

    handleCloseButton = () => {
        this.setState({
            open: false
        });

    };
    // getData = (idx) => {
        
    // }

    handleMonTypeSelectChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };

    handlePsKeyChange = name => value => {
        this.setState({
            [name]: value
        });
    };

    handletxtMonTitleChange = name => value => {
        let newTitleStr = value.target.value;
        this.setState({
            [name]: newTitleStr
        });
    };
    handletxtSearchSecChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };
    handleSnackBarClose = () => {
        this.setState({
            'snackBar': {
                open: false,
                vertical: 'top',
                horizontal: 'center',
                msg: ''
            }
        });
    };

    handleDeleteButton = async (event) => {
        console.log(event.currentTarget.value);

        let idx = parseInt(event.currentTarget.value);
        console.log(this.state.cardDataSet);
        let cardData = this.state.cardDataSet[idx];
        let params = {
            "queryType": "DELETE",
            "curIdx": idx,
            "psKey": cardData.psKey
        }
        await axios.post("/MonitorList", params);
        this._setMonitorCard();
    }

    handleAutoSearchChange = async (event) => {
        
        let value = JSON.parse(event.target.value);
        if (value) {
            value = false;
        } else {
            value = true;
        }
        let idx = parseInt(event.target.id);
        let params = {
            "queryType": "PUT2",
            "curIdx": idx,
            "auto": value
        }
        await axios.post("/MonitorList", params);
        this._setMonitorCard();
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        //this.getData(this.onGridReady.idx);
            
        //this.onSelectionChanged()
    };

    bindData = (key, tyKey, cb) => {
        // var params = {
        //     'key': key,
        //     'dataType': dataType
        // };
        // try {
        //     axios.post("/keys", params).then(res => {
        //         cb(res.data);
        //     });
        // } catch (e) {
        //     console.log(e);
        // }
        cb([{
            value: 'hello'
        }]);
    }

    _setKeyList = async () => {
        let params = {
            "queryType": "GET"
        };
        try {
            const res = await axios.post("/keys", params);
            console.log(res);
            let keys = [];

            res.data.payload.map((object) => {
                keys.push({
                    value: object.psKey,
                    label: object.psKey + " (" + object.lgKey + ")",
                    tyKey: object.tyKey
                });
            });
            keys.sort(function (a, b) {
                let keyA = a.value.toUpperCase(); // ignore upper and lowercase
                let keyB = b.value.toUpperCase(); // ignore upper and lowercase
                if (keyA < keyB) {
                    return -1;
                }
                if (keyA > keyB) {
                    return 1;
                }
                return 0;
            });
            console.log(keys);
            this.setState({
                'keys': keys
            })
        } catch (e) {
            console.log(e);
        }

    }

    _setMonitorCard = async () => {
        let params = {
            "queryType": "GET"
        };
        try {
            const res = await axios.post("/MonitorList", params);
            //res.data.payload
            console.log(res.data.payload);
            let cardDataSet = [];
            for (let i = 0; i < res.data.payload.length; i++) {
                cardDataSet.push(JSON.parse(res.data.payload[i]));
            }
            this.setState({
                'cardDataSet': cardDataSet
            })

            // const bull = <span className={classes.bullet}>•</span>;
            const children = [];        
            for (var i = 0; i < this.state.cardDataSet.length; i++) {
                children.push(
                <this.ChildComponent
                        idx={i}
                        cardDataSet = {
                            this.state.cardDataSet
                        }
                />
                );
            };
            this.setState({
                'children': children
            })

        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount = () => {  

        this._setKeyList();

        this._setMonitorCard();
        
    }

    ChildComponent = props => {
        const { classes } = this.props;
        const { cardDataSet, idx } = props;

        return (
            <Card className={classes.newCard}>
                <Typography variant="h6" color="inherit" className={classes._h6Spacing} noWrap>
                    {cardDataSet[idx].monTitle}
                </Typography>
                <div className={classes.deleteButton}>
                    <IconButton aria-label="Delete" 
                        className={classes.margin}
                        value={idx}
                        onClick={this.handleDeleteButton}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </div>
                <TextField
                    id="standard-name"
                    label="Search Key"
                    className={classes.textField}
                    value={cardDataSet[idx].psKey}
                    //onChange={this.handleChange('name')}
                    margin="normal"
                />
                <TextField
                    id="standard-name2"
                    label="Data Structure"
                    className={classes.txtStructure}
                    value={cardDataSet[idx].tyKey}
                    //onChange={this.handleChange('name')}
                    margin="normal"
                />
                <TextField
                    id="standard-name3"
                    label="Monitor Type"
                    className={classes.txtMonType}
                    value={cardDataSet[idx].monType}
                    //onChange={this.handleChange('name')}
                    margin="normal"
                />
                <TextField
                    id="standard-name4"
                    label="Auto search seconds"
                    className={classes.textField}
                    value={cardDataSet[idx].sec}
                    //onChange={this.handleChange('name')}
                    margin="normal"
                />
                <FormControlLabel
                    className={classes.Switch}
                    control={
                        <Switch
                            checked={cardDataSet[idx].auto}
                            onChange={this.handleAutoSearchChange}
                            id={idx}
                            value={cardDataSet[idx].auto}
                        />
                    }
                    label="Auto search"
                />
                <Fab
                    variant="extended"
                    size="small"
                    //color="extended"
                    aria-label="Add"
                    className={classes.Fab}
                >
                <CachedIcon className={classes.extendedIcon} />
                </Fab>
                <div
                    id="myGrid"
                    style={{
                        height: "100%",
                        width: "100%"
                    }}
                    className="ag-theme-balham"
                    >
                    <AgGridReact
                        idx={this.onGridReady.idx = idx}
                        columnDefs={this.gridKeyType[cardDataSet[idx].dataType]}
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}
                        onGridReady={this.onGridReady}
                        //onSelectionChanged={this.onSelectionChanged.bind(this)}
                        rowData={ cardDataSet[idx].rowData}
                    />
                </div>
            </Card>
        );
    };   

    render() {

        const { classes, theme } = this.props;
        const { vertical, horizontal, open } = this.state.snackBar;

        const selectStyles = {
            input: base => ({
                ...base,
                "& input": {
                    font: "inherit"
                }
            })
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
                {this.state.children}
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                <DialogTitle id="form-dialog-title">Add a new monitor</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please pick one of the key type.
                    </DialogContentText>
                    <TextField
                        ref="txtMonTitle"
                        id="txtMonTitle"
                        label="Monitor Title"
                        //placeholder="Put the keys pattern"
                        fullWidth
                        margin="normal"
                        value={this.state.monTitle}
                        onChange={this.handletxtMonTitleChange('monTitle')}
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink htmlFor="key-type-label-placeholder">
                            Monitor Type
                        </InputLabel>
                        <NativeSelect
                            value={this.state.monType}
                            onChange={this.handleMonTypeSelectChange('monType')}
                            input={
                            <Input
                                name="monType"
                                id="key-type-label-placeholder"
                            />
                            }
                            name="monType"
                        >
                            <MenuItem value={"single"}>Single</MenuItem>
                            <MenuItem value={"multi"}>Multiple</MenuItem>
                        </NativeSelect>
                    </FormControl>
                    {/* <KeyString/> */}
                    <Select
                        classes={classes}
                        styles={selectStyles}
                        textFieldProps={{
                        label: 'Select Key',
                        InputLabelProps: {
                            shrink: true,
                        },
                        }}
                        options={this.state.keys}
                        components={components}
                        value={this.state.newKey}
                        onChange={this.handlePsKeyChange('newKey')}
                        placeholder="Search "
                        isClearable
                    />
                     < TextField
                        ref = "txtSearchSec"
                        id = "txtSearchSec"
                        label = "Search Seconds"
                        //onChange={this.handletxtMonTitleChange('monTitle')}
                        //placeholder="Put the keys pattern"
                        fullWidth
                        margin = "normal"
                        value={this.state.sec}
                        onChange={this.handletxtSearchSecChange('sec')}
                        InputLabelProps = {
                            {
                                shrink: true
                            }
                        }
                     />
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
                <Snackbar
                    anchorOrigin={{ vertical, horizontal }}
                    open={open}
                    onClose={this.handleSnackBarClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.snackBar.msg}</span>}
                />
            </div>
        );
    }
}

Domain.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Domain);
