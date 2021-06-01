import axios from 'axios';

axios.create({
  validateStatus: (status) => {
    return status >= 200 && status < 300 || status === 304; // 默认的
  }
})

export const request = axios;