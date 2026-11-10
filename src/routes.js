const { Router } = require('express');
const vehicleController = require('./controllers/vehicleController');
const driverController = require('./controllers/driverController');
const vehicleUsagesController = require('./controllers/vehicleUsagesController');


const routes = Router();

routes.post('/vehicles', (req, res) => vehicleController.create(req, res));
routes.get('/vehicles', (req, res) => vehicleController.list(req, res));
routes.get('/vehicles/:id', (req, res) => vehicleController.getById(req, res));
routes.put('/vehicles/:id', (req, res) => vehicleController.update(req, res));
routes.delete('/vehicles/:id', (req, res) => vehicleController.delete(req, res));

routes.post('/drivers', (req, res) => driverController.create(req, res));
routes.get('/drivers', (req, res) => driverController.list(req, res));
routes.get('/drivers/:id', (req, res) => driverController.getById(req, res));
routes.put('/drivers/:id', (req, res) => driverController.update(req, res));
routes.delete('/drivers/:id', (req, res) => driverController.delete(req, res));

routes.post('/usages', (req, res) => vehicleUsagesController.create(req, res));
routes.put('/usages/:id/finish', (req, res) => vehicleUsagesController.finish(req, res));
routes.get('/usages', (req, res) => vehicleUsagesController.list(req, res));

module.exports = routes;