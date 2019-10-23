import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import {
    AgGridReact
} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import axios from "axios";
import 'typeface-roboto';
import MapContainer from './MapContainer';
import codeGenerator from 'node-code-generator';
import ChildMessageRenderer from "./ChildMessageRenderer";
import BtnSimulatorDelete from "./BtnSimulatorDelete";
const generator = new codeGenerator();

//axios.defaults.baseURL = 'http://intuseer.co.kr:8001';
//axios.defaults.baseURL = 'http://somnium.me:1234';
// const simulator_server = 'http://localhost:8080';
// const api_server = 'http://localhost:8001';
const simulator_server = 'http://13.124.104.59:8080';
const api_server = 'http://somnium.me:8001';
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


class AirSensorSimulator extends Component {
    constructor(props) {
        super(props);

        this.gridOpt = {
            columnDefs : [{
                headerName: "ID",
                width: 30,
                editable: false,
                valueGetter: "node.id"
            }, {
                headerName: "WiFi MAC Address",
                field: "wmac",
                width: 150,
                editable: false,
            } , {
                headerName: "latitude",
                field: "lat",
                editable: false
            } ,{
                headerName: "longitude",
                field: "lng",
                align: "right",
                width: 100,
                //headerCheckboxSelection: true,
                //checkboxSelection: true,
                editable: false
            }, {
                headerName: "Activation",
                field: "actf",
                align: "right",
                width: 100,
                //headerCheckboxSelection: true,
                //checkboxSelection: true,
                editable: false
            },{
                headerName: "State",
                field: "value",
                cellRenderer: "childMessageRenderer",
                editable: false,
                colId: "params",
                width: 100
            },{
                headerName: "Delete",
                field: "value",
                cellRenderer: "BtnSimulatorDelete",
                editable: false,
                colId: "params2",
                width: 100
            }],
            defaultColDef: {
                width: 100,
                editable: true, 
                resizable: true,
                sortable: true,
                filter: "agTextColumnFilter"
            },
            rowSelection: "single",
            frameworkComponents: {
                childMessageRenderer: ChildMessageRenderer,
                BtnSimulatorDelete: BtnSimulatorDelete
            }
            
        };
        this.mapPosCenter = {
            lat: 35.835412,
            lng: 128.679357,
            zoomLv:0
        };
        // this.state = {
        //     sensorListTuples : []
        // }
        this.state = {
            sensorListTuples: []
        };
    }
    onMarkerClick(wmac) {
        //test;
        this.gridApi.forEachNode(function (node) {
            if (node.data.wmac === wmac) {
                node.setSelected(true);
            }
        });
    }
    methodFromParent = async (e) => {
        if(e.colDef.colId === "params") {
            if(e.data.actf === 1 ) { //동작 시작
                let params = {
                    "operation": "run",
                    "simulator_wmac": e.data.wmac
                };
                axios.defaults.baseURL = simulator_server;
                let res = await axios.post("/s_simulator_control", params, axiosConfig);
                if(res) {
                    this.bind_sensor_list();
                }
                
            } else if (e.data.actf === 2) { //동작 종료
                let params = {
                    "operation": "kill",
                    "simulator_wmac": e.data.wmac
                };
                axios.defaults.baseURL = simulator_server;
                let res = await axios.post("/s_simulator_control", params, axiosConfig);
                if(res) {
                    this.bind_sensor_list();
                }
            }
        } else if (e.colDef.colId === "params2") {
            if(e.data.actf === 1) {
                let params = {
                    "queryType": "DELETE",
                    "wmac": e.data.wmac
                };
                axios.defaults.baseURL = api_server;
                let res = await axios.post("/simulator", params, axiosConfig);
                this.run_sign_in((conn)=> {
                    this.run_administrator_sensor_deregistration(conn.usn, conn.nsc, e.data.wmac, (result)=> {
                        if(result === 0) {
                            this.bind_sensor_list();
                        }
                    });
                });
            }
        }
    }
    updateMapPosCenter(lat, lng, zoomLv) {
        this.mapPosCenter = {
            lat: Number(lat),
            lng: Number(lng),
            zoomLv: zoomLv 
        }
    }
    generate_gps(){
        let posCenter = this.mapPosCenter,
            gps= {
                lat: 0,
                lng: 0
            },
            randomValue1 = Math.round(Math.random() * (9 - 1) + 1)*(Math.round(Math.random()) * 2 - 1)*0.0001,
            randomValue2 = Math.round(Math.random() * (9 - 1) + 1)*(Math.round(Math.random()) * 2 - 1)*0.0001;

        gps.lat = Number((posCenter.lat + randomValue1).toFixed(6));
        gps.lng = Number((posCenter.lng + randomValue2).toFixed(6));
        return gps;
    }
    generate_mac_address(){
        let options = {
            alphanumericChars: '1234567890ABCDEF'
        };
        let wmac = generator.generateCodes("************", 1, options)[0],
            cmac = generator.generateCodes("************", 1, options)[0],
            mac = {
                wmac: wmac,
                cmac: cmac
            };
        return mac;
    }
    run_sign_in = async (cb) => {
        let params = {
            "header": {
                "msgType": 105,
                "msgLen": 0,
                "endpointId": 5
            },
            "payload": {
                "userId": "airoundu@gmail.com",
                "userPw": "test123@"
            }
        };
        axios.defaults.baseURL = api_server;
        let res = await axios.post("/s_api_v1_0", params, axiosConfig);
        //res.data.payload
        let conn = {
            usn: res.data.payload.usn,
            nsc: res.data.payload.nsc
        } 
        cb(conn);
    }
    run_administrator_sensor_registration  = async (usn, nsc, macAdd, cb) => {
        //wmac, cmac 자동생성
        let params = {
            "header": {
                "msgType": 117,
                "msgLen": 0,
                "endpointId":usn
            },
            "payload": {
                "nsc": nsc,
                "wmac": macAdd.wmac,
                "cmac": macAdd.cmac
            }
        }
        axios.defaults.baseURL = api_server;
        let res = await axios.post("/s_api_v1_0", params, axiosConfig);
        cb(res.data.payload.resultCode);

    }
    run_administrator_sensor_association = async(usn, nsc, wmac, mobf, cb) => {
        let params = {
            "header": {
                "msgType": 125,
                "msgLen": 0,
                "endpointId":usn
            },
            "payload": {
                "nsc": nsc,
                "wmac": wmac,
                "mobf": mobf
            }
        }
        axios.defaults.baseURL = api_server;
        let res = await axios.post("/s_api_v1_0", params, axiosConfig);
        cb(res.data.payload.resultCode);
    }
    run_sign_out = async(usn, nsc, cb) => {
        let params = {
            "header": {
                "msgType": 107,
                "msgLen": 0,
                "endpointId": usn
            },
            "payload": {
                "nsc": nsc
            }
        }
        axios.defaults.baseURL = api_server;
        let res = await axios.post("/s_api_v1_0", params, axiosConfig);
        cb(res.data.payload.resultCode);
    }
    run_sensor_ist_view = async(usn, nsc, cb) => {
        let params = {
            "header": {
                "msgType": 121,
                "msgLen": 0,
                "endpointId":usn
            },
            "payload": {
                "nsc": nsc,
                "wmac": "",
                "actf": 1,
                "mobf":0
            }
        }
        axios.defaults.baseURL = api_server;
        let res = await axios.post("/s_api_v1_0", params, axiosConfig);
        cb(res.data.payload.selectedSensorInfoListEncodings);
    }
    run_administrator_sensor_deregistration = async(usn, nsc, wmac, cb) => {
        let params = {
            "header": {
                "msgType": 119,
                "msgLen": 0,
                "endpointId":usn
            },
            "payload": {
                "nsc": nsc,
                "wmac": wmac,
                "drgcd": 2,
                "userId":"airoundu@gmail.com"
            }
        }
        axios.defaults.baseURL = api_server;
        let res = await axios.post("/s_api_v1_0", params, axiosConfig);
        cb(res.data.payload.resultCode);
    }
    run_gps_add = async(wmac, cb) => {
        let gps = this.generate_gps();
        let params = {
            "queryType": "POST",
            "wmac": wmac,
            "gps": `${gps.lat},${gps.lng}`
        }
        axios.defaults.baseURL = api_server;
        let res = await axios.post("/simulator", params, axiosConfig);
        cb(res);
    }
    onAddClick() {
        //자동 로그인
        this.run_sign_in((conn)=> {
            console.log(conn);
            let macAdd = this.generate_mac_address();
            //ASR 호출
            this.run_administrator_sensor_registration(conn.usn, conn.nsc, macAdd, (result) => {
                console.log(result);
                if(result === 0){
                    let mobf = 0; //고정형 센서
                    //SAS 호출
                    this.run_administrator_sensor_association(conn.usn, conn.nsc, macAdd.wmac, mobf, (result) => {
                        if(result === 0){
                            this.run_gps_add(macAdd.wmac, (result)=> {
                                console.log('GPS 등록 성공')
                            });
                            //자동 로그아웃
                            this.run_sign_out(conn.usn, conn.nsc, (result)=> {
                                if(result === 0){
                                    console.log(`시뮬레이터(${macAdd.wmac}) 추가 성공`);
                                    this.bind_sensor_list();
                                }
                            })
                        }
                    })
                }
            });
        });
    }
    decode_sensor_list_tuple(selectedSensorInfoList) {
        let decoded_list = [];
        if(selectedSensorInfoList.length === 0) return decoded_list;
        selectedSensorInfoList.map((item) => {
            let sensor_tuple = item.split(',');
            decoded_list.push({
                wmac: sensor_tuple[0],
                lat: Number(sensor_tuple[6]),
                lng: Number(sensor_tuple[7]),
                actf:  Number(sensor_tuple[3])
            });
        });
        return decoded_list;
    }

