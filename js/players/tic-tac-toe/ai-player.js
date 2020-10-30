import staticAiNet from './ai-net.js';

export default class ComputerTicTacToePlayer {
  constructor({
            cells,
            delay,
            playerNumber,
            } = {}) {
    this.cells = cells;
    this.delay = delay;
    this.playerNumber = playerNumber;

    this.netParams = this.getSavedNetParams();
    this.saveNetParams();
    this.descentSpeed = 0.01;

    // TODO
    // 1. Learn based on last 3 moves
    // 2. Batch the changes, only apply at the end of a 'batch'
    // 3. Try a deep net

    //console.log(this);
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
    //console.log(preferences);
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

    //console.log(net);

    return net;
  }

  calculateNode(net, nodeLayerIndex, nodeIndex) {
    console.assert(nodeLayerIndex >= 1, "calculateNode should never be called on the 'input' / observation' layer, that is, layer 1");
    const previousLayer = net[nodeLayerIndex-1];
    const edges = this.netParams.weights[nodeLayerIndex-1][nodeIndex];
    const bias = this.netParams.biases[nodeLayerIndex-1][nodeIndex];

    console.assert(previousLayer.length == edges.length, 'The amount of nodes in the previous layer should be equal to the amount of edges.');

    let val = bias;
    for (var i = 0; i < previousLayer.length; i++) {
      val += previousLayer[i] * edges[i];
    }

    //if (nodeLayerIndex === 1 && nodeIndex === 0) {
    //  console.log('calculate first node: ', previousLayer, edges, bias, val, this.sigmoid(val));
    //}

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

    //console.log('preferences', preferences);
    for (var w = 0; w < preferences.length; w++) {
      if (this.cells[w] > 0) {
        // Cell was full: disincentivize
        cost.push(-preferences[w]);
      } else if (w === this.savedChoice.cell) {
        if (result === 'won') {
          // You won: incentivize
          cost.push(1 - preferences[w]);
        } else {
          // You lost or tied, try something else next time: disincentivize
          cost.push(-preferences[w]);
        }
      } else {
        // This cell was as good as any other: no cost
        cost.push(0);
      }
    }
    //console.log('cost', cost);

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

    // TODO Batch the changes before updating this.netParams;
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
    const dcda = 2 * (aL - y);
    const dcdw = math.multiply(dzdw, dadz, dcda);
    const dcdb = math.multiply(dadz, dcda);
    //const dzda1 = wl;
    //const dcda1 = math.multiply(dzda1, dadz, dcda);

    // Uncomment to see what is changing
    //console.log('dcdw', dcdw);
    //console.log('dcdb', dcdb);

    // Update the weights and biases
    for (var i = 0; i < weights[previousNodeLayerIndex][currentNodeIndex].length; i++) {
      if (typeof newNetParams.weights[previousNodeLayerIndex] === 'undefined') {
        newNetParams.weights[previousNodeLayerIndex] = [];
      }
      if (typeof newNetParams.weights[previousNodeLayerIndex][currentNodeIndex] === 'undefined') {
        newNetParams.weights[previousNodeLayerIndex][currentNodeIndex] = [];
      }

      const weightChange = dcdw._data[i] * this.descentSpeed;
      const oldWeight = weights[previousNodeLayerIndex][currentNodeIndex][i];
      const newWeight = oldWeight + weightChange;
      if (this.isValidChange(weightChange) && this.isValidNumber(newWeight)) {
        //console.log(newWeight);
        newNetParams.weights[previousNodeLayerIndex][currentNodeIndex][i] = newWeight;
      } else {
        newNetParams.weights[previousNodeLayerIndex][currentNodeIndex][i] = oldWeight; 
      }
    }
    if (typeof newNetParams.biases[biasLayerIndex] === 'undefined') {
      newNetParams.biases[biasLayerIndex] = [];
    } 
    const biasChange = dcdb * this.descentSpeed;
    const oldBias = biases[biasLayerIndex][currentNodeIndex];
    const newBias = oldBias + biasChange;
    if (this.isValidChange(biasChange) && this.isValidNumber(newBias)) {
      //console.log(newBias);
      newNetParams.biases[biasLayerIndex][currentNodeIndex] = newBias;
    } else {
      newNetParams.biases[biasLayerIndex][currentNodeIndex] = oldBias;
    }

    // Back propogate to previous layers
    if (nodeLayerIndex > 1) {
      for (var i = 0; i < nodes[previousNodeLayerIndex].length; i++) {
        this.backPropogate(newNetParams, i, reverseNodeLayerIndex+1, cost);
      }
    }
  }

  isValidNumber(val) {
    return typeof val === "number" 
      && val !== -Infinity
      && val !== Infinity
      && val !== null
      && val !== undefined
      && (val > Number.MIN_VALUE || val < Number.MAX_VALUE);
  }

  isValidChange(change) {
    const sensitivity = 0.000001;
    return typeof change === "number" 
      && change !== -Infinity
      && change !== Infinity
      && change !== null
      && change !== undefined
      && (change > sensitivity || change < -sensitivity);
  }

  saveNetParams() {
    window.localStorage.setItem("TIC_TAC_TOE_AI", JSON.stringify(this.netParams));
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

  getSavedNetParams() {
    let savedAi;

    try {
      savedAi = JSON.parse(window.localStorage.getItem("TIC_TAC_TOE_AI"));
    } catch {
      window.localStorage.removeItem("TIC_TAC_TOE_AI") 
    }

    if (savedAi) {
      return savedAi;
    } else {
      return staticAiNet;
    }
  }

  randomSeedData(inputs, hiddenLayers, hiddenLayerSize, outputs) {
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
          connections.push((Math.random() * 2) - 1);
        }
        layer.push(connections);
      }
      seedData.weights.push(layer);
    }

    for (var i = 0; i < (hiddenLayers+1); i++) {
      const layer = [];
      const layerLength = i === hiddenLayers ? outputs : hiddenLayerSize;
      for (var j = 0; j < layerLength; j++) {
        layer.push((Math.random() * 2) - 1);
      }
      seedData.biases.push(layer);
    }

    return seedData;
  }
}