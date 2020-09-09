const Fastify = require('fastify');
const request = require('request');
const {XMLParser} = require('../');

describe('XML Body Parser', function () {

  it('should send error response when an invalid XML payload', function (done) {
    runFastify(
      {validate: true},
      '<validXML</valid>',
      'text/xml',
      function (err, response, body) {
        expect(response.statusCode).toBe(400);
        var expected = {
          msg: 'Invalid Format: Tag \'validXML</valid\' is an invalid name.'
        };
        expect(JSON.parse(body).message).toEqual(expected.msg);
        done();
      }
    );
  });

  it('should parse valid XML payload including namespace', function (done) {
    runFastify(
      {ignoreNameSpace: true},
      '<ns:valid>XML</ns:valid>',
      'application/xml',
      function (err, response, body) {
        expect(response.statusCode).toBe(200);
        var expected = {
          'valid': 'XML'
        };
        expect(JSON.parse(body)).toEqual(expected);
        done();
      }
    );
  });

  it('should not parse if non-xml payload: application/json', function (done) {
    runFastify(
      null,
      JSON.stringify({'valid': 'JSON'}),
      'application/json',
      function (err, response, body) {
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(body)).toEqual({'valid': 'JSON'});
        done();
      }
    );
  });

  it('should parse for custom content-type', function (done) {
    runFastify(
      {contentType: 'my/xml'},
      '<ns:valid>XML</ns:valid>',
      'my/xml',
      function (err, response, body) {
        expect(response.statusCode).toBe(200);
        var expected = {
          'ns:valid': 'XML'
        };
        expect(JSON.parse(body)).toEqual(expected);
        done();
      }
    );
  });

});

function runFastify(pluginOptions, reqBody, contentType, verificationCall) {
  const fastify = Fastify();
  const uri = '/testuri';
  fastify
    .register(XMLParser, pluginOptions)
    .post(uri, (req, res) => {
      res.send(Object.assign({}, req.body));
    });

  fastify.listen(0, (err) => {
    const reqOpts = {
      method: 'POST',
      baseUrl: 'http://localhost:' + fastify.server.address().port,
      headers: {'content-type': contentType}
    };
    if (err) console.error(err);
    fastify.server.unref();
    const req = request.defaults(reqOpts);
    req({uri: uri, body: reqBody}, verificationCall);
  });
}

