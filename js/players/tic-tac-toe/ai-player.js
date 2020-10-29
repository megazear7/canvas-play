export default class ComputerTicTacToePlayer {
  constructor({
            cells,
            delay,
            playerNumber,
            } = {}) {
    this.cells = cells;
    this.delay = delay;
    this.playerNumber = playerNumber;

    this.netParams = getSavedNetParams();
    this.saveNetParams();
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
      .sort((g1, g2) => g2.preference - g1.preference);
    
    if (filteredGuesses.length > 0) {
      this.savedChoice = filteredGuesses[0]; // This is needed by back propogation later on.
      return filteredGuesses[0].cell;
    } else {
      console.error("No space available");
      return 1;
    }
  }

  findPreferences() {
    // The savedNet is needed for backpropogation later on.
    const net = this.buildNet();
    this.savedNet = net;
    return net[net.length-1];
  }

  buildNet() {
    const config = this.netConfig();
    const net = [];

    // The first layer of the net is the 'observation'
    net.push(this.observe());

    // Each additional layer is connected by a set of weights
    for (var i = 0; i < config.hiddenLayers+1; i++) {
      const layer = [];
      const layerSize = i === config.hiddenLayers ? config.outputs : config.hiddenLayerSize;
      for (var j = 0; j < layerSize; j++) {
        // The value of each node depends on the previous layer of the net, the current layer (i), and it's position in that layer(j)
        layer.push(this.calculateNode(net, i+1, j));
      }
      net.push(layer);
    }

    return net;
  }

  calculateNode(net, layerIndex, nodeIndex) {
    // assert layerIndex >= 1 ... this should never be called on the 'input' / 'observation' layer, that is, layer 1.
    const previousLayer = net[layerIndex-1];
    const edges = this.netParams.weights[layerIndex-1];
    const bias = this.netParams.biases[layerIndex-1][nodeIndex];

    // assert previousLayer.length == edges.length
    let val = bias;
    for (var i; i < previousLayer.length; i++) {
      val += previousLayer[i] * edges[i];
    }
    return this.sigmoid(val);
  }

  sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
  }

  sigmoidDerivitive(f) {
    return f * (1 - f);
  }

  possibleStates() {
    return [
      0,                                // the space is empty
      this.playerNumber,                // we have the space
      this.playerNumber === 1 ? 2 : 1,  // the opponent has the space
    ];
  }

  observe() {
    const observation = [];
    
    // The first 9 values are a 1 if the space is empty or a 0 otherwise
    // The second 9 values are a 1 if we have the space
    // The third 9 values are a 1 if the opponent has the space
    this.possibleStates().forEach(state => {
      this.cells.forEach(cell => {
        observation.push(cell === state ? 1 : 0);
      });
    });

    // Use this to generate noise inputs
    //for (var i = 0; i < 27; i++) {
    //  observation.push(Math.random());
    //}

    return observation;
  }

  randomCell() {
    return Math.floor(Math.random() * 9) + 1;
  }

  updateCells(cells) {
    this.cells = cells;
  }

  calculateCost(result) {
    const preferences = this.savedNet[this.savedNet.length-1];
    const cost = [];

    for (var w = 0; w < preferences.length; w++) {
      if (w === this.savedChoice.cell) {
        if (result === 'won') {
          // If we won, then this result should have been a 1
          cost.push(1 - this.savedChoice.cell);
        } else {
          // If we won, then this result should have been a 0
          cost.push(-this.savedChoice.cell);
        }
      } else {
        // If this wasn't our pick, we can leave this output node alone.
        cost.push(preferences[w]);
      }
    }

    return cost;
  }

  learn(result) {
    const cost = this.calculateCost(result);
    const newNetParams = {
      weights: [],
      biases: [],
    }

    for (var i = 0; i < cost.length; i++) {
      this.backPropogate(newNetParams, i, 0, cost[i]);
    }

    // TODO uncomment this once the back propogation is actually working
    this.netParams = newNetParams;
    //console.log(this.netParams);
    //console.log(newNetParams);
    this.saveNetParams();
  }

  backPropogate(newNetParams, currentNodeIndex, reverseNodeLayerIndex, cost) {
    const weights = this.netParams.weights;
    const biases = this.netParams.biases;
    const nodes = this.savedNet;
    const nodeLayerIndex = nodes.length - reverseNodeLayerIndex - 1;
    const biasLayerIndex = nodeLayerIndex - 1; // There is one less bias layer than node layer.
    const previousNodeLayerIndex = nodeLayerIndex - 1;
    const weightLayerIndex = nodeLayerIndex - 1; // There is one less weight layer than node layer.
    const aL = nodes[nodeLayerIndex][currentNodeIndex];
    const y = cost;
    const bL = biases[biasLayerIndex][currentNodeIndex];
    const wL = math.matrix(weights[weightLayerIndex][currentNodeIndex]);
    const aL1 = math.matrix(nodes[previousNodeLayerIndex]);

    console.assert(wL._data.length === aL1._data.length, 'wL and aL1 should be of the same length');

    const zL = math.multiply(wL, aL1) + bL;
    const dzdw = aL1;
    const dadz = this.sigmoidDerivitive(zL);
    const dcda = math.multiply(2, math.subtract(aL, y));
    const dcdw = math.multiply(dzdw, dadz, dcda);
    const dcdb = math.multiply(dadz, dcda);
    //const dzda1 = wl;
    //const dcda1 = math.multiply(dzda1, dadz, dcda);

    // Update the weights and biases
    for (var i = 0; i < weights[previousNodeLayerIndex][currentNodeIndex].length; i++) {
      if (typeof newNetParams.weights[previousNodeLayerIndex] === 'undefined') {
        newNetParams.weights[previousNodeLayerIndex] = [];
      }
      if (typeof newNetParams.weights[previousNodeLayerIndex][currentNodeIndex] === 'undefined') {
        newNetParams.weights[previousNodeLayerIndex][currentNodeIndex] = [];
      }
      newNetParams.weights[previousNodeLayerIndex][currentNodeIndex][i] = dcdw._data[i];
    }
    if (typeof newNetParams.biases[biasLayerIndex] === 'undefined') newNetParams.biases[biasLayerIndex] = [];
    newNetParams.biases[biasLayerIndex][currentNodeIndex] = dcdb;

    // Back propogate to previous layers

    if (nodeLayerIndex > 1) {
      for (var i = 0; i < nodes[previousNodeLayerIndex].length; i++) {
        this.backPropogate(newNetParams, i, reverseNodeLayerIndex+1, cost);
      }
    }
  }

  saveNetParams() {
    //window.localStorage.setItem("TIC_TAC_TOE_AI", JSON.stringify(this.netParams));
  }

  notifyWin() {
    this.learn('won');
  }

  notifyLoss() {
    this.learn('loss');
  }

  notifyTie() {
    this.learn('tie');
  }

  printNet() {
    console.log(JSON.stringify(this.netParams));
  }

  netConfig() {
    return {
      inputs: 27,
      hiddenLayers: 1,
      hiddenLayerSize: 16,
      outputs: 9,
    };
  }

  buildNewNet() {
    const config = this.netConfig();
    return randomSeedData(config.inputs, config.hiddenLayers, config.hiddenLayerSize, config.outputs);
  }
}

