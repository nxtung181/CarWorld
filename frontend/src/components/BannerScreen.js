import React from 'react';

const logo = require('../banner.jpg');
export default function BannerScreen() {
  return (
    <div>
      <img src={logo} className="banner-image" alt="CarWorld Logo" />
    </div>
  );
}