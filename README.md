# Fastify XML Parser

> Fastify Plugin

Fastify plugin to parse XML payloads into JSON objects.

A custom fork of [fastify-xml-body-parser](https://github.com/NaturalIntelligence/fastify-xml-body-parser) for fastify v3

## Installation
```bash
yarn add @stead/fastify-xml-parser
```

## Usage
This plugin use [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) to parse the XML payload. So it accepts all the options supported by fast-xml-parser.

```js
import { fastify } from 'fastify';
import { XMLParser } from '@stead/fastify-xml-parser';

const options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    decodeHTMLchar: false,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    validate: false,
    contentType: ['application/xml', 'text/xml']
};

fastify.register(XMLParser, options);

fastify.post('/', (req, res) => {
  res.send(Object.assign({}, req.body))
});

fastify.listen(8000, (err) => {
  if (err) throw err
});
```

**Sample POST body / payload**
```xml
<sample>
    data
</sample>
```

The resulting data would be an object:
```json
{
  "sample": "data"
}
```
