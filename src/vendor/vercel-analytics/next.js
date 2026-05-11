'use client';

const React = require('react');

function Analytics() {
  return React.createElement('script', {
    defer: true,
    src: '/_vercel/insights/script.js',
    'data-sdkn': '@vercel/analytics/next',
    'data-sdkv': '1.5.0',
  });
}

module.exports = { Analytics };
