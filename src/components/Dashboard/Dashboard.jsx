import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Dashboard.module.css";
import styless from "./Analytics.module.css";
import stylesD from "./Delete.module.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [optionType, setOptionType] = useState("text");
  const [IDD, setID] = useState("");
  const [activeButton, setActiveButton] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [currentQuizType, setCurrentQuizType] = useState("Q/A");
  const history = useNavigate();

  const [scorecardData, setScorecardData] = useState({
    quizzes: 0,
    questions: 0,
    impressions: 0,
  });

  const [quizDto, setQuizDto] = useState([]);
  const [quizName, setQuizName] = useState("");
  const [quizType, setQuizType] = useState("");
  const [quizTypeI, setQuizTypeI] = useState("");
  const [quizLink, setQuizLink] = useState("");
  const [questions, setQuestions] = useState([
    {
      text: "",
      optionType: "text",
      timer: 0,
      correctAnswerOption: 4,
      options: [
        { value: "", value1: "" },
        { value: "", value1: "" },
      ],
    },
  ]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [activeOption, setActiveOption] = useState("Dashboard");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRadioChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswerOption = optionIndex;
    setQuestions(newQuestions);
  };

  const handleDeleteQuiz = (quizId) => {
    setQuizToDelete(quizId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      const response = await axios.delete(
        `https://notes-backend-f8z1.onrender.com/api/v1/quiz/delete/${quizToDelete}`
      );
      setQuizDto(quizDto.filter((quiz) => quiz._id !== quizToDelete));
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error("Error deleting quiz:", error.response.data);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };

  const handleOptionClick = (option) => {
    setActiveOption(option);
    if (option === "Create Quiz") {
      handleCreateQuizClick();
    }
  };

  const handleQuestionChange = (index, e) => {
    const newQuestions = [...questions];
    newQuestions[index].text = e.target.value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, e) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].value = e.target.value;
    newQuestions[questionIndex].options[optionIndex].value1 = e.target.value1;
    setQuestions(newQuestions);
  };

  const handleOptionTypeChange = (e) => {
    const newQuestions = [...questions];
    newQuestions[selectedQuestionIndex].optionType = e.target.value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      {
        text: "",
        optionType: "text",
        timer: 0,
        correctAnswerOption: 4,
        options: [
          { value: "", value1: "" },
          { value: "", value1: "" },
        ],
      },
    ];
    setQuestions(newQuestions);
    setSelectedQuestionIndex(newQuestions.length - 1);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setSelectedQuestionIndex(0);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ value: "", value1: "" });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setQuestions(newQuestions);
  };

  const handleCreateQuiz = async () => {
    const quizData = {
      listQuestion: questions.map((q) => ({
        quizRefId: IDD,
        question: q.text,
        timer: q.timer,
        correctAnswerOption: q.correctAnswerOption || 4,
        options: q.options.map((o) => ({
          text:
            q.optionType === "text" || q.optionType === "textImageURL"
              ? o.value
              : "",
          image:
            q.optionType === "imageURL" || q.optionType === "textImageURL"
              ? o.value1
              : "",
        })),
      })),
      quizType: quizType,
    };
    try {
      let authToken = localStorage.getItem("token");
      authToken = authToken ? authToken.replace(/^"|"$/g, "") : "";
      const response = await axios.post(
        "https://notes-backend-f8z1.onrender.com/api/v1/question/list-question",
        { quizData },
        { headers: { Authorization: authToken } }
      );
      setModalStep(3);
    } catch (error) {
      console.error("Error creating quiz:", error.response.data);
    }
  };

  useEffect(() => {
    const quizDtoString = localStorage.getItem("quizDto");
    const parsedQuizDto = quizDtoString ? JSON.parse(quizDtoString) : [];
    if (parsedQuizDto.length > 0) {
      const quizzes = parsedQuizDto.length;
      const questions = parsedQuizDto.reduce(
        (acc, quiz) => acc + quiz.question,
        0
      );
      const impressions = parsedQuizDto.reduce(
        (acc, quiz) => acc + quiz.impression,
        0
      );
      setScorecardData({ quizzes, questions, impressions });
      setQuizDto(parsedQuizDto);
    }
  }, []);

  const formatNumber = (num) => {
    if (num > 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  const handleCreateQuizClick = () => {
    setIsModalOpen(true);
    setModalStep(1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuestionIndex(0);
    handleOptionClick("Dashboard");
  };

  const handleContinue = async () => {
    if (modalStep === 1 && quizName && quizType) {
      try {
        let authToken = localStorage.getItem("token");
        authToken = authToken ? authToken.replace(/^"|"$/g, "") : "";
        const response = await axios.post(
          "https://notes-backend-f8z1.onrender.com/api/v1/quiz/create-quiz",
          { quizName, quizType },
          { headers: { Authorization: authToken } }
        );

        const ID = response.data.quizDataModel._id;
        setID(ID);
        const shareLink = `http://localhost:5173/play/${response.data.quizDataModel.link}`;
        setQuizLink(shareLink);
        setModalStep(2);
      } catch (error) {
        console.error("There was an error creating the quiz!", error);
      }
    } else {
      alert("Please enter quiz name and select quiz type.");
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(quizLink);
    alert("Link copied to clipboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    history("/");
  };

  const validSelectedIndex = Math.min(
    selectedQuestionIndex,
    questions.length - 1
  );

  const handleTimerChange = (time) => {
    const newQuestions = [...questions];
    newQuestions[selectedQuestionIndex].timer = time;
    setQuestions(newQuestions);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeading}>QUIZZIE</div>
        <div className={styles.options}>
          <div
            className={`${styles.option} ${
              activeOption === "Dashboard" ? styles.active : ""
            }`}
            onClick={() => handleOptionClick("Dashboard")}
          >
            Dashboard
          </div>
          <div
            className={`${styles.option} ${
              activeOption === "Analytics" ? styles.active : ""
            }`}
            onClick={() => handleOptionClick("Analytics")}
          >
            Analytics
          </div>
          <div
            className={`${styles.option} ${
              activeOption === "Create Quiz" ? styles.active : ""
            }`}
            onClick={() => handleOptionClick("Create Quiz")}
          >
            Create Quiz
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logout}>
          LOGOUT
        </button>
      </div>
      <div className={styles.mainContent}>
        {activeOption === "Analytics" && (
          <div className={styless.analyticsContent}>
            <h2 className={styless.quizTableTitle}>Quiz Analysis</h2>
            <div className={styless.quizTableContainer}>
              <table className={styless.quizTable}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Quiz Name</th>
                    <th>Created on</th>
                    <th>Impression</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quizDto.map((quizItem, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0 ? styless.evenRow : styless.oddRow
                      }
                    >
                      <td>{index + 1}</td>
                      <td>{quizItem.quizName}</td>
                      <td>
                        {(() => {
                          const date = new Date(
                            quizItem.createdAt
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          });
                          const [day, month, year] = date.split(" ");
                          return `${day} ${month}, ${year}`;
                        })()}
                      </td>
                      <td>{quizItem.impression}</td>
                      <td>
                        <button className={styless.actionButton}>
                          <img src="public\Vector.png" alt="Edit" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quizItem._id)}
                          className={styless.actionButton}
                        >
                          <img src="public\Vector (1).png" alt="Delete" />
                        </button>
                        <button
                          onClick={handleShareLink}
                          className={styless.actionButton}
                        >
                          <img src="public\Vector (2).png" alt="Share" />
                        </button>
                      </td>
                      <td>
                        <button className={styless.QaB} onClick={() => handleOptionClick("Question Wise Analysis")} >Question Wise Analysis</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showDeleteModal && (
              <div className={stylesD.modalOverlay}>
                <div className={stylesD.modal}>
                  <h2 className={stylesD.modalTitle}>
                    Are you sure you want to delete?
                  </h2>
                  <div className={stylesD.modalActions}>
                    <button
                      onClick={handleConfirmDelete}
                      className={stylesD.confirmButton}
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={handleCloseDeleteModal}
                      className={stylesD.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeOption === "Question Wise Analysis" && (
              <div className={styless.analyticsContent}>
                <h2 className={styless.quizTableTitle}>Question Wise Analysis</h2>
                {currentQuizType === "Q/A" ? (
                  <div>
                    {questions.map((question, index) => (
                      <div key={index}>
                        <h3>Q.{index + 1} {question.text}</h3>
                        <div className={styless.analysisBox}>
                          <div>60 people Attempted the question</div>
                          <div>38 people Answered Correctly</div>
                          <div>22 people Answered Incorrectly</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {questions.map((question, index) => (
                      <div key={index}>
                        <h3>Q.{index + 1} {question.text}</h3>
                        <div className={styless.analysisBox}>
                          <div>60 Option 1</div>
                          <div>23 Option 2</div>
                          <div>45 Option 3</div>
                          <div>11 Option 4</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeOption === "Dashboard" && (
          <>
            <div className={styles.scorecards}>
              <div className={`${styles.scorecard} ${styles.quiz}`}>
                <h2 style={{ color: "#ff5722" }}>
                  {scorecardData.quizzes} Quiz Created
                </h2>
              </div>
              <div className={`${styles.scorecard} ${styles.questions}`}>
                <h2 style={{ color: "#4caf50" }}>
                  {scorecardData.questions} questions Created
                </h2>
              </div>
              <div className={`${styles.scorecard} ${styles.impressions}`}>
                <h2 style={{ color: "#2196f3" }}>
                  {formatNumber(scorecardData.impressions)} Total Impressions
                </h2>
              </div>
            </div>
            <h2 className={styles.trendingHeading}>Trending Quizzes</h2>
            <div className={styles.trendingQuizzes}>
              {quizDto
                .sort((a, b) => b.impression - a.impression)
                .slice(0, 12)
                .map((quizItem, index) => (
                  <div key={index} className={styles.quizItem}>
                    <div className={styles.topRow}>
                      <div className={styles.quizName}>{quizItem.quizName}</div>
                      <div className={styles.impression}>
                        {quizItem.impression}
                      </div>
                    </div>
                    <div className={styles.createdAt}>
                      Created on:{" "}
                      {(() => {
                        const date = new Date(
                          quizItem.createdAt
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        const [day, month, year] = date.split(" ");
                        return `${day} ${month}, ${year}`;
                      })()}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {modalStep === 1 && (
              <div className={styles.modalStep1}>
                <div className={styles.modalHeader}>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Quiz name"
                    className={styles.input1}
                  />
                  <div className={styles.quizTypeContainer}>
                    Quiz Type
                    <button
                      className={`${styles.quizTypeButton} ${
                        quizType === "Q/A" ? styles.selectedOption : ""
                      }`}
                      onClick={() => {
                        setQuizType("Q/A");
                        setQuizTypeI("Q/A Question");
                        setCurrentQuizType("Q/A");
                      }}
                    >
                      Q & A
                    </button>
                    <button
                      className={`${styles.quizTypeButton} ${
                        quizType === "POLL" ? styles.selectedOption : ""
                      }`}
                      onClick={() => {
                        setQuizType("POLL");
                        setQuizTypeI("POLL Question");
                        setCurrentQuizType("POLL");
                      }}
                    >
                      Poll Type
                    </button>
                  </div>
                </div>
                <div className={styles.modalButtons}>
                  <button
                    className={styles.cancelButton}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.continueButton}
                    onClick={handleContinue}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            {modalStep === 2 && (
              <div className={styles.modalStep2}>
                <div className={styles.modalHeader}>
                  <div className={styles.questionIndicators}>
                    {questions.map((_, index) => (
                      <span
                        key={index}
                        className={styles.questionIndicator}
                        onClick={() => setSelectedQuestionIndex(index)}
                      >
                        {index + 1}{" "}
                        {index > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeQuestion(index);
                            }}
                            className={styles.removeQuestion}
                          >
                            X
                          </button>
                        )}
                      </span>
                    ))}
                    {questions.length < 5 && (
                      <button
                        onClick={addQuestion}
                        className={styles.addQuestion}
                      >
                        +
                      </button>
                    )}
                  </div>
                  <span className={styles.maxQuestions}>Max 5 questions</span>
                </div>
                <div className={styles.questionContainer}>
                  <input
                    type="text"
                    value={questions[validSelectedIndex].text}
                    onChange={(e) =>
                      handleQuestionChange(validSelectedIndex, e)
                    }
                    placeholder={quizTypeI}
                    className={styles.inputq}
                  />
                  <div className={styles.optionTypeContainer}>
                    <p className={styles.optionTypeP}>Option Type </p>
                    <label className={styles.radioText1}>
                      <input
                        className={styles.radioTextI}
                        type="radio"
                        name="optionType"
                        value="text"
                        checked={
                          questions[validSelectedIndex].optionType === "text"
                        }
                        onChange={(e) => handleOptionTypeChange(e)}
                      />{" "}
                      Text
                    </label>
                    <label className={styles.radioText2}>
                      <input
                        className={styles.radioTextI}
                        type="radio"
                        name="optionType"
                        value="imageURL"
                        checked={
                          questions[validSelectedIndex].optionType ===
                          "imageURL"
                        }
                        onChange={(e) => handleOptionTypeChange(e)}
                      />{" "}
                      Image URL
                    </label>
                    <label className={styles.radioText3}>
                      <input
                        className={styles.radioTextI}
                        type="radio"
                        name="optionType"
                        value="textImageURL"
                        checked={
                          questions[validSelectedIndex].optionType ===
                          "textImageURL"
                        }
                        onChange={(e) => handleOptionTypeChange(e)}
                      />{" "}
                      Text & Image URL
                    </label>
                  </div>
                  <div className={styles.optionContainer}>
                    {questions[validSelectedIndex].options.map(
                      (option, oIndex) => (
                        <div key={oIndex} className={styles.optionItem}>
                          {quizTypeI === "Q/A Question" && (
                            <input
                              type="radio"
                              name={`question-${validSelectedIndex}`}
                              onChange={() =>
                                handleRadioChange(validSelectedIndex, oIndex)
                              }
                              checked={
                                questions[validSelectedIndex]
                                  .correctAnswerOption === oIndex
                              }
                            />
                          )}

                          {questions[validSelectedIndex].optionType ===
                            "text" && (
                            <input
                              className={styles.optionContainerInput1}
                              type="text"
                              value={option.value}
                              onChange={(e) =>
                                handleOptionChange(
                                  validSelectedIndex,
                                  oIndex,
                                  e
                                )
                              }
                              placeholder={`Text`}
                            />
                          )}
                          {questions[validSelectedIndex].optionType ===
                            "imageURL" && (
                            <input
                              className={styles.optionContainerInput1}
                              type="text"
                              value={option.value1}
                              onChange={(e) =>
                                handleOptionChange(
                                  validSelectedIndex,
                                  oIndex,
                                  e
                                )
                              }
                              placeholder={`Image URL`}
                            />
                          )}
                          {questions[validSelectedIndex].optionType ===
                            "textImageURL" && (
                            <div className={styles.textImageOption}>
                              <input
                                className={styles.optionContainerInput2}
                                type="text"
                                value={option.value}
                                onChange={(e) =>
                                  handleOptionChange(
                                    validSelectedIndex,
                                    oIndex,
                                    e
                                  )
                                }
                                placeholder={`Text`}
                              />
                              <input
                                className={styles.optionContainerInput3}
                                type="text"
                                value={option.value1}
                                onChange={(e) =>
                                  handleOptionChange(
                                    validSelectedIndex,
                                    oIndex,
                                    e
                                  )
                                }
                                placeholder={`Image URL`}
                              />
                            </div>
                          )}
                          {oIndex > 1 && (
                            <button
                              onClick={() =>
                                removeOption(validSelectedIndex, oIndex)
                              }
                              className={styles.removeOption}
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      )
                    )}
                    {questions[validSelectedIndex].options.length < 4 && (
                      <button
                        onClick={() => addOption(validSelectedIndex)}
                        className={styles.addOption}
                      >
                        Add Option
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.timer}>
                  <p className={styles.timerP}>Timer</p>
                  <button
                    className={`${styles.timerb} ${
                      questions[validSelectedIndex].timer === 0
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleTimerChange(0)}
                  >
                    OFF
                  </button>
                  <button
                    className={`${styles.timerb} ${
                      questions[validSelectedIndex].timer === 5
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleTimerChange(5)}
                  >
                    5 sec
                  </button>
                  <button
                    className={`${styles.timerb} ${
                      questions[validSelectedIndex].timer === 10
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleTimerChange(10)}
                  >
                    10 sec
                  </button>
                </div>
                <div className={styles.modalButtons}>
                  <button
                    className={styles.cancelButton2}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.continueButton2}
                    onClick={handleCreateQuiz}
                  >
                    Create Quiz
                  </button>
                </div>
              </div>
            )}
            {modalStep === 3 && (
              <div className={styles.modalStep3}>
                <button className={styles.modalStep3Close} onClick={handleCloseModal}>x</button>
                <h2 className={styles.modalHeader}>
                  Congrats your Quiz is Published!
                </h2>
                <input
                  type="text"
                  value={quizLink}
                  readOnly
                  className={styles.input}
                />
                <div className={styles.modalButtons}>
                  <button
                    className={styles.shareButton}
                    onClick={handleShareLink}
                  >
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