    select_first_node() {
        this.gridApi.forEachNode(function (node) {
            if (node.rowIndex === 0) {
                node.setSelected(true);
            }
        });
    }
    bind_sensor_list = () => {
        //자동 로그인
        this.run_sign_in((conn)=> {
            this.run_sensor_ist_view(conn.usn, conn.nsc, (selectedSensorInfoList) => {
                let decoded_list = this.decode_sensor_list_tuple(selectedSensorInfoList);
                this.setState({
                    sensorListTuples: decoded_list
                });
                this.run_sign_out(conn.usn, conn.nsc, (result)=> {
                    if(result === 0){
                        console.log(`센서리스트 갱신 성공`);
                        
                    }
                })
            });
        });
    }
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        
        // this.getData();
        //this.onSelectionChanged()
    };
    componentWillMount(){
        this.bind_sensor_list();
    }
    render() {
        const { classes } = this.props;
        // const bull = <span className={classes.bullet}>•</span>;
        return (
            <Card className={classes.card}>
                <CardContent>   
                    <Grid container spacing={8}>

                        <Grid item xs={12}>
                            <Button 
                                variant="contained" 
                                className={classes.button}
                                onClick={this.onAddClick.bind(this)}>
                                시뮬레이터 추가하기
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Paper className={classes.paper}>
                                <MapContainer sensorListTuples={this.state.sensorListTuples} updateMapPosCenter={this.updateMapPosCenter.bind(this)} onMarkerClick = {this.onMarkerClick.bind(this)}/>
                            </Paper>
                        </Grid>
                        <Grid item xs={8}>
                            <Paper className={classes.paper}>
                                <div 
                                    id="myGrid"
                                    style={{
                                        height: "730PX",
                                        //width: ""
                                    }}
                                    className="ag-theme-balham">
                                    <AgGridReact
                                        columnDefs={this.gridOpt.columnDefs}
                                        defaultColDef={this.gridOpt.defaultColDef}
                                        rowSelection={this.gridOpt.rowSelection}
                                        onGridReady={this.onGridReady}
                                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                                        rowData={this.state.sensorListTuples}
                                        onCellClicked={this.methodFromParent.bind(this)}
                                        frameworkComponents={this.gridOpt.frameworkComponents}
                                    >
                                    </AgGridReact>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    }
}

    AirSensorSimulator.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AirSensorSimulator);
