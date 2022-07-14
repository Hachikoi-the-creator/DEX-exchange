import React from "react";
import { useState, useRef, useEffect } from "react";
import "./style.scss";
import { stringify } from "qs";
import { ethers, providers, Signer } from "ethers";
import { ABI } from "./utils/erc20";

function App() {
  const firstLoad = useRef(true); //trick to solve issues whit useEffect
  const [web3Connected, setWeb3Connected] = useState(false);
  const [modal, setModal] = useState(false);
  const userAdx = useRef("");
  const signerMetamask = useRef();

  const [tokens, setTokens] = useState();
  const tokensToSell = useRef(0);
  const getOrGive = useRef("");
  const [ranges, setRanges] = useState([0, 100]); //trick to solve the loading problem
  const [tokenSelection, setTokenSelection] = useState({
    fromToken: [],
    fromJsx: "Select Token",
    toToken: [],
    toJsx: "Select Token",
  });
  const [fetchResponse, setFetchResponse] = useState({ input: "", gas: "" });

  /*
   *Web3 logic
   */
  const connectWallet = async () => {
    console.log("conneticut");
    const { ethereum } = window;

    if (typeof ethereum === undefined) {
      window.alert("Please go and install metamask!");
      window.location.href = "https://metamask.io/";
    } else {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts");
        const signer = provider.getSigner();

        signerMetamask.current = signer;
        userAdx.current = await signer.getAddress();
        setWeb3Connected(true);

        console.log("Account:", await signer.getAddress());
      } catch (err) {
        console.log(err);
      }
    }
  };

  /*
   * JSX modifications
   */
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
            className="logo-img"
            src={args.logoURI}
            alt={`missing image for token ${args.name}`}
          />
          <span>{" " + args.symbol}</span>
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

  /*
   * handlers for the btns that avoid extreme load bug
   */
  const prevHandler = () => {
    if (ranges[0] <= 0) return;
    setRanges((prev) => [prev[0] - 100, prev[1] - 100]);
  };

  const nextHandler = () => {
    if (ranges[1] >= tokens.length) return;
    setRanges((prev) => [prev[0] + 100, prev[1] + 100]);
  };

  // Shows price everytime the user leaves the "from" input
  const fromBlurHandler = async (e) => {
    /**
     * @param ETH_value_in_decimals:int/string
     * @returns ETH equivalnce:string*/
    tokensToSell.current = ethers.utils.parseEther(e.target.value).toString();

    if (!checkValidInputs()) return;

    const params = {
      sellToken: tokenSelection.fromToken.address,
      buyToken: tokenSelection.toToken.address,
      sellAmount: tokensToSell.current,
    };
    console.log("big num: ", typeof tokensToSell.current);

    // get price from 0x
    const data = await fetch(
      `https://api.0x.org/swap/v1/price?${stringify(params)}`
    ).then((res) => {
      if (!res.ok) {
        //TODO: show another alert for this error
        console.log("Not available pools for selected pair, res: ", res);
      }
      return res.json();
    });

    /**
     * @param ETH_in_solidity_format:string
     * @returns ETH in decimals:string*/
    const amountTokenBuy = ethers.utils.formatEther(data.buyAmount).slice(0, 9);
    const estimatedGas = data.estimatedGas;
    // console.log("What is this?: ", typeof amountTokenBuy);

    setFetchResponse({ input: amountTokenBuy, gas: estimatedGas });
  };

  const getQuote = async () => {
    console.log("Swaping tokens");
    if (!checkValidInputs()) {
      console.log("Missing inputs, cannot make trade");
      return;
    }

    const params = {
      buyToken: tokenSelection.fromToken.address,
      sellToken: tokenSelection.toToken.address,
      sellAmount: tokensToSell.current,
      // takerAddress: userAdx.current,
    };

    const quote = await fetch(
      `https://api.0x.org/swap/v1/quote?${stringify(params)}`
    ).then((res) => {
      if (!res.ok) {
        // TODO: do something else here, an alert or something
        console.log("You have not enough balance to do this!", res);
      }
      return res.json();
    });

    console.log("The quote, responded whit", quote);
    return quote;
  };

  //* Helper to reduce verbose code
  function checkValidInputs() {
    if (
      tokenSelection.fromJsx === "Select Token" ||
      tokenSelection.toJsx === "Select Token" ||
      !tokensToSell.current
    ) {
      return false;
    }
    return true;
  }

  // * Swap helper, kinda
  async function swapTokens() {
    const ERC20Contract = new ethers.Contract(
      tokenSelection.fromToken.address,
      ABI,
      signerMetamask.current
    );
    console.log("contract instance", ERC20Contract);

    const quoteJson = await getQuote(); //needs to resolve the promise
    if (!quoteJson) return; //full top if there's a problem whit the quote

    // set max allowance
    let ercRes;
    try {
      ercRes = await ERC20Contract.approve(
        quoteJson.allowanceTarget,
        ethers.constants.MaxUint256
      );
    } catch (error) {
      console.log(error);
    }

    // perform swap
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.sendTransaction(ercRes);
    } catch (error) {
      console.log("Error doing the swap: ", erros);
    }
  }

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
            {web3Connected ? "Connected!" : "Connect Metamask"}
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
          <input
            type="number"
            placeholder="Enter amount above"
            disabled
            value={fetchResponse.input}
          />
        </div>
        <p className="estimate">Estimated gas {fetchResponse.gas}</p>
        {/* Small logic to only activate btn is wallet is connected */}
        {web3Connected ? (
          <button className="cursor" onClick={swapTokens}>
            Swap
          </button>
        ) : (
          <button className="cursor disabled-btn" disabled>
            Cannot Swap
          </button>
        )}
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
