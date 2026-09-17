export class Simulation {
  constructor(width, height) {
    if (!Number.isInteger(width) || width <= 0) {
      throw new Error("Field width must be a positive integer.");
    }
    if (!Number.isInteger(height) || height <= 0) {
      throw new Error("Field height must be a positive integer.");
    }

    this.width = width;
    this.height = height;
    this.cars = [];
  }

  addCar(car) {
    if (this.cars.some(existing => existing.name === car.name)) {
      throw new Error(`A car named "${car.name}" already exists.`);
    }

    if (
      car.x < 0 || car.x >= this.width ||
      car.y < 0 || car.y >= this.height
    ) {
      throw new Error(
        `Car "${car.name}" must start inside the field (0-${this.width - 1}, 0-${this.height - 1}).`
      );
    }

    if (!["N", "E", "S", "W"].includes(car.direction)) {
      throw new Error(`Invalid direction "${car.direction}".`);
    }

    if (!/^[LRF]*$/.test(car.commands)) {
      throw new Error(`Commands for "${car.name}" may contain only L, R, and F.`);
    }

    this.cars.push(car);
  }

  listCars() {
    return this.cars.map(car => ({
      ...car.snapshot(),
      commands: car.commands
    }));
  }

  run() {
    const collisions = [];
    const maxSteps = Math.max(0, ...this.cars.map(car => car.commands.length));

    for (let step = 1; step <= maxSteps; step += 1) {
      for (const car of this.cars) {
        const command = car.nextCommand();
        if (command !== null) {
          car.execute(command, this.width, this.height);
        }
      }

      const positions = new Map();

      for (const car of this.cars) {
        const key = car.positionKey();
        if (!positions.has(key)) {
          positions.set(key, []);
        }
        positions.get(key).push(car);
      }

      for (const [position, carsAtPosition] of positions) {
        if (carsAtPosition.length > 1) {
          for (const car of carsAtPosition) {
            for (const other of carsAtPosition) {
              if (car !== other) {
                collisions.push({
                  car: car.name,
                  otherCar: other.name,
                  x: car.x,
                  y: car.y,
                  step
                });
              }
            }
          }
        }
      }
    }

    return {
      cars: this.cars.map(car => car.snapshot()),
      collisions
    };
  }

  reset() {
    this.cars = [];
  }
}
