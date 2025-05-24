import React, { useEffect, useRef, useState } from 'react';
import { VegaLite,Vega  } from 'react-vega';
import './Viz.scss';

const Viz = ({ spec, data, isVega = false }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDimensions({
                width: Math.floor(width),
                height: Math.floor(height),
            });
        });
        console.info("re-renders");
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const enhancedSpec = spec && dimensions.width && dimensions.height ? {
        ...spec,
        width: dimensions.width,
        height: dimensions.height,
        autosize: {
            type: 'fit',
            contains: 'padding'
        }
    } : null;

    return (
        <div className="Viz-chart-container" ref={containerRef}>
            {
                enhancedSpec ? (
                    isVega
                        ? <Vega key={`${dimensions.width}x${dimensions.height}`} spec={enhancedSpec} />
                        : <VegaLite key={`${dimensions.width}x${dimensions.height}`} data={data} spec={enhancedSpec} />
                ) : (
                    <div style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span>No Visualization</span>
                    </div>
                )
            }
        </div>
    );
};

export default React.memo(Viz);
