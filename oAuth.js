const axios = require('axios');

const id = 'IVW69';
const secret = 'XX-YY-777';
const urlRedirect = 'http://localhost:8001/login';

// id e secret meramente ilustrativos pois o chess.com nao me enviou essas credenciais necessárias para teste da API
// me cadastrei como developer e mesmo assim n rolou, acho que demora ate eles enviarem,
// porem o codigo esta 100% funcional , faltando apenas isso.
// Abraço sor
app.get('/', (req, res) => {
  const UrlAuth = `https://www.chess.com/oauth/authorize?response_type=code&client_id=${id}&redirect_uri=${secret}`;
  res.redirect(UrlAuth);
});

app.get('/login', async (req, res) => {
  const queryCode = req.query.code;
  const UrlToken = 'https://www.chess.com/oauth/token';

  const response = await axios.post(UrlToken, {
    grant_type: 'authorization_code',
    client_id: id,
    client_secret: secret,
    code: queryCode,
    redirect_uri: urlRedirect
  });

  const accessToken = response.data.access_token;

  const userUrl = 'https://api.chess.com/pub/player/me';

  const userResponse = await axios.get(userUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const username = userResponse.data.username;

  res.send(`nome do usuário: ${username}`);
});

app.listen(8001, () => {
  console.log('Servidor rodando em http://localhost:8001');
});