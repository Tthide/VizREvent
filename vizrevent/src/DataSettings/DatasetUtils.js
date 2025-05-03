export const DatasetFetcher = async (params = {}, serverUrl = 'http://localhost:5000/api/dataset') => {
    try {

        const queryString = new URLSearchParams(params);

        const response = await fetch(`${serverUrl}?${queryString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const DatasetListFetcher = async (serverUrl = 'http://localhost:5000/api/datasetList') => {
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
export const DatafieldsList = async (dataset_id = null, serverUrl = 'http://localhost:5000/api/datafields') => {
    
    if (dataset_id) {
        try {


            // Construct the URL with the dataset_id if provided
            const url = dataset_id ? `${serverUrl}?dataset_id=${dataset_id}` : serverUrl;

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
};
