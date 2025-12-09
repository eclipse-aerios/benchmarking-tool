const attributesTypes = (function() {
  return Object.freeze({
    PROPERTY: 'Property',
    RELATIONSHIP: 'Relationship',
  });
})();

const categoryTypes = (function() {
  return Object.freeze({
    CPU: 'CPU',
    MEMORY: 'Memory',
    STORAGE: 'Storage',
    NETWORK: 'Network',
  });
})();

const statusTypes = (function() {
  return Object.freeze({
    RUNNING: 'running',
    FINISHED: 'finished',
    ERROR: 'error',
  });
})();

module.exports = {
  attributesTypes,
  categoryTypes,
  statusTypes
}