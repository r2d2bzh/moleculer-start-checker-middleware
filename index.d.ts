declare function _default(timeoutMs?: number, onStartTimeout?: () => void): StartCheckerMiddleware;
export default _default;
/**
 * The middleware name is left out of this type as Moleculer's Middleware type only allows hooks
 */
export type StartCheckerMiddleware = {
    starting: (broker: any) => void;
    started: () => void;
    stopping: () => void;
    stopped: () => void;
};
