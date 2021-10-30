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

  document
    .getElementById("getSkinData")
    .addEventListener("click", getSkinPulseSeed);

  document.getElementById("priceSubmitId").addEventListener("click", tokenSellForm)
  document.getElementById("checkForSaleBtn").addEventListener("click", checkForSale)
  document.getElementById("purchaseBtn").addEventListener("click", purchaseTOken)
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

//
async function getSkinPulseSeed() {
  const { web3 } = window
  const messageBox = document.getElementById("skinDataList");
  const skin = document.getElementById("skinInp").value;

  try {
    let { ledNFTContractInstance } =
      await getContractInstances();
    let accounts = await web3.eth.getAccounts();

    const owner = await ledNFTContractInstance.methods.skinOwner(skin).call();

    if (owner !== accounts[0]) {
      messageBox.innerHTML = "You are not the owner of the token.";
      return;
    }

    const data = await ledNFTContractInstance.methods
      .getpulseNSeed(skin)
      .call({ from: accounts[0] });

    const pulse = data[0];
    const seed = data[1];

    messageBox.innerHTML = `pulse: ${pulse} <br> seed: ${seed}`;
  } catch (err) {
    console.error("Error: ", err, {
      METHOD: "markForSale()",
      FILE: "index.js",
    });
  }
}

// sell token
async function tokenSellForm(e) {
  e.preventDefault();
  const { web3 } = window

  const tokenIdField = document.getElementById("tokenIdInp");
  const tokenPriceField = document.getElementById("tokenPriceInp");

  try {
    let { ledNFTContractInstance } = await getContractInstances();
    let accounts = await web3.eth.getAccounts();
    let price = tokenPriceField.value;
    let id = tokenIdField.value;

    let owner = await ledNFTContractInstance.methods.ownerOf(id).call();
    console.log("owner", owner);

    if (owner !== accounts[0]) {
      throw new Error("You are not the owner of the token.");
    }

    let res = await ledNFTContractInstance.methods
      .markForSale(id, web3.utils.toWei(`${price}`))
      .send({ from: accounts[0] });
    console.log("res", res);

    document.getElementById(
      "saleSuccess"
    ).innerHTML = `Token with id ${tokenIdField.value} is up for sale.`;

    setTimeout(() => {
      document.getElementById("saleSuccess").innerHTML = "";
    }, 3000);
  } catch (error) {
    console.error("Error: ", error, {
      METHOD: "markForSale()",
      FILE: "index.js",
    });
    document.getElementById("saleFailure").innerHTML = `Error`;

    setTimeout(() => {
      document.getElementById("saleFailure").innerHTML = "";
    }, 3000);
  }
};


// check is token is up for sale

async function checkForSale(e) {
  console.log("here");
  const forSaleInp = document.getElementById("forSaleInp");
  e.preventDefault();
  const _tokenId = forSaleInp.value;
  const { web3 } = window

  try {
    let { ledNFTContractInstance } = await getContractInstances();
    const res = await ledNFTContractInstance.methods
      .isAvailableForSale(_tokenId)
      .call();
    if (res) {
      const price = await ledNFTContractInstance.methods
        .getPriceOfToken(_tokenId)
        .call();
      document.getElementById(
        "forSaleResult"
      ).innerHTML = `Token ${_tokenId} is available for sale for ${web3.utils.fromWei(
        price,
        "ether"
      )} ether.`;
      return;
    }

    document.getElementById(
      "forSaleResult"
    ).innerHTML = `Token ${_tokenId} is not available for sale.`;
  } catch (err) {
    console.error("Error: ", err, {
      METHOD: "markForSale()",
      FILE: "index.js",
    });
  }
};

// purchase token
async function purchaseTOken(e) {
  const { web3 } = window
  e.preventDefault();
  const purchaseInp = document.getElementById("tokenIdPurchaseInp");

  try {
    let { ledNFTContractInstance } = await getContractInstances();
    let accounts = await web3.eth.getAccounts();
    const res = await ledNFTContractInstance.methods
      .isAvailableForSale(purchaseInp.value)
      .call();
    if (!res) {
      throw new Error("token not available for sale");
    }

    let owner = await ledNFTContractInstance.methods
      .ownerOf(purchaseInp.value)
      .call();
    console.log("owner", owner);

    if (owner === accounts[0]) {
      throw new Error("You cannot sell tokens to yourself.");
    }

    const price = await ledNFTContractInstance.methods
      .getPriceOfToken(purchaseInp.value)
      .call();

    let resp = await ledNFTContractInstance.methods
      .purchaseToken(purchaseInp.value)
      .send({ from: accounts[0], value: price });
    console.log(resp);

    document.getElementById(
      "purchaseSuccess"
    ).innerHTML = `Bought Successfully`;

    setTimeout(() => {
      document.getElementById("purchaseSuccess").innerHTML = "";
    }, 3000);
  } catch (err) {
    console.error("Error: ", err, {
      METHOD: "markForSale()",
      FILE: "index.js",
    });

    document.getElementById("purchaseFailure").innerHTML = `Error`;

    setTimeout(() => {
      document.getElementById("purchaseFailure").innerHTML = "";
    }, 3000);
  }
};