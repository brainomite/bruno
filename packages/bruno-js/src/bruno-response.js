class BrunoResponse {
  constructor(res) {
    this.res = res;
    this.status = res ? res.status : null;
    this.statusText = res ? res.statusText : null;
    this.headers = res ? res.headers : null;
    this.body = res ? res.data : null;
  }

  getStatus() {
    return this.res ? this.res.status : null;
  }

  getHeader(name) {
    return (this.res && this.res.headers) ? this.res.headers[name] : null;
  }

  getHeaders() {
    return this.res ? this.res.headers : null;
  }

  getBody() {
    return this.res ? this.res.data : null;
  }
}

module.exports = BrunoResponse;
