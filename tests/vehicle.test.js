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

describe("Testes criação atualização e deleção de veículos", () => {
  it("Deve Criar um veículo com sucesso", async () => {
    const vehicleRes = await criarVeiculo("ABC - 1235");
    expect(vehicleRes.status).toBe(201);
    expect(vehicleRes.body).toHaveProperty("id");
  });

  it("Não deve criar veículo com placa duplicada", async () => {
    await criarVeiculo("ABC - 1235");
    const vehicleRes = await criarVeiculo("ABC - 1235");

    expect(vehicleRes.status).toBe(400);
    expect(vehicleRes.body.error).toBe(
      "Já existe um veículo cadastrado com esta placa.",
    );
  });

  it("Deve Buscar veículos por id", async () => {
    const vehicleRes = await criarVeiculo("ABC - 1236");
    const vehicleId = vehicleRes.body.id;
    const response = await request(app).get(`/vehicles/${vehicleId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Deve Buscar todos os veículos", async () => {
    const vehicleRes = await criarVeiculo("ABC - 1236");
    const response = await request(app).get("/vehicles");

    // Verifica se é uma lista
    expect(Array.isArray(response.body)).toBe(true);
    // Verifica se a lista possui itens
    expect(response.body.length).toBe(1);
    // Verifica se o primeiro item da lista tem o id
    expect(response.body[0]).toHaveProperty("id");
  });

  //Teste de atualização(Update)
  it("Deve Atualizar um veículo com sucesso", async () => {
    const vehicleRes = await criarVeiculo("ABC - 1235");
    const vehicleId = vehicleRes.body.id;
    const vehicleUpdate = await request(app)
      .put(`/vehicles/${vehicleId}`)
      .send({
        plate: "ABC - 1236",
        color: "Branco",
        brand: "Fiat",
      });
    expect(vehicleUpdate.status).toBe(200);
    expect(vehicleUpdate.body).toHaveProperty("id");
  });

  it("Não pode duplicar placa ao atualizar", async () => {
    await criarVeiculo("ABC - 1234");
    const vehicleRes = await criarVeiculo("ABC - 1235");
    const vehicleId = vehicleRes.body.id;
    const vehicleUpdate = await request(app)
      .put(`/vehicles/${vehicleId}`)
      .send({
        plate: "ABC - 1234",
        color: "Branco",
        brand: "Fiat",
      });
    expect(vehicleUpdate.status).toBe(400);
    expect(vehicleUpdate.body.error).toBe(
      "Já existe um veículo cadastrado com esta placa.",
    );
  });

  it("Deve fazer o soft delete de um veículo", async () => {
    const vehicleRes = await criarVeiculo("ABC - 1235");
    const vehicleId = vehicleRes.body.id;
    const vehicleDelete = await request(app).delete(`/vehicles/${vehicleId}`);
    expect(vehicleDelete.status).toBe(204);
  });

  it("Deve desfazer o soft delete de um veículo", async () => {
    const vehicleRes = await criarVeiculo("ABC - 1235");
    const vehicleId = vehicleRes.body.id;

    // Deleta o veículo
    await request(app).delete(`/vehicles/${vehicleId}`);

    // Reverte o soft delete do veículo
    const vehicleUpdate = await request(app)
      .put(`/vehicles/${vehicleId}`)
      .send({
        plate: "ABC - 1235",
        color: "Branco",
        brand: "Fiat",
        isEnable: true, // Reativando o veículo
      });
    expect(vehicleUpdate.status).toBe(200);
    expect(vehicleUpdate.body).toHaveProperty("id");
  });

  it("Deve buscar todos os veículos por cor", async () => {
    //Veículo Preto
    await request(app).post("/vehicles").send({
      plate: "XYZ - 9876",
      color: "Preto",
      brand: "Fiat",
    });

    // Veículo Branco
    await request(app).post("/vehicles").send({
      plate: "XYZ - 9878",
      color: "Branco",
      brand: "Fiat",
    });

    await request(app).post("/vehicles").send({
      plate: "XYZ - 9868",
      color: "Preto",
      brand: "Fiesta",
    });

    // 2. Faz a busca FILTRANDO por cor
    const response = await request(app).get("/vehicles?color=Preto");

    expect(response.status).toBe(200);
    // Verifica se é uma lista
    expect(Array.isArray(response.body)).toBe(true);

    // Verifica se o length é maior que 1
    expect(response.body.length).toBeGreaterThan(1);

    // Verifica se o item que voltou é realmente o Preto
    expect(response.body[0].color).toBe("Preto");

    //Verifica se tem outro veículo Preto
    expect(response.body[1].color).toBe("Preto");
  });

  it("Deve buscar todos os veículos por marca", async () => {
    // 1. Cria o cenário de teste
    // Veículo 1: Fiat
    await request(app).post("/vehicles").send({
      plate: "XYZ - 1111",
      color: "Preto",
      brand: "Fiat",
    });

    // Veículo 2: Fiat (para termos mais de um)
    await request(app).post("/vehicles").send({
      plate: "XYZ - 2222",
      color: "Branco",
      brand: "Fiat",
    });

    // Veículo 3: Ford (para provar que o filtro não traz ele)
    await request(app).post("/vehicles").send({
      plate: "XYZ - 3333",
      color: "Preto",
      brand: "Ford",
    });

    // 2. Faz a busca FILTRANDO por marca
    const response = await request(app).get("/vehicles?brand=Fiat");

    // 3. Verificações
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // O length deve ser 2 (apenas os dois Fiats)
    expect(response.body.length).toBe(2);

    // Verifica se ambos os itens são da marca Fiat
    expect(response.body[0].brand).toBe("Fiat");
    expect(response.body[1].brand).toBe("Fiat");
  });

  it("Deve buscar veículos combinando cor e marca", async () => {
    //Veículo 1: Fiat Preto
    await request(app).post("/vehicles").send({
      plate: "XYZ - 1111",
      color: "Preto",
      brand: "Fiat",
    });

    //Veículo 2: Fiat Branco
    await request(app).post("/vehicles").send({
      plate: "XYZ - 2222",
      color: "Branco",
      brand: "Fiat",
    });
    //Veículo 3: Ford Preto
    await request(app).post("/vehicles").send({
      plate: "XYZ - 3333",
      color: "Preto",
      brand: "Ford",
    });
    //Veículo 4: Fiat Preto
    await request(app).post("/vehicles").send({
      plate: "XYZ - 4444",
      color: "Preto",
      brand: "Fiat",
    });

    //Veículo 5: Ford Branco
    await request(app).post("/vehicles").send({
      plate: "XYZ - 5555",
      color: "Branco",
      brand: "Ford",
    });
    //Veículo 6: Fiat Preto
    await request(app).post("/vehicles").send({
      plate: "XYZ - 6666",
      color: "Preto",
      brand: "Fiat",
    });

    // 2. Faz a busca FILTRANDO por marca e cor juntos
    // Repare no '&' unindo os parâmetros na URL
    const response = await request(app).get("/vehicles?brand=Fiat&color=Preto");

    // 3. Verificações
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Deve retornar 3 veículos (Fiat Preto)
    expect(response.body.length).toBeGreaterThan(1);

    // Verifica se o item que voltou é realmente o Fiat Preto
    expect(response.body[0].brand).toBe("Fiat");
    expect(response.body[0].color).toBe("Preto");

    expect(response.body[1].brand).toBe("Fiat");
    expect(response.body[1].color).toBe("Preto");

    expect(response.body[2].brand).toBe("Fiat");
    expect(response.body[2].color).toBe("Preto");
  });

  it("NÃO deve permitir desativar um veículo que está em uso", async () => {
    // 1. Cria o veículo e o motorista
    const vehicleRes = await request(app).post("/vehicles").send({
      plate: "XYZ-9876",
      color: "Preto",
      brand: "Fiat",
    });
    const vehicleId = vehicleRes.body.id;

    const driverRes = await request(app).post("/drivers").send({
      name: "Carlos",
    });
    const driverId = driverRes.body.id;

    // 2. Inicia uma utilização (o Carlos pega o carro)
    await request(app).post("/usages").send({
      vehicleId: vehicleId,
      driverId: driverId,
      reason: "Viagem a trabalho",
    });

    // 3. Tenta desativar o veículo (deve dar erro 400)
    const deleteRes = await request(app).delete(`/vehicles/${vehicleId}`);

    // 4. Verificações
    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.error).toBe(
      "Não é possível excluir um veículo que está em uso.",
    );
  });
});
