/**
The middleware name is left out of this type as Moleculer's Middleware type only allows hooks
@typedef {object} StartCheckerMiddleware
@property {(broker: any) => void} starting
@property {() => void} started
@property {() => void} stopping
@property {() => void} stopped
*/

/**
@param {number} [timeoutMs]
@param {() => void} [onStartTimeout] Called once the broker is stopped because of the timeout
@returns {StartCheckerMiddleware}
*/
// eslint-disable-next-line unicorn/no-process-exit
export default (timeoutMs = 10e3, onStartTimeout = () => process.exit(1)) => ({
  name: 'startChecker',
  starting(broker) {
    onStartTimeout.serviceStartTimeout = false;
    onStartTimeout.timeoutID = setTimeout(() => {
      broker.logger.error('Some services did not start in time; Stopping broker');
      onStartTimeout.serviceStartTimeout = true;
      broker.stop();
    }, timeoutMs);
  },
  started() {
    clearTimeout(onStartTimeout.timeoutID);
  },
  // A broker stopped before being started must not be stopped again once the timeout expires
  stopping() {
    clearTimeout(onStartTimeout.timeoutID);
  },
  stopped() {
    if (onStartTimeout.serviceStartTimeout) {
      onStartTimeout();
    }
  },
});
