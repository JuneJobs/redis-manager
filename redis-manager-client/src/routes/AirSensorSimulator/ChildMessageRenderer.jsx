import React, {Component} from "react";
import Button from '@material-ui/core/Button';
import axios from "axios";
// const style = {
    
// };
// const style = {
    
// };

export default class ChildMessageRenderer extends Component {
    constructor(props) {
        super(props);
        let tuple = props.data;
        this.text = '';
        this.style = '';
        
        this.btnStyle = {
            style1: {
                height: 18,
                fontSize: '13px',
                paddingTop: '0px',
                paddingBottom: '0px',
                background: '#ffff00'
            },
            style2: {
                height: 18,
                fontSize: '13px',
                paddingTop: '0px',
                paddingBottom: '0px',
                background: '#00FF00'
            },
            style3: {
                height: 18,
                fontSize: '13px',
                paddingTop: '0px',
                paddingBottom: '0px',
                background: '#FF0000'
            }
        };

        if(tuple.actf === 0){
            this.text = '동작 불가능';
            this.style = this.btnStyle.style3;
        } else if (tuple.actf === 1) {
            this.text = '동작 시작';
            this.style = this.btnStyle.style1;
        } else if (tuple.actf === 2) {
            this.text = '동작 종료';
            this.style = this.btnStyle.style2;
        } else if (tuple.actf === 3) {
            this.text = '동작 불가능';
            this.style = this.btnStyle.style3;
        };

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

    invokeParentMethod =async () => {
    }

    render() {
        //const classes = useStyles();
        return (
            <Button 
                variant="contained" 
                style={this.style}
                onClick={this.invokeParentMethod.bind(this)}>
                {this.text}
            </Button>
        );
    }
};