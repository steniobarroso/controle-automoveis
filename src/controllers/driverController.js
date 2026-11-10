const driverService = require("../services/driverService");

class DriverController {
  create(req, res) {
    try {
      const driver = driverService.create(req.body);
      return res.status(201).json(driver);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  list(req, res) {
    try {
      const drivers = driverService.findAll(req.query);
      return res.json(drivers);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  getById(req, res) {
    try {
      const driver = driverService.findById(req.params.id);
      return res.json(driver);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  update(req, res) {
    try {
      const driver = driverService.update(req.params.id, req.body);
      return res.json(driver);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  delete(req, res) {
    try {
      driverService.delete(req.params.id);
      return res.status(204).send(); // 204 No Content para exclusão física
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new DriverController();
