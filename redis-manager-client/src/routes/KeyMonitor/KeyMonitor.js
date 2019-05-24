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

import Select from 'react-select';
import Snackbar from '@material-ui/core/Snackbar';

import MonitorCardType1 from '../../components/MonitorCardType1/MonitorCardType1'
import MonitorCardType2 from '../../components/MonitorCardType2/MonitorCardType2'

//import update from 'react-addons-update'
import { stat } from 'fs';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    _h6Spacing: {
        margin: '0 10px',   
    },
    txtStructure: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 120
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

class KeyMonitor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            numChildren: 0,
            defaultColDef: {
                width: 200,
                editable: true,
                filter: "agTextColumnFilter"
            },
            rowSelection: "single",
            monType: 'single',
            newKey: null,
            keys: null,
            addMonitorKeys: null,
            monTitle: null,
            sec: 5,
            snackBar: {
                open: false,
                vertical: 'top',
                horizontal: 'center',
                msg: ''
            },
            cardDataSet: []
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
            "monType": this.state.monType,
            "sec": this.state.sec,
            "auto": false
        }
        const result  = await axios.post("/MonitorList", params);
        console.log(result);
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
        //event.target.value
        let keys = [];
        if (event.target.value === 'single') {
            this.state.keys.map((item) => {
                if (item.value.indexOf('*') === -1) {
                    keys.push(item);
                }
            })
        } else {
            this.state.keys.map((item) => {
                if (item.value.indexOf('*') !== -1) {
                    keys.push(item);
                }
            })
        }

        this.setState({
            addMonitorKeys: keys,
            [name]: event.target.value,
            newKey: null
        });
    };

    handlePsKeyChange = name => value => {
        this.setState({
            [name]: value
        });
    };

    handleTxtMonTitleChange = name => value => {
        let newTitleStr = value.target.value;
        this.setState({
            [name]: newTitleStr
        });
    };
    handleTxtSearchSecChange = name => event => {
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

    handleDeleteButton = async (idx) => {
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

            let addMonitorKeys = [];
            keys.map((item) => {
                if (item.value.indexOf('*') === -1) {
                    addMonitorKeys.push(item);
                }
            });

            console.log(keys);
            this.setState({
                'keys': keys,
                'addMonitorKeys': addMonitorKeys
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
            let cardDataSet = [],
                cardData = [];
            for (let i = 0; i < res.data.payload.length; i++) {
                cardData = JSON.parse(res.data.payload[i]);
                cardDataSet.push(cardData);
            }

            // const bull = <span className={classes.bullet}>•</span>;
            this.setState({
                cards: null
            })
            let cards = cardDataSet.map((cardData, index) => {
                if(cardData.monType === 'single') {
                    return <MonitorCardType1
                        idx = {
                            index
                        }
                        cardDataSet = {
                            cardData
                        }
                        handleDeleteButton = {this.handleDeleteButton}
                    />
                } else {
                    return <MonitorCardType2
                        idx = {
                            index
                        }
                        cardDataSet = {
                            cardData
                        }
                        handleDeleteButton = {this.handleDeleteButton}
                    />
                }
                
            });
            
            this.setState({
                cardDataSet: cardDataSet,
                cards: cards
            })

        } catch (e) {
            console.log(e);
        }
    }

    componentWillMount = () => {
        this._setMonitorCard();
        this._setKeyList();
    }

    _onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
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
                {this.state.cards}
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
                        onChange={this.handleTxtMonTitleChange('monTitle')}
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
                        options={this.state.addMonitorKeys}
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
                        onChange={this.handleTxtSearchSecChange('sec')}
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

KeyMonitor.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(KeyMonitor);
