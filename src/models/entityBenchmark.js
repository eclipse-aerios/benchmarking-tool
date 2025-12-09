const { attributesTypes, categoryTypes, statusTypes } = require('./enums');

class EntityBenchmark {
  // Method to update the status of the benchmark
  constructor(id, category, infrastructureElementId) {
    this.id = `urn:ngsi-ld:Benchmark:${id}`;
    this.type = "Benchmark";

    if (infrastructureElementId) {
      this.infrastructureElement = {
        type: attributesTypes.RELATIONSHIP,
        object: infrastructureElementId
      };
    }

    this.category = {
      type: attributesTypes.PROPERTY,
      value: category
    };

    this.data = {
      type: attributesTypes.PROPERTY,
      value: {}
    };

    this.status = {
      type: attributesTypes.PROPERTY,
      value: statusTypes.RUNNING
    };

    this.error = {
      type: attributesTypes.PROPERTY,
      value: {}
    };
  }

  updateData(newData) {
    if (typeof newData === 'object') {
      this.data.value = newData;
    } else {
      throw new Error('Invalid data type');
    }
  }

  updateStatus(newStatus) {
    if (Object.values(statusTypes).includes(newStatus)) {
      this.status.value = newStatus;
    } else {
      throw new Error('Invalid status type');
    }
  }

  addError(errorMessage) {
    if (typeof errorMessage === 'string' && errorMessage.length > 0) {
      this.error.value.message = errorMessage;
    } else {
      throw new Error('Invalid error message');
    }
  }
}

module.exports = EntityBenchmark;
