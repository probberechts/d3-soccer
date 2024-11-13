import jsdom from 'jsdom';

export default function(html) {
  const { JSDOM } = jsdom;
  const { document } = (new JSDOM(html)).window;
  return document;
};
