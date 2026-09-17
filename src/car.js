const DIRECTIONS = ["N", "E", "S", "W"];

const DELTAS = {
  N: { x: 0, y: 1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: -1 },
  W: { x: -1, y: 0 }
};

export class Car {
  constructor(name, x, y, direction, commands = "") {
    this.name = name;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.commands = commands;
    this.commandIndex = 0;
  }

  rotateLeft() {
    const index = DIRECTIONS.indexOf(this.direction);
    this.direction = DIRECTIONS[(index + DIRECTIONS.length - 1) % DIRECTIONS.length];
  }

  rotateRight() {
    const index = DIRECTIONS.indexOf(this.direction);
    this.direction = DIRECTIONS[(index + 1) % DIRECTIONS.length];
  }

  nextCommand() {
    if (this.commandIndex >= this.commands.length) {
      return null;
    }
    return this.commands[this.commandIndex++];
  }

  execute(command, width, height) {
    switch (command) {
      case "L":
        this.rotateLeft();
        return true;
      case "R":
        this.rotateRight();
        return true;
      case "F":
        return this.moveForward(width, height);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  moveForward(width, height) {
    const delta = DELTAS[this.direction];
    const nextX = this.x + delta.x;
    const nextY = this.y + delta.y;

    if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
      return false;
    }

    this.x = nextX;
    this.y = nextY;
    return true;
  }

  positionKey() {
    return `${this.x},${this.y}`;
  }

  snapshot() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      direction: this.direction
    };
  }
}

export { DIRECTIONS };
