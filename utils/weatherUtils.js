import axios from 'axios';
import countryList from 'country-list';


export const isValidCountry = (countryName) => {
    // Use `country-list` to get the country code for the provided country name
    try {
        if (!countryName) {
            return false
        }
        return countryList.getCode(countryName);
    } catch (error) {
        return false
    }
};

// Function to check if a city exists
export const isCityExists = async (city, apiKey) => {
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        return response.data.cod === 200; // 200 means the city exists
    } catch (error) {
        return false; // Handle errors, e.g., city not found
    }
};

// to capitalize First Letter Of EachWord
export const capitalizeFirstLetterOfEachWord = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const getWeatherDetails = async (city, apiKey) => {
    if (!city || !apiKey) {
        return null
    }
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        // Handle errors, e.g., city not found or API request failure
        console.error('Error fetching weather details:', error.message);
        return null;
    }
};

