window.addEventListener("load", async function () {
  setTimeout(() => {
    document.querySelector(".my-node").innerHTML = "";
  }, 3000);

  document
    .getElementById("connectToEth")
    .addEventListener("click", connectToEth);

  document.getElementById("claimICT").addEventListener("click", claimICT);
  //   document.getElementById("getSkinsBtn").addEventListener("click", getNFTData);
});

// connect to metamask
async function connectToEth() {
  let { Web3 } = window;
  const web3 = new Web3(window.ethereum);
  if (web3 !== "undefined") {
    await window.ethereum.enable();
  } else {
    console.log("No Web3 Detected... using HTTP Provider");
  }
  // show account address

  let accounts = await web3.eth.getAccounts();
  console.log(`Wallet address: ${accounts[0]}`);

  // populate page
  console.log("population started");
  await populatePageData();

  // total supply
  //   getTotalSupply();
}

//get contract instance
async function getContractInstances() {
  let { Web3 } = window;
  const web3 = new Web3(window.ethereum);
  try {
    let LedNFT_ABI, ICT_ABI;

    let ledNftFileResponse = await fetch(
      "https://raw.githubusercontent.com/visheshdvn/hosted-assets/main/webflow_goreli_ABIs/LedNFT.json"
    );
    LedNFT_ABI = await ledNftFileResponse.json();

    let ICTFileResponse = await fetch(
      "https://raw.githubusercontent.com/visheshdvn/hosted-assets/main/webflow_goreli_ABIs/IntensityChangeToken.json"
    );
    ICT_ABI = await ICTFileResponse.json();

    // let web3 = await getWeb3();
    const id = await web3.eth.net.getId();

    const ledNFTContractAddress = LedNFT_ABI.networks[id].address;
    const ledNFTContractInstance = new web3.eth.Contract(
      LedNFT_ABI.abi,
      ledNFTContractAddress
    );

    const ICTContractAddress = ICT_ABI.networks[id].address;
    const ICTContractInstance = new web3.eth.Contract(
      ICT_ABI.abi,
      ICTContractAddress
    );

    return Promise.resolve({
      // web3,
      ledNFTContractInstance,
      ICTContractInstance,
    });
  } catch (error) {
    console.error("Error: ", error, {
      METHOD: "getWeb3AndContractInstances",
      FILE: "index.js",
    });
    console.error("Error: ", error, {
      METHOD: "getContractInstance()",
      FILE: "index.js",
    });
    // throw error;
  }
}

async function populatePageData() {
  console.log("please wait for the data to appear...");
  const web3 = new Web3(window.ethereum);
  try {
    if ((await web3.eth.net.getNetworkType()) !== "goerli") {
      window.alert("Connect to goerli network");
      throw new Error("Connect to Goerli network");
    }

    let { ledNFTContractInstance } = await getContractInstances();
    let populationData = [];
    console.log("got contract instance");

    let balanceOfNFTForThisAddress = await ledNFTContractInstance.methods
      .balanceOf(accounts[0])
      .call();
    console.log("balance:", balanceOfNFTForThisAddress);

    for (let i = 0; i < balanceOfNFTForThisAddress; i++) {
      console.log("calling1");
      let tokenId = await ledNFTContractInstance.methods
        .tokenOfOwnerByIndex(accounts[0], i)
        .call();

      console.log("calling2");
      let blinkingPattern = await ledNFTContractInstance.methods
        .getBlinkPatternOfTokenID(tokenId)
        .call();

      console.log("calling3");
      const skins = await ledNFTContractInstance.methods
        .getSkinsOfToken(id)
        .call({ from: accounts[0] });

      populationData.push({ tokenId, blinkingPattern, skins });
    }

    console.log(populationData);
  } catch (err) {
    console.log(err);
    console.log("population error");
  }
}

// async function getTotalSupply() {
//   const web3 = new Web3(window.ethereum);
//   try {
//     if ((await web3.eth.net.getNetworkType()) !== "goerli") {
//       window.alert("Connect to goerli network");
//       throw new Error("Connect to Goerli network");
//     }
//     let { ledNFTContractInstance } = await getContractInstances();

//     let circulatedTokens = await ledNFTContractInstance.methods
//       .allMintedId()
//       .call();
//     document.getElementById(
//       "totalsupplycount"
//     ).innerHTML = `${circulatedTokens.length} / 2048`;
//   } catch (e) {
//     console.log("Error");
//   }
// }

