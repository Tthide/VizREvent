import Draco from "draco-vis";

export const DatasetFetcher = async (params = {}, serverUrl = 'http://localhost:5000/api/dataset') => {
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

export const DatasetListFetcher = async (serverUrl = 'http://localhost:5000/api/datasetList') => {
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

export const DatafieldsList = async (datasetId = {}, serverUrl = 'http://localhost:5000/api/dataset') => {

    // Call DracoRecProcess with the dataset

    try {
        const data = await DatasetFetcher(datasetId)

        //Here we only use draco-vis to read the data fields
        const draco = new Draco();
        draco.prepareData(data);
        console.log("DataFields", draco.getSchema());
        return draco.getSchema().stats; //we only want the stats property from the getSchema output


    } catch (error) {
        console.error('Error in getting data fields:', error);

    }


};