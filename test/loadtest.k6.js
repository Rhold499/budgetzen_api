import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50, // nombre d'utilisateurs virtuels
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/transactions');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
