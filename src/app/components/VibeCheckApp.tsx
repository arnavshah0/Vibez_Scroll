import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Replace these values with your actual contract details
const CONTRACT_ADDRESS = "0x813b39B953098EeB98e890d7db854A22ecb38f62";
const CONTRACT_ABI = [
  "function vibeCheck() external",
  "event VibeChecked(address Viber, uint256 tokenId)",
  "event VibeNotChecked(address Viber)",
  "function currentTokenId() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function tokenURI(uint256) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function ownerOf(uint256) view returns (address)",
];

const SCROLL_DEVNET_RPC = "l1sload-rpc.scroll.io";
const SCROLL_CHAIN_ID = "2227728"; // Scroll Sepolia testnet

const NFT_IMAGE_URL =
  "https://cdn.prod.website-files.com/5a9ee6416e90d20001b20038/63c1cfdfc00b88fb10e4b0fc_horizontal%20(9).svg";

const VibeCheckApp = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [vibeCheckStatus, setVibeCheckStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [tokenId, setTokenId] = useState(null);
  const [txReceipt, setTxReceipt] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Switching to Scroll network...");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${parseInt(SCROLL_CHAIN_ID).toString(16)}` }],
        });
      } catch (switchError) {
        console.log("Switch error:", switchError);
        if (switchError.code === 4902) {
          console.log("Network not added, attempting to add...");
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${parseInt(SCROLL_CHAIN_ID).toString(16)}`,
                  chainName: "Scroll Sepolia",
                  rpcUrls: [SCROLL_DEVNET_RPC],
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                },
              ],
            });
          } catch (addError) {
            console.error("Add network error:", addError);
            throw addError;
          }
        } else {
          throw switchError;
        }
      }

      console.log("Setting up Web3 provider...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      console.log("Creating contract instance...");
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      console.log("Connected account:", accounts[0]);
      setAccount(accounts[0]);
      setContract(contractInstance);
    } catch (error) {
      console.error("Detailed connection error:", error);
      alert(`Error connecting wallet: ${error.message || "Unknown error"}`);
    }
  };

  const checkVibe = async () => {
    try {
      setIsLoading(true);
      console.log("Starting vibe check...");

      // Ensure contract is initialized
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      console.log("Calling vibeCheck function...");
      // Add gas limit explicitly
      const tx = await contract.vibeCheck({
        gasLimit: 300000, // Adjust this value based on your needs
      });

      console.log("Transaction sent:", tx.hash);
      setTxHash(tx.hash);

      console.log("Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      setTxReceipt(receipt);

      console.log("Transaction receipt:", receipt);

      const vibeCheckedEvent = receipt.events?.find(
        (e) => e.event === "VibeChecked"
      );

      if (vibeCheckedEvent) {
        console.log("Vibe check passed!");
        setVibeCheckStatus("passed");
        setTokenId(vibeCheckedEvent.args.tokenId.toString());
      } else {
        console.log("Vibe check failed!");
        setVibeCheckStatus("failed");
      }
    } catch (error) {
      console.error("Detailed error:", error);
      if (error.code === "ACTION_REJECTED") {
        alert("Transaction rejected by user");
      } else if (error.code === -32603) {
        alert(
          "Internal JSON-RPC error. Please check your wallet connection and contract address."
        );
      } else {
        alert(`Error checking vibe: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Vibe Check NFT
          </h1>

          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-6">
              <div className="text-center text-gray-600">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </div>

              {!vibeCheckStatus && (
                <button
                  onClick={checkVibe}
                  disabled={isLoading}
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? "Checking Vibe..." : "Vibe Check"}
                </button>
              )}

              {vibeCheckStatus === "passed" && (
                <div className="space-y-6 text-center">
                  <div className="w-96 h-48 mx-auto rounded-xl overflow-hidden bg-white shadow-lg">
                    <img
                      src={NFT_IMAGE_URL}
                      alt="Vibe Check NFT"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-purple-600">
                      Congratulations! You Passed the Vibe Check!
                    </h2>
                    <p className="text-gray-600">Token ID: {tokenId}</p>

                    {/* Transaction Details */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left text-sm text-black">
                      <h3 className="font-semibold mb-2">
                        Transaction Details:
                      </h3>
                      <div className="space-y-1">
                        <p>
                          Status:{" "}
                          <span className="text-green-600">Success</span>
                        </p>
                        <p>Block Number: {txReceipt?.blockNumber}</p>
                        <p>
                          Transaction Hash:
                          <a
                            href={`https://l1sload-blockscout.scroll.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-purple-600 hover:underline break-all"
                          >
                            {txHash}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="text-gray-600">
                      <h3 className="font-semibold mb-2">
                        Your Exclusive Perks:
                      </h3>
                      <ul className="space-y-2">
                        <li>🎉 Access to exclusive community events</li>
                        <li>💎 Priority minting for future drops</li>
                        <li>🎭 Special role in Discord</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {vibeCheckStatus === "failed" && (
                <div className="text-center text-gray-600 py-8">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">
                    Sorry, You Did Not Pass the Vibe Check
                  </h2>
                  <p className="mb-4">
                    You need to hold at least 2 NFTs total between BAYC and
                    Punks!
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left text-sm">
                    <h3 className="font-semibold mb-2">Transaction Details:</h3>
                    <div className="space-y-1">
                      <p>
                        Status:{" "}
                        <span className="text-red-600">Failed Check</span>
                      </p>
                      <p>
                        Transaction Hash:
                        <a
                          href={`https://l1sload-blockscout.scroll.io/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-purple-600 hover:underline break-all"
                        >
                          {txHash}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VibeCheckApp;
