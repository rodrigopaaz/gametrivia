// Faz a requisição do token usando a api
const fetchToken = async () => {
  const request = await fetch('https://opentdb.com/api_token.php?command=request');
  const { response_code: responseCode, token } = await request.json();
  if (responseCode !== 0) throw new Error('Erro ao requisitar Token');
  localStorage.setItem('token', token);
};

// Busca o token no localStorage e o converte a número
const getToken = () => +localStorage.getItem('token');

// Faz requisição das perguntas do jogo à api, utilizando o token
const fetchQuestions = async (amount) => {
  const token = getToken();
  const request = await fetch(`https://opentdb.com/api.php?amount=${amount}&token=${token}`);
  const { response_code: responseCode, results } = request.json();
  if (responseCode !== 0) throw new Error('Erro ao fazer requisição à API');
  return results;
};

export { fetchToken, fetchQuestions };