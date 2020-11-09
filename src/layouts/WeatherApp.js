import React from 'react';
import {getCities, matchCity} from '../components/Cities';
import { debounce } from 'lodash';
import WeatherData from '../components/WeatherData';


export default class WeatherApp extends React.Component {

  API_KEY = '**************';
  API_URL = 'https://api.openweathermap.org/data/2.5/';
  IP_GEO_API_URL = 'http://ip-api.com/json/';
  IP_API_URL = 'https://www.cloudflare.com/cdn-cgi/trace';

  constructor(props) {
    super(props);
    this.state = {
      error : {
        errorType : 'none',
        errorMessage : ''
      },
      isLoading : true,
      query : '',
      currentWeatherData : {},
      dailyWeatherData : {},
      autocompleteResults : [],
      incompleteSearch : false,
      miscData : {}
    }
  }

  fetchIpLoc = () => {
    fetch(this.IP_API_URL).then(response => response.json())
    .then()
  }

  componentDidMount() {
    // seperate geolocation into seperate function
    if ("geolocation" in navigator) {
      this.setState({error : {errorType : 'locDisabled', errorMessage : 'Location service is disabled.'}}, ()=>{
        navigator.geolocation.getCurrentPosition((position) => {
          const currentURL = `${this.API_URL}weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${this.API_KEY}`;
          fetch(currentURL).then(response => response.json())
          .then(data => {
            let misc = {
              altitude : position.coords.altitude,
              name : data.name,
              country : data.sys.country,
              currentTemp : data.main.temp
            }
            this.setState({currentWeatherData : data, miscData : misc, error : { errorType : 'none', errorMessage : '' }},()=>{
              const dailyURL = `${this.API_URL}onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${this.API_KEY}`;
              fetch(dailyURL).then(response => response.json())
              .then(data => {
                this.timeout(400).then(()=>{
                  this.setState({isLoading : false, dailyWeatherData : data.daily})
                })
              })
            })
          })
          .catch(err => {
            // geolocation failed fallback to ip location
          })
        }, (error)=>{
          console.log(error)
          this.setState({error : { errorType : 'locDisabled', errorMessage : 'Location service has been disabled.'}})
        })
      })
    }
    else {
      // no geolocation found fallback to ip location
      this.setState({error : { errorType : 'locNotFound', errorMessage : 'Location service not found.'}});
    }
    
  }

  handleGetData = debounce((query)=>{
    if (query) {
      getCities(query).then(results => {
        this.setState({autocompleteResults : results})
      })
    }
    else {
      this.setState({autocompleteResults : []});
    }
  },500)

  handleInput = (event) =>{
   this.setState({query : event.target.value, incompleteSearch : false, 
      error : {
        errorType : 'none',
        errorMessage : ''
      }
    }, this.handleGetData(event.target.value));
  }

  timeout = (delay) => {
    return new Promise( res => setTimeout(res, delay) );
  }

  selectCity = (city) => {
    this.setState({isLoading : true, incompleteSearch : false}, () => {
      const currentURL = `${this.API_URL}weather?id=${city.id}&appid=${this.API_KEY}`;
      fetch(currentURL).then(response => response.json())
      .then(data => {
        let misc = {
          altitude : null,
          name : data.name,
          country : data.sys.country,
          currentTemp : data.main.temp
        }
        this.setState({currentWeatherData : data, miscData : misc}, () => {
          const dailyURL = `${this.API_URL}onecall?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${this.API_KEY}`;
          console.log(dailyURL);
          fetch(dailyURL).then(response => response.json())
          .then(data => {
            this.timeout(400).then(()=>{
              this.setState({dailyWeatherData : data.daily, autocompleteResults : [], query : '', isLoading : false});
            })
          })
          .catch(err => console.log(err))
        });
      })
      .catch(err => console.log(err))
    })
  }

  handleSearch = ()=>{
    if (!this.state.query) return;
    matchCity(this.state.query).then(results => {
      if (results.length === 0){
        getCities(this.state.query).then(autocompleteResults => {
          autocompleteResults.length === 0 ?
          this.setState({ error : {errorType : 'noResult', errorMessage : `No Results Found for search : ${this.state.query}`}, autocompleteResults : [], incompleteSearch : false}) :
          this.setState({autocompleteResults : autocompleteResults, incompleteSearch : true})
        })
      }
      else if (results.length === 1) {
        this.selectCity(results[0]);
      }
      else {
        console.log('incomplete search');
        this.setState({autocompleteResults : results, incompleteSearch : true});
      }
    })

  }

  getListStyle = () => this.state.isLoading || this.state.autocompleteResults.length === 0 ? 'list hidden'  :'list';

  getSuggestionStyle = () => this.state.incompleteSearch? 'list-item' : 'hidden';

  handleSubmit = (event) => {
    event.preventDefault();
    this.handleSearch();
  }

  render() {
    return (    
    <>
      <div className="header">
        <div className="title-container">
          <img className="desktop-logo" alt='logo' src='assets/sun.png'/>
          <h1>Weatheria</h1>
        </div>
        <div className='searchContainer'>
          <div className='control'>
            <form onSubmit={this.handleSubmit}>
              <input type='text' value={this.state.query} onChange={this.handleInput} className='search' placeholder='Search City...'></input>
              <span onClick={this.handleSearch} className="search-button">Search</span>
            </form>
          </div>
          <div className={this.getListStyle()}>
            <span className={this.getSuggestionStyle()}>Did you mean ?</span>
            {this.state.autocompleteResults.map((city, index) => 
            <span className='list-item' onClick={()=>{this.selectCity(city)}} key={index}>{city.name}, {city.country}</span>)}
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className='curve' viewBox="0 0 1440 320"><path fill="#59D3DF" fillOpacity="1" d="M0,96L60,80C120,64,240,32,360,37.3C480,43,600,85,720,101.3C840,117,960,107,1080,90.7C1200,75,1320,53,1380,42.7L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path></svg>
      </div>
      <WeatherData 
        isLoading = {this.state.isLoading}
        current = {this.state.currentWeatherData}
        misc = {this.state.miscData}
        daily  = {this.state.dailyWeatherData}
        error = {this.state.error}
        />
    </>
    );
  }

}