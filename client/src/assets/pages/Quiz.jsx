import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../css/styles.css';
import '../css/table_styles.css';
import '../css/quiz.css';

import BurgerMenu from '../components/BurgerMenu.js';

import guitarImg from '../images/guitar.png';
import cartImg from '../images/cart.png';
import userImg from '../images/user.png';

const questions = [
  {
    id: 1,
    text: 'What is your name?',
    type: 'text',
  },
  {
    id: 2,
    text: 'Which rock band is the song "Stairway to Heaven" by?',
    type: 'single',
    options: ['The Rolling Stones', 'Led Zeppelin', 'The Beatles', 'Queen'],
    correctAnswer: 'Led Zeppelin',
  },
  {
    id: 3,
    text: 'Who is the lead guitarist of "The Rolling Stones"?',
    type: 'single',
    options: ['Keith Richards', 'Mick Jagger', 'Jimmy Page', 'Eric Clapton'],
    correctAnswer: 'Keith Richards',
  },
  {
    id: 4,
    text: 'Which Nirvana song became an international hit and made them famous?',
    type: 'single',
    options: ['Smells Like Teen Spirit', 'Come As You Are', 'Heart-Shaped Box', 'Lithium'],
    correctAnswer: 'Smells Like Teen Spirit',
  },
  {
    id: 11,
    text: 'Which of the following bands are considered hard rock?',
    type: 'multiple',
    options: ['AC/DC', 'Nirvana', 'Deep Purple', 'Coldplay'],
    correctAnswer: ['AC/DC', 'Deep Purple'],
  },
  {
    id: 6,
    text: 'Who is known for playing the guitar with his teeth and using heavy distortion?',
    type: 'single',
    options: ['Jimi Hendrix', 'Carlos Santana', 'Eric Clapton', 'Jimmy Page'],
    correctAnswer: 'Jimi Hendrix',
  }
];

function Quiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const question = questions[current];

  const handleInput = (value, isChecked) => {
    if (question.type === 'single') {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    } else if (question.type === 'text') {
      setName(value);
    } else {
      setAnswers((prev) => {
        const currentAnswers = prev[question.id] || [];
        const updatedAnswers = isChecked
          ? [...currentAnswers, value]
          : currentAnswers.filter((v) => v !== value);
        return { ...prev, [question.id]: updatedAnswers };
      });
    }
  };

  const next = () => {
    if (question.type === 'text' && !name.trim()) {
      return;
    }
    if (question.type !== 'text' && !answers[question.id]) {
      return;
    }

    const userAnswer = answers[question.id];
    let isCorrect = false;

    if (question.type === 'single') {
      isCorrect = userAnswer === question.correctAnswer;
    } else if (question.type === 'multiple') {
      const correctSet = new Set(question.correctAnswer);
      const userSet = new Set(userAnswer);
      isCorrect =
        correctSet.size === userSet.size &&
        [...correctSet].every((val) => userSet.has(val));
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinalScore(score + (isCorrect ? 1 : 0));
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrent(0);
    setScore(0);
    setAnswers({});
    setName('');
  };

  return (
    <>
      <div dangerouslySetInnerHTML={{
        __html: `
        <noscript>
          <div class='noscript-container'>
            <div class='noscript-content'>
              <h2 class='noscript-header'>JavaScript is Disabled!</h2>
              <p class='noscript-message'>
                <strong>Attention:</strong> To experience the full functionality of our website, please enable JavaScript in your browser settings.
              </p>
              <p class='noscript-note'>We apologize for any inconvenience!</p>
            </div>
          </div>
        </noscript>
      `}} />

      <div className="page-wrapper">
        <header>
          <div className="logo-title">
            <img src={guitarImg} alt="guitar" />
            <h1>Rythm Road</h1>
          </div>
          <BurgerMenu />
          <nav className="desktop-nav">
            <ul className="nav-list">
              <li><Link to="/">HOMEPAGE</Link></li>
              <li className="dropdown">
                <Link to="/marketplace">MARKETPLACE</Link>
                <ul className="dropdown-content">
                  <li><Link to="/marketplace/guitars">Guitars</Link></li>
                  <li><Link to="/marketplace/drums">Drums</Link></li>
                </ul>
              </li>
              <li className="dropdown">
                <Link to="/table">ABOUT US</Link>
                <ul className="dropdown-content">
                  <li><Link to="/quiz">Quiz</Link></li>
                  <li><Link to="/table">Table</Link></li>
                </ul>
              </li>
              <li className="dropdown">
                <Link to="/contact">CONTACT</Link>
                <ul className="dropdown-content">
                  <li><Link to="/contact/email">Email</Link></li>
                  <li><Link to="/contact/phone">Phone</Link></li>
                </ul>
              </li>
              <li><Link to="/cart"><img src={cartImg} alt="cart" className="icon" /></Link></li>
              <li><Link to="/profile"><img src={userImg} alt="user" className="icon" /></Link></li>
            </ul>
          </nav>
        </header>

        <div className="quiz-introduction">
          <h2>Take a short quiz and test your knowledge of the music world!</h2>
        </div>

        <div className={`quiz-container ${question.type === 'text' ? 'name-stage' : ''}`}>
          <div className="quiz-content">
            <div className="quiz-question">
              <p>{question.text}</p>

              {question.type === 'text' && (
                <input
                  className="quiz-input"
                  type="text"
                  value={name}
                  onChange={(e) => handleInput(e.target.value)}
                  placeholder="Enter your name"
                />
              )}

              {question.type === 'single' && (
                <div className="quiz-options">
                  {question.options.map((opt) => (
                    <label key={opt}>
                      <span className="option-text">{opt}</span>
                      <span className="option-control">
                        <input
                          type="radio"
                          name={`q${question.id}`}
                          value={opt}
                          checked={answers[question.id] === opt}
                          onChange={() => handleInput(opt)}
                        />
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multiple' && (
                <div className="quiz-options">
                  {question.options.map((opt) => (
                    <label key={opt}>
                      <span className="option-text">{opt}</span>
                      <span className="option-control">
                        <input
                          type="checkbox"
                          name={`q${question.id}`}
                          value={opt}
                          checked={(answers[question.id] || []).includes(opt)}
                          onChange={(e) => handleInput(opt, e.target.checked)}
                        />
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="quiz-footer">
            <button className="quiz-button" onClick={next}>
              {current < questions.length - 1 ? 'Next →' : 'Finish'}
            </button>
          </div>

          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>Thank you for participating, {name}!</h2>
                <p>Your score is: {finalScore} out of {questions.length - 1}</p>
                <button className="quiz-button" onClick={closeModal}>Restart</button>
              </div>
            </div>
          )}
        </div>

        <footer>
          <nav className="footer-nav">
            <Link to="/">Homepage</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/table">About us</Link>
            <Link to="/promo">Promo</Link>
            <Link to="/quiz">Contact</Link>
          </nav>
          <p>&copy; 2025 All rights reserved - Rhythm Road</p>
        </footer>
      </div>
    </>
  );
}

export default Quiz;
