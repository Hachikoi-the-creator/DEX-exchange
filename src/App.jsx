import React from "react";
import { useState, useRef, useEffect } from "react";
import "./style.scss";

function App() {
  const [tokens, setTokens] = useState("");
  const [modal, setModal] = useState(false);
  const firstLoad = useRef(true); //trick to solve issues whit useEffect

  // Web3 logic
  const connectWallet = async () => {
    console.log("cum");
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

    if (firstLoad.current) {
      fetchData();
      firstLoad.current = false;
    } else {
      console.log("React 8 doing funny dual mounting");
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
          <div className="tokens">{"tokens hehe "}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
