/* eslint-disable react/prop-types, react/jsx-handler-names */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';
import NativeSelect from "@material-ui/core/Select";
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
//import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from "@material-ui/core/Input";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

import axios from "axios";
import {
    AgGridReact
} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
let updateRow = false;
let selectedData = {
    lgKey: '',
    psKey: ''
};
const axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
    },
    proxy: {
        host: 'http://admin.intuseer.com:1234',
        port: 1234
    }
};
const styles = theme => ({
    root: {
        flexGrow: 1,
        height: 250,
        display: 'flex',
        flexWrap: 'wrap',
    },
    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08,
        ),
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    divider: {
        height: theme.spacing.unit * 2,
    },
    card: {
        minWidth: 275,
        minHeight: 800
    },
    _h6Spacing: {
        margin: '0 10px',
    },
    button: {
        margin: theme.spacing.unit,
    },
    formControl: {
        //margin: theme.spacing.unit,
        minWidth: 150,
    },
});

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
    return (
        < TextField
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

function Option(props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
              fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.placeholder}
            {...props.innerProps}
        >
          {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function onChipDelete(props) {
    updateRow = true;
    let rmIdx = 0;
    let curArray = props.getValue();
    props.getValue().map((Object, index) => {
        if (Object.value === props.data.value) {
            rmIdx = index;
        }
    })
    curArray.splice(rmIdx, 1);
    curArray.map((arr, index) => {
        if (index === 0) {
            selectedData.psKey = arr.value;
            selectedData.lgKey = arr.label;
        } else {
            selectedData.psKey = selectedData.psKey + ':' + arr.value;
            selectedData.lgKey = selectedData.lgKey + '>' + arr.label;
        }
    })
    console.log(selectedData);
    // parent.setState({
    //     readonly: false,
    //     mode: 'W'
    // });
}

function MultiValue(props) {
    return (
        <Chip
          tabIndex={-1}
          label={props.children}
          className={classNames(props.selectProps.classes.chip, {
            [props.selectProps.classes.chipFocused]: props.isFocused,
          })}
            onDelete={event=> {
                props.removeProps.onClick();
                onChipDelete(props);
            }}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu(props) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
          {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    ValueContainer,
};


class KeyManagement extends React.Component {
    constructor(props) {
        super(props);
        this._getDomains();
        this.state = {
          domains: [],
          multi: null,
          columnDefs: [
            {
              headerName: "ID",
              width: 60,
              editable: false,
              valueGetter: "node.id"
            },
            {
              headerName: "Physical Key",
              field: "psKey",
              editable: false,
              width: 150
            },
            {
              headerName: "Logical Key",
              field: "lgKey",
              editable: false,
              width: 550
            },
            {
              headerName: "Key Pattern",
              field: "ptKey",
              editable: false,
              width: 200
            },
            {
              headerName: "Key Type",
              field: "tyKey",
              editable: false,
              width: 100
            }
          ],
          defaultColDef: {
            width: 200,
            editable: true,
            resizable: true,
            sortable: true,
            filter: "agTextColumnFilter"
          },
          rowSelection: "single",
          rowData: [],
          selectedData: {
            lgKey: "",
            psKey: "",
            ptKey: "",
            tyKey: "Strings",
            idx: ""
          },
          readonly: true,
          mode: "R",
          dialogOpen: false,
          keyType: 'string'
        };
    }
    _getDomains = async () => {
        let params = {
            "queryType": "GET"
        };
        try {
            const res = await axios.post("/domain", params, axiosConfig);
            console.log(res);
            let domains = [{
                lgDom: '*',
                psDom: '*'
            }];

            res.data.payload.map((object) => {
                domains.push({
                    lgDom: object.lgDom,
                    psDom: object.psDom
                });
            });
            domains.sort(function (a, b) {
                let keyA = a.psDom.toUpperCase(); // ignore upper and lowercase
                let keyB = b.psDom.toUpperCase(); // ignore upper and lowercase
                if (keyA < keyB) {
                    return -1;
                }
                if (keyA > keyB) {
                    return 1;
                }
                return 0;
            });
            this.setState({
                domains: domains.map(domain => ({
                label: domain.lgDom,
                value: domain.psDom,
            })) 
            });

        } catch (e) {
            console.log(e);
        }
    }

    handleChange = name => value => {
        this.setState({
            [name]: value,
        });

        let psKey = '',
            lgKey = '';
        console.log(this.gridApi);
        //first registration
        let newItem = false;
        if (this.state.mode === 'R'){
            newItem = false;
        }
        let selectedRows = this.gridApi.getSelectedRows()[0];
        if (selectedRows === undefined) {
            newItem =true;
        }

        if (!newItem) {
            value.map((object, index) => {
                if (index === 0) {
                    psKey = object.value;
                    lgKey = object.label;
                } else {
                    psKey = psKey + ':' + object.value;
                    lgKey = lgKey + '>' + object.label;
                }
            })

            this.setState({
                
                selectedData: {
                    idx: selectedRows.idx,
                    psKey: psKey,
                    lgKey: lgKey,
                    ptKey: selectedRows.ptKey,
                    tyKey: selectedRows.tyKey
                },
                //rowData
            });
        } else {
            value.map((object, index) => {
                if (index === 0) {
                    psKey = object.value;
                    lgKey = object.label;
                } else {
                    psKey = psKey + ':' + object.value;
                    lgKey = lgKey + '>' + object.label;
                }
            })
            this.setState({
              selectedData: {
                idx: 0,
                psKey: psKey,
                lgKey: lgKey,
                ptKey: '',
                tyKey: 'Strings'
              },
              mode: 'W'
            });
        }
    };
    handleNativeSelectChange = event => {
        this.setState({ 
            selectedData: {
                ...this.state.selectedData,
                tyKey: event.target.value
            }
        });
    };

    handleTextChange = name => event => {
        this.setState({
            selectedData: {
                ...this.state.selectedData,
                ptKey: event.target.value
            }
        });
    };
    
    _handleUpdateInput = (searchText) => {
        console.log(searchText)
    };
    
    selectFirstNode() {
        this.gridApi.forEachNode(function (node) {
            console.log(node);
            if (node.id === "0") {
                node.setSelected(true);
            }
        });
    }
    
    getData = async () => {
        let params = {
            "queryType": "GET"
        };
        try {
            const response = await axios.post("/keys", params, axiosConfig);
            let rowdata = response.data.payload
            rowdata.sort(function (a, b) {
                let keyA = a.psKey.toUpperCase(); // ignore upper and lowercase
                let keyB = b.psKey.toUpperCase(); // ignore upper and lowercase
                if (keyA < keyB) {
                    return -1;
                }
                if (keyA > keyB) {
                    return 1;
                }
                return 0;
            });
            this.setState({
                rowData: rowdata
            });
            if (response.data.payload > 0) {
                this.selectFirstNode();
            }
            
        } catch (e) {
            console.log(e);
        }
    }

    _onBtnAddClick = async () => {
        this.setState({
            selectedData: {
                lgKey: '',
                psKey: '',
                ptKey: '',
                tyKey: 'Strings',
                idx: ''
            },
            ["multi"]: [],
            readonly: false,
            mode: 'W'
        });
    };
    _onBtnSaveClick = async () => {
        try {
            let params ={};
            if (this.state.mode === "W") {
                params = {
                    "queryType": "POST",
                    "lgKey": this.state.selectedData.lgKey,
                    "psKey": this.state.selectedData.psKey,
                    "ptKey": this.state.selectedData.ptKey,
                    "tyKey": this.state.selectedData.tyKey,
                };
            } else {
                if (updateRow) {
                    params = {
                        "queryType": "PUT",
                        "idx": this.state.selectedData.idx,
                        "lgKey": selectedData.lgKey,
                        "psKey": selectedData.psKey,
                        "ptKey": this.state.selectedData.ptKey,
                        "tyKey": this.state.selectedData.tyKey,
                    };
                } else {
                    params = {
                        queryType: "PUT",
                        idx: this.state.selectedData.idx,
                        lgKey: this.state.selectedData.lgKey,
                        psKey: this.state.selectedData.psKey,
                        ptKey: this.state.selectedData.ptKey,
                        tyKey: this.state.selectedData.tyKey
                    };
                }
            }
            
            await axios.post("/keys", params, axiosConfig);

            this.getData();
            this.setState({
                readonly: true,
                mode: 'R'
            });
            updateRow = false;
            selectedData = {
                lgKey: '',
                psKey: '',
                ptKey: '',
                tyKey: 'Strings'
            };
        } catch (e) {
            console.log(e);
        }
    }
    _onBtnDeleteClick = async () => {
        console.log(this.state.selectedData.psKey);
        var params = {
            "queryType": "DELETE",
            "psKey": this.state.selectedData.psKey
        };
        try {
            await axios.post("/keys", params, axiosConfig).then( res => {
                if(res.data.resCode === 0) {
                    this.getData();
                    this.setState({
                        readonly: true,
                        mode: 'R'
                    });
                    updateRow = false;
                    this.selectFirstNode();
                } else if (res.data === 3) {
                    this.setState({
                        dialogOpen: true
                    });
                }
            })
        } catch (e) {
            console.log(e);
        }

        
    }
    text = () => {
        let keys = this.state.multi.map(single => single.value);
        if(keys.length < 1){
            return '' 
        } else if (keys.length === 1) {
            return keys[0];
        } else {
            return keys.reduce((a, b) => a + ':' + b, '').slice(1);
        }
    };

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.getData();
        //this.onSelectionChanged()
    };


    onSelectionChanged() {
        let selectedRows = this.gridApi.getSelectedRows()[0];
        this.setState({
            selectedData: selectedRows
        });
        //selectedRows[0].
        this.setState({
            readonly: true,
            mode: 'R'
        });

        let selectedValues = [];

        
        let lgKeys = [],
            psKeys = []
        lgKeys = selectedRows.lgKey.split(">");
        psKeys = selectedRows.psKey.split(":");
        for (let i = 0, len = lgKeys.length; i < len; i++) {
            selectedValues.push({
                label: lgKeys[i],
                value: psKeys[i]
            })
        }
        this.setState({
            ["multi"]: selectedValues
        });
        
    }

    handleClickOpen = () => {
        this.setState({
            dialogOpen: true
        });
    };

    handleClose = () => {
        this.setState({
            dialogOpen: false
        });
    };

    render() {
        const { classes, theme, fullScreen} = this.props;
        const { multi } = this.state;

        const selectStyles = {
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
            '& input': {
            font: 'inherit',
            },
        }),
        };

        return (
            <Card className={classes.card}>
                <Typography
                    variant="h6"
                    color="inherit"
                    className={classes._h6Spacing}
                    noWrap
                >
                    Key Management
                </Typography>
                <CardContent>
                    <Select
                        ref="selectBox"
                        classes={classes}
                        styles={selectStyles}
                        textFieldProps={{
                            label: "Key",
                            InputLabelProps: {
                            shrink: true
                            }
                        }}
                        options={this.state.domains}
                        components={components}
                        value={this.state.multi}
                        onChange={this.handleChange("multi")}
                        //onChange={this.onTextChange.bind(this)}
                        placeholder="Select Domains"
                        isMulti
                    />
                    <TextField
                        ref="keyPattern"
                        id="standard-full-width"
                        label="Key Pattern"
                        placeholder="Put the keys pattern"
                        fullWidth
                        margin="normal"
                        value={this.state.selectedData.ptKey}
                        onChange={this.handleTextChange("ptKey")}
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink htmlFor="key-type-label-placeholder">
                            Key Type
                        </InputLabel>
                        <NativeSelect
                            value={this.state.selectedData.tyKey}
                            onChange={this.handleNativeSelectChange.bind(this)}
                            input={
                            <Input
                                name="keyType"
                                id="key-type-label-placeholder"
                            />
                            }
                            name="keyType"
                        >
                            <MenuItem value={"Strings"}>Strings</MenuItem>
                            <MenuItem value={"Lists"}>Lists</MenuItem>
                            <MenuItem value={"Sets"}>Sets</MenuItem>
                            <MenuItem value={"Hashes"}>Hashes</MenuItem>
                            <MenuItem value={"SortedSets"}>SortedSets</MenuItem>
                            <MenuItem value={"Bitmaps"}>Bitmaps</MenuItem>
                            <MenuItem value={"HyperLogLogs"}>HyperLogLogs</MenuItem>
                            <MenuItem value={"GeoSets"}>GeoSets</MenuItem>
                        </NativeSelect>
                    </FormControl>
                    <Button
                        variant="contained"
                        className={classes.button}
                        onClick={this._onBtnAddClick.bind(this)}
                        >
                        Add
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.button}
                        color="primary"
                        onClick={this._onBtnSaveClick.bind(this)}
                        >
                        Save
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.button}
                        color="secondary"
                        onClick={this._onBtnDeleteClick.bind(this)}
                        >
                        Delete
                    </Button>
                    {multi === null && (
                    <div>
                        <Typography variant="title" gutterBottom />
                    </div>
                    )}
                    {multi !== null && (
                    <div>
                        <Typography variant="title" gutterBottom>
                        {this.text()}
                        </Typography>
                    </div>
                    )}
                    <div
                    id="myGrid"
                    style={{
                        height: "669px",
                        width: "100%"
                    }}
                    className="ag-theme-balham"
                    >
                    <AgGridReact
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}
                        onGridReady={this.onGridReady}
                        onSelectionChanged={this.onSelectionChanged.bind(this)}
                        rowData={this.state.rowData}
                    />
                    </div>
                    <Dialog
                    fullScreen={fullScreen}
                    open={this.state.dialogOpen}
                    onClose={this.handleClose}
                    aria-labelledby="responsive-dialog-title"
                    >
                    <DialogTitle id="responsive-dialog-title">
                        {"Can not remove seleted key"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        The key is using now. Please retry after removing
                        keys.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                        Close
                        </Button>
                    </DialogActions>
                    </Dialog>
                </CardContent>
            </Card>
        );
    }
}

KeyManagement.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(KeyManagement);