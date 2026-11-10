const { randomUUID } = require('crypto');
const db = require("../database/inMemoryDb");

class VehicleUsagesService {
  startUsage(data) {
    const { vehicleId, driverId, reason } = data;

    if (!vehicleId || !driverId || !reason) {
      throw new Error(
        "ID do veículo, ID do motorista e motivo são obrigatórios.",
      );
    }

    const vehicle = db.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) throw new Error("Veículo não encontrado.");

    if (vehicle.isEnable === false) {
      throw new Error("Este veículo está desativado e não pode ser utilizado.");
    }

    const driver = db.drivers.find((d) => d.id === driverId);
    if (!driver) throw new Error("Motorista não encontrado.");

    const isVehicleInUse = db.vehicleUsages.some(
      (usage) => usage.vehicleId === vehicleId && !usage.endDate,
    );
    if (isVehicleInUse) {
      throw new Error("Este veículo já está em uso por outro motorista.");
    }

    const isDriverInUse = db.vehicleUsages.some(
      (usage) => usage.driverId === driverId && !usage.endDate,
    );
    if (isDriverInUse) {
      throw new Error("Este motorista já está utilizando outro veículo.");
    }

    const{ isEnable, ...publicVehicle } = vehicle;
    const newUsage = {
      id: randomUUID(),
      vehicleId,
      vehicle: publicVehicle,
      driverId,
      driver: driver,
      reason,
      startDate: new Date().toISOString(),
      endDate: null,
    };

    db.vehicleUsages.push(newUsage);
    return newUsage;
  }

  finishUsage(id) {
    const usage = db.vehicleUsages.find((u) => u.id === id);

    if (!usage) {
      throw new Error("Registro de utilização não encontrado.");
    }

    if (usage.endDate) {
      throw new Error("Esta utilização já foi finalizada.");
    }

    usage.endDate = new Date().toISOString();

    return usage;
  }

  findAll() {
    return db.vehicleUsages;
  }
}

module.exports = new VehicleUsagesService();
