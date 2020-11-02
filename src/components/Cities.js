import cities from '../components/city.list.json';
const citiesData = JSON.parse(JSON.stringify(cities));


function getCities(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(citiesData.filter((el) => el['name'].toLowerCase().includes(query.toLowerCase())).slice(0, 10));
    });
  });
}

function matchCity(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(citiesData.filter(el => el['name'].toLowerCase() === query.toLowerCase()));
    });
  });
  
}

export { getCities, matchCity };