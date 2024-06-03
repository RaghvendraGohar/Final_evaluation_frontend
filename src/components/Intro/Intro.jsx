import React, { useState } from "react";
import styles from "./Intro.module.css";
import { registerUser,loginUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export default function Intro() {
  const navigate  = useNavigate();
  const [activeButton, setActiveButton] = useState("Sign");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (activeButton === "Sign") {
      if (!formData.name) newErrors.name = "Invalid name";
    }
    if (!formData.email) newErrors.email = "Invalid Email";
    if (!formData.password) newErrors.password = "Weak password";
    if (activeButton === "Sign" && (formData.password !== formData.confirmPassword || !formData.confirmPassword)) {
      newErrors.confirmPassword = "Password doesn't match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      if (activeButton === "Sign") {
        const response = await registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        if (response) {
          console.log("Registration successful", response);
          
        }
      } else {
        const response = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        if (response) {
          console.log("Login successful", response);
          navigate("/dashboard")
        }
      }
    }
  };

  const getButtonText = () => {
    return activeButton === "Sign" ? "Sign-Up" : "Log In";
  };

  const renderFormFields = () => {
    return (
      <>
        {activeButton === "Sign" && (
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <input
              className={`${styles.input} ${errors.name ? styles.error : ""}`}
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder={errors.name ? errors.name : ""}
            />
          </div>
        )}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            className={`${styles.input} ${errors.email ? styles.error : ""}`}
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={errors.email ? errors.email : ""}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            className={`${styles.input} ${errors.password ? styles.error : ""}`}
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={errors.password ? errors.password : ""}
          />
        </div>
        {activeButton === "Sign" && (
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              className={`${styles.input} ${errors.confirmPassword ? styles.error : ""}`}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={errors.confirmPassword ? errors.confirmPassword : ""}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <div className={styles.heading}>QUIZZIE</div>
        <div className={styles.credButtons}>
          <button
            className={`${styles.Sign} ${activeButton === "Sign" ? styles.active : ""}`}
            onClick={() => handleButtonClick("Sign")}
          >
            Sign Up
          </button>
          <button
            className={`${styles.LogIn} ${activeButton === "LogIn" ? styles.active : ""}`}
            onClick={() => handleButtonClick("LogIn")}
          >
            Log In
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {renderFormFields()}
          <button id="submission_button" type="submit" className={styles.buttonSubmite}>
            {getButtonText()}
          </button>
        </form>
        {/* <button id="submission_button" type="submit" className={styles.button}>
            {getButtonText()}
          </button> */}
      </div>
    </div>
  );
}
