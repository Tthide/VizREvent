
export const DracoRecRequest = async (datasetId = null, specs = null, numChart = 5, serverUrl = "http://localhost:5000/api/draco") => {
    if (datasetId) {
        try {

            //these first 3 properties are perturbing the recommendation pipeline
            //so we take them out before sending the REST request to the server
            const payload = {
                dataset_id: datasetId,
                specs,
                num_chart: numChart,
            };
            if (specs) {
                const { $schema, config, data, ...draco_specs } = specs;
                payload.specs ={ ...draco_specs }//({ ...draco_specs });
            };


            console.log("draco_specs before draco request", payload.specs);
            const response = await fetch(serverUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

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
    else {
        throw new Error("datasetId in requesting draco recommendations is required");
    }

}