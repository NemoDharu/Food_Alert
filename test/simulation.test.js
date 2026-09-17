import test from "node:test";
import assert from "node:assert/strict";
import { Car } from "../src/car.js";
import { Simulation } from "../src/simulation.js";

test("single-car example ends at (5,4) facing South", () => {
  const simulation = new Simulation(10, 10);
  simulation.addCar(new Car("A", 1, 2, "N", "FFRFFFFRRL"));

  const result = simulation.run();

  assert.deepEqual(result.cars, [
    { name: "A", x: 5, y: 4, direction: "S" }
  ]);
  assert.deepEqual(result.collisions, []);
});

test("supports multiple cars and detects a same-step collision", () => {
  const simulation = new Simulation(10, 10);
  simulation.addCar(new Car("A", 0, 0, "E", "FFF"));
  simulation.addCar(new Car("B", 4, 0, "W", "F"));

  const result = simulation.run();

  assert.deepEqual(result.collisions, [
    { car: "A", otherCar: "B", x: 3, y: 0, step: 3 },
    { car: "B", otherCar: "A", x: 3, y: 0, step: 3 }
  ]);
});

test("out-of-bounds movement does not move the car", () => {
  const simulation = new Simulation(2, 2);
  simulation.addCar(new Car("A", 0, 0, "S", "F"));

  const result = simulation.run();

  assert.deepEqual(result.cars[0], {
    name: "A", x: 0, y: 0, direction: "S"
  });
});

test("rejects duplicate car names", () => {
  const simulation = new Simulation(5, 5);
  simulation.addCar(new Car("A", 0, 0, "N"));

  assert.throws(
    () => simulation.addCar(new Car("A", 1, 1, "N")),
    /already exists/
  );
});

test("rejects invalid starting coordinates", () => {
  const simulation = new Simulation(5, 5);

  assert.throws(
    () => simulation.addCar(new Car("A", 5, 0, "N")),
    /must start inside/
  );
});

test("rejects invalid commands", () => {
  const simulation = new Simulation(5, 5);

  assert.throws(
    () => simulation.addCar(new Car("A", 0, 0, "N", "FX")),
    /may contain only/
  );
});

test("reset removes all cars", () => {
  const simulation = new Simulation(5, 5);
  simulation.addCar(new Car("A", 0, 0, "N"));
  simulation.reset();
  assert.equal(simulation.cars.length, 0);
});
