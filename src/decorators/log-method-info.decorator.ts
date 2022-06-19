import logger from '../utils/logger';

export function logMethodInfo(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const className = target.name;
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const datetime = new Date().toLocaleString();

    logger.info(`[Call] ${className}.${propertyKey}(${args.join(', ')})`);

    return method.apply(this, args);
  };
}
