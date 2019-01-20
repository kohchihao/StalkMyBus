import React, { Component } from 'react';
import './App.css';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import Geolocation from 'react-geolocation';
import { Row, Grid, Col, Button } from 'react-bootstrap';
import rp from 'request-promise';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 13,
      numbers: ['A1', 'A1E', 'A2', 'D1', 'D2'],
      buses: []
    };
  }

  renderBtns = () => {
    return this.state.numbers.map(bus => (
      <Col md={6} className="btnBusCol">
        <Button
          bsStyle="primary"
          bsSize="large"
          block
          onClick={() => this.fetchPosition(bus)}
        >
          {bus}
        </Button>
      </Col>
    ));
  };

  fetchLocation = bus => {
    let options = {
      method: 'GET',
      uri: 'https://location-buses.glitch.me/api/' + bus,
      json: true // Automatically parses the JSON string in the response
    };

    rp(options)
      .then(location => {
        let loc = location.substring(1, location.length - 1);
        return JSON.parse(loc);
      })
      .then(location => {
        console.log(location);
        this.setState({
          buses: location.ActiveBusResult.activebus
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  fetchPosition = bus => {
    let timerId = setInterval(() => {
      this.fetchLocation(bus);
    }, 10000);
  };

  render() {
    return (
      <div className="map-container">
        <Geolocation
          render={({
            getCurrentPosition,
            fetchingPosition,
            position: { coords: { latitude, longitude } = {} } = {}
          }) => {
            return (
              <div className="map">
                {fetchingPosition ? (
                  <span>loading...</span>
                ) : (
                  <Map
                    center={[latitude, longitude]}
                    zoom={this.state.zoom}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer
                      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {this.state.buses.map(bus => (
                      <Marker position={[bus.lat, bus.lng]}>
                        <Popup>{bus.vehplate}</Popup>
                      </Marker>
                    ))}
                  </Map>
                )}
                <Grid className="grid-container">
                  <Row>{this.renderBtns()}</Row>
                </Grid>
              </div>
            );
          }}
        />
      </div>
    );
  }
}

export default App;
