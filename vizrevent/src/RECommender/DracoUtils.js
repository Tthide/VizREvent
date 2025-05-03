// dracoUtils.js
import Draco from 'draco-vis';

const defaultProgram = `
  % Define facts based on the dataset
  category(a).
  category(b).
  category(c).
  category(d).
  category(e).
  category(f).
  category(g).
  category(h).
  category(i).

  value(a, 28).
  value(b, 55).
  value(c, 43).
  value(d, 91).
  value(e, 81).
  value(f, 53).
  value(g, 19).
  value(h, 87).
  value(i, 52).

  % Define a recommendation rule
  recommend(X) :- category(X), value(X, V), V > 50.
`;

const defaultAspSet = {
    constraint1: ':- category(X), value(X, V), V <= 20.',
};

export const DracoRecProcess = (data, aspSet = defaultAspSet, program = defaultProgram, modelQty = 5) => {
    return new Promise((resolve, reject) => {
        const draco = new Draco();

        draco.init().then(() => {


            draco.prepareData(data);
            console.log("draco.getSchema()");
            console.log(draco.getSchema());
            //draco.updateAsp(aspSet);

            const solutionSet = draco.solve(program, { models: modelQty });

            //Resolving the promise 
            resolve(solutionSet);
        }).catch((error) => {
            reject(`Error initializing Draco: ${error.message}`);
        });
    });
};

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