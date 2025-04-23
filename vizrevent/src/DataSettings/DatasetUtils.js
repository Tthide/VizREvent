export const DatasetFetcher = async (params = {},serverUrl = 'http://localhost:5000/api/dataset') => {
    try {
        
        const queryString = new URLSearchParams(params);
        
        const response = await fetch(`${serverUrl}?${queryString}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const DatasetListFetcher = async (serverUrl = 'http://localhost:5000/api/datasetList') =>{
    try {
        const response = await fetch(`${serverUrl}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }

}
