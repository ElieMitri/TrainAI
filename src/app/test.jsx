// return (
  //   <div className="authModal__overlay">
  //     {/* Backdrop */}
  //     <div className="authModal__backdrop" onClick={() => setIsOpen(false)} />

  //     {/* Modal */}
  //     <div className="authModal__container">
  //       {/* Close Button */}
  //       <button
  //         onClick={closeModal}
  //         className="authModal__closeBtn"
  //         aria-label="Close modal"
  //       >
  //         &times;
  //       </button>

  //       {/* Header */}
  //       <div className="authModal__header">
  //         <h2 className="authModal__title">
  //           {type === "signIn" ? "Login" : "Sign Up"}
  //         </h2>
  //         <p className="authModal__subtitle">
  //           {type === "signIn"
  //             ? "Please sign in to your account"
  //             : "Please fill in your details"}
  //         </p>
  //       </div>

  //       {/* Notification */}
  //       <Notification
  //         type={notification.type}
  //         message={notification.message}
  //         isVisible={notification.visible}
  //         onClose={hideNotification}
  //       />

  //       {/* Form */}
  //       <form
  //         onSubmit={type === "signIn" ? login : handleSubmit}
  //         className="authModal__form"
  //       >
  //         {type === "tryFree" && (
  //           <div className="authModal__formGroup">
  //             <label htmlFor="name" className="authModal__label">
  //               Name
  //             </label>
  //             <div className="authModal__inputWrapper">
  //               <span className="authModal__icon">👤</span>
  //               <input
  //                 type="text"
  //                 id="name"
  //                 className="authModal__input"
  //                 placeholder="Enter your name"
  //                 required
  //                 ref={userName}
  //               />
  //             </div>
  //           </div>
  //         )}

  //         <div className="authModal__formGroup">
  //           <label htmlFor="email" className="authModal__label">
  //             Email Address
  //           </label>
  //           <div className="authModal__inputWrapper">
  //             <span className="authModal__icon">📧</span>
  //             <input
  //               type="email"
  //               id="email"
  //               className="authModal__input"
  //               placeholder="Enter your email"
  //               required
  //               ref={userEmail}
  //             />
  //           </div>
  //         </div>

  //         <div className="authModal__formGroup">
  //           <label htmlFor="password" className="authModal__label">
  //             Password
  //           </label>
  //           <div className="authModal__inputWrapper">
  //             <span className="authModal__icon">🔒</span>
  //             <input
  //               type="password"
  //               id="password"
  //               className="authModal__input"
  //               placeholder="Enter your password"
  //               required
  //               ref={userPassword}
  //             />
  //           </div>
  //         </div>

  //         <button
  //           type="submit"
  //           className="btn btn-primary"
  //           disabled={loading}
  //         >
  //           {loading
  //             ? "Processing..."
  //             : type === "signIn"
  //             ? "Login"
  //             : "Create Account"}
  //         </button>
  //       </form>

  //       {/* Footer */}
  //       <div className="authModal__footer">
  //         {type === "signIn" ? (
  //           <p>
  //             Don’t have an account?{" "}
  //             <button
  //               className="authModal__switchBtn"
  //               onClick={(e) => {
  //                 e.preventDefault();
  //                 onClose();
  //                 setActiveModal("tryFree");
  //               }}
  //             >
  //               Sign up
  //             </button>
  //           </p>
  //         ) : (
  //           <p>
  //             Already have an account?{" "}
  //             <button
  //               className="authModal__switchBtn"
  //               onClick={(e) => {
  //                 e.preventDefault();
  //                 onClose();
  //                 setActiveModal("signIn");
  //               }}
  //             >
  //               Login
  //             </button>
  //           </p>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );