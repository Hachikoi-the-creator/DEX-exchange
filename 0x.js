import { ERC20TokenContract } from "@0x/contract-wrappers";
import { BigNumber } from "@0x/utils";

const test = async () => {
  const web3 = window.web3;

  // Get a quote from 0x API which contains `allowanceTarget`
  // This is the contract that the user needs to set an ERC20 allowance for
  const quote = await fetch(
    `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
  ).then((res) => res.json());

  // // Set up approval
  // const USDCaddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  // const USDCcontract = new ERC20TokenContract(
  //   USDCaddress,
  //   web3.eth.currentProvider
  // );
  // const maxApproval = new BigNumber(2).pow(256).minus(1);

  // // Send the approval to the allowance target smart contract
  // // const chainId = 1;
  // const approvalTxData = USDCcontract.approve(
  //   quote.allowanceTarget,
  //   maxApproval
  // ).getABIEncodedTransactionData();
  // // await web3.eth.sendTransaction(approvalTxData);
  // console.log(approvalTxData);
};
test();
// ---------
// FREN QUOTE
// ---------
const getQuote = async () => {
  // if user puts in number of tokens before chossing tokens, don't wate time computing
  if (!token0Address || !token1Address) return;

  // if MetaMask isn't logged in, show error and return
  if (!signer) {
    // TODO error
    return;
  }

  // get user inputed value
  let amount = token0Amount;
  // format it because Solidity doesn't deal with floating point numbers
  amount = ethers.utils.parseEther(amount);

  // set query params.
  // NOTE! you have to call toString() on amount because it's a BigNumber
  // I spent like an hour trying to debug that one. Writing a long-ass
  // comment here so I (hopefully) remember in the future.
  const params = {
    sellToken: token0Address,
    buyToken: token1Address,
    sellAmount: amount.toString(),
    takerAddress: signer._address, // logged in address with MetaMask
  };

  // fetch the swap price and gas price
  const response = await fetch(
    `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
  );
  let swapQuoteJSON = await response.json();
  return swapQuoteJSON;
};
