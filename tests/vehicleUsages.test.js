const request = require("supertest");
const app = require("../src/app"); // Importa o seu app Express
const db = require("../src/database/inMemoryDb"); // Importa o banco para limpar entre os testes

// Antes de cada teste, limpamos o banco de dados em memória
beforeEach(() => {
  db.vehicles = [];
  db.drivers = [];
  db.vehicleUsages = [];
});

const criarVeiculo = async (plate = "ABC-1234") => {
  return await request(app).post("/vehicles").send({
    plate,
    color: "Preto",
    brand: "Fiat",
  });
};

describe("Testes de Regras de Negócio - Utilização de Veículos", () => {
  it("Deve ser possível iniciar uma utilização se o veículo e o motorista estiverem livres", async () => {
    // 1. Criar um veículo e um motorista
    const vehicleRes = await criarVeiculo("ABC - 1235");

    const driverRes = await request(app)
      .post("/drivers")
      .send({ name: "João Silva" });

    // 2. Iniciar a utilização
    const response = await request(app).post("/usages").send({
      vehicleId: vehicleRes.body.id,
      driverId: driverRes.body.id,
      reason: "Viagem a trabalho",
    });

    expect(response.status).toBe(201); // Status Criado
    expect(response.body).toHaveProperty("id");
    expect(response.body.endDate).toBeNull(); // Ainda não finalizado
  });

  it("NÃO deve permitir que o mesmo veículo seja usado por dois motoristas ao mesmo tempo", async () => {
    const vehicleRes = await criarVeiculo("ABC - 1235");
    const driver1 = await request(app).post("/drivers").send({ name: "João" });
    const driver2 = await request(app).post("/drivers").send({ name: "Maria" });

    // João pega o carro
    await request(app).post("/usages").send({
      vehicleId: vehicleRes.body.id,
      driverId: driver1.body.id,
      reason: "Uso 1",
    });

    // Maria tenta pegar o MESMO carro
    const response = await request(app).post("/usages").send({
      vehicleId: vehicleRes.body.id,
      driverId: driver2.body.id,
      reason: "Uso 2",
    });

    // Verificação: Deve dar erro 400 com a mensagem correta
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Este veículo já está em uso por outro motorista.",
    );
  });

  it("NÃO deve permitir que o mesmo motorista use dois veículos ao mesmo tempo", async () => {
    const vehicle1 = await request(app)
      .post("/vehicles")
      .send({ plate: "ABC-1234", color: "Preto", brand: "Fiat" });
    const vehicle2 = await request(app)
      .post("/vehicles")
      .send({ plate: "XYZ-5678", color: "Branco", brand: "VW" });
    const driver = await request(app).post("/drivers").send({ name: "João" });

    // João pega o Carro 1
    await request(app).post("/usages").send({
      vehicleId: vehicle1.body.id,
      driverId: driver.body.id,
      reason: "Uso 1",
    });

    // João tenta pegar o Carro 2
    const response = await request(app).post("/usages").send({
      vehicleId: vehicle2.body.id,
      driverId: driver.body.id,
      reason: "Uso 2",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Este motorista já está utilizando outro veículo.",
    );
  });

  it("Deve ser possível finalizar uma utilização e o veículo ficar livre novamente", async () => {
    const vehicle = await request(app)
      .post("/vehicles")
      .send({ plate: "ABC-1234", color: "Preto", brand: "Fiat" });
    const driver = await request(app).post("/drivers").send({ name: "João" });

    // Inicia o uso
    const usage = await request(app).post("/usages").send({
      vehicleId: vehicle.body.id,
      driverId: driver.body.id,
      reason: "Uso",
    });

    // Finaliza o uso
    const finishResponse = await request(app).put(
      `/usages/${usage.body.id}/finish`,
    );

    expect(finishResponse.status).toBe(200);
    expect(finishResponse.body.endDate).not.toBeNull();

    // Tenta usar o mesmo veículo de novo com outro motorista (deve funcionar agora)
    const driver2 = await request(app).post("/drivers").send({ name: "Maria" });
    const newUsageResponse = await request(app).post("/usages").send({
      vehicleId: vehicle.body.id,
      driverId: driver2.body.id,
      reason: "Novo uso",
    });

    expect(newUsageResponse.status).toBe(201); // Passou!
  });

  it("NÃO deve permitir usar um veículo que foi desativado (Soft Delete)", async () => {
    const vehicle = await request(app)
      .post("/vehicles")
      .send({ plate: "ABC-1234", color: "Preto", brand: "Fiat" });
    const driver = await request(app).post("/drivers").send({ name: "João" });

    // Desativa o veículo
    await request(app).delete(`/vehicles/${vehicle.body.id}`);

    // Tenta iniciar uma utilização
    const response = await request(app).post("/usages").send({
      vehicleId: vehicle.body.id,
      driverId: driver.body.id,
      reason: "Teste",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Este veículo está desativado e não pode ser utilizado.",
    );
  });

});
