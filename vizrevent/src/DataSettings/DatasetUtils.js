export const DatasetFetcher = async (url = 'http://localhost:5000/api/data') => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to handle it where the function is called
    }
};