function getSavedNetParams() {
  let savedAi;

  try {
    savedAi = JSON.parse(window.localStorage.getItem("TIC_TAC_TOE_AI"));
  } catch {
    window.localStorage.removeItem("TIC_TAC_TOE_AI") 
  }

  if (savedAi) {
    return savedAi;
  } else {
    return getStaticNetParams();
  }
}

function getStaticNetParams() {
  return {"weights":[[[0.8656593099140917,0.589214532459609,0.42494036607578445,0.30420192703325655,0.7224975348749507,0.8912460884266327,0.3281248878392755,0.12452848637991965,0.28888356961129547,0.5935499378967375,0.1558941574447157,0.5312451384483559,0.9638913082140383,0.5667815060125294,0.6997619666993347,0.36360210142102023,0.5397176016631886,0.004915456516074279,0.5977076377818586,0.03911680833470155,0.3630581870419938,0.8479210808356952,0.21637567249875023,0.3613026971199542,0.08510833924024563,0.15453033811460837,0.42867939173279757],[0.20143347682394763,0.4290144685637727,0.2879616133672407,0.902785869069404,0.8096272209237299,0.9676197617859179,0.3435104410273757,0.610665349321388,0.4233794993599538,0.5930814034697958,0.005602834211270613,0.5723502655724133,0.20474167517950104,0.5181886117282948,0.9466827225849512,0.11358492629747241,0.15254089621651,0.10493804549724928,0.9890553657377745,0.10263800512174681,0.8389005892504686,0.895406265622041,0.8612872285414153,0.312208946170315,0.9281432023476417,0.33912550874557446,0.9843317571636598],[0.5381325655300737,0.012864046477397029,0.14391442312596814,0.8437676427959779,0.7299641696884325,0.14574268812541447,0.007612302148380712,0.29049353994263916,0.6948437664219385,0.21400274731069602,0.8604147077609732,0.7642893982789194,0.8313177578336974,0.8917293488940576,0.11393406135120432,0.3928043385607807,0.8482950481374794,0.6842469063369572,0.3159336032734785,0.17486963563708158,0.7967542073991793,0.980780018566757,0.8741425197434207,0.9309888829137674,0.695366682282964,0.704206455528416,0.4915214160301471],[0.6699357489452153,0.7499127880120389,0.29309432182811235,0.24247059732537624,0.8133909279148304,0.3953781775764533,0.7401322165769018,0.4699806720564388,0.3217408170240854,0.8806506150858191,0.869551948136005,0.4216514025354323,0.18498511341904522,0.8916203532925131,0.09990415840207145,0.8941222546693994,0.8248400904097173,0.30580395158309615,0.6803648710733257,0.8838092098675114,0.6972039929076286,0.31523573423650775,0.5273039807610349,0.27854854660234385,0.12080751330140482,0.7541034932638231,0.7148850452559514],[0.38119531776538107,0.37587150497306787,0.7452464994992236,0.3997146750966194,0.8458193541086441,0.8274351866106779,0.8737388648879183,0.36681083664147596,0.11339004305302325,0.5676519655134078,0.004731124908712525,0.529849897960692,0.43229984129949295,0.5534646979661322,0.3860501655448283,0.8237694788713985,0.7550052932911036,0.5342814453982376,0.7170337429289246,0.8982714259896218,0.5762191346258241,0.43019868076906986,0.3634014877698586,0.47657016345869163,0.31934064197273404,0.09787299614788414,0.9501105230086722],[0.2932388340805363,0.7046055850998283,0.2646600886656052,0.3947420803240327,0.7622197745037405,0.7056471195685241,0.44428658775245844,0.08606956296952073,0.06711500445478147,0.01026952524228486,0.8826355871189744,0.04484616600912017,0.266054473153859,0.6975843896869436,0.582115458115773,0.8014126916970454,0.1909411441543929,0.6413274229973023,0.7600032492779611,0.9808427829869562,0.5588261739325591,0.06287615190220697,0.8837260590736151,0.7901013160136856,0.04696871548727288,0.6218604265894616,0.5892077711796537],[0.7217763295088633,0.5340646089323755,0.24381840884753214,0.9144612982798785,0.06701204429391194,0.4636997643554799,0.3164332167130166,0.4529675637631816,0.9106919522589592,0.7717608657056219,0.048160925924698006,0.6395454902658229,0.5471803117422029,0.5601408038204889,0.30199900932835533,0.18051313427866233,0.2550908486378396,0.6920876346251357,0.3859710184324481,0.20634995735855965,0.09681645726501698,0.03384985248313699,0.5020604808334337,0.1150068740175274,0.677045964004169,0.4437317558254885,0.24577294389031823],[0.27862942598400675,0.3511753232890509,0.3783008785896853,0.28321619502251827,0.5843196799058143,0.352797452021403,0.8174597166953086,0.8741642631877804,0.19127324152850345,0.8567633872932927,0.686468156111953,0.8812366227798205,0.9663804440066028,0.5495628837018114,0.7890302772453659,0.9842838937036171,0.9742866509716683,0.3779968481189353,0.4136241601330999,0.6587779081938614,0.46755668100244385,0.25653178930246057,0.6321646681904722,0.9348648857169628,0.6056971352228819,0.5216944151620762,0.3871477235209668],[0.8528420015981495,0.6032784149282286,0.14982001784861687,0.8564527516333296,0.07895099053844068,0.28567332324719286,0.7715245003733844,0.44481396558029207,0.6934798983171429,0.8517348888919525,0.1851855837245271,0.49732941864135016,0.763949105360856,0.7217162866161886,0.05091601160646242,0.7389181893728822,0.31110811211321177,0.2006429144245574,0.7070487486062802,0.3917207578706212,0.3015359176642378,0.2884349080858368,0.5206157572697137,0.36989838728915836,0.8702874208065605,0.658715267133299,0.1240510240519197],[0.07740290681369166,0.1576299836362256,0.3485260469383322,0.7569536793253013,0.8727650975696646,0.3208417056750794,0.1850806037802064,0.7675302891279614,0.19048391090169203,0.7095197742387147,0.23440894176542915,0.028083510029433878,0.029173371755289557,0.10618753878363907,0.7251450596302917,0.3733941303117987,0.12186288509075127,0.8101808502333743,0.46562548326840925,0.39559422299281155,0.5607014438077933,0.2326316615840538,0.8071355198765842,0.7141715604781882,0.20212486935967133,0.08777506048074835,0.030745402955098644],[0.4648927928169362,0.1213512941267263,0.35559108253055505,0.11693624871132657,0.026723772376393562,0.46096639950928475,0.6088635823852682,0.3491755373478942,0.4775088692614311,0.7010207847554037,0.026967979820534893,0.3434725862403929,0.19992093841689518,0.9438297252003469,0.7841391610235078,0.697605198114321,0.20697943067306301,0.2148027050276924,0.048807627753354454,0.866944063200108,0.19553087814805448,0.16910085301062194,0.9131972717645525,0.8705070150692162,0.9963662363862222,0.14778423500950644,0.5179050407931121],[0.36508095087991266,0.6682234345648883,0.021340483369697516,0.8047715874344372,0.6368819961676626,0.7175187890539478,0.553815197845567,0.21439850914491054,0.5960098671207628,0.45746765817243995,0.9411684411909325,0.7443001546903729,0.4042583895047971,0.8287235562754123,0.15465266481130135,0.9708910040722212,0.06348881840610732,0.38533276804402994,0.7565023541974121,0.9785739600420942,0.17925633061226387,0.546632809826687,0.41617411684794225,0.04829563302608708,0.9161493239799456,0.795666119733911,0.5902950419795623],[0.11197200418844311,0.042207778187312694,0.42576580988478163,0.9705951950891445,0.7830398515563319,0.4650140139393757,0.26123416312843806,0.5443722897634082,0.1571036435422266,0.870144068113589,0.3455147363819091,0.7667864873041623,0.9305781656979168,0.8814139123169507,0.3704423090880491,0.20521993002340033,0.556101905182923,0.8220839987657147,0.44817664407892277,0.4123646958601581,0.5511809094772631,0.5086172105480107,0.5568541892052203,0.6383843048613678,0.30454044048123485,0.2209782404989611,0.46218943745485186],[0.2784689709252657,0.1986084001903985,0.14286092715892407,0.10182703116849412,0.9164398704161578,0.7731657276832751,0.8583699412625636,0.9822410220008018,0.23039997843700832,0.8349499796467164,0.407254401138875,0.7604932185812119,0.12587792186174074,0.42696804546643596,0.04802385030622358,0.2189312395882841,0.2067940238353294,0.5176308790558424,0.6264890507205731,0.7247610825197648,0.26457087431209514,0.39259119271399157,0.29431956093075096,0.5717852999092612,0.7300845849654098,0.5957584008681116,0.3595411174169263],[0.5958148669711636,0.8759232930339096,0.045196825248982275,0.260907490454245,0.7478086902566963,0.42725869564235874,0.963657430721887,0.9688169229025094,0.2740774492846605,0.5241326354448796,0.46380671426612463,0.5050960117296743,0.6055021793358331,0.46806245186091555,0.5135266108678469,0.11059354660968967,0.2535528986795239,0.7997875884643906,0.24535318585009147,0.00808488595105361,0.16432572473411788,0.06314196817879525,0.546115123647696,0.4179722000341508,0.4698321337501865,0.8283058140896378,0.44996879970906223],[0.7649710648393684,0.9223170713387641,0.938287124027497,0.6563477163017826,0.620947930386474,0.16136588144453512,0.07095678410284134,0.841942539869543,0.5297928163842083,0.047883076788279855,0.13744779340972424,0.2288291556638773,0.32679573170688925,0.3448392383201644,0.9505950178530957,0.7704089200788287,0.8434698439924511,0.5625117434336406,0.2911604705227193,0.12227985531431607,0.6786930526036237,0.5432424814839674,0.46955959433806727,0.40136773413643145,0.36953380723716434,0.7404717830183827,0.5708324244263336]],[[0.3366046517734482,0.3460143341757005,0.546469273676305,0.9675824813350138,0.6237141955599594,0.008512784823490716,0.7939547704419245,0.9234644346965175,0.8559958916342558,0.667148305802592,0.6483481917870058,0.8514324234699908,0.8027771346090682,0.6593452378863824,0.2691354908424075,0.3095308102910177],[0.7250894278150122,0.3481492621397746,0.7864620880770778,0.8041929442734224,0.4766702049183662,0.9761507875478455,0.49620115612425986,0.7880502116748187,0.3380380720833769,0.9331967168576809,0.7009294084783961,0.3908982544746804,0.5201360370378822,0.7652020616559565,0.734991309661682,0.3928393252954996],[0.14696049557484847,0.5806400578783191,0.5323508053327017,0.12404418139639639,0.9960906996693621,0.931100733291703,0.9059239585366987,0.34809771956285607,0.4110667518357014,0.9527096467856673,0.7166980717568601,0.8517342352245301,0.40748441458362006,0.44725176698723246,0.24451448242959928,0.615289308778586],[0.3516044584575275,0.9475848921968713,0.25763319869696644,0.6876083628295653,0.955052736006188,0.1526144013784203,0.24658500231398262,0.5983412867015263,0.05765457861517587,0.8056704223540057,0.443379603797744,0.8634812099853442,0.2373332457168611,0.09345161455124806,0.4323791589665533,0.2285391408324906],[0.9122093607280375,0.6101115118784353,0.2622277990880053,0.11566564559544834,0.7910012699471707,0.8586019334296782,0.15848555840935075,0.6393192191421904,0.44211089335754084,0.5222802568168889,0.24170980298878408,0.11258097203766448,0.4977794132951414,0.1810043220941584,0.9587004949962219,0.3373302378769565],[0.9527306846627159,0.6579060618854893,0.1445975892981255,0.5009599986196651,0.9143144260931617,0.999915669592415,0.9552140093330104,0.4921941112024051,0.719081783022276,0.3642106778740597,0.8025000283260049,0.5853208329564514,0.9891160305445181,0.30706371668689236,0.24906677586751758,0.3515566776746626],[0.7171528123620439,0.9677281500002184,0.5300931667995044,0.05146187410995662,0.8549001590623433,0.7541536199396128,0.30032161957097925,0.594397197411995,0.0504036956347238,0.15148433392969163,0.36138647358742393,0.365958232394767,0.535074059775519,0.6212070334348372,0.05890775886915667,0.9925239598482878],[0.4944900942864996,0.22963210674334467,0.3575419335833234,0.39623546792692776,0.010918883672084156,0.808206398626758,0.5548563311576766,0.2774483002348769,0.9600559756137583,0.10101838927390694,0.6161290936301622,0.5553987074093505,0.6756659445459716,0.5450337721588985,0.02720059526048102,0.8792717961595815],[0.12577268845730916,0.4644024035772292,0.24268357872115054,0.4734485381929523,0.8338046755660855,0.47632966456739445,0.08081027500732052,0.48213602145952694,0.9624493837502368,0.3631661915976707,0.6234735497287405,0.6495005363363515,0.8879875962400647,0.8815283350367658,0.05932963536323843,0.6294641713663698]]],"biases":[[0.7446462882348432,0.34199050443030443,0.27373739296718336,0.8436720103017918,0.9934754891972146,0.2368109324911214,0.11114703060511122,0.6611956999105,0.6573051351392829,0.6725877137788305,0.37407819724472646,0.6125393431325024,0.6672089592368813,0.963040918360254,0.14985459768489107,0.9822155440471452],[0.35106748572665225,0.738948955910744,0.5651090687001921,0.306413577840821,0.02029512632272823,0.8042214543716131,0.4749877086357337,0.6396442762459058,0.4868887246186746]]};
}

function randomSeedData(inputs, hiddenLayers, hiddenLayerSize, outputs) {
  const seedData = {
    weights: [],
    biases: [],
  }

  for (var i = 0; i < (hiddenLayers+1); i++) {
    const layer = [];
    const connectionLength = i === hiddenLayers ? outputs : hiddenLayerSize;
    for (var k = 0; k < connectionLength; k++) {
      const connections = [];
      const layerLength = i === 0 ? inputs : hiddenLayerSize;
      for (var j = 0; j < layerLength; j++) {
        connections.push(Math.random());
      }
      layer.push(connections);
    }
    seedData.weights.push(layer);
  }

  for (var i = 0; i < (hiddenLayers+1); i++) {
    const layer = [];
    const layerLength = i === hiddenLayers ? outputs : hiddenLayerSize;
    for (var j = 0; j < layerLength; j++) {
      layer.push(Math.random());
    }
    seedData.biases.push(layer);
  }

  return seedData;
}