async function claimICT() {
  let { Web3 } = window;
  const web3 = new Web3(window.ethereum);
  console.log("Claiming ICT");
  let addressICTBalanceInEth;
  try {
    if ((await web3.eth.net.getNetworkType()) !== "goerli") {
      window.alert("Connect to goerli network");
      throw new Error("Connect to Goerli network");
    }

    let { ledNFTContractInstance, ICTContractInstance } =
      await getContractInstances();
    let accounts = await web3.eth.getAccounts();
    let totalNftForThisAccount = await ledNFTContractInstance.methods
      .balanceOf(accounts[0])
      .call();

    let flag = false;
    for (let i = 0; i < totalNftForThisAccount; i++) {
      let tokenId = await ledNFTContractInstance.methods
        .tokenOfOwnerByIndex(accounts[0], i)
        .call();

      let lastClaimedNFTIdToAgeMapping = await ICTContractInstance.methods
        .lastClaimedNFTIdToAgeMapping(tokenId)
        .call();
      if (lastClaimedNFTIdToAgeMapping != 400) {
        flag = true;
      }
    }

    if (!flag) {
      let addressICTBalanceInWei = await ICTContractInstance.methods
        .balanceOf(accounts[0])
        .call();
      addressICTBalanceInEth = Web3.utils.fromWei(
        addressICTBalanceInWei,
        "ether"
      );
      document.getElementById("ictoutput").innerHTML =
        "ICT (Pulse Tokens) <br/>" +
        `${addressICTBalanceInEth} ICT and no left for claim`;
      console.log(`${addressICTBalanceInEth} ICT and no left for claim`);
      return;
    }

    await ICTContractInstance.methods
      .claim()
      .send({ from: accounts[0], gas: 3000000 })
      .on("error", function (error, receipt) {
        console.log("Error");
        console.error("Error: ", error, {
          METHOD: "claim()",
          FILE: "index.js",
        });
        return;
      });

    let addressICTBalanceInWei = await ICTContractInstance.methods
      .balanceOf(accounts[0])
      .call();
    addressICTBalanceInEth = Web3.utils.fromWei(
      addressICTBalanceInWei,
      "ether"
    );
    document.getElementById("ictoutput").innerHTML =
      "ICT (Pulse Tokens) <br/>" + addressICTBalanceInEth + ` ICT`;

    console.log("claimed " + addressICTBalanceInEth + ` ICT`);
    document.getElementById("ictMessage").innerText = addressICTBalanceInEth;
  } catch (error) {
    console.error("Error: ", error, {
      METHOD: "getData()",
      FILE: "service.js",
    });
    return;
  }
}

// get NFT data
// async function getNFTData() {
//   let { Web3 } = window;
//   const web3 = new Web3(window.ethereum);
//   try {
//     if ((await web3.eth.net.getNetworkType()) !== "goerli") {
//       window.alert("Connect to goerli network");
//       throw new Error("Connect to Goerli network");
//     }
//     let { ledNFTContractInstance } = await getContractInstances();
//     let accounts = await web3.eth.getAccounts();

//     // let contractInstance = ledNFTContractInstance;
//     let balanceOfNFTForThisAddress = await ledNFTContractInstance.methods
//       .balanceOf(accounts[0])
//       .call();

//     let tokenId;
//     if (balanceOfNFTForThisAddress >= 1) {
//       tokenId = await ledNFTContractInstance.methods
//         .tokenOfOwnerByIndex(accounts[0], 0)
//         .call();
//     } else {
//       throw new Error("You don't have any tokens");
//       return;
//     }

//     const res = await ledNFTContractInstance.methods
//       .getSkinsOfToken(tokenId)
//       .call({ from: accounts[0] });

//     let result = "";
//     for (let skin in res) {
//       result += `<li>${res[skin]}</li>`;
//     }
//     result = `<ol> ${result} </ol>`;
//     document.getElementById("skinsoutput").innerHTML = result;
//   } catch (err) {
//     console.error("Error: ", err, {
//       METHOD: "markForSale()",
//       FILE: "index.js",
//     });
//   }
// }

// formElem.onsubmit = async (e) => {
//   e.preventDefault();
//   console.log("Here1");
//   let { Web3 } = window;
//   const web3 = new Web3(window.ethereum);
//   const formElem = document.getElementById("formElem");
//   try {
//     if ((await web3.eth.net.getNetworkType()) !== "goerli") {
//       window.alert("Connect to goerli network");
//       throw new Error("Connect to Goerli network");
//     }
//     let { ledNFTContractInstance, ICTContractInstance } =
//       await getContractInstances();
//     let accounts = await web3.eth.getAccounts();

//     let tokenId = await ledNFTContractInstance.methods
//       .tokenOfOwnerByIndex(accounts[0], 0)
//       .call();

//     let formData = new FormData(formElem);
//     let blinkPattern = formData.getAll("pattern").map((item) => parseInt(item));
//     let data = {
//       token_id: tokenId,
//       pattern: blinkPattern,
//     };

//     try {
//       let addressICTBalanceInWei = await ICTContractInstance.methods
//         .balanceOf(accounts[0])
//         .call();
//       let addressICTBalanceInEth = window.Web3.utils.fromWei(
//         addressICTBalanceInWei,
//         "ether"
//       );

//       let ownerOfNFT;
//       try {
//         ownerOfNFT = await ledNFTContractInstance.methods
//           .ownerOf(data.token_id)
//           .call();
//       } catch (error) {
//         if (ownerOfNFT != accounts[0]) {
//           console.log("Not authorized");
//           return;
//         }
//       }

//       if (ownerOfNFT != accounts[0]) {
//         console.log("Not authorized");
//         return;
//       }
//       console.log("Here2");
//       if (addressICTBalanceInEth < 1) {
//         console.log("Insufficient funds");
//         return;
//       }
//       await ledNFTContractInstance.methods
//         .changeLEDBlinkPattern(data.token_id, data.pattern)
//         .send({ from: accounts[0], gas: 3000000 })
//         .on("error", function (error, receipt) {
//           console.error("Error: ", error, {
//             METHOD: "changeLEDBlinkPattern()",
//             FILE: "index.js",
//           });
//           return;
//         });
//       console.log("Success");
//       return;
//     } catch (error) {
//       console.error("Error: ", error, {
//         METHOD: "changeBlinkPattern()",
//         FILE: "index.js",
//       });
//     }
//   } catch (error) {
//     console.error("Error: ", error, {
//       METHOD: "formElem.onsubmit()",
//       FILE: "index.js",
//     });
//     return;
//   }
// };
