import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles } from '@material-ui/core/styles';
import {
    AgGridReact
}
from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import Fab from '@material-ui/core/Fab';
import axios from "axios";
import Switch from "@material-ui/core/Switch";
import CachedIcon from '@material-ui/icons/Cached';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
const styles = theme => ({
    newCard: {
        minWidth: 575,
        minHeight: 200,
        margin: theme.spacing.unit,
    },
    card: {
        minWidth: 275,
        minHeight: 800
    },
    deleteButton: {
        textAlign: 'right',
        width: '100%'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    txtMonType: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 100,
    },
    _h6Spacing: {
        margin: '0 10px',
    },
})

class MonitorCardType1 extends Component {
    constructor(props) {
        super(props);
            
        this.state = {
            defaultColDef: {
                width: 200,
                editable: true,
                filter: "agTextColumnFilter"
            },
            idx: props.idx,
            tyKey: props.cardDataSet.tyKey,
            psKey: props.cardDataSet.psKey,
            monTitle: props.cardDataSet.monTitle,
            monType: props.cardDataSet.monType,
            auto: props.cardDataSet.auto,
            sec: props.cardDataSet.sec,
            hData: [],
            selectedHKey: null,
            dTyKey: 'Strings',
            dData: []
        };

        this.gridKeyType = {
            Keys: [{
                headerName: "ID",
                type: 'string',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "Keys",
                field: "value",
                editable: false,
                width: 200
            }],
            Strings: [{
                headerName: "ID",
                type: 'string',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "Value",
                field: "value",
                editable: false,
                width: 200
            }],
            Lists: [{
                headerName: "ID",
                type: 'list',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "Index",
                field: "idx",
                editable: false,
                width: 200
            }, {
                headerName: "Values",
                field: "value",
                editable: false,
                width: 200
            }],
            Sets: [{
                headerName: "ID",
                type: 'set',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "Members",
                field: "value",
                editable: false,
                width: 200
            }],
            SortedSets: [{
                headerName: "ID",
                type: 'sortedSet',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "Score",
                field: "score",
                editable: false,
                width: 200
            }, {
                headerName: "Member",
                field: "value",
                editable: false,
                width: 200
            }],
            GeoSets: [{
                headerName: "ID",
                type: 'geoSet',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "longitude",
                field: "lng",
                editable: false,
                width: 200
            }, {
                headerName: "latitude",
                field: "lat",
                editable: false,
                width: 200
            }, {
                headerName: "member",
                field: "member",
                editable: false,
                width: 200
            }],
            Hashes: [{
                headerName: "ID",
                type: 'hash',
                width: 60,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "Field",
                field: "field",
                editable: false,
                width: 200
            }, {
                headerName: "Value",
                field: "value",
                editable: false,
                width: 200
            }]
        };

    }
    handleAutoSearchChange = async (event) => {
        let value = JSON.parse(event.target.value);
        if (value) {
            value = false;
            this.setState({
                auto: false
            });
        } else {
            value = true;
            this.setState({
                auto: true
            });
        }
        let idx = parseInt(event.target.id);
        let params = {
            "queryType": "PUT2",
            "curIdx": this.state.idx,
            "auto": value
        }
        await axios.post("/MonitorList", params);
    }
    handleRefreshClick = () => {
        this._bindHData();
    };
    _bindHData = () => {
        let psKey = this.state.psKey,
            params = {
                "queryType": "GET",
                "psKey": psKey
            };
        axios.post("/searchKeyList", params).then((response) => {
            let data = response.data.payload;
            if (response.data.resCode === 0) {
                this.setState({
                    hData: data
                });

            }
        }).catch((error) => {
            console.log(error);
        });
    }
    _bindDData = () => {
        let psKey = this.state.selectedHKey,
            params = {
                "queryType": "GET",
                "tyKey": 'Keys',
                "psKey": psKey
            };
        axios.post("/searchKey", params).then((response) => {
            if (response.data.resCode === 0) {
                let tyKey = response.data.payload;
                this.setState({
                    dTyKey : tyKey
                });
                //change grid type

                params = {
                    "queryType": "GET",
                    "tyKey": tyKey,
                    "psKey": psKey
                };
                axios.post("/searchKey", params).then((response) => {
                    let data = response.data.payload;
                    if (response.data.resCode === 0) {
                        this.setState({
                            dData: data
                        });

                    }
                }).catch((error) => {
                    console.log(error);
                });
            }
        }).catch((error) => {
            console.log(error);
        });
        
    }
    _onHDataGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };
    _onDDataGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };
    _handleDeleteButton = () => {
        this.props.handleDeleteButton(this.state.idx);
    }
    _onSelectionChanged = (e) => {
        let selectedRows = e.value;
        this.setState({
            selectedHKey: selectedRows
        });
        this._bindDData();
    }
    
    componentDidMount(){
        this._bindHData()
    }
    render() {
        const {classes} = this.props;
        return (
            <Card className={classes.newCard}>
            <CardContent>
            <Typography
              variant="h6"
              color="inherit"
              className={classes._h6Spacing}
              noWrap
            >
              {this.state.monTitle}
            </Typography>
            <div className={classes.deleteButton}>
              <IconButton
                aria-label="Delete"
                className={classes.margin}
                value={this.state.car}
                onClick={this._handleDeleteButton}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
            <TextField
              id="standard-name3"
              label="Monitor Type"
              className={classes.txtMonType}
              value={this.state.monType}
              margin="normal"
            />
            <TextField
              id="standard-name"
              label="Search Key"
              className={classes.textField}
              value={this.state.psKey}
              //onChange={this.handleChange('name')}
              margin="normal"
            />
            <TextField
              id="standard-name2"
              label="Data Structure"
              className={classes.txtStructure}
              value={this.state.tyKey}
              //onChange={this.handleChange('name')}
              margin="normal"
            />
            <FormControlLabel
              className={classes.Switch}
              control={
                <Switch
                  checked={this.state.auto}
                  onChange={this.handleAutoSearchChange}
                  id={this.state.idx}
                  value={this.state.auto}
                />
              }
              label="Auto search"
            />
            <TextField
              id="standard-name4"
              label="Auto search seconds"
              className={classes.textField}
              value={this.state.sec}
              //onChange={this.handleChange('name')}
              margin="normal"
            />
            <Fab
              variant="extended"
              size="small"
              //color="extended"
              aria-label="refresh"
              className={classes.Fab}
              onClick={this.handleRefreshClick}
            >
            <CachedIcon className={classes.extendedIcon} />
            </Fab>
              {/* <AgGridReact
                idx={(this.onGridReady.idx = idx)}
                columnDefs={this.gridKeyType[cardDataSet[idx].dataType]}
                defaultColDef={this.state.defaultColDef}
                rowSelection={this.state.rowSelection}
                onGridReady={this.onGridReady}
                //onSelectionChanged={this.onSelectionChanged.bind(this)}
                rowData={cardDataSet[idx].rowData}
              /> */}
            <Grid container spacing={24}>
                <Grid item xs={12} sm={4}>
                    <div
                        id="hGrid"
                        style={{
                        height: "100%",
                        width: "100%"
                        }}
                        className="ag-theme-balham"
                    >
                        <AgGridReact
                            columnDefs={this.gridKeyType[this.state.tyKey]}
                            defaultColDef={this.state.defaultColDef}
                            rowSelection={this.state.selectedHKey}
                            onGridReady={this._onHDataGridReady}
                            onSelectionChanged={this._onSelectionChanged.bind(this)}
                            onCellClicked={this._onSelectionChanged.bind(this)}
                            rowData={this.state.hData}
                        />
                    </div>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <div
                        id="myGrid2"
                        style={{
                        height: "100%",
                        width: "100%"
                        }}
                        className="ag-theme-balham"
                    >
                        <AgGridReact
                            columnDefs={this.gridKeyType[this.state.dTyKey]}
                            defaultColDef={this.state.defaultColDef}
                            onGridReady={this._onDDataGridReady}
                            rowData={this.state.dData}
                        />
                    </div>
                </Grid>
            </Grid>

            </CardContent>
            </Card>     
        )
    }
}
MonitorCardType1.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MonitorCardType1);