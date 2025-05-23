const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const DatasetFetcher = async (datasetId = null, serverUrl = `${API_BASE_URL}/api/dataset`) => {
    if (datasetId) {
        try {

            // Construct the URL with the dataset_id if provided
            const url = datasetId ? `${serverUrl}?dataset_id=${datasetId}` : serverUrl;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            return jsonData;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
    else{
        console.warn("No datasetId passed when trying to fetch dataset")
    }
};

export const DatasetListFetcher = async (serverUrl = `${API_BASE_URL}/api/datasetList`) => {
    try {
        const response = await fetch(`${serverUrl}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }

}
export const DatafieldsList = async (datasetId = null, serverUrl = `${API_BASE_URL}/api/datafields`) => {

    if (datasetId) {
        try {


            // Construct the URL with the dataset_id if provided
            const url = datasetId ? `${serverUrl}?dataset_id=${datasetId}` : serverUrl;

            // Send a GET request to the server
            const response = await fetch(url);

            // Check if the response is ok (status code 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the JSON response
            const data = await response.json();
            // Return the list of data fields
            return data;

        } catch (error) {
            // Handle any errors that occur during the fetch operation
            console.error('Error fetching data fields:', error);
            throw error;
        }
    }
    else{
        console.warn("No datasetId passed when trying to fetch data fields")
    }
};
