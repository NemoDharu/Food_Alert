import test from "node:test";
import assert from "node:assert/strict";
import { Car } from "../src/car.js";

test("rotates left through all directions", () => {
  const car = new Car("A", 0, 0, "N");
  car.rotateLeft();
  assert.equal(car.direction, "W");
  car.rotateLeft();
  assert.equal(car.direction, "S");
  car.rotateLeft();
  assert.equal(car.direction, "E");
  car.rotateLeft();
  assert.equal(car.direction, "N");
});

test("rotates right through all directions", () => {
  const car = new Car("A", 0, 0, "N");
  car.rotateRight();
  assert.equal(car.direction, "E");
  car.rotateRight();
  assert.equal(car.direction, "S");
  car.rotateRight();
  assert.equal(car.direction, "W");
  car.rotateRight();
  assert.equal(car.direction, "N");
});

test("moves forward according to direction", () => {
  const car = new Car("A", 1, 1, "N");
  car.execute("F", 10, 10);
  assert.deepEqual(car.snapshot(), { name: "A", x: 1, y: 2, direction: "N" });

  car.rotateRight();
  car.execute("F", 10, 10);
  assert.deepEqual(car.snapshot(), { name: "A", x: 2, y: 2, direction: "E" });
});

test("ignores forward movement outside the boundary", () => {
  const car = new Car("A", 0, 0, "S");
  const moved = car.execute("F", 10, 10);
  assert.equal(moved, false);
  assert.equal(car.x, 0);
  assert.equal(car.y, 0);
});

test("consumes commands one at a time", () => {
  const car = new Car("A", 1, 2, "N", "FFR");
  assert.equal(car.nextCommand(), "F");
  assert.equal(car.nextCommand(), "F");
  assert.equal(car.nextCommand(), "R");
  assert.equal(car.nextCommand(), null);
});
