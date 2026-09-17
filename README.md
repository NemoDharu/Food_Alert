# Driving Simulation — Node.js

A clean, dependency-free command-line implementation of the Driving Simulation assignment.

## Requirements

- Node.js 18+ (the current LTS releases are recommended)
- No external npm packages are required.

## Run

```bash
./start.sh
```

If your environment does not preserve executable permissions:

```bash
bash start.sh
```

Or:

```bash
npm start
```

## Test

```bash
npm test
```

## How to use

1. Enter the field width and height, for example `10 10`.
2. Choose `1` to add a car.
3. Enter a unique car name.
4. Enter the initial position and direction, for example `1 2 N`.
5. Enter a command string containing only `L`, `R`, and `F`.
6. Add more cars if required.
7. Choose `2` to run the simulation.
8. Review the final positions or collision results.
9. Choose `1` to start a completely new simulation or `2` to exit.

Directions:

- `N` — North (+Y)
- `E` — East (+X)
- `S` — South (-Y)
- `W` — West (-X)

Commands:

- `L` — rotate 90° left
- `R` — rotate 90° right
- `F` — move forward one grid point

The field uses coordinates from `(0, 0)` through `(width - 1, height - 1)`.

## Design decisions and assumptions

### 1. Collision handling

Cars execute commands in synchronized steps. At each step, every car that still has a command executes its next command. A collision is recorded when two cars occupy the same coordinate after that step.

A collision does not terminate the whole simulation; the involved cars continue executing their remaining commands. This makes collision reporting deterministic and keeps the simulation useful for more than one collision.

If multiple cars arrive at the same coordinate on the same step, each affected car is reported as colliding with the other affected cars.

### 2. Boundary behavior

An `F` command that would leave the field is ignored. The car keeps its current position and continues with the next command.

### 3. Empty commands

An empty command string is accepted and leaves the car unchanged. This is useful for representing a car that does not move.

### 4. Input validation

Invalid field dimensions, duplicate names, coordinates outside the field, invalid directions, and unsupported commands are rejected with a clear message and the user is asked again.

### 5. State reset

The program keeps all state in memory only. Choosing `Start over` creates a new simulation, and stopping/restarting `start.sh` creates a fresh process. No cars or simulation state are persisted.

### 6. Example-session inconsistency

The supplied multiple-car example reports a collision at `(5,4)` at step 7, but the listed commands do not produce that exact result under the stated `F = one grid point` rules. This implementation follows the explicit movement rules rather than reproducing that inconsistent example.

For the single-car example, the implementation produces `(5,4) S`, matching the supplied expected result.

## Project structure

```text
driving-simulation-node/
├── src/
│   ├── car.js
│   ├── simulation.js
│   └── index.js
├── test/
│   ├── car.test.js
│   └── simulation.test.js
├── package.json
├── start.sh
├── README.md
└── .gitignore
```

## Engineering notes

The domain logic is separated from the CLI:

- `Car` owns position, direction, rotation, movement and command execution.
- `Simulation` owns the field, cars, synchronized execution and collision detection.
- `index.js` contains only CLI interaction and validation/retry flow.

This keeps the core logic independently testable and avoids coupling business rules to terminal input/output.
