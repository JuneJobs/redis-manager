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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from "@material-ui/core/Switch";
import CachedIcon from '@material-ui/icons/Cached';
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
    txtType: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 100,
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
    newCard: {
        minWidth: 575,
        minHeight: 200,
        margin: theme.spacing.unit,
    },
    title: {
        fontSize: 14,
    },
    addMonitor: {
        textAlign: 'right',
        width: '100%'
    },
    closeCard: {
        textAlign: 'right',
    },
    open: false,
    formControl: {
        //margin: theme.spacing.unit,
        minWidth: 500,
    }
});
class KeyString extends Component {
    render() {
        const { classes } = this.props;
        return (
          <div>
            <TextField
              ref="txtKeyName"
              id="txtKeyName"
              label="Key"
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

class SearchSec extends Component {
    render() {
        const { classes } = this.props;
        return (
          <div>
            <TextField
              ref="txtKeyName"
              id="txtKeyName"
              label="Search Seconds"
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

class Domain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numChildren: 0,
            cardDataSet: [{
                id: 1,
                title: 'user key monitor',
                sec: 5,
                auto: true,
                type: 'single',
                searchString: 'user:seq'
            }, {
                id:2,
                title: 'user name monitor',
                sec: 5,
                auto: true,
                type: 'single',
                searchString: 'user:name'
            }]
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
    handleAddButton = () => {
        this.setState({
            numChildren: this.state.numChildren + 1,
            open:false,
            cardDataSet: [...this.state.cardDataSet, {
                id: 3,
                title: 'user birth monitor',
                sec: 5,
                auto: true,
                type: 'single',
                searchString: 'user:birth'
            }]
        });
    };

    handleCloseButton = () => {
        this.setState({
            open: false
        });
    };

    ChildComponent = props => {
        const { classes } = this.props;
        const { cardDataSet, idx } = props;

        console.log(this.state.cardDataSet[idx]);
        return (
            <Card className={classes.newCard}>
                <Typography variant="h6" color="inherit" className={classes._h6Spacing} noWrap>
                    {cardDataSet[idx].title}
                </Typography>
                <div className={classes.addMonitor}>
                    <Button color="secondary" className={classes.button}>
                        X
                    </Button>
                </div>
                <TextField
                    id="standard-name"
                    label="Search Key"
                    className={classes.textField}
                    value={cardDataSet[idx].searchString}
                    //onChange={this.handleChange('name')}
                    margin="normal"
                />
                <TextField
                    id="standard-name2"
                    label="Type"
                    className={classes.txtType}
                    value={cardDataSet[idx].type}
                    //onChange={this.handleChange('name')}
                    margin="normal"
                />
                <TextField
                    id="standard-name2"
                    label="Auto search seconds"
                    className={classes.textField}
                    value={cardDataSet[idx].sec}
                    //onChange={this.handleChange('name')}
                    margin="normal"
                />
                <FormControlLabel
                    className={classes.Switch}
                    control={
                        <Switch
                            //checked={this.state.checkedA}
                            //onChange={this.handleChange('checkedA')}
                            value={cardDataSet[idx].auto}
                        />
                    }
                    label="Auto search"
                />
                <Fab
                variant="extended"
                size="small"
                //color="extended"
                aria-label="Add"
                className={classes.Fab}
                >
                <CachedIcon className={classes.extendedIcon} />
                </Fab>
            </Card>
        );
    };   

    render() {

        const { classes } = this.props;
        // const bull = <span className={classes.bullet}>•</span>;
        const children = [];        
        for (var i = 0; i < this.state.numChildren; i += 1) {
            children.push(
              <this.ChildComponent
                    key={i}
                    idx={i}
                    cardDataSet = {
                        this.state.cardDataSet
                    }
              />
            );
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
                {children}
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
                        ref="txtTitle"
                        id="txtTitle"
                        label="Monitor Title"
                        //placeholder="Put the keys pattern"
                        fullWidth
                        margin="normal"
                        // value={this.state.selectedData.ptKey}
                        //onChange={this.handleTextChange("ptKey")}
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink htmlFor="key-type-label-placeholder">
                            Key Type
                        </InputLabel>
                        <NativeSelect
                            value={"1"}
                            //onChange={this.handleNativeSelectChange.bind(this)}
                            input={
                            <Input
                                name="keyType"
                                id="key-type-label-placeholder"
                            />
                            }
                            name="keyType"
                        >
                            <MenuItem value={"1"}>Single</MenuItem>
                            <MenuItem value={"2"}>Multiple</MenuItem>
                        </NativeSelect>
                    </FormControl>
                    <KeyString/>
                    <SearchSec/>
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
            </div>
        );
    }
}

Domain.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Domain);
