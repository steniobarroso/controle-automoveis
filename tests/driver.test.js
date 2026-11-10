const request = require("supertest");
const app = require("../src/app");
const db = require("../src/database/inMemoryDb");

// Função auxiliar para criar motorista mais rápido
const criarMotorista = async (name) => {
  return await request(app).post("/drivers").send({ name });
};

// Limpa o banco antes de cada teste
beforeEach(() => {
  db.vehicles.length = 0;
  db.drivers.length = 0;
  db.vehicleUsages.length = 0;
});

describe("Testes de CRUD de Motoristas", () => {
  it("Deve criar um motorista com sucesso", async () => {
    const response = await criarMotorista("João Silva");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("João Silva");
  });

  it("NÃO deve criar um motorista sem nome", async () => {
    const response = await request(app).post("/drivers").send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("O nome do motorista é obrigatório.");
  });

  it("Deve listar todos os motoristas", async () => {
    await criarMotorista("João");
    await criarMotorista("Maria");

    const response = await request(app).get("/drivers");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });

  it("Deve filtrar motoristas por nome", async () => {
    await criarMotorista("João Silva");
    await criarMotorista("Maria Souza");

    // Busca parcial (apenas "jo")
    const response = await request(app).get("/drivers?name=jo");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe("João Silva");
  });

  it("Deve buscar um motorista pelo ID", async () => {
    const driverRes = await criarMotorista("Carlos");
    const driverId = driverRes.body.id;

    const response = await request(app).get(`/drivers/${driverId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(driverId);
    expect(response.body.name).toBe("Carlos");
  });

  it("Deve atualizar um motorista com sucesso", async () => {
    const driverRes = await criarMotorista("Carlos");
    const driverId = driverRes.body.id;

    const response = await request(app)
      .put(`/drivers/${driverId}`)
      .send({ name: "Carlos Andrade" });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Carlos Andrade");
  });

  it("Deve excluir um motorista com sucesso (Hard Delete)", async () => {
    const driverRes = await criarMotorista("Carlos");
    const driverId = driverRes.body.id;

    // Deleta
    const deleteRes = await request(app).delete(`/drivers/${driverId}`);
    expect(deleteRes.status).toBe(204); // 204 No Content

    // Tenta buscar o motorista deletado (deve dar 404)
    const getRes = await request(app).get(`/drivers/${driverId}`);
    expect(getRes.status).toBe(404);
  });

  it("NÃO deve permitir excluir um motorista que está em uso", async () => {
    // 1. Cria o motorista e o veículo
    const driverRes = await criarMotorista("Carlos");
    const driverId = driverRes.body.id;

    const vehicleRes = await request(app).post("/vehicles").send({
      plate: "ABC-1234",
      color: "Preto",
      brand: "Fiat",
    });
    const vehicleId = vehicleRes.body.id;

    // 2. Inicia uma utilização (o Carlos pega o carro)
    await request(app).post("/usages").send({
      vehicleId: vehicleId,
      driverId: driverId,
      reason: "Viagem",
    });

    // 3. Tenta deletar o Carlos (deve dar erro 400)
    const deleteRes = await request(app).delete(`/drivers/${driverId}`);

    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.error).toBe(
      "Não é possível excluir um motorista que está utilizando um automóvel.",
    );
  });
});
