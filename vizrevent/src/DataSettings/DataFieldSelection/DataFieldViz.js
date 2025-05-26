import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Tooltip } from 'react-tooltip';

const DataFieldViz = ({ distribution, showRectTooltips = false, renderMode = 'svg', showResizeObserver = true }) => {
    //renderMode= "svg" or "canvas"
    const containerRef = useRef();
    const svgRef = useRef();
    const canvasRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // ResizeObserver
    useEffect(() => {
        if (!showResizeObserver) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [showResizeObserver]);

    // Canvas rendering
    useEffect(() => {
        if (!distribution || renderMode !== 'canvas') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        if (distribution.type === 'categorical') {
            drawTreemapCanvas(ctx, distribution, width, height);
        } else if (distribution.type === 'numerical') {
            drawHistogramCanvas(ctx, distribution, width, height);
        }
    }, [distribution, renderMode]);

    // SVG rendering
    useEffect(() => {
        if (!distribution || dimensions.width === 0 || dimensions.height === 0 || renderMode !== 'svg') return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        if (distribution.type === 'categorical') {
            drawTreemapSVG(svg, distribution, dimensions, showRectTooltips);
        } else if (distribution.type === 'numerical') {
            drawHistogramSVG(svg, distribution, dimensions, showRectTooltips);
        }
    }, [distribution, dimensions, renderMode]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            {renderMode === 'svg' ? (
                <>
                    <svg ref={svgRef} width="100%" height="100%" className="datafield-viz" />
                    <Tooltip id="treemap-tooltip" place="top" positionStrategy="fixed" />
                </>
            ) : (
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            )}
        </div>
    );
};

export default React.memo(DataFieldViz);

// ======================== Drawing functions ========================

function drawTreemapSVG(svg, distribution, { width, height }, showRectTooltips) {
    const data = Object.entries(distribution.frequencies).map(([name, value]) => ({ name, value }));
    const root = d3.hierarchy({ children: data }).sum(d => d.value).sort((a, b) => b.value - a.value);
    d3.treemap().size([width, height]).padding(1)(root);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const leaves = root.leaves();
    const totalValue = root.value;

    const rects = svg.selectAll('rect')
        .data(leaves)
        .join('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => color(d.data.name));

    if (showRectTooltips) {
        rects
            .attr('data-tooltip-id', 'treemap-tooltip')
            .attr('data-tooltip-content', d => `${d.data.name}: ${d.data.value} (${((d.data.value / totalValue) * 100).toFixed(2)}%)`);

    }

    const sizeThreshold = 3500;
    svg.selectAll('text')
        .data(leaves.filter(d => (d.x1 - d.x0) * (d.y1 - d.y0) >= sizeThreshold))
        .join('text')
        .attr('x', d => d.x0 + 4)
        .attr('y', d => d.y0 + 14)
        .text(d => d.data.name)
        .attr('class', 'treemap-rect');

    svg.selectAll('text.value')
        .data(leaves.filter(d => (d.x1 - d.x0) * (d.y1 - d.y0) >= sizeThreshold))
        .join('text')
        .attr('x', d => d.x0 + 4)
        .attr('y', d => d.y0 + 28) // Position below the name
        .text(d => `${((d.data.value / totalValue) * 100).toFixed(2)}%`)
        .attr('class', 'treemap-rect');
}

function drawHistogramSVG(svg, distribution, { width, height }, showRectTooltips) {
    const margin = showRectTooltips
        ? { top: 5, right: 5, bottom: 40, left: 45 }
        : { top: 5, right: 5, bottom: 20, left: 25 };

    const data = distribution.counts.map((count, i) => ({
        binStart: distribution.bins[i],
        binEnd: distribution.bins[i + 1],
        count,
    }));

    const x = d3.scaleLinear()
        .domain([distribution.bins[0], distribution.bins[distribution.bins.length - 1]])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.binStart))
        .attr('y', d => y(d.count))
        .attr('width', d => x(d.binEnd) - x(d.binStart) - 1)
        .attr('height', d => y(0) - y(d.count))
        .attr('fill', '#69b3a2');

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
        .attr('font-size', '10px');

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(4).tickSizeOuter(0))
        .attr('font-size', '10px');

    if (showRectTooltips) {
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 5)
            .text('Value')
            .attr('class', 'hist-axis-label');

        svg.append('text')
            .attr('transform', `translate(15,${height / 2}) rotate(-90)`)
            .text('Count')
            .attr('class', 'hist-axis-label');
    }
}

function drawTreemapCanvas(ctx, distribution, width, height) {
    const data = Object.entries(distribution.frequencies).map(([name, value]) => ({ name, value }));
    const root = d3.hierarchy({ children: data }).sum(d => d.value).sort((a, b) => b.value - a.value);
    d3.treemap().size([width, height]).padding(1)(root);

    const sizeThreshold = 2000;

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    root.leaves().forEach(d => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        ctx.fillStyle = color(d.data.name);
        ctx.fillRect(d.x0, d.y0, w, h);

        if (w * h >= sizeThreshold) {
            ctx.fillStyle = 'black';
            ctx.fillText(d.data.name, d.x0 + 4, d.y0 + 10);
        }
    });
}

function drawHistogramCanvas(ctx, distribution, width, height) {
    const margin = { top: 5, right: 5, bottom: 20, left: 25 };
    const data = distribution.counts.map((count, i) => ({
        binStart: distribution.bins[i],
        binEnd: distribution.bins[i + 1],
        count,
    }));

    const x = d3.scaleLinear()
        .domain([distribution.bins[0], distribution.bins[distribution.bins.length - 1]])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height - margin.bottom, margin.top]);

    ctx.fillStyle = '#69b3a2';
    data.forEach(d => {
        const x0 = x(d.binStart);
        const x1 = x(d.binEnd);
        const y1 = y(d.count);
        ctx.fillRect(x0, y1, x1 - x0 - 1, y(0) - y1);
    });
}
