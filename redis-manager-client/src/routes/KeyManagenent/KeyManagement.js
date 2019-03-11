/* eslint-disable react/prop-types, react/jsx-handler-names */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Button from '@material-ui/core/Button';
import axios from "axios";
import {
    AgGridReact
} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: 250,
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

function MultiValue(props) {
    return (
        <Chip
          tabIndex={-1}
          label={props.children}
          className={classNames(props.selectProps.classes.chip, {
            [props.selectProps.classes.chipFocused]: props.isFocused,
          })}
          onDelete={props.removeProps.onClick}
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
        this.state = {
            domains: [
                { label: 'App Client' , value: 'ac'},
                { label: 'Association', value: 'ass' },
                { label: 'Birth Date', value: 'bdt' },
                { label: 'Common System', value: 'c' },
                { label: 'Temporary', value: 'tmp' },
                { label: 'Pattern', value: '*' }
            ].map(domain => ({
            label: domain.label,
            value: domain.value,
            })),
            multi: null,
            columnDefs: [{
                headerName: "ID",
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "Logical Key",
                field: "lgKey",
                editable: false,
                width: 300,
            }, {
                headerName: "Physical Key",
                field: "psKey",
                editable: false,
                width: 300,
            }, {
                headerName: "Key Pattern",
                field: "ptKey",
                editable: false,
                width: 300,
            }],
            defaultColDef: {
                width: 200,
                editable: true,
                filter: "agTextColumnFilter"
            },
            rowSelection: "single",
            rowData: [],
            selectedData: {
                lgKey: '',
                psKey: '',
                ptKey: '',
                idx: ''
            },
            readonly: true,
            mode: 'R'
        }
    }

    handleChange = name => value => {
        this.setState({
            [name]: value,
        });

        let selectedRows = this.gridApi.getSelectedRows()[0];
        if (this.state.mode === 'R') {
            this.setState({
                selectedData: {
                    idx: selectedRows.idx,
                    psKey: selectedRows.psKey,
                    lgKey: selectedRows.lgKey
                }
            });
        } else {
            this.setState({
                selectedData: {
                    idx: 0,
                    psKey: selectedRows.psKey,
                    lgKey: selectedRows.lgKey
                }
            });
        }
    };
    _handleUpdateInput = (searchText) => {
        console.log(searchText)
    };

    selectFirstNode() {
        this.gridApi.forEachNode(function (node) {
            console.log(node);
            if (node.data.key === "s") {
                node.setSelected(true);
            }
        });
    }
    
    getData = async () => {
        let params = {
            "queryType": "GET"
        };
        try {
            const response = await axios.post("/keys", params);
            this.setState({
                rowData: response.data
            });
            this.selectFirstNode();
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
                idx: ''
            },
            readonly: false,
            mode: 'W'
        });
    };
    _onBtnSaveClick = async () => {
        try {
            let params = {
                "queryType": "POST",
                "idx": this.state.selectedData.idx,
                "lgKey": this.state.selectedData.lgKey,
                "psKey": this.state.selectedData.psKey,
                "ptKey": this.state.selectedData.ptKey,
            };
            await axios.post("/keys", params);

            this.getData();
            this.setState({
                readonly: true,
                mode: 'R'
            });
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
        console.log(this.gridApi);
        let selectedRows = this.gridApi.getSelectedRows()[0];
        console.log(selectedRows);
        this.setState({
            selectedData: selectedRows
        });
        //selectedRows[0].
        this.setState({
            readonly: true,
            mode: 'R'
        });
    }

    render() {
        const { classes, theme } = this.props;
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
                <Typography variant="h6" color="inherit" className={classes._h6Spacing} noWrap>
                Key Management
                </Typography>
                <CardContent>
                    <Select
                        classes={classes}
                        styles={selectStyles}
                        textFieldProps={{
                        label: 'Key',
                        InputLabelProps: {
                            shrink: true,
                        },
                        }}
                        options={this.state.domains}
                        components={components}
                        value={this.state.multi}
                        onChange={this.handleChange('multi')}
                        //onChange={this.onTextChange.bind(this)}
                        placeholder="Select Domains"
                        isMulti
                    />
                    <Button 
                        variant="contained" 
                        className={classes.button}
                        onClick={this._onBtnAddClick.bind(this)}>
                        Add
                    </Button>
                    <Button 
                        variant="contained" 
                        className={classes.button}
                        color="primary"
                        onClick={this._onBtnSaveClick.bind(this)}>
                        Save
                    </Button>
                    <Button 
                        variant="contained" 
                        className={classes.button}
                        color = "secondary">
                        Delete
                    </Button>
                    {
                        multi === null && <div><Typography variant="title" gutterBottom>
                        </Typography></div>
                    }
                    {
                        multi !== null && <div><Typography variant="title" gutterBottom>
                            {this.text()}
                        </Typography></div>
                    }
                    <div 
                    id="myGrid"
                    style={{
                    height: "100%",
                    width: "100%"
                    }}
                    className="ag-theme-balham">
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            rowSelection={this.state.rowSelection}
                            onGridReady={this.onGridReady}
                            onSelectionChanged={this.onSelectionChanged.bind(this)}
                            rowData={this.state.rowData}>
                        </AgGridReact>
                    </div>
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