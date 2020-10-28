export default class ComputerTicTacToePlayer {
  constructor({
            cells,
            delay,
            playerNumber,
            } = {}) {
    this.cells = cells;
    this.delay = delay;
    this.playerNumber = playerNumber;

    this.netParams = getNetParams();
  }

  makeMove() {
    return new Promise(resolve => {
      setTimeout(() => {
        return resolve(this.chooseCell());
      }, this.delay);
    });
  }

  chooseCell() {
    const preferences = this.findPreferences();
    const guesses = [];
    for (var k = 0; k < preferences.length; k++) {
      guesses.push({ cell: k+1, preference: preferences[k] });
    }
    const filteredGuesses = guesses
      .filter(guess => this.cells[guess.cell-1] === 0)
      .sort(guess => guess.preference - 1)
      .reverse();
    
    if (filteredGuesses.length > 0) {
      return filteredGuesses[0].cell;
    } else {
      console.error("No space available");
      return 1;
    }
  }

  findPreferences() {
    const net = this.buildNet();
    return net[net.length-1];
  }

  buildNet() {
    const net = [];
    net.push(this.observe());
    for (var i = 0; i < this.netParams.weights.length; i++) {
      const layer = [];
      for (var j = 0; j < this.netParams.weights[i].length; j++) {
        layer.push(this.calculateNode(net, i, j));
      }
      net.push(layer);
    }
    return net;
  }

  calculateNode(net, layerIndex, nodeIndex) {
    // An array of length X
    const previousLayer = net[layerIndex];

    // An array of length X
    const edges = this.netParams.weights[layerIndex];

    // A scalar
    const bias = this.netParams.biases[layerIndex][nodeIndex];

    // assert previousLayer.length == edges.length

    let val = -bias;
    for (var i; i < previousLayer.length; i++) {
      val += previousLayer[i] * edges[i];
    }
    return this.sigmoid(val);
  }

  sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
  }

  observe() {
    return this.cells.map(cell => {
      if (cell === this.playerNumber) {
        // This cell is mine
        return 1;
      } else if (cell === 0) {
        // This cell is empty
        return 0.5;
      } else {
        // This cell is the opponents
        return 0;
      }
    });
  }

  randomCell() {
    return Math.floor(Math.random() * 9) + 1;
  }

  updateCells(cells) {
    this.cells = cells;
  }

  printNet() {
    console.log(JSON.stringify(this.netParams));
  }
}

function getNetParams() {
  return {"weights":[[[0.028162603022673594,0.7493819902520511,0.3013647747078787,0.4632424732666609,0.5048985159667745,0.7370893114267654,0.7226516627984567,0.7872863774060337,0.7655051585974737],[0.9084318741174982,0.9544244851638595,0.6754620895677539,0.950331887213707,0.545891622132817,0.8983686701617415,0.6631918882525696,0.9309290211767216,0.6190249742647078],[0.5484753829695082,0.40255814284057245,0.14326617857215584,0.5999824824890048,0.19436783202250418,0.2908128361023421,0.13634709703771097,0.3355351972577927,0.05597132134084615],[0.7991774786046937,0.9219368914030555,0.14577257901624585,0.27870459018617955,0.6812991855583419,0.8394927083722499,0.9519466809935757,0.7954586665019159,0.9890587055761377],[0.19707584608537698,0.010104036815687945,0.2584501018523746,0.9509402696002398,0.6420569517733543,0.7082941394762805,0.9068396059623232,0.7419227215485438,0.5794237561589275],[0.9500882451017605,0.7315904927169612,0.6168887417829274,0.17110145716416603,0.0650825083871629,0.7877201972522343,0.5705371252550757,0.8645727070728635,0.7956765316981278],[0.1348663812446429,0.9190365087458896,0.6921377745110551,0.9686464879542931,0.7337623820662671,0.3200907846325025,0.05105255880166504,0.9265429609540297,0.21211872549103217],[0.5467197077982593,0.4883563223921672,0.29573044053858566,0.7386941368076991,0.9187746185841175,0.7337144529360689,0.4152057444055244,0.7757045137889471,0.49167976575075745],[0.5321406365549728,0.9622141140120495,0.828971584499756,0.7398947025894629,0.20358578732839527,0.9125707600796313,0.6268988242301281,0.5757213656326123,0.9129814927713888]],[[0.35647131577359703,0.011993133421483781,0.11717179682201717,0.91645240245921,0.024947993924577583,0.7311041764181769,0.12798423950258786,0.7261842647809271,0.07852405926461503],[0.7992158389609996,0.12059817014351015,0.31077809528803835,0.0581231562857929,0.6570095910572666,0.08358033919143737,0.38758061752815554,0.9991864606698397,0.6100077633089065],[0.027014779410066803,0.2790311415116098,0.6024890969137862,0.8751890484053242,0.5744912085433793,0.8932543507286266,0.553472277733662,0.16648212238701587,0.297511448631093],[0.8848366160886134,0.12421234761339983,0.3087397451766496,0.1850926278418863,0.20603553430763832,0.34557655624528527,0.6021846490365994,0.6173642111616917,0.13863398477922684],[0.6155736599474864,0.9903422908045474,0.7558331049210216,0.6543930300959369,0.5971016875184805,0.62012918368643,0.5997383145497583,0.3533655839247789,0.19679903314559177],[0.8160295155543775,0.5583866147575891,0.36149799945666317,0.10031757310081257,0.8930781639749927,0.8225509150004213,0.029201172895840788,0.1107722267933251,0.29427961281873216],[0.5573308289229506,0.979141384046128,0.8180850322424271,0.9950275223182905,0.02384998361052748,0.7067895290988644,0.6806696786864539,0.08643532384459562,0.21178907823819082],[0.2758284092629977,0.3858312454223216,0.6841682845203236,0.28741234748267797,0.5281752801973991,0.8641527982488,0.30440081278081244,0.3057859980392392,0.41922037721232996],[0.547146279838093,0.6403184256784764,0.3934318177885714,0.16090761796889153,0.28453636417095773,0.9190521885783207,0.7057923186784958,0.8763172327302555,0.9350388923885644]]],"biases":[[0.5584895023817658,0.3752805002546644,0.26485343889783897,0.5875476252815146,0.45124778759647444,0.6623589227227222,0.6830127783125794,0.232737927168299,0.2548204457688823],[0.38348771283042016,0.9112955082038183,0.061496796481017135,0.7990697820119812,0.2671442662002048,0.5466930880649501,0.677889392765409,0.0066758579554118125,0.6054772395863421]]};
}