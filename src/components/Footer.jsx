import React from 'react';
import CONFIG from '../config.js';
import { asset } from '../utils.js';

export default function Footer() {
  return (
    <footer className="footer">
      <img className="f-corner f-corner--l" src={asset('corner-left.jpg')} alt="" />
      <img className="f-corner f-corner--r" src={asset('corner-right.jpg')} alt="" />
      <p className="f-script">With love,</p>
      <p className="f-names">
        {CONFIG.bride} &amp; {CONFIG.groom}
      </p>
    </footer>
  );
}
