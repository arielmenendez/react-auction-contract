import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const abi = [
  {
    inputs: [],
    name: 'placeBid',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'endAuction',
    outputs: [],
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'bidder',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'NewBid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'AuctionEnded',
    type: 'event',
  },
]; // ABI of the deployed Auction contract

function App() {
  const [contract, setContract] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState('');
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [auctionWinner, setAuctionWinner] = useState('');
  const [winningBidAmount, setWinningBidAmount] = useState(0);

  useEffect(() => {
    // Connect to the Ethereum network
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Connect to the deployed contract using its address and ABI
    const auctionContract = new ethers.Contract(
      '0xYourContractAddressHere', // Replace with the deployed contract's address
      abi,
      provider
    );

    setContract(auctionContract);

    // Listen for events
    auctionContract.on('NewBid', (bidder, amount) => {
      setHighestBid(amount.toNumber());
      setHighestBidder(bidder);
    });

    auctionContract.on('AuctionEnded', (winner, amount) => {
      setAuctionEnded(true);
      setAuctionWinner(winner);
      setWinningBidAmount(ethers.utils.formatEther(amount));
    });
  }, []);

  const handlePlaceBid = async () => {
    if (contract && !auctionEnded) {
      const tx = await contract.placeBid({ value: bidAmount });
      await tx.wait();
    }
  };

  const handleEndAuction = async () => {
    if (contract) {
      const tx = await contract.endAuction();
      await tx.wait();
    }
  };

  return (
    <div>
      <p>Highest Bid: {highestBid} ETH</p>
      <p>Highest Bidder: {highestBidder}</p>
      {auctionEnded ? (
        <>
          <p>Auction Ended</p>
          <p>Auction Winner: {auctionWinner}</p>
          <p>Winning Bid Amount: {winningBidAmount} ETH</p>
        </>
      ) : (
        <div>
          <input
            type="number"
            placeholder="Enter bid amount (in ETH)"
            onChange={(e) => setBidAmount(e.target.value)}
          />
          <button onClick={handlePlaceBid}>Place Bid</button>
          <button onClick={handleEndAuction}>End Auction</button>
        </div>
      )}
    </div>
  );
}

export default App;
