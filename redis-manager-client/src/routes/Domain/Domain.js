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

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
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
                headerName: "논리 도메인",
                field: "key",
                align: "right",
                width: 200,
                //headerCheckboxSelection: true,
                //checkboxSelection: true,
                editable: false
            }, {
                headerName: "물리 도메인",
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
        var params = {
            "queryType": "GET"
        };
        try {
            const response = await axios.post("/domain", params);
            response.data.sort(function (a, b) {
                var keyA = a.key.toUpperCase(); // ignore upper and lowercase
                var keyB = b.key.toUpperCase(); // ignore upper and lowercase
                if (keyA < keyB) {
                    return -1;
                }
                if (keyA > keyB) {
                    return 1;
                }
                return 0;
            });
            this.setState({
                rowData: response.data
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
            console.log(node);
            if (node.data.key === "s") {
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
                    key: selectedRows.key,
                    value: e.target.value
                }
            });
        } else {
            this.setState({
                selectedData: {
                    key: this.input.value,
                    value: e.target.value
                }
            });
        }
        
    }
    onPyTextChange(e) {
        console.log(e.target.value);
        this.setState({
            selectedData: {
                key: e.target.value,
                value: ''
            }
        });
    }

    setData = async (params) => {
        try {
            const response = await axios.post("/domain", params);
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
        var params = {
            "queryType": "PUT",
            "py": this.state.selectedData.key,
            "lg": this.state.selectedData.value,
        };
        this.setData(params);
    }
    onAddClick() {
        this.setState({
            selectedData: {
                key: '',
                value: ''
            },
            readonly: false,
            mode:'W'
        });
    }

    delData = async (params) => {
        try {
            const response = await axios.post("/domain", params);
            this.getData();
            this.selectFirstNode();
        } catch (e) {
            console.log(e);
        }
    }

    onDeleteClick() {
        var params = {
            "queryType": "DELETE",
            "key": this.state.selectedData.key
        };
        this.delData(params);
    }
    render() {

        const { classes } = this.props;
        // const bull = <span className={classes.bullet}>•</span>;
        return (
            
            <Card className={classes.card}>
            <Typography variant="h6" color="inherit" noWrap>
            도메인 관리
            </Typography>
            <CardContent>
               <div 
                    id="myGrid"
                    style={{
                    height: "100%",
                    width: "80%"
                    }}
                    className="ag-theme-balham">
                    <TextField
                        required
                        inputProps={{
                            readOnly: this.state.readonly
                        }}
                        id="dm-lg"
                        label="논리 도메인"
                        inputRef={el => this.input = el}
                        className={classes.textField}
                        margin="normal"
                        value={this.state.selectedData.key}
                        onChange={this.onPyTextChange.bind(this)}
                    />
                    <TextField
                        id="dm-py"
                        label="물리 도메인"
                        className={classes.textField}
                        margin="normal"
                        value={this.state.selectedData.value}
                        onChange={this.onTextChange.bind(this)}
                    />
                    <Button 
                        variant="contained" 
                        className={classes.button}
                        onClick={this.onAddClick.bind(this)}>
                        추가
                    </Button>
                    <Button 
                        variant="contained" 
                        className={classes.button}
                        color="primary"
                        onClick={this.onSaveClick.bind(this)}>
                        저장
                    </Button>
                    <Button 
                        variant="contained" 
                        className={classes.button}
                        color = "secondary"
                        onClick={this.onDeleteClick.bind(this)}>
                        삭제
                    </Button>
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
