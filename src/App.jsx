import React from "react";
import { useState, useRef, useEffect } from "react";
import "./style.scss";

function App() {
  const [tokens, setTokens] = useState();
  const [modal, setModal] = useState(false);
  const firstLoad = useRef(true); //trick to solve issues whit useEffect
  const [ranges, setRanges] = useState([0, 100]); //trick to solve the loading problem

  // Web3 logic
  const connectWallet = async () => {
    console.log("conneticut");
  };

  const logFecth = () => {
    console.log(tokens);
  };

  const prevHandler = () => {
    if (ranges[0] <= 0) return;
    setRanges((prev) => [prev[0] - 100, prev[1] - 100]);
  };

  const nextHandler = () => {
    if (ranges[1] >= tokens.length) return;
    setRanges((prev) => [prev[0] + 100, prev[1] + 100]);
  };

  useEffect(() => {
    // fetch function, CORS errors if declared outside useEffect
    async function fetchData() {
      console.log("Fetching!");
      const tokenList = await fetch(
        "https://tokens.coingecko.com/uniswap/all.json"
      );
      const tokenListJSON = await tokenList.json();
      console.log("Fetched!");
      setTokens(tokenListJSON.tokens);
    }

    // trick to avoid multiple fetching due to dual mounting
    if (firstLoad.current) {
      fetchData();
      firstLoad.current = false;
    }
  });

  return (
    <div id="app">
      {/* navbar */}
      <ul className="navbar">
        <li>
          <h1>My DEX aggregator</h1>
        </li>
        <li>
          <button onClick={connectWallet} className="cursor">
            Connect Metamask
          </button>
        </li>
      </ul>
      {/* Swap container */}
      <div className="container flex">
        <h2>Swap</h2>
        <div className="swap-from flex">
          <p onClick={() => setModal(true)} className="cursor">
            Select token
          </p>
          <input type="number" placeholder="Enter amount" />
        </div>
        <div className="swap-to flex">
          <p onClick={() => setModal(true)} className="cursor">
            Select token
          </p>
          <input type="number" placeholder="Enter amount" />
        </div>
        <p className="estimate">Estimated gas</p>
        <button className="cursor"> Swap </button>
      </div>
      {/* modal */}
      <div
        id="myModal"
        className={`modal ${modal ? "show-modal" : "hidde-modal"}`}
      >
        <div className="modal-content">
          <span className="close" onClick={() => setModal(false)}>
            &times;
          </span>
          <div className="tokens">
            <p>Choose a token</p>
            {/* pagination btns */}
            <div className="pagination pag-top">
              <button className="prev-btn" onClick={prevHandler}>
                Prev
              </button>
              <button className="next-btn" onClick={nextHandler}>
                Next
              </button>
            </div>

            {/* tokens */}
            <ul>
              {tokens &&
                tokens.map((object, index) => {
                  if (index >= ranges[0] && index < ranges[1]) {
                    // console.log("ass", object);
                    return (
                      <li key={index}>
                        {/* a way to select that exact token */}
                        <button
                          className="token-btn"
                          onClick={(e) => {
                            console.log(e.target.children[1].outerText);
                          }}
                        >
                          <img
                            src={object.logoURI}
                            alt={`missing logo for item ${index}`}
                          />
                          {" " + object.name}
                          {` (${object.symbol})`}
                          <span style={{ display: "none" }}>{index}</span>
                        </button>
                      </li>
                    );
                  }
                })}
            </ul>

            {/* pagination btns */}
            <div className="pagination">
              <button className="prev-btn" onClick={prevHandler}>
                Prev
              </button>
              <button className="next-btn" onClick={nextHandler}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
