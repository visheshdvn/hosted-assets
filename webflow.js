window.addEventListener("load", async function () {
  document
    .getElementById("getAllDataButton")
    .addEventListener("click", getALLNFTData);
  document
    .getElementById("connectToEth")
    .addEventListener("click", connectToEth);

  document.getElementById("mintNFT").addEventListener("click", mintNFT);
  document.getElementById("claimICT").addEventListener("click", claimICT);

  // get skins from tokenId
  document
    .getElementById("getSkinsBtn")
    .addEventListener("click", getSkinsFromTokenId);
});

//
async function connectToEth() {
  if (window.web3 !== "undefined") {
    window.web3 = new window.Web3(window.ethereum);
    await window.ethereum.enable();
  } else {
    console.log("No Web3 Detected... using HTTP Provider");
  }
}

async function getContractInstances() {
  let { web3 } = window;
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

async function getALLNFTData() {
  const { web3 } = window;
  try {
    let { ledNFTContractInstance } = await getContractInstances();
    let accounts = await web3.eth.getAccounts();

    let tokenIdToBlinkPatternObject = {};

    let circulatedTokens = await ledNFTContractInstance.methods
      .allMintedId()
      .call();
    // console.log(circulatedTokens);
    let totalSupply = circulatedTokens.length;

    for (let i = 0; i < totalSupply; i++) {
      let blinkingPattern = await ledNFTContractInstance.methods
        .getBlinkPatternOfTokenID(circulatedTokens[i])
        .call();
      tokenIdToBlinkPatternObject[circulatedTokens[i]] = blinkingPattern;

      let owner = await ledNFTContractInstance.methods
        .ownerOf(circulatedTokens[i])
        .call();

      tokenIdToBlinkPatternObject[circulatedTokens[i]] = [
        blinkingPattern,
        owner,
      ];
    }

    let data = {
      res: tokenIdToBlinkPatternObject,
    };

    if (data.res.length !== 0) {
      document.getElementById("outputHead2").innerHTML = `ALL NFT's Data`;
      let result = "";
      for (let [k, v] of Object.entries(data.res)) {
        result += `<li>TokenID: ${k}, <br> BlinkPattern: ${v[0]}, <br> Owner: ${v[1]} </li> <br>`;
      }
      result = `<ol> ${result} </ol>`;
      document.getElementById("outputBody2").innerHTML = result;
    } else {
      document.getElementById(
        "outputHead2"
      ).innerHTML = `No NFT for account: ${accounts[0]}`;
    }
  } catch (error) {
    // console.error("Error: ", error, {
    //   METHOD: "getALLNFTData()",
    //   FILE: "index.js",
    // });
    // throw error;

    if (!web3.eth) {
      document.getElementById("outputBody2").innerHTML = "<p style='color:red'>Connect to metamask.</p>";
    }
  }
}

//
async function mintNFT() {
  const { web3 } = window;
  const nos = document.getElementById("tokens").value;
  if (!nos || nos < 1 || nos > 3) {
    document.getElementById("outputBody3").innerHTML =
      "Not a valid number. Enter a value between 1 to 3.";
    setTimeout(() => {
      document.getElementById("outputBody3").innerHTML = "";
    }, 3000);
    return;
  }

  try {
    document.getElementById("outputBody3").innerHTML = "";
    document.getElementById("outputErrorBody3").innerHTML = "";

    let { ledNFTContractInstance } = await getContractInstances();
    let accounts = await web3.eth.getAccounts();
    let bal = await web3.eth.getBalance(accounts[0]);

    let mintedCount = await ledNFTContractInstance.methods
      .mintedTokens(accounts[0])
      .call();
    if (mintedCount >= 3) {
      document.getElementById("outputErrorBody3").innerHTML =
        "Cannot mint more than 3 tokens.";
      setTimeout(() => {
        document.getElementById("outputErrorBody3").innerHTML = "";
      }, 3000);
      return;
    }

    if (nos > 3 - mintedCount) {
      document.getElementById(
        "outputErrorBody3"
      ).innerHTML = `You can mint only ${3 - mintedCount} more tokens.`;
      setTimeout(() => {
        document.getElementById("outputErrorBody3").innerHTML = "";
      }, 3000);
      return;
    }

    let price = await ledNFTContractInstance.methods.getNFTPrice(nos).call();
    let ownerNFTCount = await ledNFTContractInstance.methods
      .ownerTotalTokensMintCount(accounts[0])
      .call();
    if (parseInt(bal) < parseInt(price)) {
      console.error("Insufficient Funds");
      document.getElementById("outputErrorBody3").innerHTML =
        "Insufficient Funds";
      return;
    }

    if (parseInt(ownerNFTCount) >= 3) {
      console.error("Max 3 NFT's can me minted");
      document.getElementById("outputErrorBody3").innerHTML =
        "Max 3 NFT's can me minted";
      return;
    }
    let r = await ledNFTContractInstance.methods
      .mintToken(nos)
      .send({ from: accounts[0], value: price, gas: 3500000 });

    console.log("Txn response: ", r);
    document.getElementById("outputBody3").innerHTML = "Minted successfully";
  } catch (error) {
    console.error("Error: ", error, { METHOD: "getData()", FILE: "index.js" });
    document.getElementById("outputErrorBody3").innerHTML = "Error";
  }
}

formElem.onsubmit = async (e) => {
  console.log("Here1");
  let { web3 } = window;
  const formElem = document.getElementById("formElem")
  try {
    document.getElementById("outputBody5").innerHTML = "";
    document.getElementById("outputErrorBody5").innerHTML = "";

    e.preventDefault();

    let formData = new FormData(formElem);
    let blinkPattern = formData.getAll("pattern").map((item) => parseInt(item));
    let data = {
      token_id: parseInt(formData.get("nftTokenId")),
      pattern: blinkPattern,
    };

    try {
      let { ledNFTContractInstance, ICTContractInstance } =
        await getContractInstances();
      let accounts = await web3.eth.getAccounts();

      let addressICTBalanceInWei = await ICTContractInstance.methods
        .balanceOf(accounts[0])
        .call();
      let addressICTBalanceInEth = window.Web3.utils.fromWei(
        addressICTBalanceInWei,
        "ether"
      );

      let ownerOfNFT;
      try {
        ownerOfNFT = await ledNFTContractInstance.methods
          .ownerOf(data.token_id)
          .call();
      } catch (error) {
        if (ownerOfNFT != accounts[0]) {
          document.getElementById("outputErrorBody5").innerHTML =
            "Not authorized";
          return;
        }
      }

      if (ownerOfNFT != accounts[0]) {
        document.getElementById("outputErrorBody5").innerHTML =
          "Not authorized";
        return;
      }
      console.log("Here2");
      if (addressICTBalanceInEth < 1) {
        document.getElementById("outputErrorBody5").innerHTML =
          "Insufficient funds";
        return;
      }
      await ledNFTContractInstance.methods
        .changeLEDBlinkPattern(data.token_id, data.pattern)
        .send({ from: accounts[0], gas: 3000000 })
        .on("error", function (error, receipt) {
          document.getElementById("outputErrorBody5").innerHTML = "Error";
          console.error("Error: ", error, {
            METHOD: "changeLEDBlinkPattern()",
            FILE: "index.js",
          });
          return;
        });
      console.log("Here3");
      document.getElementById("outputBody5").innerHTML = "Success";
      return;
    } catch (error) {
      console.error("Error: ", error, {
        METHOD: "changeBlinkPattern()",
        FILE: "index.js",
      });
    }
  } catch (error) {
    console.error("Error: ", error, {
      METHOD: "formElem.onsubmit()",
      FILE: "index.js",
    });
    document.getElementById("outputErrorBody5").innerHTML = "Error";
    return;
  }
};

async function claimICT() {
  const { web3, Web3 } = window
  console.log("Claiming ICT");
  let addressICTBalanceInEth;
  try {
    document.getElementById("outputBody4").innerHTML = "";
    document.getElementById("outputErrorBody4").innerHTML = "";

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
      document.getElementById(
        "outputBody4"
      ).innerHTML = `${addressICTBalanceInEth} ICT and no left for claim`;
      return;
    }

    await ICTContractInstance.methods
      .claim()
      .send({ from: accounts[0], gas: 3000000 })
      .on("error", function (error, receipt) {
        document.getElementById("outputErrorBody4").innerHTML = "Error";
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

    document.getElementById("outputBody4").innerHTML =
      addressICTBalanceInEth + ` ICT`;
  } catch (error) {
    console.error("Error: ", error, {
      METHOD: "getData()",
      FILE: "service.js",
    });
    document.getElementById("outputErrorBody4").innerHTML = "Server error";
    return;
  }
}


// get skins from token ID
async function getSkinsFromTokenId() {
  const { web3 } = window
  const textbox = document.getElementById("skinlist");
  const id = document.getElementById("tokenId").value;

  if (isNaN(id) || id == "") {
    console.log("not a number");
    textbox.innerText = "Not a valid number";
    return;
  }

  textbox.innerText = "";

  try {
    let { ledNFTContractInstance } = await getContractInstances();
    let accounts = await web3.eth.getAccounts();

    const owner = await ledNFTContractInstance.methods.ownerOf(id).call();

    if (owner !== accounts[0]) {
      textbox.innerHTML = "You are not the owner of the token.";
      return;
    }
    //
    const res = await ledNFTContractInstance.methods
      .getSkinsOfToken(id)
      .call({ from: accounts[0] });

    if (res.length === 0) {
      textbox.innerHTML = "No skins associated with this token.";
      return;
    }

    let result = "";
    var skin;
    for (skin in res) {
      result += `<li>${res[skin]}</li>`;
    }
    result = `<ol> ${result} </ol>`;
    textbox.innerHTML = result;
  } catch (err) {
    textbox.innerHTML = "non existant token";
    console.error("Error: ", err, {
      METHOD: "markForSale()",
      FILE: "index.js",
    });
  }
}