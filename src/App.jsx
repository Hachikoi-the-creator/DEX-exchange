import React from "react";
import { useState, useRef, useEffect } from "react";
import "./style.scss";

function App() {
  const [tokens, setTokens] = useState();
  const [modal, setModal] = useState(false);
  const firstLoad = useRef(true); //trick to solve issues whit useEffect
  const getOrGive = useRef("");
  const [ranges, setRanges] = useState([0, 100]); //trick to solve the loading problem
  const [tokenSelection, setTokenSelection] = useState({
    fromToken: [],
    fromJsx: "Select Token",
    toToken: [],
    toJsx: "Select Token",
  });

  // Web3 logic
  const connectWallet = async () => {
    console.log("conneticut");
  };

  const selectHandler = (side) => {
    setModal(true);
    if (side == "giveToken") {
      // upper side
      getOrGive.current = "give";
    } else {
      getOrGive.current = "get";
    }
  };

  const tokenSelectHandler = (e) => {
    const index = +e.target.children[1].outerText;

    const changeInnerHTML = (args) => {
      return (
        <>
          <img
            src={args.logoURI}
            alt={`missing image for token ${args.name}`}
          />
          <span>{args.symbol}</span>
          <span style={{ display: "none" }}>{index}</span>
        </>
      );
    };

    const field = changeInnerHTML(tokens[index]);
    setModal(false);

    console.log("check e value", e.target.children[1].outerText);
    console.log("get or give?: ", getOrGive.current);

    if (getOrGive.current == "give") {
      setTokenSelection((prev) => ({
        fromToken: tokens[index],
        fromJsx: field,
        toToken: prev.toToken,
        toJsx: prev.toJsx,
      }));
      console.log("trying to from :", index);
    } else {
      setTokenSelection((prev) => ({
        fromToken: prev.fromToken,
        fromJsx: prev.fromJsx,
        toToken: tokens[index],
        toJsx: field,
      }));
      console.log("trying to tot :", index);
    }
    console.log(tokenSelection);
  };

  const prevHandler = () => {
    if (ranges[0] <= 0) return;
    setRanges((prev) => [prev[0] - 100, prev[1] - 100]);
  };

  const nextHandler = () => {
    if (ranges[1] >= tokens.length) return;
    setRanges((prev) => [prev[0] + 100, prev[1] + 100]);
  };

  // Shows price everytime the user leaves the "from" input
  const fromBlurHandler = (e) => {
    const inputVal = e.target.value;

    // console.log(
    //   "printing state: ",
    //   inputVal,
    //   tokenSelection.fromJsx,
    //   tokenSelection.toJsx
    // );

    if (
      tokenSelection.fromJsx === "Select Token" ||
      tokenSelection.toJsx === "Select Token" ||
      !e.target.value
    ) {
      return;
    } else {
      console.log(
        "can't see shit unu",
        inputVal * 10 ** tokenSelection.fromToken.decimals
      );
    }
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
        <div className="swap-from flex" onBlur={(e) => fromBlurHandler(e)}>
          <p
            onClick={(e) => selectHandler("giveToken", e)}
            className="cursor swap-from-p"
          >
            {tokenSelection.fromJsx}
          </p>
          <input type="number" placeholder="Enter amount" id="from-input" />
        </div>

        <div className="swap-to flex">
          <p
            onClick={(e) => selectHandler("getToken", e)}
            className="cursor swap-to-p"
          >
            {tokenSelection.toJsx}
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
                    // console.log("ascii", object);
                    return (
                      <li key={index}>
                        {/* a way to select that exact token */}
                        <button
                          className="token-btn"
                          onClick={(e) => tokenSelectHandler(e)}
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
