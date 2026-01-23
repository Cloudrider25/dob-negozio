import * as migration_20260117_132940 from './20260117_132940';
import * as migration_20260122_114200 from './20260122_114200';
import * as migration_20260122_115200 from './20260122_115200';
import * as migration_20260122_121000 from './20260122_121000';
import * as migration_20260123_110000 from './20260123_110000';

export const migrations = [
  {
    up: migration_20260117_132940.up,
    down: migration_20260117_132940.down,
    name: '20260117_132940'
  },
  {
    up: migration_20260122_114200.up,
    down: migration_20260122_114200.down,
    name: '20260122_114200'
  },
  {
    up: migration_20260122_115200.up,
    down: migration_20260122_115200.down,
    name: '20260122_115200'
  },
  {
    up: migration_20260122_121000.up,
    down: migration_20260122_121000.down,
    name: '20260122_121000'
  },
  {
    up: migration_20260123_110000.up,
    down: migration_20260123_110000.down,
    name: '20260123_110000'
  },
];
