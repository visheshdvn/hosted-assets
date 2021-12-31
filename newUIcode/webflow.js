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
    let accounts = await web3.eth.getAccounts();
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
        .getSkinsOfToken(tokenId)
        .call({ from: accounts[0] });

      populationData.push({ tokenId, blinkingPattern, skins });
    }

    document.querySelector(".my-node").innerHTML = populationData.map(
      (data) => `<div class="node-viewer-1">
    <div id="nodeContainer1" class="div-block-52">
      <div class="w-embed w-script">
        
        <script>
          // Random Token Generator
          // ------------------------------------
  
          function random_hash() {
            let x = "0123456789abcdef",
              hash = "0x";
            for (let i = 64; i > 0; --i) {
              hash += x[Math.floor(Math.random() * x.length)];
            }
            return hash;
          }
  
          tokenData = {
            hash: random_hash(),
            tokenId: "123000456",
          };
  
          //-------------------------------------------------
          //-------------------------------------------------
          let tokenhash = random_hash();
  
          // Static TokenHash Input
          //let tokenhash =  "0xf49eade024e2d7ce66d1e6230a751f061671410d23bfd71f57128a0688098a71";
  
          //------------------------------------------------------
          //-------------------------------------------------
  
          // parseInt(string, radix) - Radix = 16 - Dex format
          let seed = parseInt(tokenhash, 16);
          let p = [];
          for (let i = 0; i < 64; i += 2) {
            p.push(tokenhash.substring(i + 2, i + 4));
          }
  
          let rns = p.map((x) => {
            return parseInt(x, 16) % 100;
          });
  
          // Dimensionless Canvas setup
          var DEFAULT_SIZE = 1500;
          var WIDTH = window.innerWidth * 0.25;
          var HEIGHT = window.innerWidth * 0.25;
          var DIM = Math.min(WIDTH, HEIGHT);
          var M = DIM / DEFAULT_SIZE;
  
          // ------ Traits -----
  
          let n = 0;
          let oR = 900 * M;
          let iR = rns[0] < 5 ? 1 * M : rns[0] <= 60 ? 660 * M : 250 * M;
  
          let strokeScale = rns[1] < 10 ? 0.2 * M : rns[1] < 98 ? 1 * M : 20 * M;
          let strokeScaleN =
            rns[1] < 10 ? "Micro" : rns[1] < 98 ? "Small Stroke" : "Thick";
  
          let strokeV = rns[2] < 10 ? 1 : rns[2] <= 80 ? 1.5 : 3;
          let strokeVN =
            rns[2] < 10
              ? "Uniform"
              : rns[2] <= 80
              ? "Medium Variation"
              : "Large Variation";
  
          // Length of lines probablilty
          let strokeLength = rns[3] < 10 ? 5 : rns[3] <= 60 ? 10 : 20;
          let strokeLengthN =
            rns[3] < 10 ? "Short" : rns[3] <= 60 ? "Medium Length" : "Long";
  
          let spacing = rns[4] < 25 ? 0.8 : rns[4] <= 90 ? 1 : 3;
          let spacingN =
            rns[4] < 25 ? "Overlap" : rns[4] <= 90 ? "Tight" : "Spaced";
  
          let phase =
            rns[6] < 9
              ? 0
              : rns[6] <= 55
              ? 0.01
              : rns[6] <= 60
              ? 0.02
              : rns[6] <= 70
              ? 0.007
              : rns[6] <= 90
              ? 0.1
              : 1;
          let phaseN =
            rns[6] < 9
              ? "Straight"
              : rns[6] <= 55
              ? "Gentle"
              : rns[6] <= 60
              ? "Rolling"
              : rns[6] <= 70
              ? "Offset"
              : rns[6] <= 90
              ? "Cross"
              : "Vibration";
  
          let gap = rns[5] < 80 ? 0 : rns[5] <= 90 ? 1 : rns[5] <= 98 ? 2 : 4;
          let gapN =
            rns[5] < 80
              ? "Air Tight"
              : rns[5] <= 90
              ? "Small Gap"
              : rns[5] <= 98
              ? "Breath"
              : "Spaced out";
          let t = 0; // Angle set to 0
  
          let colp0 = [147, 27, 79]; //
          let colp1 = [65, 190, 200]; //tur
          let colp2 = [230, 80, 90]; //
          let colp3 = [240, 228, 70];
          let colp4 = [26, 230, 170];
          let colp5 = [114, 58, 240];
          let colp6 = [28, 98, 120];
          let colp7 = [242, 220, 196]; // Cream
          let colp8 = [10, 102, 141]; // Turq
          let colp9 = [30, 30, 32]; //
          let colp10 = [10, 40, 90]; // Blue
          let colp11 = [217, 35, 68]; // Red
          let colp12 = [242, 159, 5]; // D Orange
          let colp13 = [75, 40, 90]; // D purple
  
          let colourpallet = [
            colp1,
            colp2,
            colp3,
            colp4,
            colp5,
            colp6,
            colp7,
            colp8,
            colp9,
            colp0,
          ];
  
          let col1 = colourpallet[rns[8] % 10];
          let col2 = colourpallet[rns[9] % 10];
          let col3 = colourpallet[rns[10] % 10];
          let col4 = colourpallet[rns[10] % 10];
  
          function setup() {
            let nCanvas = createCanvas(WIDTH, HEIGHT);
            nCanvas.parent("nodeContainer1");
  
            background(246, 241, 238);
            stroke(0, 100);
            noFill();
            noLoop();
            randomSeed(0);
            noiseSeed(0);
  
            print(tokenhash);
            print(rns);
            print(
              strokeScaleN,
              " | ",
              strokeVN,
              " | ",
              strokeLengthN,
              " | ",
              spacingN,
              " | ",
              phaseN,
              " | ",
              gapN
            );
          }
  
          function draw() {
            translate(width / 2, height / 2);
            noStroke();
            for (let d = iR; d <= oR; d += spacing * strokeScale * 1.9) {
              let end = map(noise(n), 0, 2, 0, PI);
              let cRate = map(d, iR, oR, 0, 1);
              let gRate = map(d, iR, oR, 0.2, 0.95);
              let iRate = map(d, iR, oR, 1, 0.4);
              let arcLength = PI;
              let incr = TWO_PI / 360;
              let gapc = gap * incr;
              for (let theta = -PI / 2; theta <= arcLength + end; theta) {
                let den = map(theta, 0, arcLength + end, 0.2, 1);
                let bGrad = map(
                  theta,
                  arcLength * 0.7,
                  arcLength + end * 0.7,
                  0,
                  1
                );
                // let x = d * sin(theta);
                // let y = d * cos(theta);
                // incr = random(PI / 50, PI / 1000);
                // incr = random()*den*iRate*PI/60;
                // incr = randomGaussian(PI/1000);
                push();
                ran = random(-10, 10);
                let colG =
                  random() > gRate
                    ? lerpColor(
                        color(col1[0] + ran, col1[1] + ran, col1[2] + ran),
                        color(col2[0] + ran, col2[1] + ran, col2[2] + ran),
                        cRate
                      )
                    : lerpColor(
                        color(col4[0] + ran, col4[1] + ran, col4[2] + ran),
                        color(col3[0] + ran, col3[1] + ran, col3[2] + ran),
                        cRate
                      );
                // let col = theta <= arcLength ? color(0) : lerpColor( color(0), colG ,bGrad);
                let col = lerpColor(color(30), colG, bGrad);
                stroke(col);
                strokeWeight(strokeScale);
                strokeCap[SQUARE];
                let start = theta;
                let stop = start + incr * random(1, strokeLength); // in degrees
                theta = stop + gapc;
                arc(0, 0, d, d, start, stop);
                pop();
  
                // circle(x, -y, random(dotScale, dotScale*dotV));
                // pop();
              }
              n += 1.01;
            }
          }
  
          function keyPressed() {
            if (key === "s") {
              //save out to a file
              saveCanvas(tokenhash, "png");
            }
          }
        </script>
      </div>
    </div>
    <div class="div-block-58">
      <div class="token-propoerties-nodepage">
        <p class="token-title">Token ID:</p>
        <p class="token-detail id"># ${data.tokenId}</p>
        <p class="token-title">Token Hash:</p>
        <p class="token-detail id">
          0xea99d59db9330b56d6b1753033a5a3c9eae39435322a3f8b74431d1faac2c000
        </p>
        <p class="token-title">Pulse:</p>
        <p class="token-detail pulse">
          ${data.blinkingPattern.map(blink => blink + " |")}
        </p>
        <p class="token-title">Skin Hash:</p>
        <div class="form-block w-form">
          <form
            id="email-form"
            name="email-form"
            data-name="Email Form"
            method="get"
            class="form-2"
          >
            <select
              id="Skins"
              name="Skins"
              data-name="Skins"
              class="select-field w-select"
            >
              ${data.skins.map(
                (skin) =>
                  `<option value=${skin}>
                  ${skin}
                </option>`
              )}
            </select>
          </form>
          <div class="w-form-done">
            <div>Thank you! Your submission has been received!</div>
          </div>
          <div class="w-form-fail">
            <div>Oops! Something went wrong while submitting the form.</div>
          </div>
        </div>
      </div>
      <div class="div-block-57">
        <a
          data-w-id="26e5ae02-ded6-1a90-c369-2f629b0935ae"
          href="#"
          class="button-2 change-pulse _1 w-button"
          ><span class="button-text small">Change Pulse</span></a
        ><a href="#" class="button-2 change-pulse w-button"
          ><span class="button-text small">Change Skins</span></a
        >
      </div>
    </div>
  </div>
  <div class="divider">
    <div class="text-block-6">
      。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。。
    </div>
  </div>`
    );
    console.log(populationData[0]);
  } catch (err) {
    console.error(err);
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
