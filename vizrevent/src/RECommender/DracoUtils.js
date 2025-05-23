const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * An async generator that yields each chart spec
 * as soon as it’s parsed out of the incoming stream.
 */
export async function* DracoRecRequest(datasetId = null, specs = null, numChart = 1, serverUrl = `${API_BASE_URL}/api/draco`) {
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
                payload.specs = { ...draco_specs }//({ ...draco_specs });
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

            // Set up streaming reader
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buf = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                let lines = buf.split("\n");
                buf = lines.pop();          // last line may be incomplete
                for (const line of lines) {
                    if (line.trim()) yield JSON.parse(line);
                }
            }
            if (buf.trim()) {
                yield JSON.parse(buf);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
    else {
        throw new Error("datasetId in requesting draco recommendations is required");
    }

}