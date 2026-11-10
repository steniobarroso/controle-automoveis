const { randomUUID } = require("crypto");
const db = require("../database/inMemoryDb");

class DriverService {
  create(data) {
    const { name } = data;

    if (!name) {
      throw new Error("O nome do motorista é obrigatório.");
    }

    const newDriver = {
      id: randomUUID(),
      name,
    };
    db.drivers.push(newDriver);

    return newDriver;
  }

  findAll(filters) {
    let result = db.drivers;

    if (filters.name) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(filters.name.toLowerCase()),
      );
    }
    return result;
  }

  findById(id) {
    const driver = db.drivers.find((d) => d.id === id);
    if (!driver) {
      throw new Error("Motorista não encontrado.");
    }
    return driver;
  }

  update(id, data) {
    const driverIndex = db.drivers.findIndex((d) => d.id === id);
    if (driverIndex === -1) {
      throw new Error("Motorista não encontrado.");
    }

    const updatedDriver = { ...db.drivers[driverIndex], ...data };
    db.drivers[driverIndex] = updatedDriver;

    return updatedDriver;
  }

  delete(id) {
    const driverIndex = db.drivers.findIndex((d) => d.id === id);

    if (driverIndex === -1) {
      throw new Error("Motorista não encontrado.");
    }

    // Regra de negócio: Não pode excluir motorista que está usando carro
    const isUsingCar = db.vehicleUsages.some(
      (op) => op.driverId === id && !op.endDate,
    );
    if (isUsingCar) {
      throw new Error(
        "Não é possível excluir um motorista que está utilizando um automóvel.",
      );
    }

    // Exclusão física do array
    db.drivers.splice(driverIndex, 1);
    return true;
  }
}

module.exports = new DriverService();
