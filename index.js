import { ethers } from "./ethers-5.2.esm.min.js"
import { fundMeContractAbi, fundMeContractAddress } from "./constants.js"

const connectBtn = document.getElementById("connectBtn")
const fundBtn = document.getElementById("fundBtn")
const balanceBtn = document.getElementById("balanceBtn")
const withdrawBtn = document.getElementById("withdrawBtn")
const ethAmountInput = document.getElementById("ethAmount")

connectBtn.addEventListener("click", handleConnect)
fundBtn.addEventListener("click", handleFund)
balanceBtn.addEventListener("click", handleBalance)
withdrawBtn.addEventListener("click", handleWithdraw)
ethAmountInput.addEventListener("input", changeEthAmount)

async function handleConnect() {
  if (window.ethereum !== undefined) {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectBtn.innerHTML = "Connected!"
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
  } else {
    connectBtn.innerHTML = "Please install metamask!"
  }
}

async function handleFund() {
  const ethAmount = String(Number(ethAmountInput.value) || 0)
  console.log(`Funding with ${ethAmount}...`)

  if (window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      fundMeContractAddress,
      fundMeContractAbi,
      signer
    )

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Done!")
    } catch (error) {
      console.error(error)
    }
  }
}

async function handleBalance() {
  if (window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(fundMeContractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function handleWithdraw() {
  if (window.ethereum !== undefined) {
    console.log("Withdrawing...")

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      fundMeContractAddress,
      fundMeContractAbi,
      signer
    )

    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}

function changeEthAmount(e) {
  const value = String(Number(e.target.value) || 0)
  console.log(value)
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`)
  return new Promise((resolve) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
  // return new Promise((resolve, reject) => {})
}
