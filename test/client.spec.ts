import { createConnection } from '../src';
import axios from 'axios';
import { getConfigurationStorage } from '../src/configuration.storage';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Apollo Client.', () => {
  it('Unexpected namespaceName.', async () => {
    mockedAxios.get.mockImplementation(url => {
      if (url.startsWith('localhost/notifications/v2')) {
        return Promise.resolve({ data: [{}] });
      }
      return Promise.reject(new Error('not found'));
    });
    try {
      await createConnection({
        url: 'localhost',
        namespaceNames: ['ns1', 'ns2'],
        appId: 'application_test_id',
        clusterName: 'default',
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('Fetch the config and save to local cache.', async () => {
    const clientOptions = {
      url: 'localhost',
      namespaceNames: ['ns1'],
      appId: 'application_test_id',
      clusterName: 'default',
    };
    const notifications = [{ namespaceName: 'ns1', notificationId: 1 }];
    const releaseKey = 'releaseKey';
    const config = {
      appId: clientOptions.appId,
      namespaceName: clientOptions.namespaceNames[0],
      releaseKey: releaseKey,
      cluster: clientOptions.clusterName,
      configurations: {
        host: 'application#host_localhost',
        numberConfig: `numberConfig_1`,
        aliasKey: 'aliasKey_1',
      },
    };
    const updateConfig = {
      appId: clientOptions.appId,
      namespaceName: clientOptions.namespaceNames[0],
      releaseKey: releaseKey + '_update',
      cluster: clientOptions.clusterName,
      configurations: {
        host: 'application#host_localhost_001',
        numberConfig: `numberConfig_1_001`,
        aliasKey: 'aliasKey_1_001',
      },
    };
    let notificationId = -1;
    mockedAxios.get.mockImplementation(url => {
      if (url.startsWith('localhost/notifications/v2')) {
        if (notificationId === notifications[0].notificationId) {
          return new Promise(resolve => {
            setTimeout(() => {
              return resolve({
                status: 304,
                data: null,
              });
            }, 3000);
          });
        }
        notificationId = notifications[0].notificationId;
        return Promise.resolve({
          status: 200,
          data: notifications,
        });
      }

      if (url.startsWith('localhost/configs')) {
        return url.includes(releaseKey)
          ? // Return the updated config.
            Promise.resolve({ data: updateConfig, status: 200 })
          : // For the first request should return init config.
            Promise.resolve({ data: config, status: 200 });
      }
      return Promise.reject(new Error('not found'));
    });
    await createConnection(clientOptions);
    const namespace = clientOptions.namespaceNames[0];
    expect(getConfigurationStorage().getConfig(namespace)).toEqual(
      config.configurations,
    );
  });

  it('Auto update the config.', async () => {
    const clientOptions = {
      url: 'localhost',
      namespaceNames: ['ns1'],
      appId: 'application_test_id',
      clusterName: 'default',
    };

    const releaseKey = 'releaseKey';
    const initNotificationId = 1;
    const updateNotificationId = 2;
    const notifications = [
      { namespaceName: 'ns1', notificationId: initNotificationId },
    ];
    const config = {
      appId: clientOptions.appId,
      namespaceName: clientOptions.namespaceNames[0],
      releaseKey: releaseKey,
      cluster: clientOptions.clusterName,
      configurations: {
        host: 'application#host_localhost',
        numberConfig: `numberConfig_1`,
        aliasKey: 'aliasKey_1',
      },
    };
    const updateConfig = {
      appId: clientOptions.appId,
      namespaceName: clientOptions.namespaceNames[0],
      releaseKey: releaseKey + '_update',
      cluster: clientOptions.clusterName,
      configurations: {
        host: 'application#host_localhost_001',
        numberConfig: `numberConfig_1_001`,
        aliasKey: 'aliasKey_1_001',
      },
    };

    let notificationId = -1;
    mockedAxios.get.mockImplementation(url => {
      if (url.startsWith('localhost/notifications/v2')) {
        // second request
        if (notificationId === initNotificationId) {
          notificationId = updateNotificationId;
          return Promise.resolve({
            status: 200,
            data: notifications.map(item => ({ ...item, notificationId })),
          });
        }
        // request etc.
        if (notificationId === updateNotificationId) {
          return new Promise(resolve => {
            setTimeout(() => {
              return resolve({
                status: 304,
                data: null,
              });
            }, 3000);
          });
        }

        // first request
        notificationId = initNotificationId;
        return Promise.resolve({
          status: 200,
          data: notifications,
        });
      }

      if (url.startsWith('localhost/configs')) {
        if (notificationId === initNotificationId) {
          Promise.resolve({ data: config, status: 200 });
        }
        return Promise.resolve({ data: updateConfig, status: 200 })
      }
      return Promise.reject(new Error('not found'));
    });
    await createConnection(clientOptions);
    const namespace = clientOptions.namespaceNames[0];
    expect(getConfigurationStorage().getConfig(namespace)).toEqual(
      updateConfig.configurations,
    );
  });
});
