import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Question from '../components/Question';
import { fetchQuestions, fetchCustomizedQuestions } from '../service/triviaApi';
import { clearScore } from '../redux/actions/playerActions';
import '../styles/game.css';

class Game extends Component {
  state = {
    questions: [],
    questionsIndex: 0,
  };

  async componentDidMount() {
    const { handleGetQuestions, props: { history, dispatch } } = this;

    await handleGetQuestions(history);
    dispatch(clearScore());
  }

  // Pega ranking do localStorage
  getData = () => JSON.parse(localStorage.getItem('rankings')) || [];

  // Salva os dados do jogador e seu desempenho no localStorage
  saveData = (name, assertions, score, gravatarEmail) => {
    const { getData } = this;
    const rankings = getData();
    const dataObject = { name, assertions, score, gravatarEmail };
    const updatedRankings = [...rankings, dataObject];
    localStorage.setItem('rankings', JSON.stringify(updatedRankings));
  };

  // Aumenta o estado questionsIndex por 1, passando para a próxima questão
  nextQuestion = () => {
    const { saveData, state: { questionsIndex, questions },
      props: { history, name, assertions, score, gravatarEmail } } = this;
    if (questionsIndex === questions.length - 1) {
      saveData(name, assertions, score, gravatarEmail);
      history.push('/feedback');
    }
    this.setState((prevState) => ({
      questionsIndex: prevState.questionsIndex + 1,

    }));
  };

  // Faz a requisição para a api e salva as questões no estado, ou apaga token e retorna à tela de Login em caso de erro
  handleGetQuestions = async (history) => {
    const { props: { amount, category, difficulty, questionType } } = this;
    const { isCustomized } = this.props;
    const getQuestions = isCustomized
      ? await fetchCustomizedQuestions(
        Number(amount),
        category,

        difficulty,

        questionType,
      )
      : await fetchQuestions();
    switch (typeof getQuestions) {
    case 'number':
      localStorage.removeItem('token');
      history.push('/');
      break;
    default:
      this.setState({ questions: getQuestions });
    }
  };

  // Faz a randomização de um número usado na randomização das respostas e o salva no estado
  getRandomSortNumber = () => (
    Math.random() - Number('0.5')
  );

  // Embaralha as respostas e as salvam no estado
  randomizeAnswers = (correctAnswer, incorrectAnswers) => {
    const { getRandomSortNumber } = this;
    return [...incorrectAnswers, correctAnswer].sort(() => getRandomSortNumber());
  };

  render() {
    const { nextQuestion, randomizeAnswers, state: { questions, questionsIndex } } = this;
    const currentQuestion = questions.length
      ? questions[questionsIndex]
      : { incorrect_answers: [], correct_answer: '' };

    const { incorrect_answers: incorrectAnswers,
      correct_answer: correctAnswer } = currentQuestion;

    const randomizedAnswers = randomizeAnswers(correctAnswer, incorrectAnswers);
    return (
      <div className="game__container">
        <Header />
        <Question
          questionProp={ currentQuestion }
          nextQuestion={ nextQuestion }
          answers={ randomizedAnswers }
        />
        <footer />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({ ...state.player });

Game.propTypes = {}.isRequired;

export default connect(mapStateToProps)(Game);
