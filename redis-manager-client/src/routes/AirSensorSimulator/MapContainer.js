//Reference:  https://dev.to/jessicabetts/how-to-use-google-maps-api-and-react-js-26c2
import React, {Component} from 'react';
import { Map, 
         GoogleApiWrapper, 
         Marker } from 'google-maps-react';

const mapStyles = {
     width: '43%',
     height: "760px",
  };

class MapContainer extends Component {
    constructor(props) {
        super(props);
        
    }
    displayMarkers = () => {
        return this.props.sensorListTuples.map((store, index) => {
            return <Marker 
                        key={index} 
                        id={index} 
                        label={`${store.wmac}`} 
                        position={{
                            lat: store.latitude,
                            lng: store.longitude
                        }}
                        onClick={this.onMarkerClick.bind(this)} />
        })
    }
    onMarkerClick(e) {
        console.log(encodeURIComponent);
    }
    onDragEnd(e,target) {
        this.props.updateMapPosCenter(target.center.lat().toFixed(6), target.center.lng().toFixed(6), target.zoom);
    }
    render() {
        return (
            <Map
              google={this.props.google}
              zoom={18}
              style={mapStyles}
              initialCenter={{ lat: 35.835412, lng: 128.679357}}
              //onMouseUp = {this.onDragEnd.bind(this)}
              onDragend= {this.onDragEnd.bind(this)}
            >
                {this.displayMarkers()}
            </Map>
        );
    }
}


export default GoogleApiWrapper({
    apiKey: 'AIzaSyBfG8Itiv_KIqBCpgz1rwj8111s0K9DFNE'
  })(MapContainer);