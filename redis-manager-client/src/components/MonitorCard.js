import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles } from '@material-ui/core/styles';
import {
    AgGridReact
}
from 'ag-grid-react';
import Fab from '@material-ui/core/Fab';
import axios from "axios";
import Switch from "@material-ui/core/Switch";
import CachedIcon from '@material-ui/icons/Cached';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import PropTypes from 'prop-types';
const styles = theme => ({
    newCard: {
        minWidth: 575,
        minHeight: 200,
        margin: theme.spacing.unit,
    },
})

class MonitorCard extends Component {
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
            hData: []
        };

        this.gridKeyType = {
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
                headerName: "score",
                field: "score",
                editable: false,
                width: 200
            }, {
                headerName: "member",
                field: "member",
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
                headerName: "field",
                field: "field",
                editable: false,
                width: 200
            }, {
                headerName: "value",
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
        let tyKey = this.state.tyKey,
            psKey = this.state.psKey,
            params = {
                "queryType": "GET",
                "tyKey": tyKey,
                "psKey": psKey
            };
        axios.post("/searchKey", params).then((response) => {
            let data = response.data.payload
            if (response.data.resCode === 0) {
                
                this.setState({
                   hData: data
                });

            }
        }).catch((error) => {
            console.log(error);
        });

    }
    _onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };
    _handleDeleteButton = () => {
        this.props.handleDeleteButton(this.state.idx);
    }
    componentDidMount(){
        this._bindHData()
    }
    render() {
        const {classes, idx, cardDataSet} = this.props;
        
        return (
            <Card className={classes.newCard}>
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
            <TextField
              id="standard-name3"
              label="Monitor Type"
              className={classes.txtMonType}
              value={this.state.monType}
              //onChange={this.handleChange('name')}
              margin="normal"
            />
            <TextField
              id="standard-name4"
              label="Auto search seconds"
              className={classes.textField}
              value={this.state.sec}
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
            <div
                id="myGrid"
                style={{
                height: "100%",
                width: "100%"
                }}
                className="ag-theme-balham"
            >
                <AgGridReact
                    idx={this.state.idx}
                    columnDefs={this.gridKeyType[this.state.tyKey]}
                    defaultColDef={this.state.defaultColDef}
                    //rowSelection={this.state.rowSelection}
                    onGridReady={this._onGridReady}
                    rowData={this.state.hData}
                />
            </div>
          </Card>     
        )
    }
}
MonitorCard.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(MonitorCard);