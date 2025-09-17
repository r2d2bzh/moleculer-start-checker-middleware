import test from 'ava';
import { v4 as uuid } from 'uuid';
import { ServiceBroker } from 'moleculer';
import startCheckerMiddleware from '../index.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startTimeout = (t) => () => {
  t.context.broker.result = 'broker stopped with exit code 1';
};

test.beforeEach((t) => {
  const namespace = uuid();
  t.context.onStartTimeout = startTimeout(t);
  const broker = new ServiceBroker({
    namespace,
    middlewares: [startCheckerMiddleware(1000, t.context.onStartTimeout)],
    logLevel: 'none',
  });
  broker.createService({ name: `${namespace}_service1` });

  t.context.namespace = namespace;
  t.context.broker = broker;
});

test.afterEach.always((t) => {
  return t.context.broker.stop();
});

test('start checker returns 0 when services start successfully', async (t) => {
  await t.context.broker.start();
  t.assert(!t.context.onStartTimeout.serviceStartTimeout);
});

test.only('start checker returns 1 when services do not start successfully before timeout', async (t) => {
  t.context.broker.createService({
    name: `${t.context.namespace}_service2`,
    async started() {
      await sleep(3000);
    },
  });
  await t.context.broker.start();
  t.assert(t.context.onStartTimeout.serviceStartTimeout);
  t.assert(t.context.broker.result === 'broker stopped with exit code 1');
});
