const { randomUUID } = require("crypto");
const db = require("../database/inMemoryDb");

class vehicleService {
  create(data) {
    const { plate, color, brand, isEnable } = data;

    if (!plate || !color || !brand) {
      throw new Error("Placa, cor e marca são obrigatórios.");
    }

    const vehicleExists = db.vehicles.find((v) => v.plate === plate);
    if (vehicleExists) {
      throw new Error("Já existe um veículo cadastrado com esta placa.");
    }

    const newVehicle = {
      id: randomUUID(),
      plate,
      color,
      brand,
      isEnable: isEnable !== undefined ? isEnable : true,
    };

    db.vehicles.push(newVehicle);
    const { isEnable: ignorarIsEnable, ...publicVehicle } = newVehicle;
    return publicVehicle;
  }

  findAll(filters) {
    let result = db.vehicles;

    if (filters.color) {
      result = result.filter(
        (v) => v.color.toLowerCase() === filters.color.toLowerCase(),
      );
    }
    if (filters.brand) {
      result = result.filter(
        (v) => v.brand.toLowerCase() === filters.brand.toLowerCase(),
      );
    }
    result = result.filter((v) => v.isEnable === true);
    const publicVehicles = result.map((v) => {
      const { isEnable: _, ...publicVehicle } = v;
      return publicVehicle;
    });

    return publicVehicles;
  }

  findById(id) {
    const vehicles = db.vehicles;
    const vehicle = db.vehicles.find((v) => v.id === id && v.isEnable === true);
    if (!vehicle) throw new Error("Veículo não encontrado.");
    const { isEnable, ...publicVehicle } = vehicle;
    return publicVehicle;
  }

  update(id, data) {
    const { plate } = data;

    const vehicleIndex = db.vehicles.findIndex((v) => v.id === id);
    if (vehicleIndex === -1) throw new Error("Veículo não encontrado.");

    const vehicleExists = db.vehicles.find(
      (v) => v.plate === plate && v.id !== id,
    );
    if (vehicleExists) {
      throw new Error("Já existe um veículo cadastrado com esta placa.");
    }
    // Adicione este log para depuração
    const updatedVehicle = { ...db.vehicles[vehicleIndex], ...data };
    db.vehicles[vehicleIndex] = updatedVehicle;
    const { isEnable: ignorarIsEnable, ...publicVehicle } = updatedVehicle;
    return publicVehicle;
  }

  delete(id) {
    const vehicle = db.vehicles.find((v) => v.id === id);
    if (!vehicle) throw new Error("Veículo não encontrado.");

    const isInUse = db.vehicleUsages.some(
      (op) => op.vehicleId === id && !op.endDate,
    );
    if (isInUse)
      throw new Error("Não é possível excluir um veículo que está em uso.");

    vehicle.isEnable = false;
    return true;
  }
}

module.exports = new vehicleService();
