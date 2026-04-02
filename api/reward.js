import { ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { score } = req.body;
    if (!score) throw new Error("Score missing");

    // Calculate token amount: score / 10 = DNAC tokens (18 decimals)
    const tokenAmount = ethers.parseUnits((score / 10).toString(), 18);
    
    // Hardcoded target wallet for rewards
    const targetWallet = "0x887a18074c60b0892e41115D0612796F542E3c19";

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // BrainToken/DNAC contract with mint function
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      ["function mint(address to, uint256 amount) public"],
      wallet
    );

    // Mint tokens to target wallet
    const tx = await contract.mint(targetWallet, tokenAmount);
    await tx.wait();

    res.status(200).json({ 
      success: true, 
      txHash: tx.hash, 
      tokenAmount: tokenAmount.toString() 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
