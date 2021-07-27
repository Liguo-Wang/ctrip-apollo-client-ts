import axios from 'axios';

export const request = axios.create({
  validateStatus: (status) => {
    return status >= 200 && status < 300 || status === 304; // 默认的
  }
})
