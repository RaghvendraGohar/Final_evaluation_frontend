import React, { useState, useEffect } from "react";
import axios from "axios";
import sstyle from "./QuizInterface.module.css";
import { useParams } from "react-router-dom";
// import image2 from "src/assets/image2.png"; 

export default function QuizInterface() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(10);
  const [score, setScore] = useState(0);
  const [quizType, setQuizType] = useState("");
  const [showScore, setShowScore] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [optionSelected, setOptionSelected] = useState(false);
  const { link } = useParams();

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    // Call the API to update the quiz impression
    const updateImpression = async () => {
      try {
        // Extract the quiz ID from the link if necessary
        const quizId = link; // Adjust this based on your URL structure

        const response = await axios.patch(`/quiz/${quizId}/impression`);
        console.log(response.data.message);
      } catch (error) {
        console.error("Error updating impression:", error);
      }
    };

    updateImpression();

    axios
      .get("https://notes-backend-f8z1.onrender.com/quiz/play", {
        params: { link: link },
      })
      .then((response) => {
        console.log("API Response:", response.data);
        const fetchedQuestions = response.data.questionAnswer;
        setQuestions(fetchedQuestions);
        setQuizType(response.data.quizType);
        if (response.data.quizType !== "Poll") {
          setTimer(fetchedQuestions[0]?.timer || 10);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [link]);

  const handleOptionClick = (index) => {
    setSelectedOptions((prevSelectedOptions) => {
      const newSelectedOptions = [...prevSelectedOptions];
      newSelectedOptions[currentQuestionIndex] = index;
      return newSelectedOptions;
    });
    setOptionSelected(true);
  };

  const handleNextClick = () => {
    if (!optionSelected) {
      alert("Please select an option before proceeding.");
      return;
    }

    const selectedOption = selectedOptions[currentQuestionIndex];
    if (selectedOption !== null) {
      const isCorrect =
        selectedOption === questions[currentQuestionIndex].correctAnswerOption;
      setScore((prevScore) => prevScore + (isCorrect ? 1 : 0));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setOptionSelected(false);
      if (quizType !== "Poll") {
        setTimer(questions[currentQuestionIndex + 1].timer); // Reset timer for next question
      }
    } else {
      submitQuiz();
      setShowScore(true);
    }
  };

  const submitQuiz = async () => {
    const quizData = {
      listQuestion: questions.map((q, index) => ({
        id: q._id,
        isCorrected: selectedOptions[index] === q.correctAnswerOption,
        optionSelected: selectedOptions[index],
      })),
      quizType: quizType,
    };

    console.log(quizData);

    try {
      const response = await axios.post(
        "https://notes-backend-f8z1.onrender.com/question/submit",
        { quizData }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  if (showScore) {
    return (
      <div className={sstyle.quizInterface}>
        <div className={sstyle.congratsPage}>
          {quizType === "Q/A" ? (
            <>
              <h1 className={sstyle.qAH}>Congrats, Quiz is completed!</h1>
              <img className={sstyle.image2} src="src/assets/image2.png" alt="Congrats" />
              <div className={sstyle.qAP}>
              <p >Your Score is 
                <span className={sstyle.qAPs}>{score }/{questions.length}</span></p>
              </div>
              
            </>
          ) : (
            <h1 className={sstyle.pollH}>Thank you for participating in the Poll</h1>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const { question, options } = questions[currentQuestionIndex];
  const selectedOption = selectedOptions[currentQuestionIndex];

  return (
    <div className={sstyle.quizInterface}>
      <div className={sstyle.quizContainer}>
        <div className={sstyle.quizHeader}>
          <span className={sstyle.quizCount}>
            {currentQuestionIndex + 1}/{questions.length}
          </span>
          {console.log("Current Question:", questions[currentQuestionIndex])}
          {quizType !== "Poll" && timer > 0 && <span className={sstyle.timer}>{formatTimer(timer)}</span>}
        </div>
        <h2 className={sstyle.quizQuestion}>{question}</h2>
        <div className={sstyle.optionsContainer}>
          {options.map((option, index) => (
            <div
              key={index}
              className={`${sstyle.option} ${
                selectedOption === index ? sstyle.selectedOption : ""
              }`}
              onClick={() => handleOptionClick(index)}
            >
              {option.text && (
                <span className={sstyle.text}>{option.text}</span>
              )}
              {option.image && (
                <img src={option.image} alt="option" className={sstyle.image} />
              )}
            </div>
          ))}
        </div>
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            className={sstyle.nextButton}
            onClick={handleNextClick}
            disabled={!optionSelected}
          >
            NEXT
          </button>
        ) : (
          <button
            className={sstyle.submitButton}
            onClick={handleNextClick}
            disabled={!optionSelected}
          >
            SUBMIT
          </button>
        )}
      </div>
    </div>
  );
}
