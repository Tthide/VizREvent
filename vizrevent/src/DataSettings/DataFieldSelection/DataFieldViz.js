import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export default function DataFieldViz({ distribution }) {
  const containerRef = useRef();
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // ResizeObserver to track container size
  useEffect(() => {
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
  }, []);

  // Draw visualization when dimensions or data change
  useEffect(() => {
    if (!distribution || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear previous content

    if (distribution.type === 'categorical') {
      drawTreemap(svg, distribution, dimensions);
    } else if (distribution.type === 'numerical') {
      drawHistogram(svg, distribution, dimensions);
    }
  }, [distribution, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}

function drawTreemap(svg, distribution, { width, height }) {
  const data = Object.entries(distribution.frequencies).map(([name, value]) => ({ name, value }));

  const root = d3.hierarchy({ children: data }).sum(d => d.value);
  d3.treemap().size([width, height]).padding(1)(root);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  svg.selectAll('rect')
    .data(root.leaves())
    .join('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => color(d.data.name));

  svg.selectAll('title')
    .data(root.leaves())
    .join('title')
    .text(d => `${d.data.name}: ${d.data.value}`);
}

function drawHistogram(svg, distribution, { width, height }) {
  const margin = { top: 5, right: 5, bottom: 20, left: 30 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

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
}
