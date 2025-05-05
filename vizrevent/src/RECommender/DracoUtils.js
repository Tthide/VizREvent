
export const DracoRecRequest = async (datasetId = null, specs = null, numChart = 5, serverUrl = "http://localhost:5000/api/draco") => {
    if (datasetId) {
        try {

            const queryParams = [];
            if (datasetId) queryParams.push(`dataset_id=${datasetId}`);
            if (numChart) queryParams.push(`num_chart=${numChart}`);
            if (specs) queryParams.push(`specs=${specs}`);

            // Construct the URL with query parameters
            const url = `${serverUrl}?${queryParams.join('&')}`;
            // Construct the URL with the dataset_id if provided
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const chartsSpecs = await response.json();
            return chartsSpecs;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

}