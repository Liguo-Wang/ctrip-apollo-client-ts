import 'reflect-metadata';
import { ApolloConfiguration, Props } from '../../src/index';
import { getConfigurationStorage } from '../../src/configuration.storage';

describe('ApolloConfiguration and Props.', () => {
  it('Get config by the namespace and default.', () => {
    const n1Configurations = {
      appId: 'appid',
      namespaceName: 'n1',
      releaseKey: 'releaseKey',
      cluster: 'default',
      configurations: {
        host: 'localhost',
        user: 'jack',
        password: 't1_pwd',
      },
    };
    const applicationConfigurations = {
      appId: 'appid',
      namespaceName: 'application',
      releaseKey: 'application_releaseKey',
      cluster: 'default',
      configurations: {
        host: 'application#host_localhost',
        user: 'application#user_jack',
        password: 'application#password_1111',
      },
    };
    getConfigurationStorage().setConfig(n1Configurations);
    getConfigurationStorage().setConfig(applicationConfigurations);

    @ApolloConfiguration()
    class ApplicationConfig {
      @Props()
      static readonly host: string;
      @Props()
      static readonly user: string;
      @Props()
      static readonly password: string;
    }

    expect(ApplicationConfig.host).toEqual(
      applicationConfigurations.configurations.host,
    );
    expect(ApplicationConfig.user).toEqual(
      applicationConfigurations.configurations.user,
    );
    expect(ApplicationConfig.password).toEqual(
      applicationConfigurations.configurations.password,
    );

    @ApolloConfiguration('n1')
    class N1Config {
      @Props()
      static readonly host: string;
      @Props()
      static readonly user: string;
      @Props()
      static readonly password: string;
    }

    expect(N1Config.host).toEqual(n1Configurations.configurations.host);
    expect(N1Config.user).toEqual(n1Configurations.configurations.user);
    expect(N1Config.password).toEqual(n1Configurations.configurations.password);
  });

  it('Get config value by the props options.', () => {
    const jsonConfig = {
      host: 'application#redis_host_localhost',
      port: 6378,
    };
    const arrayConfig = [1, 2];
    const numberConfig = 8080;
    const config = {
      appId: 'appid',
      namespaceName: 'application',
      releaseKey: 'application_releaseKey',
      cluster: 'default',
      configurations: {
        host: 'application#host_localhost',
        numberConfig: `${numberConfig}`,
        jsonConfig: JSON.stringify(jsonConfig),
        arrayConfig: JSON.stringify(arrayConfig),
        aliasKey: 'aliasKey_1',
      },
    };
    getConfigurationStorage().setConfig(config);

    @ApolloConfiguration()
    class ApplicationConfig {
      @Props()
      static readonly host: string;

      @Props({ type: 'number' })
      static readonly numberConfig: number;

      @Props({ type: 'json' })
      static readonly jsonConfig: string;

      @Props({ type: 'array' })
      static readonly arrayConfig: string;

      @Props('aliasKey')
      static readonly alias: string;

      @Props({
        key: 'arrayConfig',
        type: 'array',
        transformer: (val: number[]) => {
          return new Set(val);
        },
      })
      static readonly transformToSet: Set<number>;
    }
    const { configurations } = config;
    expect(ApplicationConfig.host).toEqual(configurations.host);
    expect(ApplicationConfig.numberConfig).toEqual(numberConfig);
    expect(ApplicationConfig.jsonConfig).toEqual(jsonConfig);
    expect(ApplicationConfig.arrayConfig).toEqual(arrayConfig);
    expect(ApplicationConfig.transformToSet).toEqual(new Set(arrayConfig));
  });
});
