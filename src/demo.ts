import "reflect-metadata";
import {ApolloConfiguration, createConnection, Props} from '.'

(async ()=>{
  @ApolloConfiguration()
  class RedisConfig {
    @Props()
    static readonly host: string;
    @Props()
    static readonly port: number;
    @Props({
      key:'user.name',
      transformer: (v)=>{
        return v + 'test_1'
      }
    })
    static readonly db: string;
  }

  await createConnection({
    appId: 'apolloclient',
    configServerUrl: 'http://106.54.227.205:8080',
    "clusterName": "default",
    "namespaceNames":[ RedisConfig ],
    'secret':'35be8a4868c748ec96faef3e326adad5'
  });

  setInterval(()=>{
    
    console.log('RedisConfig.host', RedisConfig.host)
    console.log('RedisConfig.port', RedisConfig.port)
    console.log('RedisConfig.db', RedisConfig.db)
  }, 6000)
})()