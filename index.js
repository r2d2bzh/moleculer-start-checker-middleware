module.exports = (
  timeoutMs,
  onStartTimeout = function () {
    process.exit(1);
  }
) => ({
  name: "startChecker",
  starting(broker) {
    onStartTimeout.serviceStartTimeout = false;
    onStartTimeout.timeoutID = setTimeout(() => {
      broker.logger.error(
        "Some services did not start in time; Stopping broker"
      );
      onStartTimeout.serviceStartTimeout = true;
      broker.stop();
    }, timeoutMs);
  },
  started() {
    clearTimeout(onStartTimeout.timeoutID);
  },
  stopped() {
    if (onStartTimeout.serviceStartTimeout) {
      onStartTimeout();
    }
  },
});
