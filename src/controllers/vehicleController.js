const vehicleService = require("../services/vehicleService");

class VehicleController {
  create(req, res) {
    try {
      const vehicle = vehicleService.create(req.body);
      return res.status(201).json(vehicle);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  list(req, res) {
    try {
      const vehicles = vehicleService.findAll(req.query);
      return res.json(vehicles);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  getById(req, res) {
    try {
      const vehicle = vehicleService.findById(req.params.id);
      return res.json(vehicle);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  update(req, res) {
    try {
      const vehicle = vehicleService.update(req.params.id, req.body);
      return res.json(vehicle);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  delete(req, res) {
    try {
      vehicleService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new VehicleController();
