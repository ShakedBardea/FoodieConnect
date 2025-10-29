import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Dashboard.css';

export const PopularRecipesChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) {
      console.log('PopularRecipesChart: No data available', data);
      return;
    }
    console.log('PopularRecipesChart: Rendering with data', data);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };

    const x = d3.scaleBand()
      .domain(data.map(d => d.title.substring(0, 12)))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.likesCount)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.attr('width', width).attr('height', height);

    // Define colors for top 5 recipes
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4CAF50', '#2196F3']; // Gold, Silver, Bronze, Green, Blue
    
    // Bars
    svg.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.title.substring(0, 12)))
      .attr('y', d => y(d.likesCount))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d.likesCount))
      .attr('fill', (d, i) => colors[i] || '#667eea')
      .attr('rx', 8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) { 
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('transform', 'scale(1.05)');
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.9)')
          .style('color', 'white')
          .style('padding', '12px')
          .style('border-radius', '8px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
        
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <strong>${d.title}</strong><br/>
          👤 ${d.author}<br/>
          🍽️ ${d.cuisine} • ${d.category}<br/>
          ⭐ ${d.difficulty}<br/>
          ❤️ ${d.likesCount} likes
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) { 
        d3.select(this)
          .attr('opacity', 1)
          .attr('transform', 'scale(1)');
        d3.selectAll('.tooltip').remove();
      });

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '11px')
      .style('font-weight', 'bold');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px');

    // Y Axis Label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Likes');

    // Add value labels on top of bars
    svg.selectAll('.bar-label')
      .data(data)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.title.substring(0, 12)) + x.bandwidth() / 2)
      .attr('y', d => y(d.likesCount) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d.likesCount);

    // Add ranking labels (1st, 2nd, 3rd, etc.)
    svg.selectAll('.rank-label')
      .data(data)
      .enter().append('text')
      .attr('class', 'rank-label')
      .attr('x', d => x(d.title.substring(0, 12)) + x.bandwidth() / 2)
      .attr('y', d => y(d.likesCount) - 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#666')
      .text((d, i) => `#${i + 1}`);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No data available for popular recipes chart</p>
        <p>Create some recipes and get likes to see the chart!</p>
      </div>
    );
  }

  return <svg ref={svgRef}></svg>;
};

export const ActivityTimelineChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) {
      console.log('ActivityTimelineChart: No data available', data);
      return;
    }
    console.log('ActivityTimelineChart: Rendering with data', data);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    const g = svg.attr('width', width).attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.cuisine))
      .range(['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']);

    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.cuisine))
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('opacity', 1);
      });

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => `${d.data.percentage}%`);

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => color(d.cuisine));

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 9)
      .style('font-size', '12px')
      .text(d => d.cuisine);

  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No data available for activity timeline chart</p>
        <p>Create some recipes and groups to see the chart!</p>
      </div>
    );
  }

  return <svg ref={svgRef}></svg>;
};
