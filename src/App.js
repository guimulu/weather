import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Moment from 'react-moment';
import 'moment-timezone';
import { convertUnixToTimestamp, isFifteenMinutesDifferent } from "./Utils"

function App() {
  const [location, setLocation] = useState(false);
  const [weather, setWeather] = useState(false);
  const [lastSync, setLastSync] = useLocalStorage('lastSync', false)
  const [storeWeather, setStoreWeather] = useLocalStorage('storeWeather', false)

  // if(!storeWeather){
    let getWeather = async (lat, long) => {
      let key = process.env.REACT_APP_DARK_SKY_KEY
      let proxy = 'https://cors-anywhere.herokuapp.com/';
      let url = `https://api.darksky.net/forecast/${key}/${lat},${long}`

      let res = await axios.get(proxy + url, {
        params: {
          units: 'si'
        }
      });
      console.log("FIZ UMA REQUISIÇÂO")
      // setWeather(res.data);
      setStoreWeather(res.data);
      setLastSync(Date.now())
    }
  // } 
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      if(!storeWeather){
        getWeather(position.coords.latitude, position.coords.longitude);
      } else if (isFifteenMinutesDifferent(lastSync/1000, Date.now()/1000)){
        getWeather(position.coords.latitude, position.coords.longitude);
      } else {
        setWeather(storeWeather)
      }

      setLocation(true)
    })
  }, [])

  function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.log(error);
        return initialValue;
      }
    });

    const setValue = value => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    };

    return [storedValue, setValue];
  }

  if (!location) {
    return (
      <Fragment>
        Você precisa habilitar a localização no browser o/
      </Fragment>
    )
  } else if (!weather){
    return(
      <Fragment>
        Carregando...
      </Fragment>
    )  
  } else {
    return (
      <Fragment>
        <p>
          Temperatura do ar:&nbsp;
          <span className="text-4xl font-bold">
            {weather.currently.temperature.toFixed(1)} °C
          </span>
        </p>
        <p>
          Umidade Relativa do ar:&nbsp;
          <span className="text-4xl font-bold">
            {weather.currently.humidity.toFixed(1)}%
          </span>
        </p>
        <p>
          Velocidade do Vento:&nbsp;
          <span className="text-4xl font-bold">
            {weather.currently.windSpeed.toFixed(0)} m/s
          </span>
        </p>
        <p>Volume de Chuva:&nbsp;
          <span className="text-4xl font-bold">
            {weather.currently.precipIntensity} mm
          </span>
          &nbsp;na última hora
        </p>
        <p>Data e hora da medição:&nbsp; 
          <span className="text-4xl font-bold">
            {convertUnixToTimestamp(weather.currently.time)}
          </span>
        </p>
        <p>Data e hora da última sincronização com a API Darksky:&nbsp;
          <span className="text-4xl font-bold">
            {convertUnixToTimestamp(lastSync/1000)}
          </span>
        </p>

        <input
          type="text"
          placeholder="Enter your name"
          value={lastSync}
          onChange={e => setLastSync(e.target.value)}
        />

      </Fragment>
    );
  }
}

export default App;
