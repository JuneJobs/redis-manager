import React, {Component} from "react";
import Button from '@material-ui/core/Button';
import axios from "axios";
// const style = {
    
// };
const axiosConfig = {
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
    }
};

export default class BtnSimulatorDelete extends Component {
    constructor(props) {
        super(props);

        let tuple = props.data;
        this.text = '';
        this.style = {
            height: 18,
            fontSize: '13px',
            paddingTop: '0px',
            paddingBottom: '0px'
        };
        this.text = '삭제';

        this.invokeParentMethod = this.invokeParentMethod.bind(this);
        this.state = {
            btnStyle: {
                height: 18,
                fontSize: '13px',
                paddingTop: '0px',
                paddingBottom: '0px'
            }
        }
    }

    invokeParentMethod = async() => {
        // let wmac = this.props.data.wmac;
        // let params = {
        //     "operation": "kill",
        //     "simulator_wmac": wmac
        // }
        // axios.defaults.baseURL = 'http://localhost:8080';
        // let res = await axios.post("/s_simulator_control", params, axiosConfig);

    }

    render() {
        //const classes = useStyles();
        return (
            <Button 
                variant="contained" 
                style={this.style}
                onClick={this.invokeParentMethod}>
                {this.text}
            </Button>
        );
    }
};