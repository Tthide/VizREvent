/**
 * Extracts all data field names used in a Vega-Lite specification.
 *
 * This function traverses the Vega-Lite spec and collects field names
 * found in the `encoding` and `facet` blocks, including nested structures
 * like layers, hconcat, vconcat, concat, and spec. It is assumed that the fields
 * name can be found there.
 *
 * @param {Object} spec - A Vega-Lite specification object (without data).
 * @returns {string[]} - A sorted array of unique field names used in the spec.
 */

export function extractFieldsFromSpec(spec) {
    const fields = new Set();

    function traverse(obj) {
        if (!obj || typeof obj !== 'object') return;

        if (obj.encoding) {
            for (const key in obj.encoding) {
                const enc = obj.encoding[key];
                if (enc && enc.field) fields.add(enc.field);
                if (enc.condition) {
                    const cond = Array.isArray(enc.condition) ? enc.condition : [enc.condition];
                    cond.forEach(c => c.field && fields.add(c.field));
                }
            }
        }

        if (obj.facet && typeof obj.facet === 'object') {
            for (const key in obj.facet) {
                const f = obj.facet[key];
                if (f && typeof f === 'object' && f.field) fields.add(f.field);
            }
        }

        // Recursively check composite views
        ['layer', 'hconcat', 'vconcat', 'concat'].forEach(key => {
            if (obj[key]) obj[key].forEach(traverse);
        });

        if (obj.spec) traverse(obj.spec);
    }

    traverse(spec);
    return Array.from(fields).sort();
}