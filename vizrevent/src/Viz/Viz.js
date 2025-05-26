import React, { useEffect, useRef, useState } from 'react';
import { VegaLite, Vega } from 'react-vega';
import { throttle, debounce } from 'lodash';
import './Viz.scss';

const Viz = ({ spec, data, isVega = false }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [readyToRenderImage, setReadyToRenderImage] = useState(false);
    const viewRef = useRef(null);

    // Resize logic
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const debounceRenderImage = debounce(() => {
            setIsResizing(false);
            setReadyToRenderImage(true); // trigger image generation
        }, 400);

        const handleResize = throttle(entries => {
            const { width, height } = entries[0].contentRect;
            const newDims = { width: Math.floor(width), height: Math.floor(height) };

            setDimensions(prev => {
                if (prev.width !== newDims.width || prev.height !== newDims.height) {
                    setIsResizing(true);
                    setReadyToRenderImage(false);
                    debounceRenderImage(); // restart debounce timer
                    return newDims;
                }
                return prev;
            });
        }, 100);

        const observer = new ResizeObserver(handleResize);
        observer.observe(container);

        return () => {
            observer.disconnect();
            handleResize.cancel();
            debounceRenderImage.cancel();
        };
    }, []);

    useEffect(() => {
        setImageURL(null); // clear old image on dimension change
    }, [dimensions]);

    const enhancedSpec = spec && dimensions.width && dimensions.height ? {
        ...spec,
        width: dimensions.width,
        height: dimensions.height,
        autosize: {
            type: 'fit',
            contains: 'padding'
        }
    } : null;

    const handleNewView = (view) => {
        viewRef.current = view;
    };

    // readyToRenderImage flips to true, render image from existing view
    useEffect(() => {
        if (readyToRenderImage && viewRef.current) {
            viewRef.current.toImageURL('png').then(url => {
                setImageURL(url);
            }).catch(err => {
                console.error('Failed to render image from chart:', err);
            });
        }
    }, [readyToRenderImage]);

    const showImage = imageURL && !isResizing;

    return (
        <div className="Viz-chart-container" ref={containerRef}>
            {showImage ? (
                <img
                    src={imageURL}
                    alt="Chart"
                    style={{ width: '100%', height: 'auto' }}
                />
            ) : enhancedSpec ? (
                isVega
                    ? <Vega spec={enhancedSpec} onNewView={handleNewView} />
                    : <VegaLite data={data} spec={enhancedSpec} onNewView={handleNewView} actions={false} />
            ) : (
                <div style={{
                    width: '200px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span>No Visualization</span>
                </div>
            )}
        </div>
    );
};

export default React.memo(Viz);
