import { controller, IAppController } from '@foal/core';
import { createConnection } from 'typeorm';

import { Sep10Controller } from './controllers';

export class AppController implements IAppController {
  subControllers = [
    controller('/api', Sep10Controller),
  ];

  async init() {
    await createConnection();
  }
}
