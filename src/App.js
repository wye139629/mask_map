import logo from './logo.svg';
import {Fragment, useEffect, useState} from "react"
import './App.css';
import "leaflet/dist/leaflet.css";
import LeafLet from "leaflet";


function App() {
  const [map, setMap] = useState(null)
  const [maskData, setMaskData] = useState(null)
  useEffect(() => {
    async function fetchMaskData(params) {
      const response =  await fetch("https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json")
      const json = await response.json();
      setMaskData(json)
    }
    fetchMaskData()
  }, [])

  useEffect(() => {
    if(!maskData)return
    console.log(maskData)
    const osmUrl = " https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      navigator.geolocation.getCurrentPosition(function(position){
        let center = [position.coords.latitude, position.coords.longitude]
        let greenIcon = new LeafLet.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        let myMap = LeafLet.map("mapid",{
         center : center,  // center point coordinates
         zoom : 18 ,  // 0-18
         attributionControl : true ,
         zoomControl : true  ,  // Whether to show the-+ button
       })
          LeafLet.tileLayer(osmUrl, {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
        }).addTo(myMap);
        LeafLet.marker(center,{icon: greenIcon}).addTo(myMap).bindPopup("Your are here.").openPopup()
        maskData.features.map((data)=>{
          LeafLet.marker([data.geometry.coordinates[1],data.geometry.coordinates[0]],{icon: greenIcon}).addTo(myMap)
                // LeafLet.marker(data.geometry.coordinates,{icon: greenIcon}).addTo(myMap)

        })
      });
    return () => {

    }
  },[maskData])

  return (
    <div id="mapid"></div>
  );
}

export default App;
