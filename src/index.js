import readline from "node:readline";
import { Car } from "./car.js";
import { Simulation } from "./simulation.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = question => new Promise(resolve => rl.question(question, resolve));

function parseDimensions(input) {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 2) {
    throw new Error("Please enter width and height in `x y` format.");
  }

  const width = Number(parts[0]);
  const height = Number(parts[1]);

  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("Width and height must be positive integers.");
  }

  return { width, height };
}

function parseCarPosition(input) {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 3) {
    throw new Error("Please enter position in `x y Direction` format.");
  }

  const x = Number(parts[0]);
  const y = Number(parts[1]);
  const direction = parts[2].toUpperCase();

  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    throw new Error("X and Y must be integers.");
  }

  if (!["N", "E", "S", "W"].includes(direction)) {
    throw new Error("Direction must be N, E, S, or W.");
  }

  return { x, y, direction };
}

function printCars(cars) {
  if (cars.length === 0) {
    console.log("- No cars registered.");
    return;
  }

  for (const car of cars) {
    const commands = car.commands ?? "";
    console.log(`- ${car.name}, (${car.x},${car.y}) ${car.direction}, ${commands}`);
  }
}

async function createSimulation() {
  while (true) {
    console.log("\n=== Driving Simulation ===");
    console.log("Enter the field dimensions.");

    try {
      const dimensions = parseDimensions(
        await ask("Field width and height (x y): ")
      );
      return new Simulation(dimensions.width, dimensions.height);
    } catch (error) {
      console.log(`Invalid input: ${error.message}`);
    }
  }
}

async function addCar(simulation) {
  try {
    const name = (await ask("Car name: ")).trim();
    if (!name) {
      throw new Error("Car name cannot be empty.");
    }

    const position = parseCarPosition(
      await ask(`Initial position of car ${name} (x y Direction): `)
    );

    const commands = (await ask(`Commands for car ${name} (L/R/F): `))
      .trim()
      .toUpperCase();

    if (!/^[LRF]*$/.test(commands)) {
      throw new Error("Commands may contain only L, R, and F.");
    }

    const car = new Car(
      name,
      position.x,
      position.y,
      position.direction,
      commands
    );

    simulation.addCar(car);

    console.log("\nCurrent list of cars:");
    printCars(simulation.listCars());
  } catch (error) {
    console.log(`Unable to add car: ${error.message}`);
  }
}

function printResult(result) {
  console.log("\nAfter simulation, the result is:");

  if (result.collisions.length === 0) {
    for (const car of result.cars) {
      console.log(`- ${car.name}, (${car.x},${car.y}) ${car.direction}`);
    }
    return;
  }

  const printed = new Set();
  for (const collision of result.collisions) {
    const key = [
      Math.min(collision.car, collision.otherCar),
      Math.max(collision.car, collision.otherCar),
      collision.x,
      collision.y,
      collision.step
    ].join("|");

    if (!printed.has(key)) {
      printed.add(key);
      console.log(
        `- ${collision.car}, collides with ${collision.otherCar} at ` +
        `(${collision.x},${collision.y}) at step ${collision.step}`
      );
    }
  }
}

async function main() {
  console.log("Welcome to Driving Simulation!");

  let simulation = await createSimulation();

  while (true) {
    console.log("\nPlease choose from the following options:");
    console.log("[1] Add a car to field");
    console.log("[2] Run simulation");

    const choice = (await ask("Choice: ")).trim();

    if (choice === "1") {
      await addCar(simulation);
      continue;
    }

    if (choice === "2") {
      if (simulation.cars.length === 0) {
        console.log("Please add at least one car before running the simulation.");
        continue;
      }

      console.log("\nYour current list of cars are:");
      printCars(simulation.listCars());

      const result = simulation.run();
      printResult(result);

      console.log("\nWhat would you like to do?");
      console.log("[1] Start over");
      console.log("[2] Exit");

      const next = (await ask("Choice: ")).trim();

      if (next === "1") {
        simulation = await createSimulation();
        continue;
      }

      if (next === "2") {
        break;
      }

      console.log("Invalid choice. Exiting to avoid accidental repeated execution.");
      break;
    }

    console.log("Please choose 1 or 2.");
  }

  rl.close();
  console.log("\nThank you for running the simulation. Goodbye!");
}

main().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  rl.close();
  process.exitCode = 1;
});
