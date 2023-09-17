const Store = require('electron-store');
const _ = require('lodash');

class EnvironmentSecretsStore {
  constructor() {
    this.store = new Store({
      name: 'preferences',
      clearInvalidConfig: true
    });
  }

  get(name) {
    return this.store.get(name) || {};
  }

  create(name) {
    this.store.set(name, {});
  }

  save(environment) {
    const variables = _.get(environment, 'variables', []);
    console.log('variables', variables);
    const vars = {};

    variables
      .filter((variable) => {
        const { secret } = variable;
        return secret;
      })
      .reduce((obj, variable) => {
        const { name, value, enabled } = variable;
        const prefix = enabled ? '' : '~';
        obj[`${prefix}${name}`] = value;
        return obj;
      }, vars);

    console.log('secrets', vars);
    this.store.set(environment.name, vars);
  }

  rename(oldName, newName) {
    const secrets = this.get(oldName);
    this.store.set(newName, secrets);
    this.delete(oldName);
  }

  delete(name) {
    this.store.delete(name);
  }
}

module.exports = EnvironmentSecretsStore;
