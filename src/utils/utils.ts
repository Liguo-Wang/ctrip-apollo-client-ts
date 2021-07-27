import ip from 'ip';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import { log } from './logger.utils';
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined';

export const isString = (fn: any): fn is string => typeof fn === 'string';

export function niceTry <T, E>(fn: ()=> T, errCallback?:(e:E)=>void):T | undefined {
  try {
    return fn();
  } catch (error) {
    if (typeof errCallback === 'function') {
      errCallback(error);
    }
    return undefined
  }
}


export async function niceTryPromise <T, E>(fn: ()=> PromiseLike<T>, errCallback?:(e:E)=>void):Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (typeof errCallback === 'function') {
      errCallback(error);
    }
    return undefined
  }
}

export function getIp(): string {
  return ip.address()
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            log(
              `Connect to the apollo server, Retrying (${errorCount + 1})...`,
              error,
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}