import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

export default class WeatherData extends React.Component {

  ICON_URL =  'http://openweathermap.org/img/wn/';
  constructor(props) {
    super(props);
    let date =  new Date();
    this.state = {
      isLoading : true,
      error : {
        errorType : 'none',
        errorMessage : ''
      },
      currentIndex : 0,
      currentDate : date,
      date,
      dateString : this.getFormattedDate(date)
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {isLoading: props.isLoading, error : props.error, misc : props.misc, current : props.current, daily : props.daily };
  }

  getDay = (i)=>{
    let days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    if (i >=7) {
      return days[i-7]
    }
    return days[i];
  }

  getMonth = (i) =>{
    let months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return months[i];
  }

  handlePrevious = () => {
    if (this.state.currentIndex === 0 ) return;
    let d = new Date();
    d.setDate(this.state.date.getDate() - 1);
    let dateString = this.getFormattedDate(d);
    this.setState({currentIndex : this.state.currentIndex - 1, date : d, dateString});
  }
  handleNext = () => {
    if (this.state.currentIndex === 7 ) return;
    let d = new Date();
    d.setDate(this.state.date.getDate() + 1);
    let dString = this.getFormattedDate(d);
    this.setState({currentIndex : this.state.currentIndex + 1, date : d, dateString : dString});
  }

  getFormattedDate = (date) => {
    let formattedDate = `${this.getDay(date.getDay())}, ${date.getDate()} ${this.getMonth(date.getMonth())} ${date.getFullYear()}`
    return formattedDate;
  }

  getLoaderClass = () => {
    return this.state.isLoading && this.state.error.errorType ==='none' ? 'loader' : 'hidden'
  }

  getErrorClass = () => {
    return this.state.error.errorType !=='none' ? 'error' : 'hidden'
  }

  render() {
    return (
    <>
    <Container className='weather-data' >
      <div className={this.getLoaderClass()}></div>
      <div className={this.getErrorClass()}>
        <h1>{this.state.error.errorMessage}</h1>
      </div>
      {(this.state.isLoading || this.state.searchError) ? null : 
        <>
          <Row>
            <Col className='info' md={5}>
              <div className='data-title'>
                <h1>{this.state.misc.name}, {this.state.misc.country}</h1>
                <div className='navigation'>
                  <span onClick={this.handlePrevious} className={this.state.currentIndex===0 ? 'hide' : 'navigation-button'}><i className='fa fa-chevron-left'></i></span>
                  <span onClick={this.handleNext} className={this.state.currentIndex===7 ? 'hide' : 'navigation-button'}><i className='fa fa-chevron-right'></i></span>
                </div>
              </div>
              <p>{this.state.dateString}</p>
              <p>Height From Sea Level : {this.state.misc.altitude ? this.state.misc.altitude : 'Not Available'}</p>
              <p>Wind : {this.state.daily[this.state.currentIndex].wind_speed} m/s, {this.state.daily[this.state.currentIndex].wind_deg} deg</p>
              <p>Rain : {this.state.daily[this.state.currentIndex].rain ? this.state.daily[this.state.currentIndex].rain + ' mm' : 'No Rain'}</p>
              <p>Humidity : {this.state.daily[this.state.currentIndex].humidity} %</p>
              <p>Temperature : {this.state.currentIndex === 0 ? 
              `${(this.state.misc.currentTemp - 273.15).toFixed(2)} (Current)`
              : `${(this.state.daily[this.state.currentIndex].temp.day - 273.15).toFixed(2)} (Day)`
            } &deg;C</p>
            </Col>
            <Col md={7}>
              <div className='data-title'>
                <h1>Daily Forecast</h1>
              </div>
              {this.state.daily.map((item,index) => 
                <div key={index} className='weeklyWeather'>
                  <span>{this.getDay(this.state.currentDate.getDay() + index)}{index === 0 ? ' (Today)' : null}</span>
                  <img alt='weather' src={`${this.ICON_URL}${item.weather[0].icon}.png`}></img>
                  <span>{(item.temp.day-273.15).toFixed(1)} &deg;C</span>
                </div>
              )}
            </Col>
          </Row> 
        </>
      }
    </Container>

    </>
    )
  }
}