const test = require('ava');
const { v4: uuid } = require('uuid');
const { ServiceBroker } = require('moleculer');
const startCheckerMiddleware = require('..');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const onStartTimeout = () => {
  this.result = 'broker stopped with exit code 1';
};

test.beforeEach((t) => {
  const namespace = uuid();
  const broker = new ServiceBroker({
    namespace,
    middlewares: [startCheckerMiddleware(1000, onStartTimeout)],
    logLevel: 'none',
  });
  broker.createService({ name: `${namespace}_service1` });

  t.context.broker = namespace;
  t.context.broker = broker;
});

test.afterEach.always((t) => {
  return t.context.broker.stop();
});

test('start checker returns 0 when services start successfully', async (t) => {
  await t.context.broker.start();
  t.assert(!onStartTimeout.serviceStartTimeout);
});

test('start checker returns 1 when services do not start successfully before timeout', async (t) => {
  t.context.broker.createService({
    name: `${t.context.namespace}_service2`,
    async started() {
      await sleep(3000);
    },
  });
  await t.context.broker.start();
  t.assert(onStartTimeout.serviceStartTimeout);
  t.assert(this.result === 'broker stopped with exit code 1');
});
