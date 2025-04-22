export const DatasetFetcher = async (params = {},serverUrl = 'http://localhost:5000/api/dataset') => {
    try {
        const queryString = new URLSearchParams(params).toString();
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
