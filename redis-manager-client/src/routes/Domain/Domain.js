import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {
    AgGridReact
} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import axios from "axios";
import 'typeface-roboto';
axios.defaults.baseURL = 'http://admin.intuseer.com:1234';
//axios.defaults.baseURL = 'http://somnium.me:1234';
const axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
    }
};
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
        minHeight: 800
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
    button: {
        margin: theme.spacing.unit,
    },
});

class Domain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [{
                    headerName: "ID",
                    width: 60,
                    editable: false,
                    valueGetter: "node.id"
                }, {
                headerName: "Physical Domain",
                field: "psDom",
                editable: false
                } ,{
                headerName: "Logical Domain",
                field: "lgDom",
                align: "right",
                width: 400,
                //headerCheckboxSelection: true,
                //checkboxSelection: true,
                editable: false
            }],
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
                lgDom: '',
                psDom: ''
            },
            readonly: true,
            mode: 'R'

        }
    }
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.getData();
        //this.onSelectionChanged()
    };

    getData = async () => {
        let params = {
            "queryType": "GET"
        };
        try {
            const response = await axios.post("/domain", params, axiosConfig);
                let data = response.data.payload
                data.sort(function (a, b) {
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
                rowData: data
            });
            this.selectFirstNode();
        } catch (e) {
            console.log(e);
        }
    }

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
    selectFirstNode() {
        this.gridApi.forEachNode(function (node) {
            if (node.rowIndex === 0) {
                node.setSelected(true);
            }
        });
    }
    onTextChange(e){
        console.log(e.target.value);
        let selectedRows = this.gridApi.getSelectedRows()[0];
        if(this.state.mode === 'R') {
            this.setState({
                selectedData: {
                    psDom: selectedRows.psDom,
                    lgDom: e.target.value
                }
            });
        } else {
            this.setState({
                selectedData: {
                    psDom: this.psDom.value,
                    lgDom: e.target.value
                }
            });
        }
        
    }
    onPsDomTextChange(e) {
        console.log(e.target.value);
        this.setState({
            selectedData: {
                psDom: e.target.value,
                lgDom: this.lgDom.value
            }
        });
    }

    setData = async (params) => {
        try {
            await axios.post("/domain", params, axiosConfig);
            this.getData();
            this.selectFirstNode();
            this.setState({
                readonly: true,
                mode: 'R'
            });
        } catch (e) {
            console.log(e);
        }
    }

    onSaveClick(){
        if(!this.state.readonly) {
            var params = {
                "queryType": "POST",
                "psDom": this.state.selectedData.psDom,
                "lgDom": this.state.selectedData.lgDom,
            };
        } else {
            var params = {
                "queryType": "PUT",
                "psDom": this.state.selectedData.psDom,
                "lgDom": this.state.selectedData.lgDom,
            };
        }
        
        this.setData(params);
    }
    onAddClick() {
        this.setState({
            selectedData: {
                psDom: '',
                lgDom: ''
            },
            readonly: false,
            mode:'W'
        });
    }

    delData = async (params) => {
        try {
            await axios.post("/domain", params, axiosConfig);
            this.getData();
            this.selectFirstNode();
        } catch (e) {
            console.log(e);
        }
    }

    onDeleteClick() {
        var params = {
            "queryType": "DELETE",
            "psDom": this.state.selectedData.psDom
        };
        this.delData(params);
    }
    render() {

        const { classes } = this.props;
        // const bull = <span className={classes.bullet}>•</span>;
        return (
            
            <Card className={classes.card}>
            <Typography variant="h6" color="inherit" className={classes._h6Spacing} noWrap>
            Domain Management
            </Typography>
            <CardContent>
                <TextField
                    required
                    inputProps={{
                        readOnly: this.state.readonly
                    }}
                    id="dm-psDom"
                    label="Pysical Domain"
                    inputRef={el => this.psDom = el}
                    className={classes.textField}
                    margin="normal"
                    value={this.state.selectedData.psDom}
                    onChange={this.onPsDomTextChange.bind(this)}
                />
                <TextField
                    id="dm-lgdom"
                    label="Logical Domain"
                    inputRef={el => this.lgDom = el}
                    className={classes.textField}
                    margin="normal"
                    value={this.state.selectedData.lgDom}
                    onChange={this.onTextChange.bind(this)}
                />
                <Button 
                    variant="contained" 
                    className={classes.button}
                    onClick={this.onAddClick.bind(this)}>
                    Add
                </Button>
                <Button 
                    variant="contained" 
                    className={classes.button}
                    color="primary"
                    onClick={this.onSaveClick.bind(this)}>
                    Save
                </Button>
                <Button 
                    variant="contained" 
                    className={classes.button}
                    color = "secondary"
                    onClick={this.onDeleteClick.bind(this)}>
                    Delete
                </Button>
                
               <div 
                    id="myGrid"
                    style={{
                    height: "780px",
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
            {/* <CardActions>
                <Button size="small" onClick={this.getData}>Learn More</Button>
            </CardActions> */}
            </Card>
        );
    }
}

Domain.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Domain);
