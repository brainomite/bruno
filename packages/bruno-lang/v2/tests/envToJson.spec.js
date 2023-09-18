const parser = require("../src/envToJson");

describe("env parser", () => {
  it("should parse empty vars", () => {
    const input = `
vars {
}`;

    const output = parser(input);
    const expected = {
      "variables": []
    };

    expect(output).toEqual(expected);
  });

  it("should parse single var line", () => {
    const input = `
vars {
  url: http://localhost:3000
}`;

    const output = parser(input);
    const expected = {
      "variables": [{
        "name": "url",
        "value": "http://localhost:3000",
        "enabled" : true,
        "secret": false
      }]
    };

    expect(output).toEqual(expected);
  });

  it("should parse multiple var lines", () => {
    const input = `
vars {
  url: http://localhost:3000
  port: 3000
  ~token: secret
}`;

    const output = parser(input);
    const expected = {
      "variables": [{
        "name": "url",
        "value": "http://localhost:3000",
        "enabled" : true,
        "secret": false
      }, {
        "name": "port",
        "value": "3000",
        "enabled" : true,
        "secret": false
      }, {
        "name": "token",
        "value": "secret",
        "enabled" : false,
        "secret": false
      }]
    };

    expect(output).toEqual(expected);
  });

  it("should gracefully handle empty lines and spaces", () => {
    const input = `

vars {
      url:     http://localhost:3000   
  port: 3000
}

`;

    const output = parser(input);
    const expected = {
      "variables": [{
        "name": "url",
        "value": "http://localhost:3000",
        "enabled" : true,
        "secret": false
      }, {
        "name": "port",
        "value": "3000",
        "enabled" : true,
        "secret": false
      }]
    };

    expect(output).toEqual(expected);
  });

  it("should parse vars with empty values", () => {
    const input = `
vars {
  url: 
  phone: 
  api-key:
}
`;

    const output = parser(input);
    const expected = {
      "variables": [{
        "name": "url",
        "value": "",
        "enabled" : true,
        "secret": false
      }, {
        "name": "phone",
        "value": "",
        "enabled" : true,
        "secret": false
      }, {
        "name": "api-key",
        "value": "",
        "enabled" : true,
        "secret": false
      }]
    };

    expect(output).toEqual(expected);
  });

  it("should parse secret vars", () => {
    const input = `
vars {
  url: http://localhost:3000
}

vars:secret {
  token: abracadabra
}
`;

    const output = parser(input);
    const expected = {
      "variables": [{
        "name": "url",
        "value": "http://localhost:3000",
        "enabled" : true,
        "secret": false
      }, {
        "name": "token",
        "value": "abracadabra",
        "enabled" : true,
        "secret": true
      }]
    };

    expect(output).toEqual(expected);
  });
});
