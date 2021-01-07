import logo from './logo.svg';
import {Fragment, useEffect, useState} from "react"
import './App.css';
import "leaflet/dist/leaflet.css";
import LeafLet from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/leaflet.markercluster.js"


function App() {
  const [maskData, setMaskData] = useState(null)
  const [selectPharmacy, setSelectPharmacy] = useState([])
  const [cities, setCities] = useState(null)
  const [allDistricts, setAllDistricts] = useState(null)
  const [districts, setDistricts] = useState([])
  const [map, setMap] = useState(null)
  const [today, setToday] = useState("")
  const [day, setDay]= useState(0)

  useEffect(() => {
    async function fetchMaskData(params) {
      const response =  await fetch("https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json")
      const json = await response.json();
      setMaskData(json.features)

      let cities = {}
      let districts = {}
      json.features.map((data)=>{
        if(data.properties.county in cities !== true && data.properties.county !== ""){
          cities[data.properties.county] = [data.geometry.coordinates[1], data.geometry.coordinates[0]]
        }
        for(let city in cities){
          if(data.properties.county === city && data.properties.town in districts !== true){
            districts[data.properties.town] = {
              city: city,
              location: [data.geometry.coordinates[1], data.geometry.coordinates[0]]
            }
          }
          // console.log(data.properties)
        }
      })
      setCities(cities)
      setAllDistricts(districts)


    }
    function getDate() {
      const dateObj = new Date()
      const year = dateObj.getFullYear()
      const month = dateObj.getMonth()
      const date = dateObj.getDate()
      const day = dateObj.getDay()
      const todayDate = `${year}/${month+1}/${date}`
      setToday(todayDate)
      setDay(day)
    }
    getDate()
    fetchMaskData()
  }, [])

  useEffect(() => {
    if(!maskData)return
    const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        let markers = new LeafLet.markerClusterGroup().addTo(myMap)

        maskData.map((data)=>{
          markers.addLayer(LeafLet.marker([data.geometry.coordinates[1],data.geometry.coordinates[0]],{icon: greenIcon}).bindPopup("<h3>"+data.properties.name+"</h3>" + "<p>成人口罩數量:"+data.properties.mask_adult +"<br/>"+ "兒童口罩數量:"+data.properties.mask_child+"</p>"))
        })
        myMap.addLayer(markers)
        setMap(myMap)
      });
  },[maskData])


  function updateDistrictOption(options) {
    setDistricts(options)
  }

  function updateSelectPharmacy(e){

    let selectElement = e.target.parentNode.children
    let selectValue = []
    let pharmacy = []
    Array.from(selectElement).map((value)=>{
      selectValue.push(value)
    })
    maskData.map((data)=>{
      if(data.properties.county === selectValue[0].value && data.properties.town === selectValue[1].value){
        pharmacy.push(data)
      }
    })
    setSelectPharmacy(pharmacy)
  }

  return (
    <div className="container">
      <SearchPanel dateData = {{today, day}} areaData = {{cities, districts, allDistricts}} selectPharmacy={selectPharmacy} myMap={map} updateDistrictOption={updateDistrictOption} updateSelectPharmacy={updateSelectPharmacy}/>
      <div id="mapid"></div>
    </div>
  );
}


function SearchPanel(props) {
  return(
    <div className="search-panel">
      <SearchArea dateData = {props.dateData} areaData = {props.areaData} updateDistrictOption={props.updateDistrictOption} updateSelectPharmacy={props.updateSelectPharmacy}/>
      <PharmacyList selectPharmacy = {props.selectPharmacy} myMap ={props.myMap}/>
    </div>
  )
}


function SearchArea(props) {
  const {today, day} = props.dateData
  const {cities, districts, allDistricts} = props.areaData
  const checkDay = {
    1: "星期一",
    2: "星期二",
    3: "星期三",
    4: "星期四",
    5: "星期五",
    6: "星期六",
    7: "星期日"
  }
  const cityOption = []
  for(let city in cities){
    cityOption.push(<option value={city}>{city}</option>)
  }

  function cityChangeHandler(e) {
    let districtOption =[]
    document.querySelector("#district").disabled = false
    for(let district in allDistricts){
      if(allDistricts[district].city === e.target.value){
        districtOption.push(<option value={district}>{district}</option>)
      }
    }

    props.updateDistrictOption(districtOption)
  }

  function districtChangeHandler(e) {
    props.updateSelectPharmacy(e)
  }


  return(
    <div className="searchArea">
      <div className="dateTime">
        <div className="day">{checkDay[day]}</div>
        <div className="date">{today}</div>
      </div>
      <form className="areaSelect">
        <select id="cities" onChange={cityChangeHandler}>
          <option value="">請選擇縣市</option>
          {cityOption}
        </select>
        <select id="district" onChange={districtChangeHandler} disabled >
          <option value="">請選擇行政區</option>
          {districts}
        </select>
      </form>
    </div>
  )
}

function PharmacyList(props){
  const selectPharmacy = props.selectPharmacy
  if(selectPharmacy === [])return

  return(
    <div className="phamracyList">
      <ul>
      {
      selectPharmacy.map((pharmacy)=>{
        return <Pharmacy pharmacy={pharmacy} myMap={props.myMap}/>
      })
      }
    </ul>
  </div>
  )
}



function Pharmacy(props) {
  const pharmacy = props.pharmacy
  // console.log(props.myMap)

  function clickHandler(e){
    // console.log(pharmacy.geometry.coordinates)
    props.myMap.flyTo([pharmacy.geometry.coordinates[1],pharmacy.geometry.coordinates[0]],18,1)
  }
return(
  <li className="pharmacy" onClick={clickHandler}>
    <h3>{pharmacy.properties.name}</h3>
    <ul>
      <li>{pharmacy.properties.address}</li>
      <li>{pharmacy.properties.phone}</li>
    </ul>
    <div className="maskAmount">
      <ul>
        <li className="adult">成人口罩 {pharmacy.properties.mask_adult}</li>
        <li className="child">兒童口罩 {pharmacy.properties.mask_child}</li>
      </ul>
    </div>
  </li>
)
}



export default App;
