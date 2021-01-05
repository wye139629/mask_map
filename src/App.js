import logo from './logo.svg';
import {Fragment, useEffect, useState} from "react"
import './App.css';
import "leaflet/dist/leaflet.css";
import LeafLet from "leaflet";


function App() {
  const osmUrl = " https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  useEffect(() => {
    let myMap = LeafLet.map("mapid").setView([25.03418, 121.564517], 15);

    LeafLet.tileLayer(osmUrl, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    }).addTo(myMap);
    return () => {

    }
  },[])
  return (
    <div id="mapid"></div>
  );
}

export default App;
