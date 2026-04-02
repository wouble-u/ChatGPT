import { ethers } from "ethers";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { score, walletAddress } = req.body;
    
    // Validate inputs
    if (!score || score <= 0) {
      throw new Error("Invalid score");
    }
    
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      throw new Error("Invalid wallet address");
    }

    // Validate environment variables
    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      throw new Error("Server configuration error");
    }

    // Calculate token reward: score / 10 = tokens (e.g., 100 score = 10 DNAC)
    const tokenAmount = ethers.parseUnits((score / 10).toString(), 18);

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // BrainToken/DNAC contract with mint function
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      [
        "function mint(address to, uint256 amount) public",
        "function balanceOf(address account) view returns (uint256)"
      ],
      wallet
    );

    // Mint tokens to user wallet
    const tx = await contract.mint(walletAddress, tokenAmount);
    await tx.wait();

    // Get new balance
    const newBalance = await contract.balanceOf(walletAddress);

    res.status(200).json({
      success: true,
      txHash: tx.hash,
      tokenAmount: ethers.formatUnits(tokenAmount, 18),
      newBalance: ethers.formatUnits(newBalance, 18),
      message: `Successfully minted ${ethers.formatUnits(tokenAmount, 18)} DNAC tokens`
    });
  } catch (err) {
    console.error("Reward API Error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to process reward" 
    });
  }
}
