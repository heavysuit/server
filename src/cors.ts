import createCors from 'cors';

export const cors = createCors({
  origin: [
    'http://localhost:3000',
    'https://heavysuit.com',
    'https://www.heavysuit.com',
  ],
  credentials: true,
});
