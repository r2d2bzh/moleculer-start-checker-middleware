declare function _default(timeoutMs?: number, onStartTimeout?: () => any): {
    name: string;
    starting(broker: any): void;
    started(): void;
    stopped(): void;
};
export default _default;
