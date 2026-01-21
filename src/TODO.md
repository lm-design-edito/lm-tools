# To do

- [ ] Migrate to v3 of aws-sdk (then remove workaround plugin in lm-publisher)
- [ ] Get rid of namespaces (import * as Thing from './thing/index.js' instead, dont worry about types not being imported that way)
  - Or maybe... get rid of reexports?
- [ ] JSDOC everywhere
- [ ] Write tests for everything
- [ ] Really not sure about the centralized error codes
- [ ] create empty (export {}) index.js files in directories without index files so that import is easyer on the consumer side
