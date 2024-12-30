import React from 'react'

export const extractLinks = (text) => {
    const linkRegex = /-\s(.+?)\((\/[^)]+)\)/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      links.push({ title: match[1], url: match[2] });
    }
    return links;
  };

export const removeLinks = (text) => {
  return text.replace(/-\s(.+?)\((\/[^)]+)\)/g, '').trim();
};

