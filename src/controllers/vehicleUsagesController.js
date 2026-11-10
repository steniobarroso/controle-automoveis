const vehicleUsagesService = require('../services/vehicleUsagesService');

class VehicleUsagesController {
  create(req, res) {
    try {
      const usage = vehicleUsagesService.startUsage(req.body);
      return res.status(201).json(usage);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  finish(req, res) {
    try {
      const usage = vehicleUsagesService.finishUsage(req.params.id);
      return res.json(usage);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  list(req, res) {
    try {
      const usages = vehicleUsagesService.findAll();
      return res.json(usages);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new VehicleUsagesController();