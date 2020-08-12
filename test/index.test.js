const test = require("ava");
const { v4: uuid } = require("uuid");
const { ServiceBroker } = require("moleculer");
const startCheckerMiddleware = require("..");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const onStartTimeout = () => {
  this.result = `broker stopped with exit code 1`;
};

const createBrokerAndService = ({ namespace, timeoutMs = 2000 }) => {
  const broker = new ServiceBroker({
    namespace,
    middlewares: [startCheckerMiddleware(timeoutMs, onStartTimeout)],
  });
  broker.createService({ name: `${namespace}_service1` });
  return broker;
};

test("startcheck returns 0 when services start successfully", async (t) => {
  const broker = createBrokerAndService({ namespace: uuid() });
  await broker.start();
  await broker.stop();
  t.assert(!onStartTimeout.serviceStartTimeout);
});

test("startcheck returns 1 when services do not start successfully before timeout", async (t) => {
  const namespace = uuid();
  const broker = createBrokerAndService({ namespace });
  broker.createService({
    name: `${namespace}_service2`,
    async started() {
      await sleep(3000);
    },
  });

  await broker.start();
  t.assert(onStartTimeout.serviceStartTimeout);

  t.assert(this.result === `broker stopped with exit code 1`);
});
