import newElement from '../rendering/newelement';
import listElements from '../rendering/listelements';
import autoComplete from '../api/autocomplete';
import cityAPI from '../api/city';
import mainContainer from '../components/maincontainer';
import Loading from '../pages/loading';
import Weather from '../pages/weather';
import notFound from '../pages/notfound';

const Navbar = () => {

  const cityInput = newElement('input', 'w-100', null, null, ['placeholder', 'Type the name of your city here...']);

  const cityList = listElements(
    newElement('ul', 'nav flex-column', null, null, ['id', 'city_nav']),
  );

  const autoCompleteQueue = [];

  cityInput.addEventListener(
    'keyup',
    async () => {

      autoCompleteQueue.push(
        async () => {
          try {
            cityList.innerHTML = '';
            cityList.appendChild(
              listElements(
                newElement('li', 'nav-item'),
                newElement('a', 'nav-link active', 'Loading...'),
              )
            );
            const cities = await autoComplete(cityInput.value); 
            cityList.innerHTML = '';
            cities.forEach(
              (city, i) => {
                const newCity = listElements(
                  newElement('li', 'nav-item'),
                  newElement(
                    'a',
                    'nav-link', 
                    `${city['matching_full_name']}`,
                    async () => {
                      try {
                        cityInput.value = city['matching_full_name'];
                        cityList.innerHTML = '';
                        mainContainer.display(Loading);
                        const cityObject = await cityAPI(city['_embedded']['city:item']['geoname_id']);
                        mainContainer.display(Weather(cityObject));
                      } catch(e) {
                        mainContainer.display(notFound);
                      }
                    },
                    ['href', '#']
                  ),
                );
                cityList.appendChild(newCity);
              },
            );
            // This ensures that the latest keyup event shows the latest city list,
            // and prevents that the longest-running api request shows on the city list.
            if(autoCompleteQueue.length > 0){
              autoCompleteQueue.shift()();
            }
          } catch(e) {
            console.log(e);
          }              
        }
      );
      if(autoCompleteQueue.length == 1){
        autoCompleteQueue.shift()();
      }
    },
  );

  const navbar = listElements(
    newElement('nav', 'navbar navbar-dark sticky-top bg-dark flex-column shadow'),
    cityInput,
    cityList
  );

  return navbar;
};

export default Navbar;
