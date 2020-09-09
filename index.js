'use strict';

const fp = require('fastify-plugin');
const fxp = require('fast-xml-parser');

const defaults = {
  contentType: ['text/xml', 'application/xml', 'application/rss+xml'],
  validate: false
};

function xmlBodyParserPlugin(instance, options, next) {
  const opts = Object.assign({}, defaults, options || {});

  function contentParser(fastify, payload, done) {
    const parsingOpts = opts;

    let body = '';
    payload.on('error', errorListener);
    payload.on('data', dataListener);
    payload.on('end', endListener);

    function errorListener(err) {
      done(err);
    }

    function endListener() {
      if (parsingOpts.validate) {
        const result = fxp.validate(body, parsingOpts);
        if (result.err) {
          const invalidFormat = new Error('Invalid Format: ' + result.err.msg);
          invalidFormat.statusCode = 400;
          payload.removeListener('error', errorListener);
          payload.removeListener('data', dataListener);
          payload.removeListener('end', endListener);
          done(invalidFormat);
        }
      }

      done(null, fxp.parse(body, parsingOpts));
    }

    function dataListener(data) {
      body = body + data;
    }
  }

  if (typeof opts.contentType === 'string') {
    instance.addContentTypeParser(opts.contentType, contentParser);
  } else {
    for (let i = 0; i < opts.contentType.length; i++) {
      instance.addContentTypeParser(opts.contentType[i], contentParser);
    }
  }

  next();
}

module.exports.XMLParser = fp(xmlBodyParserPlugin, {
  fastify: '>=3.0.0',
  name: 'fastify-xml-parser'
});
